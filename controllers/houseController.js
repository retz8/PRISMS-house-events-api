const { isValidObjectId } = require("mongoose");
const House = require("../models/House");
const User = require("../models/User");
const cloudinary = require("../cloud/cloudinaryConfig");

// @desc    Create new house
// @route   POST /api/house/create
const createNewHouse = async (req, res) => {
  const { name, point, motto, enMotto, color } = req.body;
  const { file } = req; // crest

  // required fields: name
  if (!name) {
    return res.status(400).json({ error: "House name is required" });
  }

  const duplicate = await House.findOne({ name: name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    // 409 status code: conflict
    return res.status(409).json({ error: "Duplicate House" });
  }

  const newHouse = {
    name: name,
  };
  if (point) {
    newHouse.point = Number(point);
  }
  if (motto) {
    newHouse.motto = motto;
  }
  if (enMotto) {
    newHouse.enMotto = enMotto;
  }
  if (color) {
    newHouse.color = color;
  }

  if (file) {
    // upload file to cloudinary (use file.path)
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    newHouse.crest = { url: secure_url, public_id };
  }

  // Create and Store new house
  const house = await House.create(newHouse);
  if (house) {
    // successfully created
    res.status(201).json({ message: `New house ${name} created` });
  } else {
    res.status(400).json({ error: "Unable to create house in Database" });
  }
};

// @desc    Get all houses
// @route   GET /api/house/houses
const getAllHouses = async (req, res) => {
  const houses = await House.find().lean();
  if (!houses?.length) {
    return res.status(400).json({ error: "No Houses Found" });
  }
  res.json({
    houses: houses.map((house) => ({
      id: house._id,
      name: house.name,
      point: house.point,
      crest: house.crest?.url,
      motto: house.motto,
      enMotto: house.enMotto,
      color: house.color,
      createdAt: house.createdAt,
    })),
  });
};

// @desc    Get house by Id
// @route   GET /api/house/:houseId
const getHouse = async (req, res) => {
  const { houseId } = req.params;

  if (!isValidObjectId(houseId))
    return res.status(401).json({ error: "Invalid Request" });

  const house = await House.findById(houseId).lean().exec();
  if (!house) return res.status(404).json({ error: "House not found!" });

  const { name, point, crest, motto, enMotto, color, createdAt } = house;
  res.json({
    house: {
      id: houseId,
      name,
      point,
      crest,
      motto,
      enMotto,
      color,
      createdAt,
    },
  });
};

// @desc    Get house by Id
// @route   GET /api/house/name/:houseName
const getHouseByName = async (req, res) => {
  const { houseName } = req.params;

  if (!["Albemarle", "Lambert", "Hobler", "Ettl"].includes(houseName))
    return res.status(401).json({ error: "Invalid Request" });

  const house = await House.find({ name: houseName }).lean().exec();
  if (!house) return res.status(404).json({ error: "House not found!" });
  const { name, point, crest, motto, enMotto, color, createdAt } = house[0];
  res.json({
    house: {
      id: house[0]._id,
      name,
      point,
      crest,
      motto,
      enMotto,
      color,
      createdAt,
    },
  });
};

// @desc    Get house leaders by house name
// @route   GET /api/house/leaders/:houseName
const getLeaders = async (req, res) => {
  // return leaders (faculty & student)
  const { houseName } = req.params;
  if (!["Albemarle", "Lambert", "Hobler", "Ettl"].includes(houseName))
    return res.status(401).json({ error: "Invalid Request" });

  const facultyLeader = await User.find({
    house: houseName,
    role: "HouseLeader",
    grade: "Faculty",
  })
    .lean()
    .exec();
  if (!facultyLeader)
    return res.status(404).json({ error: "Faculty Leader Not Found" });

  const studentLeader = await User.find({
    house: houseName,
    role: "HouseLeader",
    grade: "12",
  })
    .lean()
    .exec();
  if (!studentLeader)
    return res.status(404).json({ error: "Student Leader Not Found" });

  res.json({
    leaders: {
      faculty: facultyLeader,
      student: studentLeader,
    },
  });
};

// @desc    Get house members
// @route   GET /api/house/members/:houseName
const getMembers = async (req, res) => {
  // return leaders (faculty & student)
  const { houseName } = req.params;
  if (!["Albemarle", "Lambert", "Hobler", "Ettl"].includes(houseName))
    return res.status(401).json({ error: "Invalid Request" });

  const users = await User.find({ house: houseName }).lean().exec();

  if (!users) return res.status(404).json({ error: "Users Not Found" });

  res.json({
    users: users.map((user) => ({
      id: user._id,
      displayName: user.displayName,
      email: user.email,
      profilePic: user.profilePic,
      introduction: user.introduction,
      role: user.role,
      house: user.house,
    })),
  });
};

// @desc    Update house except crest
// @route   PUT /api/house/update/:houseId
const updateHouse = async (req, res) => {
  const { houseId } = req.params;
  const { name, point, crest, motto, enMotto, color } = req.body;

  if (!isValidObjectId(houseId)) {
    return res.status(401).json({ error: "Invalid Request" });
  }
  // Validate req body
  if (
    !name ||
    !motto ||
    !enMotto ||
    !color ||
    point === undefined ||
    point === null ||
    point === ""
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const house = await House.findById(houseId).lean().exec();
  if (!house) {
    return res.status(400).json({ error: "House Not Found" });
  }
  //check for duplicate
  const duplicate = await House.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate && duplicate?._id.toString() !== houseId) {
    // 409 status code: conflict
    return res.status(409).json({ error: "Duplicate house" });
  }

  const public_id = house.crest?.public_id;
  if (public_id && crest.public_id !== public_id) {
    console.log("need to destroy");
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return res.status(404).json({ error: "Could not remove crest" });
    }
  }

  house.name = name;
  house.point = Number(point);
  house.crest = crest;
  house.motto = motto;
  house.enMotto = enMotto;
  house.color = color;

  console.log(house);
  // try {
  //   await house.save();
  //   res.json({
  //     house: house,
  //   });
  // } catch (err) {
  //   console.log(err.message);
  //   res.status(400).json({ error: err.message });
  // }
  House.updateOne({ _id: houseId }, house)
    .then(() => {
      res.json({
        house: house,
      });
    })
    .catch((error) => {
      console.log(error.message);
      res.status(400).json({
        error: error,
      });
    });
};

// @desc    Update house points by houseId
// @route   PATCH /api/house/update/:houseId
const updateHousePoint = async (req, res) => {
  const { houseId } = req.params;
  const { point } = req.body;

  console.log(point);

  if (!isValidObjectId(houseId)) {
    return res.status(401).json({ error: "Invalid Request" });
  }

  try {
    const house = await House.findByIdAndUpdate(
      houseId,
      { $inc: { point: Number(point) } },
      { new: true }
    );
    if (!house) {
      return res.status(400).json({ error: "House Not Found" });
    }
    res.json({ newHouse: house });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

// @desc    Delete house by ID
// @route   DELETE /api/house/delete/:houseId
const deleteHouse = async (req, res) => {
  const { houseId } = req.params;

  if (!isValidObjectId(houseId)) {
    return res.status(401).json({ error: "Invalid Request" });
  }

  const house = await House.findById(houseId).lean().exec();
  if (!house) {
    return res.status(404).json({ error: "House Not Found" });
  }

  // destroy crest from cloud
  const { public_id } = house.crest;
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok")
      return res.status(404).json({ error: "Could not remove crest" });
  }

  await House.findByIdAndDelete(houseId);
  res.json({ message: `House ${houseId} removed successfully` });
};

module.exports = {
  getAllHouses,
  getHouse,
  getHouseByName,
  getMembers,
  getLeaders,
  createNewHouse,
  updateHouse,
  updateHousePoint,
  deleteHouse,
};
