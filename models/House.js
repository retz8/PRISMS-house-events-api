const mongoose = require("mongoose");

const HouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["Albemarle", "Lambert", "Hobler", "Ettl"],
  },
  point: {
    type: Number,
    default: 0,
  },
  crest: {
    type: Object,
    url: {
      type: URL,
      required: true,
    },
    public_id: {
      // to handle image data in cloud storage
      type: String,
      required: true,
    },
  },
  motto: {
    type: String,
    default: "",
  },
  enMotto: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "white",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("House", HouseSchema);
