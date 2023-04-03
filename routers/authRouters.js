const express = require("express");
const router = express.Router();
const multer = require("../middleware/multer");
const authController = require("../controllers/authController");

router.post("/create", authController.createNewUser);

module.exports = router;
