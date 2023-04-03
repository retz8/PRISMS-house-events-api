const Event = require("../models/Event");
const User = require("../models/User");
const cloudinary = require("../cloud/cloudinaryConfig");
const getBaseInfo = require("../helpers/getBaseInfo");
const { isValidObjectId } = require("mongoose");

// @desc    Create new event
// @route   POST /api/auth/create
const createNewUser = async (req, res) => {
  //   console.log("req.bdoy:");
  //   console.log(req.body);
  const { id, email, name, picture } = req.body.user;
  const accessToken = req.headers.authorization.split(" ")[1];
  //res.json({ user: id });
  const currentUser = await User.findOne({ googleId: id });
  if (!currentUser) {
    // new user
    const { secure_url, public_id } = await cloudinary.uploader.upload(picture);
    const { grade, role, house } = getBaseInfo(
      (username = name),
      (email = email)
    );
    const newUser = {
      googleId: id,
      displayName: name,
      email: email,
      profilePic: { url: secure_url, public_id: public_id },
      grade: grade,
      role: role,
      house: house,
    };
    const user = await User.create(newUser);
    if (!user) {
      res.status(400).json({ error: "Unable to create New User in Database" });
    }
    res.json({
      id: user._id,
      displayName: name,
      email: email,
      profilePic: user.profilePic,
      introduction: user.introduction,
      grade: grade,
      role: role,
      house: house,
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
