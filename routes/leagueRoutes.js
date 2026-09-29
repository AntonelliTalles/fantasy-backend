const express = require("express");

const League = require("../models/League");
const requireAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Obter todas as ligas - PÚBLICO
router.get("/", async (req, res) => {
  try {
    const leagues = await League.find()
      .populate("champion", "name")
      .populate("runnerUp", "name")
      .populate("thirdPlace", "name")
      .populate("players", "name");

    res.json(leagues);
  } catch (error) {
    console.error("Erro ao buscar ligas:", error);

    res.status(500).json({
      message: "Erro ao buscar ligas",
      error,
    });
  }
});

// Criar liga - ADMIN
router.post("/", requireAdmin, async (req, res) => {
  try {
    const league = new League(req.body);

    await league.save();

    res.status(201).json(league);
  } catch (error) {
    console.error("Erro ao criar liga:", error);

    res.status(400).json({
      message: "Erro ao criar liga",
      error,
    });
  }
});

// Atualizar liga - ADMIN
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("champion", "name")
      .populate("runnerUp", "name")
      .populate("thirdPlace", "name")
      .populate("players", "name");

    if (!league) {
      return res.status(404).json({
        message: "Liga não encontrada",
      });
    }

    res.json(league);
  } catch (error) {
    console.error("Erro ao atualizar liga:", error);

    res.status(400).json({
      message: "Erro ao atualizar liga",
      error,
    });
  }
});

// Deletar liga - ADMIN
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const league = await League.findByIdAndDelete(
      req.params.id
    );

    if (!league) {
      return res.status(404).json({
        message: "Liga não encontrada",
      });
    }

    res.json({
      message: "Liga deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar liga:", error);

    res.status(500).json({
      message: "Erro ao deletar liga",
      error,
    });
  }
});

module.exports = router;