const express = require("express");
const router = express.Router();
const houseController = require("../controllers/houseController");
const multer = require("../middleware/multer");

router.get("/houses", houseController.getAllHouses);
router.get("/:houseId", houseController.getHouse);
router.get("/name/:houseName", houseController.getHouseByName);
router.get("/leaders/:houseName", houseController.getLeaders);
router.get("/members/:houseName", houseController.getMembers);

router.post("/create", multer.single("crest"), houseController.createNewHouse);
router.put(
  "/update/:houseId",
  multer.single("crest"),
  houseController.updateHouse
);
router.patch("/update-point/:houseId", houseController.updateHousePoint);
router.delete("/delete/:houseId", houseController.deleteHouse);

module.exports = router;
