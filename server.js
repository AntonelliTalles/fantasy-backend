const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const playerRoutes = require('./routes/playerRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const headToHeadRoutes = require('./routes/headToHeadRoutes');
const newsRoutes = require('./routes/newsRoutes');

connectDB();

const app = express();
app.use(bodyParser.json());
app.use('/api/players', playerRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/head-to-head', headToHeadRoutes);
app.use('/api/news', newsRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log('Servidor rodando na porta 5000');
});
