const express = require("express");
const HeadToHead = require("../models/HeadToHead");
const Player = require("../models/Player");  // Adicione esta linha
const League = require("../models/League");  // Também adicione a importação da Liga
const router = express.Router();

// Criar confronto direto
router.post("/", async (req, res) => {
  try {
    console.log("Dados recebidos para criação do confronto:", req.body);
    const { player1, player2, player1Wins, player2Wins, player1PlayoffsWins,
        player2PlayoffsWins, totalMatches, league, matchName } = req.body;

     // Adicionando log para verificação dos dados antes de salvar
    console.log("Dados recebidos para criação do confronto:", req.body);

    const player1Data = await Player.findById(player1);
    const player2Data = await Player.findById(player2);
    const leagueData = await League.findById(league);

    if (!player1Data || !player2Data || !leagueData) {
      return res.status(404).json({ message: "Jogadores ou Liga não encontrados" });
    }

    // Gerar o nome do confronto
    const generatedMatchName = `${player1Data.name} X ${player2Data.name}`;
    console.log("Nome do confronto gerado:", generatedMatchName);

    // Criar o novo confronto com todos os campos, incluindo matchName
    const newMatch = new HeadToHead({
      player1,
      player2,
      player1Wins,
      player2Wins,
      player1PlayoffsWins,
      player2PlayoffsWins,
      totalMatches,
      league,
      matchName: generatedMatchName,  // nome gerado no backend
    });

    // Adicionar log antes de salvar
    console.log("Tentando salvar o confronto:", newMatch);

    // Salvar o novo confronto no banco
    await newMatch.save();
    // Log após salvar
    console.log("Confronto salvo:", newMatch);
    res.status(201).json(newMatch);
  } catch (error) {
    console.error("Erro ao criar confronto direto", error);
    res.status(400).json({ message: "Erro ao criar confronto direto", error });
  }
});

// Obter todos os confrontos diretos
router.get("/", async (req, res) => {
  try {
    const matches = await HeadToHead.find()
      .populate("league player1 player2")
      .exec();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar confrontos diretos", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { player1, player2, player1Wins, player2Wins, player1PlayoffsWins, player2PlayoffsWins, totalMatches, league } = req.body;

    // Buscar o confronto pelo ID
    const updatedMatch = await HeadToHead.findByIdAndUpdate(
      req.params.id, // ID do confronto
      {
        player1,
        player2,
        player1Wins,
        player2Wins,
        player1PlayoffsWins,
        player2PlayoffsWins,
        totalMatches,
        league,
        matchName: `${player1} X ${player2}` // Gerar o nome do confronto
      },
      { new: true } // Retornar o novo objeto após atualização
    );

    // Verificar se o confronto existe
    if (!updatedMatch) {
      return res.status(404).json({ message: "Confronto não encontrado" });
    }

    res.json(updatedMatch); // Retornar o confronto atualizado
  } catch (error) {
    console.error("Erro ao atualizar confronto direto", error);
    res.status(400).json({ message: "Erro ao atualizar confronto direto", error });
  }
});

// Deletar confronto direto
router.delete("/:id", async (req, res) => {
  try {
    const deletedMatch = await HeadToHead.findByIdAndDelete(req.params.id);
    if (!deletedMatch) return res.status(404).json({ message: "Confronto não encontrado" });
    res.json({ message: "Confronto deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar confronto", error });
  }
});

module.exports = router;
