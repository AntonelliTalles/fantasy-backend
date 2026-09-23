const express = require("express");

const PlayerHistory = require("../models/PlayerHistory");
const League = require("../models/League");

const router = express.Router();

/**
 * GET /api/all-time
 *
 * Query params:
 * leagueType = ALL | NFL | NBA | MLB
 *
 * Exemplos:
 * /api/all-time?leagueType=NFL
 * /api/all-time?leagueType=NBA
 * /api/all-time?leagueType=ALL
 */
router.get("/", async (req, res) => {
  try {
    const requestedLeagueType = String(
      req.query.leagueType || "ALL"
    ).toUpperCase();

    const validLeagueTypes = ["ALL", "NFL", "NBA", "MLB"];

    if (!validLeagueTypes.includes(requestedLeagueType)) {
      return res.status(400).json({
        message: "Modalidade inválida.",
        validLeagueTypes,
      });
    }

    // ---------------------------------------------------------
    // 1. Buscar as ligas que fazem parte da consulta
    // ---------------------------------------------------------

    const leagueFilter =
      requestedLeagueType === "ALL"
        ? {}
        : { leagueType: requestedLeagueType };

    const leagues = await League.find(leagueFilter)
      .populate("champion runnerUp thirdPlace")
      .lean();

    const leagueIds = leagues.map((league) => league._id);

    // Nenhuma liga encontrada
    if (leagueIds.length === 0) {
      return res.json({
        filter: {
          leagueType: requestedLeagueType,
        },
        totalPlayers: 0,
        totalLeagues: 0,
        ranking: [],
      });
    }

    // ---------------------------------------------------------
    // 2. Buscar todos os históricos dessas ligas
    // ---------------------------------------------------------

    const histories = await PlayerHistory.find({
      league: {
        $in: leagueIds,
      },
    })
      .populate("player")
      .populate("league")
      .lean();

    // ---------------------------------------------------------
    // 3. Estrutura de agregação por jogador
    // ---------------------------------------------------------

    const rankingMap = new Map();

    const getOrCreatePlayer = (player) => {
      const playerId = player._id.toString();

      if (!rankingMap.has(playerId)) {
        rankingMap.set(playerId, {
          player: {
            _id: player._id,
            name: player.name,
          },

          seasons: 0,

          // Regular season
          regularWins: 0,
          regularLosses: 0,
          regularTies: 0,

          // Playoffs
          playoffAppearances: 0,
          playoffsWins: 0,
          playoffsLosses: 0,

          // Totais
          totalWins: 0,
          totalLosses: 0,
          totalGames: 0,

          // Pontuação
          pointsScored: 0,
          pointsConceded: 0,
          pointDifference: 0,

          // Resultados
          championships: 0,
          runnerUps: 0,
          thirdPlaces: 0,

          // Calculados depois
          winPercentage: 0,
          regularWinPercentage: 0,
          playoffWinPercentage: 0,
        });
      }

      return rankingMap.get(playerId);
    };

    // ---------------------------------------------------------
    // 4. Somar históricos
    // ---------------------------------------------------------

    histories.forEach((history) => {
      if (!history.player) {
        return;
      }

      const playerRanking = getOrCreatePlayer(history.player);

      const regularWins = Number(history.regularWins || 0);
      const regularLosses = Number(history.regularLosses || 0);
      const regularTies = Number(history.regularTies || 0);

      const playoffsWins = Number(history.playoffsWins || 0);
      const playoffsLosses = Number(history.playoffsLosses || 0);

      const pointsScored = Number(history.pointsScored || 0);
      const pointsConceded = Number(
        history.pointsConceded || 0
      );

      playerRanking.seasons += 1;

      // Regular
      playerRanking.regularWins += regularWins;
      playerRanking.regularLosses += regularLosses;
      playerRanking.regularTies += regularTies;

      // Playoffs
      playerRanking.playoffsWins += playoffsWins;
      playerRanking.playoffsLosses += playoffsLosses;

      /**
       * Compatibilidade com registros antigos:
       *
       * Alguns históricos anteriores podem não ter
       * madePlayoffs salvo.
       *
       * Se houve partida de playoff, consideramos que
       * o jogador chegou aos playoffs.
       */
      const madePlayoffs =
        history.madePlayoffs === true ||
        playoffsWins > 0 ||
        playoffsLosses > 0;

      if (madePlayoffs) {
        playerRanking.playoffAppearances += 1;
      }

      // Pontuação
      playerRanking.pointsScored += pointsScored;
      playerRanking.pointsConceded += pointsConceded;

      /**
       * Calculamos o saldo novamente em vez de depender
       * do pointDifference salvo no banco.
       */
      playerRanking.pointDifference +=
        pointsScored - pointsConceded;
    });

    // ---------------------------------------------------------
    // 5. Contabilizar títulos / vice / terceiro
    // ---------------------------------------------------------

    leagues.forEach((league) => {
      if (league.champion) {
        const championId =
          league.champion._id.toString();

        const championRanking =
          rankingMap.get(championId);

        if (championRanking) {
          championRanking.championships += 1;
        }
      }

      if (league.runnerUp) {
        const runnerUpId =
          league.runnerUp._id.toString();

        const runnerUpRanking =
          rankingMap.get(runnerUpId);

        if (runnerUpRanking) {
          runnerUpRanking.runnerUps += 1;
        }
      }

      if (league.thirdPlace) {
        const thirdPlaceId =
          league.thirdPlace._id.toString();

        const thirdPlaceRanking =
          rankingMap.get(thirdPlaceId);

        if (thirdPlaceRanking) {
          thirdPlaceRanking.thirdPlaces += 1;
        }
      }
    });

    // ---------------------------------------------------------
    // 6. Calcular estatísticas derivadas
    // ---------------------------------------------------------

    const ranking = Array.from(
      rankingMap.values()
    ).map((player) => {
      player.totalWins =
        player.regularWins +
        player.playoffsWins;

      player.totalLosses =
        player.regularLosses +
        player.playoffsLosses;

      player.totalGames =
        player.totalWins +
        player.totalLosses +
        player.regularTies;

      const regularGames =
        player.regularWins +
        player.regularLosses +
        player.regularTies;

      const playoffGames =
        player.playoffsWins +
        player.playoffsLosses;

      /**
       * Aproveitamento geral:
       *
       * vitória = 1
       * empate = 0.5
       * derrota = 0
       */
      player.winPercentage =
        player.totalGames > 0
          ? Number(
              (
                ((player.totalWins +
                  player.regularTies * 0.5) /
                  player.totalGames) *
                100
              ).toFixed(2)
            )
          : 0;

      player.regularWinPercentage =
        regularGames > 0
          ? Number(
              (
                ((player.regularWins +
                  player.regularTies * 0.5) /
                  regularGames) *
                100
              ).toFixed(2)
            )
          : 0;

      player.playoffWinPercentage =
        playoffGames > 0
          ? Number(
              (
                (player.playoffsWins /
                  playoffGames) *
                100
              ).toFixed(2)
            )
          : 0;

      // Evitar problemas de ponto flutuante
      player.pointsScored = Number(
        player.pointsScored.toFixed(2)
      );

      player.pointsConceded = Number(
        player.pointsConceded.toFixed(2)
      );

      player.pointDifference = Number(
        player.pointDifference.toFixed(2)
      );

      return player;
    });

    // ---------------------------------------------------------
    // 7. Ordenação padrão
    // ---------------------------------------------------------

    ranking.sort((a, b) => {
      // 1º - Total de vitórias
      if (b.totalWins !== a.totalWins) {
        return b.totalWins - a.totalWins;
      }

      // 2º - Aproveitamento
      if (
        b.winPercentage !==
        a.winPercentage
      ) {
        return (
          b.winPercentage -
          a.winPercentage
        );
      }

      // 3º - Vitórias em playoffs
      if (
        b.playoffsWins !==
        a.playoffsWins
      ) {
        return (
          b.playoffsWins -
          a.playoffsWins
        );
      }

      // 4º - Títulos
      if (
        b.championships !==
        a.championships
      ) {
        return (
          b.championships -
          a.championships
        );
      }

      // 5º - Saldo de pontos
      return (
        b.pointDifference -
        a.pointDifference
      );
    });

    // ---------------------------------------------------------
    // 8. Adicionar posição
    // ---------------------------------------------------------

    const rankingWithPosition = ranking.map(
      (player, index) => ({
        position: index + 1,
        ...player,
      })
    );

    // ---------------------------------------------------------
    // 9. Response
    // ---------------------------------------------------------

    res.json({
      filter: {
        leagueType: requestedLeagueType,
      },

      totalPlayers: rankingWithPosition.length,
      totalLeagues: leagues.length,
      totalHistoryRecords: histories.length,

      ranking: rankingWithPosition,
    });
  } catch (error) {
    console.error(
      "Erro ao gerar histórico geral:",
      error
    );

    res.status(500).json({
      message:
        "Erro ao gerar histórico geral.",
      error: error.message,
    });
  }
});

module.exports = router;