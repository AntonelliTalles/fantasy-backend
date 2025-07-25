const express = require("express");
const Record = require("../models/Record");
const router = express.Router();

// Criar recorde
router.post("/", async (req, res) => {
  try {
    const record = new Record(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar recorde", error });
  }
});

// Obter todos os recordes
router.get("/", async (req, res) => {
  try {
    const records = await Record.find().populate("playerId");
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar recordes", error });
  }
});

module.exports = router;
