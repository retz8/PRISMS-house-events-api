const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referring to userSchema
    },
    host: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // referring to userSchema
      },
    ],
    tier: {
      type: String,
      enum: ["I", "II", "III", "IV", "Others"],
    },
    thumbnail: {
      type: Object,
      url: {
        type: URL,
      },
      public_id: {
        // to handle image data in cloud storage
        type: String,
      },
    },
    summary: {
      type: String,
    },
    content: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isForAll: {
      type: Boolean,
      default: true,
    },
    signUpLink: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // if all, frontend will send user as admin user
      },
    ],
    adminNote: {
      // update page
      type: String,
    },
    result: {
      // update page
      type: Object,

      Albemarle: {
        type: Number,
        default: 0,
      },
      Lambert: {
        type: Number,
        default: 0,
      },
      Hobler: {
        type: Number,
        default: 0,
      },
      Ettl: {
        type: Number,
        default: 0,
      },
    },
    upcoming: {
      // automatically update in mongoDB
      type: Boolean,
      default: true,
    },
    resultPosted: {
      // update page
      type: Object,
      active: {
        type: Boolean, // postedDate에 따라 결정되는 요소
        default: false,
      },
      waitingResult: {
        type: Boolean,
        default: true,
      },
      forceActive: {
        type: Boolean, // 강제적으로 껐다 키는 요소
        default: false,
      },
      postedDate: {
        type: Date,
      },

      default: {
        active: false,
        waitingResult: true,
        forceActive: false,
      },
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);
