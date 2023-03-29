const Event = require("../models/Event");
const User = require("../models/User");
const cloudinary = require("../cloud/cloudinaryConfig");
const { isValidObjectId } = require("mongoose");

function isEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

// @desc    Create new event
// @route   POST /api/event/create
const createNewEvent = async (req, res) => {
  const {
    title,
    author, // id
    host,
    tier,
    thumbnail,
    summary,
    content,
    startDate,
    endDate,
    signUpLink,
    participants,
    isForAll,
    slug,
  } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: "Title and Slug are required" });
  }

  // check duplicate event
  const duplicate = await Event.findOne({ slug }).lean();
  if (duplicate) {
    return res.status(401).json({ error: "Please use Unique Slug" });
  }

  const newEvent = new Event({
    title,
    slug,
  });

  // check valid author
  if (author) {
    const user = await User.findById(author);
    if (!user) {
      return res.status(400).json({ error: "Author doesn't exist" });
    }
    newEvent.author = author;
  }

  if (startDate && endDate) {
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(401).json({ error: "StartDate should before endDate" });
    }
  }

  const defaultThumbnail = {
    url: process.env.DEFAULT_THUMBNAIL_URL,
    public_id: process.env.DEFAULT_THUMBNAIL_PUBLIC_ID,
  };

  let newThumbnail = thumbnail;
  if (isEqual(thumbnail, defaultThumbnail)) {
    // create default logo in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      defaultThumbnail.url
    );
    newThumbnail = { url: secure_url, public_id };
  }

  if (host) newEvent.host = host;
  if (tier) newEvent.tier = tier;
  if (thumbnail) newEvent.thumbnail = newThumbnail;
  if (summary) newEvent.summary = summary;
  if (content) newEvent.content = content;
  if (startDate) newEvent.startDate = startDate;
  if (endDate) newEvent.endDate = endDate;
  if (signUpLink) newEvent.signUpLink = signUpLink;
  if (participants) newEvent.participants = participants;

  if (isForAll === false) newEvent.isForAll = false;
  else newEvent.isForAll = true;

  const curDate = new Date();

  if (
    endDate.toLocaleString("en-US", { timeZone: "America/New_York" }) <
    curDate.toLocaleString("en-US", { timeZone: "America/New_York" })
  ) {
    newEvent.upcoming = false;
  }

  const event = await Event.create(newEvent);
  if (event) {
    res.status(201).json({ event: event });
  } else {
    res.status(400).json({ error: "Unable to create Event in Database" });
  }
};

// @desc    Get all events
// @route   GET /api/event/events
const getAllEvents = async (req, res) => {
  const events = await Event.find().lean();
  if (!events?.length) {
    return res.status(400).json({ error: "No Events Found" });
  }

  res.json({
    events: events.map((event) => ({
      id: event._id,
      title: event.title,
      author: event.author,
      host: event.host,
      tier: event.tier,
      thumbnail: event.thumbnail,
      summary: event.summary,
      content: event.content,
      startDate: event.startDate,
      endDate: event.endDate,
      signUpLink: event.signUpLink,
      participants: event.participants,
      isForAll: event.isForAll,
      adminNote: event.adminNote ? event.adminNote : "",
      result: event.result ? event.result : {},
      upcoming: event.upcoming,
      resultPosted: event.resultPosted,
      slug: event.slug,
    })),
  });
};

// @desc    Get all events
// @route   GET /api/event/:eventId
const getEvent = async (req, res) => {
  const { eventId } = req.params;

  if (!isValidObjectId(eventId))
    return res.status(401).json({ error: "Invalid Request" });

  const event = await Event.findById(eventId).lean().exec();
  if (!event) {
    return res.status(400).json({ error: "No Event Found" });
  }

  res.json({
    event: {
      id: event._id,
      title: event.title,
      author: event.author,
      host: event.host,
      tier: event.tier,
      thumbnail: event.thumbnail,
      summary: event.summary,
      content: event.content,
      startDate: event.startDate,
      endDate: event.endDate,
      signUpLink: event.signUpLink,
      participants: event.participants,
      isForAll: event.isForAll,
      adminNote: event.adminNote ? event.adminNote : "",
      result: event.result ? event.result : {},
      upcoming: event.upcoming,
      resultPosted: event.resultPosted,
      slug: event.slug,
    },
  });
};

// @desc    Update event by id
// @route   PUT /api/event/update/:eventId
const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const {
    title,
    author,
    host,
    tier,
    thumbnail,
    summary,
    content,
    startDate,
    endDate,
    signUpLink,
    participants,
    isForAll,
    adminNote,
    result,
    upcoming,
    resultPosted,
    slug,
  } = req.body;

  // console.log(req.body);

  if (!isValidObjectId(eventId)) {
    return res.status(401).json({ error: "Invalid Request" });
  }

  if (!title || !slug) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const event = await Event.findById(eventId).lean().exec();
  if (!event) {
    return res.status(400).json({ error: "Event Not Found" });
  }

  const duplicate = await Event.findOne({ slug })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate && duplicate?._id.toString() !== eventId) {
    // 409 status code: conflict
    return res.status(409).json({ error: "Duplicate event" });
  }

  const public_id = event.thumbnail?.public_id;
  if (public_id && thumbnail.public_id !== public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return res.status(404).json({ error: "Could not remove thumbnail" });
    }
  }

  event.title = title;
  event.author = author;
  event.host = host;
  event.tier = tier;
  if (thumbnail) event.thumbnail = thumbnail;
  if (summary) event.summary = summary;
  if (content) event.content = content;
  if (startDate) event.startDate = startDate;
  if (endDate) event.endDate = endDate;
  if (signUpLink) event.signUpLink = signUpLink;
  if (participants) event.participants = participants;
  if (isForAll) event.isForall = isForAll;
  if (adminNote) event.adminNote = adminNote;
  if (result) event.result = result;
  if (upcoming) event.upcoming = upcoming;
  if (resultPosted) event.resultPosted = resultPosted;
  event.slug = slug;

  console.log(event);

  Event.updateOne({ _id: eventId }, event)
    .then(() => {
      res.json({
        event: event,
      });
    })
    .catch((error) => {
      console.log(error.message);
      res.status(400).json({
        error: error,
      });
    });
};

// @desc    Get upcoming events
// @route   GET /api/event/upcoming
const getUpcomingEvents = async (req, res) => {
  const events = await Event.find({ upcoming: true }).lean().exec();

  if (!events?.length) {
    return res.status(400).json({ error: "No Upcoming Events found" });
  }

  res.json({
    events: events.map((event) => ({
      id: event._id,
      title: event.title,
      author: event.author,
      host: event.host,
      tier: event.tier,
      thumbnail: event.thumbnail,
      summary: event.summary,
      content: event.content,
      startDate: event.startDate,
      endDate: event.endDate,
      signUpLink: event.signUpLink,
      participants: event.participants,
      isForAll: event.isForAll,
      adminNote: event.adminNote ? event.adminNote : "",
      result: event.result ? event.result : {},
      upcoming: event.upcoming,
      resultPosted: event.resultPosted,
      slug: event.slug,
    })),
  });
};

// @desc    Get waiting for results events
// @route   GET /api/event/waiting-result
const getWaitingResultEvents = async (req, res) => {
  const events = await Event.find({
    upcoming: false,
    "resultPosted.waitingResult": true,
  })
    .lean()
    .exec();

  // not upcoming events, already happened
  // but result is not posted -> waitingResult: true
  if (!events?.length) {
    return res.status(400).json({ error: "No Waiting Result Events found" });
  }

  res.json({
    events: events.map((event) => ({
      id: event._id,
      title: event.title,
      author: event.author,
      host: event.host,
      tier: event.tier,
      thumbnail: event.thumbnail,
      summary: event.summary,
      content: event.content,
      startDate: event.startDate,
      endDate: event.endDate,
      signUpLink: event.signUpLink,
      participants: event.participants,
      isForAll: event.isForAll,
      adminNote: event.adminNote ? event.adminNote : "",
      result: event.result ? event.result : {},
      upcoming: event.upcoming,
      resultPosted: event.resultPosted,
      slug: event.slug,
    })),
  });
};

// @desc    Get waiting for results events
// @route   GET /api/event/result-posted
const getResultPostedEvents = async (req, res) => {
  const events = await Event.find({
    upcoming: false,
    "resultPosted.active": true,
  })
    .lean()
    .exec();
  // not upcoming events, already happened
  // but result is not posted -> waitingResult: true
  if (!events?.length) {
    return res.status(400).json({ error: "No Result Posted Events found" });
  }

  res.json({
    events: events.map((event) => ({
      id: event._id,
      title: event.title,
      author: event.author,
      host: event.host,
      tier: event.tier,
      thumbnail: event.thumbnail,
      summary: event.summary,
      content: event.content,
      startDate: event.startDate,
      endDate: event.endDate,
      signUpLink: event.signUpLink,
      participants: event.participants,
      isForAll: event.isForAll,
      adminNote: event.adminNote ? event.adminNote : "",
      result: event.result ? event.result : {},
      upcoming: event.upcoming,
      resultPosted: event.resultPosted,
      slug: event.slug,
    })),
  });
};

// @desc    Get past events (result already posted)
// @route   GET /api/event/past
const getPastEvents = async (req, res) => {
  const events = await Event.find({
    upcoming: false,
    "resultPosted.active": false,
    "resultPosted.waitingResult": false,
  })
    .lean()
    .exec();
  // not upcoming events, already happened
  // but result is not posted -> waitingResult: true
  if (!events?.length) {
    return res.status(400).json({ error: "No Past Events found" });
  }

  res.json({
    events: events.map((event) => ({
      id: event._id,
      title: event.title,
      author: event.author,
      host: event.host,
      tier: event.tier,
      thumbnail: event.thumbnail,
      summary: event.summary,
      content: event.content,
      startDate: event.startDate,
      endDate: event.endDate,
      signUpLink: event.signUpLink,
      participants: event.participants,
      isForAll: event.isForAll,
      adminNote: event.adminNote ? event.adminNote : "",
      result: event.result ? event.result : {},
      upcoming: event.upcoming,
      resultPosted: event.resultPosted,
      slug: event.slug,
    })),
  });
};

// @desc    Delete event by id
// @route   DELETE /api/event/delete/:eventId
const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  if (!isValidObjectId(eventId)) {
    return res.status(401).json({ error: "Invalid Request" });
  }

  const event = await Event.findById(eventId).lean().exec();
  if (!event) {
    return res.status(404).json({ error: "Event not found!" });
  }

  // destroy thumbnail
  const { public_id } = event.thumbnail;
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok")
      return res.status(404).json({ error: "Could not remove thumbnail" });
  }

  await Event.findByIdAndDelete(eventId);
  res.json({ message: `Event ${eventId} removed successfully` });
};

module.exports = {
  createNewEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  getUpcomingEvents,
  getWaitingResultEvents,
  getResultPostedEvents,
  getPastEvents,
  deleteEvent,
};
