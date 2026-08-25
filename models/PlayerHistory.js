const mongoose = require("mongoose");

const PlayerHistorySchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "League",
    required: true,
  },

  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },

  // Temporada regular
  regularWins: {
    type: Number,
    default: 0,
  },

  regularLosses: {
    type: Number,
    default: 0,
  },

  regularTies: {
    type: Number,
    default: 0,
  },

  // Playoffs
  madePlayoffs: {
    type: Boolean,
    default: false,
  },

  playoffsWins: {
    type: Number,
    default: 0,
  },

  playoffsLosses: {
    type: Number,
    default: 0,
  },

  // Pontuação
  pointsScored: {
    type: Number,
    default: 0,
  },

  pointsConceded: {
    type: Number,
    default: 0,
  },

  pointDifference: {
    type: Number,
    default: 0,
  },

  // Resultado da temporada
  finalPosition: {
    type: Number,
    required: true,
  },

  seasonYear: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("PlayerHistory", PlayerHistorySchema);