require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const playerRoutes = require('./routes/playerRoutes'); 
const leagueRoutes = require('./routes/leagueRoutes');
const headToHeadRoutes = require('./routes/headToHeadRoutes');
const newsRoutes = require('./routes/newsRoutes');

connectDB();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],  // Permitir apenas o frontend local
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization']  // Cabeçalhos permitidos
}));

app.use(bodyParser.json());

// Rotas de API
app.use('/api/players', playerRoutes);  // Agora passando diretamente como middleware
app.use('/api/leagues', leagueRoutes);
app.use('/api/head-to-head', headToHeadRoutes);
// app.use('/api/news', newsRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log('Servidor rodando na porta 5000');
});
