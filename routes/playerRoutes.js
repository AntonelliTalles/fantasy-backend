const express = require('express');
const Player = require('../models/Player');
const router = express.Router();

// Obter todos os jogadores
router.get('/', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter os jogadores', error });
  }
});

// Criar um novo jogador
router.post('/', async (req, res) => {
  try {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar o jogador', error });
  }
});

// Atualizar um jogador
router.put('/:id', async (req, res) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlayer) return res.status(404).json({ message: 'Jogador não encontrado' });
    res.json(updatedPlayer);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar o jogador', error });
  }
});

// Deletar um jogador
router.delete('/:id', async (req, res) => {
  try {
    const deletedPlayer = await Player.findByIdAndDelete(req.params.id);
    if (!deletedPlayer) return res.status(404).json({ message: 'Jogador não encontrado' });
    res.json({ message: 'Jogador deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar o jogador', error });
  }
});

module.exports = router;
