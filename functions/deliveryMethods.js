const topshipApi =
  process.env.NODE_ENV !== "production"
    ? process.env.topship_api_staging
    : process.env.topship_api_live;

const { default: Axios } = require("axios");
const db = require("../models");
const fetchTopShip = Axios.create({
  baseURL: topshipApi,
  headers: {
    Authorization: `Bearer ${process.env.topship_api_key}`,
  },
});

class DeliveryMethods {
  constructor(data = {}) {
    this.userData = data;
  }

  static topship = {
    getCountries: async () => {
      const data = await fetchTopShip({
        url: "/get-countries",
      });
      return data.data;
    },
    getStates: async (countryCode = "NG") => {
      const data = await fetchTopShip({
        url: "/get-states",
        params: {
          countryCode,
        },
      });
      return data.data;
    },
    getCities: async (countryCode = "NG") => {
      console.log(topshipApi);
      const data = await fetchTopShip({
        url: "/get-cities",
        params: {
          countryCode,
        },
      });
      return data.data;
    },
    getDeliveryFee: async function (
      listingId,
      senderDetails = {},
      noFee = false
    ) {
      const item = await db.physicalItems.findOne({
        where: {
          nftId: listingId,
        },
      });

      const data = await fetchTopShip({
        url: "/get-shipment-rate",
        params: {
          shipmentDetail: JSON.stringify({
            senderDetails: {
              cityName: senderDetails.city,
              countryCode: senderDetails.countryCode,
            },
            receiverDetails: {
              cityName: item.city,
              countryCode: item.country,
            },
            totalWeight: Number(item.weight),
          }),
        },
      });
      const result = data.data[0];
      //fee controls whether to include service charges from nftytribe or not
      const addedPercentage = !noFee
        ? result.cost * (Number(process.env.delivery_percentage) / 100) +
          result.cost
        : result.cost;
      return { ...result, cost: addedPercentage };
    },
    getCategories: () => {
      const cat =
        "Appliance || BeautyProducts || Jewelry || ComputerSupplies || HomeDecor || BabySupplies || TelevisionAndEntertainment || KitchenAccessories || Furniture || Gadgets || SolarPanelsAndInverter || VehicleParts || ClothingAndTextile || SportAccessories || GymEquipment || Fashion || Furniture || Education || Drones || Document || Others";
      return cat.split("||").map((cat) => cat.trim());
    },
    book: async (physicalItem, buyerInfo, userId, buyerAddress) => {
      //fix - category(Others)
      //fix - description(any)
      //fix - quantity(1)
      //fix - value(convert nft price to get this value)
      //fix - pricingTier(Express)
      //fix - itemCollectionMode(DropOff)
      //fix - insuranceType(None)
      //fix - shipmentCharge(Express) -- > make a fresh request for the actual charge with no fee set to true
      //fix - sellers phone number --> seller must have gone through verification so phone number must be available
      //fix - address --> seller must have gone through verification so we'd have his address
      const [sender, receiver] = await Promise.all([
        await db.users.findOne({
          where: {
            id: userId,
          },
        }),
        await db.users.findOne({
          where: {
            walletAddress: buyerAddress,
          },
        }),
      ]);

      return await fetchTopShip({
        url: "/save-shipment/",
        method: "post",
        data: {
          shipment: [
            {
              items: [
                {
                  // category: physicalItem.category,
                  // description: "string",
                  weight: physicalItem.weight,
                  quantity: 1,
                  // value: "number",
                },
              ],
              itemCollectionMode: "PickUp" /*"DropOff || PickUp"*/,
              // pricingTier: "Budget || Express || Standard || Premium",
              // insuranceType: "None || Premium",
              // insuranceCharge: "number",
              // discount: "number",
              // shipmentRoute: "Import || Export || Domestic",
              // shipmentCharge: "number",
              // pickupCharge: 50000 || 0,
              senderDetail: {
                name: physicalItem.name ?? "Nftytribe-buyer",
                email: sender.email ?? "radiancegeorge@gmail.com",
                // phoneNumber: "string",
                addressLine1: physicalItem.address ?? "some address",
                // addressLine2: "string",
                // addressLine3: "string",
                // country: physicalItem.country,
                state: physicalItem.state,
                city: physicalItem.city,
                countryCode: physicalItem.country,
                postalCode: physicalItem.postalCode ?? 343533,
              },
              receiverDetail: {
                name: buyerInfo.name ?? "Nftytribe-receiver",
                email: receiver.email ?? "radiancegeorge@gmail.com",
                // phoneNumber: "string",
                addressLine1: buyerInfo.address ?? "some street address",
                // addressLine2: "string",
                // addressLine3: "string",
                // country: "string",
                state: buyerInfo.state,
                city: buyerInfo.city,
                countryCode: buyerInfo.countryCode ?? "NG",
                postalCode: buyerInfo.postalCode ?? 23453,
              },
            },
          ],
        },
      });
    },
  };
}

module.exports = DeliveryMethods;
