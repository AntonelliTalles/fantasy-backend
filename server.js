require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const playerRoutes = require("./routes/playerRoutes");
const leagueRoutes = require("./routes/leagueRoutes");
const headToHeadRoutes = require("./routes/headToHeadRoutes");
const playerHistoryRoutes = require("./routes/playerHistoryRoutes");
const powerRankingRoutes = require("./routes/powerRankingRoutes");
const allTimeRoutes = require("./routes/allTime");

connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem Origin, como Postman/health checks
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origem não permitida pelo CORS")
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Fantasy Stats API is running",
  });
});

app.use("/api/players", playerRoutes);
app.use("/api/leagues", leagueRoutes);
app.use("/api/head-to-head", headToHeadRoutes);
app.use("/api/player-history", playerHistoryRoutes);
app.use("/api/power-ranking", powerRankingRoutes);
app.use("/api/all-time", allTimeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});