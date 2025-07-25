const mongoose = require("mongoose");

const titleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  league: { type: String, required: true },
  year: { type: Number, required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
});

module.exports = mongoose.model("Title", titleSchema);
