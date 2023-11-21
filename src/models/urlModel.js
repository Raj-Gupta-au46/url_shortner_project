const mongoose = require("mongoose");

const URLSchema = new mongoose.Schema(
  {
    urlCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    longUrl: { type: String, required: true },
    shortUrl: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Url", URLSchema);
