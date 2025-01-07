const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  favoriteTeams: { type: [String], required: true },
  leagueTypes: { type: [String], required: true },
  titlesWon: { type: [String], default: [] },
});

module.exports = mongoose.model('Player', PlayerSchema);
