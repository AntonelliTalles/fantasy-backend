const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  league: { type: String, required: true },
  value: { type: Number, required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  year: { type: Number, required: true },
});

module.exports = mongoose.model("Record", recordSchema);
