const express = require('express');
const League = require('../models/League');
const router = express.Router();

router.get('/', async (req, res) => {
  const leagues = await League.find()
    .populate('champion', 'name')
    .populate('runnerUp', 'name')
    .populate('thirdPlace', 'name')
    .populate('players', 'name');

  res.json(leagues);
});

router.post('/', async (req, res) => {
  const leagues = new League(req.body);
  await leagues.save();
  res.json(leagues);
});

router.delete('/:id', async (req, res) => {
  try {
    const league = await League.findByIdAndDelete(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'Liga não encontrada' });
    }
    res.json({ message: 'Liga deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar liga', error });
  }
});

module.exports = router;
