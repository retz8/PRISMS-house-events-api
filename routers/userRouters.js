const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("../middleware/multer");

router.post(
  "/dev",
  multer.single("profilePic"),
  userController.createNewUserDev
);
router.delete("/dev-clear", userController.deleteAllDevUsers);

router.get("/base-info", userController.updateBaseInfoMap);
router.get("/search", userController.searchUser);
router.get("/users", userController.getAllUsers);
router.get("/:userId", userController.getUser);
router.put("/update/:userId", userController.updateUser);
router.patch("/promote", userController.promoteStudents);
router.delete("/graduate", userController.graduateSeniors);
router.delete("/delete/:userId", userController.deleteUser);

module.exports = router;
