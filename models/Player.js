const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  favoriteTeams: [{ type: String }],
  leagueTypes: [{ type: String }],
  titlesWon: [{ type: String }],
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
