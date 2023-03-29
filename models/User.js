const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true, // createNewUser를위해
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  profilePic: {
    type: Object,
    url: {
      type: URL,
      default:
        "https://res.cloudinary.com/dlhqii3cq/image/upload/v1679707897/addwrt5d63jn8jnhkdqv.png",
    },
    public_id: {
      // to handle image data in cloud storage
      type: String,
      default: "addwrt5d63jn8jnhkdqv",
    },
  },
  introduction: {
    type: String,
    default: "",
  },
  grade: {
    type: String,
    required: true,
    enum: ["Admin", "12", "11", "10", "9", "Faculty"],
  },
  role: {
    // 고민이 필요함
    type: String,
    require: true,
    default: "Student",
    enum: ["Admin", "HouseLeader", "Faculty", "Student"],
  },
  house: {
    type: String,
    require: true,
    default: "None",
    enum: ["None", "Albemarle", "Ettl", "Hobler", "Lambert"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
