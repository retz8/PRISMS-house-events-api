const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");
const getBaseInfo = require("../helpers/getBaseInfo");
const cloudinary = require("../cloud/cloudinaryConfig");

module.exports = function (passport) {
  // done: callback function
  // serialize: after Google auth is completed, store user in the session
  passport.serializeUser((user, done) => {
    console.log("Serialize");
    console.log(user._id);
    return done(null, user._id); // add user._id on session
  });
  // deserialize: after user is serialized, enables session's user information to be converted to req.user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      console.log("Deserialize");
      console.log(user);
      return done(null, user);
    } catch (error) {
      return done(new Error("Failed to deserialize an user"));
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const { grade, role, house } = getBaseInfo(
          (username = profile.displayName),
          (email = profile.emails[0].value)
        );
        const currentUser = await User.findOne({ googleId: profile.id });
        // create new user and store in DB if DB doesn't have current user
        if (!currentUser) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            profile.photos[0].value
          );
          const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            profilePic: { url: secure_url, public_id: public_id },
            grade: grade,
            role: role,
            house: house,
          };
          console.log(newUser);
          const user = await User.create(newUser);
          return done(null, user);
        }
        return done(null, currentUser);
      }
    )
  );
};
