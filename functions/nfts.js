const moralis = require("./moralis");
const db = require("../models");
class Nfts {
  getNfts = async (options, walletAddress) => {
    const { limit, page: cursor, chain } = options;
    const { symbol } = await db.chains.findOne({ where: { id: chain } });
    const nfts = await moralis(`${walletAddress}/nft`, "get", {
      chain: symbol,
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

  //   getNftMetaData = async (data) => {
  //     const { tokenId, contractAddress } = data;
  //   };
}

module.exports = Nfts;
