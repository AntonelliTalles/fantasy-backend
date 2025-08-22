const mongoose = require("mongoose");

const PlayerHistorySchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  regularWins: { type: Number, default: 0 },  // Vitórias na fase regular
  regularLosses: { type: Number, default: 0 },  // Derrotas na fase regular
  playoffsWins: { type: Number, default: 0 },  // Vitórias nos playoffs
  playoffsLosses: { type: Number, default: 0 },  // Derrotas nos playoffs
  pointsScored: { type: Number, default: 0 },
  pointsConceded: { type: Number, default: 0 },
  pointDifference: { type: Number, default: 0 },  // saldo de pontos
  finalPosition: { type: Number, required: true },  // posição final na liga
  seasonYear: { type: Number, required: true },  // Ano da temporada
});

module.exports = mongoose.model("PlayerHistory", PlayerHistorySchema);
