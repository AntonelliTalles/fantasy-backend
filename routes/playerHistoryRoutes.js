const express = require("express");

const PlayerHistory = require("../models/PlayerHistory");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Criar histórico - ADMIN
router.post("/", requireAdmin, async (req, res) => {
  try {
    console.log(
      "Dados recebidos:",
      req.body
    );

    const {
      league,
      player,
      regularWins,
      regularLosses,
      regularTies,
      madePlayoffs,
      playoffsWins,
      playoffsLosses,
      pointsScored,
      pointsConceded,
      pointDifference,
      finalPosition,
      seasonYear,
    } = req.body;

    const newPlayerHistory =
      new PlayerHistory({
        league,
        player,
        regularWins,
        regularLosses,
        regularTies,
        madePlayoffs,
        playoffsWins,
        playoffsLosses,
        pointsScored,
        pointsConceded,
        pointDifference,
        finalPosition,
        seasonYear,
      });

    await newPlayerHistory.save();

    console.log(
      "Histórico de jogador salvo:",
      newPlayerHistory
    );

    res.status(201).json(
      newPlayerHistory
    );
  } catch (error) {
    console.error(
      "Erro ao salvar histórico do jogador",
      error
    );

    res.status(400).json({
      message:
        "Erro ao salvar histórico",
      error,
    });
  }
});

// Obter todos os históricos - PÚBLICO
router.get("/", async (req, res) => {
  try {
    const histories =
      await PlayerHistory.find().populate(
        "league player"
      );

    res.json(histories);
  } catch (error) {
    res.status(500).json({
      message:
        "Erro ao buscar históricos",
      error,
    });
  }
});

// Deletar histórico - ADMIN
router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const deletedHistory =
        await PlayerHistory.findByIdAndDelete(
          req.params.id
        );

      if (!deletedHistory) {
        return res.status(404).json({
          message:
            "Histórico não encontrado",
        });
      }

      res.json({
        message:
          "Histórico deletado com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Erro ao deletar histórico",
        error,
      });
    }
  }
);

// Editar histórico - ADMIN
router.put(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        league,
        player,
        regularWins,
        regularLosses,
        regularTies,
        madePlayoffs,
        playoffsWins,
        playoffsLosses,
        pointsScored,
        pointsConceded,
        pointDifference,
        finalPosition,
        seasonYear,
      } = req.body;

      const updatedHistory =
        await PlayerHistory.findByIdAndUpdate(
          req.params.id,
          {
            league,
            player,
            regularWins,
            regularLosses,
            regularTies,
            madePlayoffs,
            playoffsWins,
            playoffsLosses,
            pointsScored,
            pointsConceded,
            pointDifference,
            finalPosition,
            seasonYear,
          },
          {
            new: true,
          }
        );

      if (!updatedHistory) {
        return res.status(404).json({
          message:
            "Histórico não encontrado",
        });
      }

      res.json(updatedHistory);
    } catch (error) {
      console.error(
        "Erro ao editar histórico",
        error
      );

      res.status(400).json({
        message:
          "Erro ao editar histórico",
        error,
      });
    }
  }
);

module.exports = router;