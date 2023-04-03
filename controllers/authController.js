const Event = require("../models/Event");
const User = require("../models/User");
const cloudinary = require("../cloud/cloudinaryConfig");
const { isValidObjectId } = require("mongoose");
const getBaseInfo = require("../helpers/getBaseInfo");

// @desc    Create new user
// @route   POST /api/auth/create
const createNewUser = async (req, res) => {
  const { user } = req.body;
  const currentUser = await User.findOne({ googleId: user.id }).lean().exec();

  if (!currentUser) {
    // create new user
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      user.picture
    );
    const { grade, role, house } = getBaseInfo(
      (username = user.name),
      (email = user.email)
    );
    const newUser = {
      googleId: user.id,
      displayName: user.name,
      email: user.email,
      profilePic: { url: secure_url, public_id: public_id },
      grade: grade,
      role: role,
      house: house,
    };
    const createdUser = await User.create(newUser);
    res.json({
      id: createdUser._id,
      displayName: createdUser.displayName,
      email: createdUser.email,
      profilePic: createdUser.profilePic,
      introduction: createdUser.introduction,
      grade: createdUser.grade,
      role: createdUser.role,
      house: createdUser.house,
    });
  }
  res.json({
    id: currentUser._id,
    displayName: currentUser.displayName,
    email: currentUser.email,
    profilePic: currentUser.profilePic,
    introduction: currentUser.introduction,
    grade: currentUser.grade,
    role: currentUser.role,
    house: currentUser.house,
  });
};

module.exports = {
  createNewUser,
};
