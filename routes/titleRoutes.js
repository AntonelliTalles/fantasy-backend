const express = require("express");
const Title = require("../models/Title");
const router = express.Router();

// Criar título
router.post("/", async (req, res) => {
  try {
    const title = new Title(req.body);
    await title.save();
    res.status(201).json(title);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar título", error });
  }
});

// Obter todos os títulos
router.get("/", async (req, res) => {
  try {
    const titles = await Title.find().populate("playerId");
    res.json(titles);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar títulos", error });
  }
});

module.exports = router;
