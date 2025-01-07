const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leagueType: { type: String, required: true },
  teamCount: { type: Number, required: true },
  platform: { type: String, required: true },
  year: { type: Number, required: true },
  champion: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  runnerUp: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  thirdPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
});

module.exports = mongoose.model('League', LeagueSchema);
