const checkError = require("@functions/checkError");
const { BubbleDelivery } = require("@helpers/bubble");
const getPair = require("@helpers/pairs");
const { redis } = require("@helpers/redis");
const db = require("@models");
const expressAsyncHandler = require("express-async-handler");

exports.verifyAddress = expressAsyncHandler(async (req, res) => {
  const data = await checkError(req);
  const user = await db.users.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: db.addresses,
      },
    ],
  });
  data.email = req.user.email;
  //validation
  const { data: verified } = await BubbleDelivery.verifyAddress(data).catch(
    (err) => {
      throw {
        message: getError(err),
        status: 400,
      };
    }
  );

  //check if user has address
  if (user.address) {
    await db.addresses.update(
      {
        address_code: verified.address_code,
      },
      {
        where: {
          userId: user.id,
        },
      }
    );
  } else {
    await db.addresses.create({
      userId: user.id,
      address_code: verified.address_code,
    });
  }
  //save

  res.send({ ...verified, ...add });
});

exports.retrieveRates = expressAsyncHandler(async (req, res) => {
  const { listingId } = await checkError(req);
  const [user, listing] = await Promise.all([
    await db.users.findOne({
      where: {
        id: req.user.id,
      },
      include: {
        model: db.addresses,
        required: true,
      },
    }),
    await db.nfts.findOne({
      where: {
        id: listingId,
      },
      include: [
        {
          model: db.physicalItems,
          required: true,
        },
        {
          model: db.users,
          required: true,
          include: [
            {
              model: db.addresses,
              required: true,
            },
          ],
        },
      ],
    }),
  ]);
  if (!listing || !user) {
    throw {
      status: 400,
      message: "address missing!",
    };
  }

  //   console.log(user);
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const deliveryData = {
    sender_address_code: listing.user.address.address_code,
    reciever_address_code: user.address.address_code,
    pickup_date: date.toISOString().split("T")[0],
    category_id: listing.physicalItem.category_id,
    package_items: [
      {
        name: listing.physicalItem.name,
        description: listing.physicalItem.description,
        unit_weight: listing.physicalItem.unit_weight,
        unit_amount: listing.physicalItem.unit_amount,
        quantity: listing.physicalItem.quantity,
      },
    ],
    package_dimension: {
      height: listing.physicalItem.height,
      width: listing.physicalItem.width,
      length: listing.physicalItem.length,
    },
    // delivery_instructions: "nothing",
  };

  const response = await BubbleDelivery.requestShippingRates(
    deliveryData
  ).catch((err) => {
    throw {
      message: getError(err),
      status: 400,
    };
  });

  //add percentage to all fees ---
  const { USDTNGN: dollarValue } = await getPair();
  response.data.couriers = response.data.couriers.map((courier) => {
    const percentageIncrement = Number(process.env.delivery_percentage);
    const total = (percentageIncrement * courier.total) / 100 + courier.total;
    const totalUsd = total / Number(dollarValue);
    return {
      ...courier,
      total,
      totalUsd,
    };
  });

  await redis.setex(
    `${user.walletAddress}-${response.data.request_token}`,
    60 * 60,
    JSON.stringify(response.data.couriers)
  );
  delete response.data.fastest_courier;
  delete response.data.cheapest_courier;
  res.send(response);
});

exports.book = expressAsyncHandler(async (req, res) => {
  const data = await checkError(req);
  const listing = await db.nfts.findOne({
    where: {
      id: data.listingId,
    },
    include: {
      model: db.physicalItems,
      required: true,
    },
  });
  if (!listing)
    throw { message: "listing not found or not physical item", status: 404 };

  //delete listingId from data to avoid conflicts with api
  delete data.listingId;

  const user = await db.users.findOne({
    where: {
      id: req.user.id,
    },
  });
  //find cached total
  const cachedCouriers = JSON.parse(
    await redis.get(`${user.walletAddress}-${data.request_token}`)
  );

  if (!cachedCouriers) throw { message: "expired!" };
  const { total, totalUsd } = cachedCouriers.find(
    (courier) =>
      courier.courier_id === data.courier_id &&
      courier.service_code === data.service_code
  );
  //   const booked = await BubbleDelivery.book(data).catch((err) => {
  //     throw {
  //       status: 400,
  //       message: getError(err),
  //     };
  //   });
  //pattern is listingId-walletAddress-booked
  //cached
  await redis.setex(
    `${listing.id}-${user.walletAddress}-booking`,
    60 * 60 * 12,
    JSON.stringify({ data, total, totalUsd })
  );
  res.send();
});

const getError = (err) => {
  return err.response.data;
};
