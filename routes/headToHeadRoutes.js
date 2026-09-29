const express = require("express");

const HeadToHead = require("../models/HeadToHead");
const Player = require("../models/Player");
const League = require("../models/League");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Criar confronto direto - ADMIN
router.post("/", requireAdmin, async (req, res) => {
  try {
    console.log(
      "Dados recebidos para criação do confronto:",
      req.body
    );

    const {
      player1,
      player2,
      player1Wins,
      player2Wins,
      player1PlayoffsWins,
      player2PlayoffsWins,
      totalMatches,
      league,
    } = req.body;

    const player1Data = await Player.findById(player1);
    const player2Data = await Player.findById(player2);
    const leagueData = await League.findById(league);

    if (
      !player1Data ||
      !player2Data ||
      !leagueData
    ) {
      return res.status(404).json({
        message:
          "Jogadores ou Liga não encontrados",
      });
    }

    const generatedMatchName =
      `${player1Data.name} X ${player2Data.name}`;

    const newMatch = new HeadToHead({
      player1,
      player2,
      player1Wins,
      player2Wins,
      player1PlayoffsWins,
      player2PlayoffsWins,
      totalMatches,
      league,
      matchName: generatedMatchName,
    });

    await newMatch.save();

    console.log(
      "Confronto salvo:",
      newMatch
    );

    res.status(201).json(newMatch);
  } catch (error) {
    console.error(
      "Erro ao criar confronto direto",
      error
    );

    res.status(400).json({
      message:
        "Erro ao criar confronto direto",
      error,
    });
  }
});

// Obter todos os confrontos diretos - PÚBLICO
router.get("/", async (req, res) => {
  try {
    const matches = await HeadToHead.find()
      .populate("league player1 player2")
      .exec();

    res.json(matches);
  } catch (error) {
    res.status(500).json({
      message:
        "Erro ao buscar confrontos diretos",
      error,
    });
  }
});

// Atualizar confronto direto - ADMIN
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const {
      player1,
      player2,
      player1Wins,
      player2Wins,
      player1PlayoffsWins,
      player2PlayoffsWins,
      totalMatches,
      league,
    } = req.body;

    const updatedMatch =
      await HeadToHead.findByIdAndUpdate(
        req.params.id,
        {
          player1,
          player2,
          player1Wins,
          player2Wins,
          player1PlayoffsWins,
          player2PlayoffsWins,
          totalMatches,
          league,
          matchName: `${player1} X ${player2}`,
        },
        {
          new: true,
        }
      );

    if (!updatedMatch) {
      return res.status(404).json({
        message: "Confronto não encontrado",
      });
    }

    res.json(updatedMatch);
  } catch (error) {
    console.error(
      "Erro ao atualizar confronto direto",
      error
    );

    res.status(400).json({
      message:
        "Erro ao atualizar confronto direto",
      error,
    });
  }
});

// Deletar confronto direto - ADMIN
router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const deletedMatch =
        await HeadToHead.findByIdAndDelete(
          req.params.id
        );

      if (!deletedMatch) {
        return res.status(404).json({
          message:
            "Confronto não encontrado",
        });
      }

      res.json({
        message:
          "Confronto deletado com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Erro ao deletar confronto",
        error,
      });
    }
  }
);

module.exports = router;