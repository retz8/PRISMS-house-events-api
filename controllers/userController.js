const { isValidObjectId } = require("mongoose");
const createBaseInfoMap = require("../config/baseInfoMap");
const getBaseInfo = require("../helpers/getBaseInfo");
const User = require("../models/User");
const Event = require("../models/Event");
const cloudinary = require("../cloud/cloudinaryConfig");

// ----------------------------------------------------------------------------
// DEV Routes
// @desc    Create new user (only for Dev)
// @route   POST /api/user/dev
const createNewUserDev = async (req, res) => {
  const { displayName, email, introduction } = req.body;
  const { file } = req;

  if (!displayName || !email || !file) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    // 409 status code: conflict
    return res.status(409).json({ error: "Duplicate email" });
  }

  let profileObj;

  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    profileObj = {
      url: secure_url,
      public_id,
    };
  }

  const { grade, role, house } = getBaseInfo(displayName, email);

  const newUser = {
    googleId: "dev",
    displayName,
    email,
    grade: grade,
    role: role,
    house: house,
    profilePic: profileObj,
  };
  if (introduction) {
    newUser.introduction = introduction;
  }
  // Create and Store new user
  const user = await User.create(newUser);
  if (user) {
    // successfully created
    res.status(201).json({ message: `Dev: New user ${displayName} created` });
  } else {
    res.status(400).json({ error: "Dev: Invalid user data received" });
  }
};

// @desc    Create new user (only for Dev)
// @route   POST /api/user/dev-clear
const deleteAllDevUsers = async (req, res) => {
  const users = await User.find({ googleId: "dev" }).exec();

  console.log(users);
  users.map(async (user) => {
    const { result } = await cloudinary.uploader.destroy(
      user.profilePic.public_id
    );
    if (result !== "ok")
      res.status(404).json({ error: `Coudn't delete user ${user._id}` });
  });

  try {
    const deletedUsers = await User.deleteMany({ googleId: { $in: "dev" } });

    console.log(deletedUsers);

    res.status(200).json({ message: `Deleted Dev users.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ----------------------------------------------------------------------------

// @desc    Get all users
// @route   GET /api/user/users
const getAllUsers = async (req, res) => {
  // select("-password") : password는 불러오지마
  // lean: 필요한 데이터만 save같은 메소드 제외하고 json
  const users = await User.find().lean();
  if (!users?.length) {
    return res.status(400).json({ error: "No users found" });
  }
  res.json({
    users: users.map((user) => ({
      id: user._id,
      displayName: user.displayName,
      email: user.email,
      profilePic: user.profilePic,
      introduction: user.introduction,
      grade: user.grade,
      role: user.role,
      house: user.house,
      createdAt: user.createdAt,
    })),
  });
};

// @desc    Get user by email
// @route   GET /api/user/:userId
const getUser = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId))
    return res.status(401).json({ error: "Invalid Request" });

  const user = await User.findById(userId).lean().exec();
  if (!user) return res.status(404).json({ error: "User not found!" });

  const {
    displayName,
    firstName,
    lastName,
    email,
    profilePic,
    introduction,
    grade,
    role,
    house,
    createdAt,
  } = user;
  res.json({
    user: {
      id: userId,
      displayName,
      firstName,
      lastName,
      email,
      profilePic,
      introduction,
      grade,
      role,
      house,
      createdAt,
    },
  });
};

// @desc    Update user
// @route   PUT /api/user/update/:userId
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { displayName, grade, email, profilePic, introduction, role, house } =
    req.body;

  if (!isValidObjectId(userId)) {
    return res.status(401).json({ error: "Invalid Request" });
  }
  // Confirm data
  if (!displayName || !email || !role || !house || !grade) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const user = await User.findById(userId).exec();
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  //check for duplicate
  // const duplicate = await User.findOne({ email })
  //   .collation({ locale: "en", strength: 2 })
  //   .lean()
  //   .exec();
  // if (duplicate && duplicate?._id.toString() !== userId) {
  //   // 409 status code: conflict
  //   return res.status(409).json({ error: "Duplicate user" });
  // }

  if (role === "HouseLeader") {
    if (grade !== "12" && grade !== "Faculty") {
      return res
        .status(400)
        .json({ error: "House Leader should be Faculty member or Senior" });
    }
    const roleDuplicate = await User.findOne({
      house: house,
      role: "HouseLeader",
      grade: grade === "Faculty" ? "Faculty" : "12",
    });
    if (roleDuplicate) {
      return res.status(409).json({ error: "Duplicate House Leader" });
    }
  }

  const public_id = user.profilePic.public_id;
  if (public_id && profilePic.public_id !== public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return res.status(404).json({ error: "Could not remove crest" });
    }
  }

  user.displayName = displayName;
  user.email = email;
  user.introduction = introduction;
  user.grade = grade;
  user.role = role;
  user.house = house;
  user.profilePic = profilePic;
  console.log(profilePic);

  try {
    const updatedUser = await user.save();
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

// @desc    Delete user
// @route   DELETE /api/user/delete/:userId
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(401).json({ error: "Invalid Request" });
  }

  const events = await Event.find({ author: id }).lean().exec();
  if (events) {
    const { error } = await Event.deleteMany({ author: id });
    if (error) {
      return res
        .status(400)
        .json({ error: "Failed to remove events written by user" });
    }
  }

  const user = await User.findById(userId).exec();
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // destroy profilePic
  const { result } = await cloudinary.uploader.destroy(
    user.profilePic.public_id
  );
  if (result !== "ok") {
    return res.status(404).json({ error: "Could not remove user" });
  }
  console.log("find by id and delete");
  await User.findByIdAndDelete(userId);
  res.json({ message: `User ${userId} removed successfully` });
};

// @desc    Search user by name
// @route   GET /api/user/search
const searchUser = async (req, res) => {
  const { displayName } = req.query;
  if (!displayName.trim())
    return res.status(401).json({ error: "Search query is missing" });

  const users = await User.find({
    displayName: { $regex: displayName, $options: "i" },
  });
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

// @desc    Graduate all seniors (increase grade by 1)
// @route   DELETE /api/user/graduate
const graduateSeniors = async (req, res) => {
  // remove Seniors
  const users = await User.find({ grade: "12" });

  users.map(async (user) => {
    const { result } = await cloudinary.uploader.destroy(
      user.profilePic.public_id
    );
    if (result !== "ok")
      return res.json(404).json({ error: "Could not remove seniors" });

    const events = await Event.find({ author: user._id }).lean().exec();
    if (events) {
      const { error } = await Event.deleteMany({ author: user._id });
      if (error) {
        return res
          .status(400)
          .json({ error: "Failed to remove events written by users" });
      }
    }
  });

  User.deleteMany({ grade: "12" })
    .then(function () {
      return res.json({ message: "Seniors removed successfully" });
    })
    .catch(function (error) {
      return res.status(400).json({ error: error.message });
    });
};

// @desc    Increase grades by one
// @route   PATCH /api/user/promote
const promoteStudents = async (req, res) => {
  // increase grades by 1
  const res1 = await User.updateMany({ grade: "11" }, { grade: "12" });
  const res2 = await User.updateMany({ grade: "10" }, { grade: "11" });
  const res3 = await User.updateMany({ grade: "9" }, { grade: "10" });

  res.json({ message: "Students promoted successfully" });
};

// @desc    Update Base Info Map
// @route   GET /api/user/base-info
// ONLY SHOULD BE CALLED WHEN YOU ARE SURE TO RESTART SERVER
const updateBaseInfoMap = async (req, res) => {
  createBaseInfoMap();
  res.status(200).send("Successfullyl updated User Base Info");
};

module.exports = {
  createNewUserDev,
  deleteAllDevUsers,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUser,
  graduateSeniors,
  promoteStudents,
  updateBaseInfoMap,
};
