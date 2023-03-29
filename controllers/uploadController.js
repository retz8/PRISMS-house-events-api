// image upload
const cloudinary = require("../cloud/cloudinaryConfig");

// @desc  Upload Image to the Cloud
// @route POST /api/upload-image
const uploadImage = async (req, res) => {
  const { file } = req;
  console.log(file);
  if (!file) return res.status(401).json({ error: "Image File is Missing" });
  // file.path
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path
  );
  res.status(201).json({ image: url, public_id }); // 201 statuscode: smt is successfully added
};

module.exports = {
  uploadImage,
};
