const express = require("express");
const router = express.Router();
const multer = require("../middleware/multer");
const eventController = require("../controllers/eventController");

router.get("/events", eventController.getAllEvents);
router.get("/:eventId", eventController.getEvent);

router.get("/upcoming", eventController.getUpcomingEvents);
router.get("/waiting-result", eventController.getWaitingResultEvents);
router.get("/result-posted", eventController.getResultPostedEvents);
router.get("/past", eventController.getPastEvents);

router.put(
  "/update/:eventId",
  multer.single("thumbnail"),
  eventController.updateEvent
);

router.post("/create", multer.fields([]), eventController.createNewEvent);
router.delete("/delete/:eventId", eventController.deleteEvent);

module.exports = router;
