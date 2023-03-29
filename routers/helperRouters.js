const express = require("express");
const uploadController = require("../controllers/uploadController");
const router = express.Router();
const multer = require("../middleware/multer");

router.post(
  "/upload-image",
  multer.single("image"),
  uploadController.uploadImage
);

module.exports = router;
