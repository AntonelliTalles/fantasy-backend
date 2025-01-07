const mongoose = require('mongoose');

const HeadToHeadSchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  player1Wins: { type: Number, default: 0 },
  player2Wins: { type: Number, default: 0 },
  totalMatches: { type: Number, default: 0 },
});

module.exports = mongoose.model('HeadToHead', HeadToHeadSchema);
