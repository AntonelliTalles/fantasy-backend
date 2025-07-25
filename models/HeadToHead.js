const mongoose = require('mongoose');

const HeadToHeadSchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  player1Wins: { type: Number, default: 0 },
  player2Wins: { type: Number, default: 0 },
  player1PlayoffsWins: { type: Number, default: 0 }, 
  player2PlayoffsWins: { type: Number, default: 0 }, 
  totalMatches: { type: Number, default: 0 },
  matchName: { type: String, required: true }
});

HeadToHeadSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('player1') || this.isModified('player2')) {
    this.matchName = `${this.player1.name} X ${this.player2.name}`;
  }
  next();
});

module.exports = mongoose.model('HeadToHead', HeadToHeadSchema);
