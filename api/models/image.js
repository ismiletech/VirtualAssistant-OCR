const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Image = new mongoose.Schema({
  image: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  }
});

mongoose.model("Image", Image);
