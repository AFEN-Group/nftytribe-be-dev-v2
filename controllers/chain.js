const expressAsyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const Chains = require("../functions/chains");
const checkError = require("../functions/checkError");

const addSupportedChain = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const chain = await new Chains().createOrUpdateChain(req.body);
  res.send(chain);
});
const getSupportedChains = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const chains = await new Chains().getChains();
  res.send(chains);
});
const removeSupportForChain = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  await new Chains().removeChain(req.params.id);

  res.send({
    message: "success",
    id: req.params.id,
  });
});

module.exports = {
  addSupportedChain,
  getSupportedChains,
  removeSupportForChain,
};
