const express = require('express');
const League = require('../models/League');
const router = express.Router();

router.get('/', async (req, res) => {
  const leagues = await League.find();
  res.json(leagues);
});

router.post('/', async (req, res) => {
  const leagues = new League(req.body);
  await leagues.save();
  res.json(leagues);
});

module.exports = router;
