const moralis = require("./moralis");
const Moralis = require("moralis").default;
const db = require("../models");

Moralis.start({
  apiKey: process.env.moralis_api_key,
});
class Nfts {
  getNfts = async (options, walletAddress) => {
    const { limit, page: cursor, chain } = options;

    //validations will be re done on chains
    // const { symbol } = await db.chains.findOne({ where: { id: chain } });
    const nfts = await moralis(`${walletAddress}/nft`, "get", {
      chain,
      limit,
      cursor,
    });
    return {
      ...nfts,
      result: nfts.result.map((data) => ({
        ...data,
        metadata: JSON.parse(data.metadata),
      })),
    };
  };
  getSingleNft = async (id) => {
    const nft = await db.nfts.findOne({ where: { id } });
    return nft;
  };

  putOnSale = async (params = [], walletAddress, chain) => {
    //const validate chain, collection and userId

    const [user, chainId] = await Promise.all([
      await db.users.findOne({ where: { walletAddress } }),
      await db.chains.findOne({
        where: {
          chain,
        },
      }),
    ]);

    if (chainId && user) {
      const data = {};
      while (params.length > Object.keys(data).length) {
        const index = Object.keys(data).length;
        data[params[index].name.replace("_", "")] = params[index].value;
      }
      const collection = await db.collections.findOne({
        where: {
          contractAddress: data.mintableToken,
        },
      });
      const [nftMetadata, tokenData] = await Promise.all([
        await this.getNftMetaData(data.tokenID, data.mintableToken, chain),
        await this.getTokenData(data.erc20Token, chain),
      ]);

      console.log(tokenData);

      // building data
      const values = {
        name: nftMetadata.name,
        tokenId: data.tokenID,
        description: nftMetadata.metadata.description,
        url:
          nftMetadata.metadata?.image ||
          nftMetadata.metadata?.file ||
          nftMetadata.metadata?.video,
        price: data.auctionType === "1" ? data.buyPrice : data.startingPrice,
        listingType: data.auctionType === "1" ? "NORMAL" : "AUCTION",
        timeout:
          data.auctionType === "1"
            ? null
            : new Date(Date.now() + data.duration * 1000),
        moreInfo: {
          erc20TokenAddress: data.erc20Token,
          erc20TokenName: tokenData.token.name,
          erc20TokenSymbol: tokenData.token.symbol,
          erc20TokenDecimals: tokenData.token.decimals,
          nftContractType: nftMetadata.contractType,
          symbol: nftMetadata.symbol,
          contractAddress: nftMetadata.tokenAddress,
        },
        collectionId: collection?.id,
        chainId: chainId.id,
        userId: user.id,
        confirmed: true,
      };

      // store to db
      console.log(values);
      const newListing = await db.nfts.create(values);
      return newListing;
    } else {
      //do nothing
    }
  };

  getNftMetaData = async (tokenId, address, chain) => {
    const nftMetadata = await Moralis.EvmApi.nft.getNFTMetadata({
      address,
      chain,
      tokenId,
    });
    return nftMetadata?.toJSON();
  };

  getTokenData = async (address, chain) => {
    const data = await Moralis.EvmApi.token.getTokenMetadata({
      addresses: [address],
      chain,
    });
    return data?.toJSON()[0];
  };

  putOffSale = async (contractAddress, walletAddress, tokenId) => {
    const user = await db.users.findOne({
      where: {
        walletAddress,
      },
    });
    return (
      user &&
      (await db.nfts.destroy({
        where: {
          userId: user.id,
          tokenId,
          moreInfo: {
            contractAddress,
          },
        },
      }))
    );
  };
}

module.exports = Nfts;
