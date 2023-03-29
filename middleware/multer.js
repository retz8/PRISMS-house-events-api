// middleware for uploading files for thumbnail and post
const multer = require("multer");

// frontend로부터 받은 파일을 저장하는장소: storage -> 우리는 cloud storage
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.includes("image")) {
    return cb("Invalid Image Format", false);
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
