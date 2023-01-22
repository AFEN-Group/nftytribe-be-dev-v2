const expressAsyncHandler = require("express-async-handler");
const Uploads = require("functions/uploads");

exports.tempUploads = expressAsyncHandler(async (req, res) => {
  const files = req.files;
  const buffers = files.map((data) => data.buffer);
  const compressImages = await new Uploads().compressImages(buffers);
  const uploaded = await Promise.all(
    compressImages.map(
      async (buffer) => await new Uploads().upload(buffer, "temp/img")
    )
  );
  const temp = await new Uploads().saveTempImages(uploaded);
  res.send(temp);
});
