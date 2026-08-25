const express = require("express");
const PlayerHistory = require("../models/PlayerHistory");

const router = express.Router();

const SCORE_RULES = {
  REGULAR_WIN: 3,
  REGULAR_TIE: 1,
  REGULAR_LOSS: -1,

  MADE_PLAYOFFS: 15,
  PLAYOFF_WIN: 8,
  PLAYOFF_LOSS: -2,

  CHAMPION: 100,
  RUNNER_UP: 60,
  THIRD_PLACE: 35,

  MAX_POSITION_POINTS: 20,
};

const calculatePositionPoints = (finalPosition, teamCount) => {
  if (!finalPosition || !teamCount || teamCount <= 1) {
    return 0;
  }

  const positionPoints =
    SCORE_RULES.MAX_POSITION_POINTS *
    ((teamCount - finalPosition) / (teamCount - 1));

  return Math.max(0, Math.round(positionPoints));
};

const getPlayerId = (player) => {
  if (!player) return null;

  if (player._id) {
    return player._id.toString();
  }

  return player.toString();
};

const didMakePlayoffs = (history) => {
  return (
    history.madePlayoffs === true ||
    (history.playoffsWins ?? 0) > 0 ||
    (history.playoffsLosses ?? 0) > 0
  );
};

const calculateSeasonScore = (history) => {
  const regularWins = history.regularWins ?? 0;
  const regularLosses = history.regularLosses ?? 0;
  const regularTies = history.regularTies ?? 0;

  const playoffsWins = history.playoffsWins ?? 0;
  const playoffsLosses = history.playoffsLosses ?? 0;

  const madePlayoffs = didMakePlayoffs(history);

  const league = history.league;

  let score = 0;

  // Temporada regular
  score += regularWins * SCORE_RULES.REGULAR_WIN;
  score += regularTies * SCORE_RULES.REGULAR_TIE;
  score += regularLosses * SCORE_RULES.REGULAR_LOSS;

  // Playoffs
  if (madePlayoffs) {
    score += SCORE_RULES.MADE_PLAYOFFS;
  }

  score += playoffsWins * SCORE_RULES.PLAYOFF_WIN;
  score += playoffsLosses * SCORE_RULES.PLAYOFF_LOSS;

  // Pódio
  const playerId = getPlayerId(history.player);

  const championId = getPlayerId(league?.champion);
  const runnerUpId = getPlayerId(league?.runnerUp);
  const thirdPlaceId = getPlayerId(league?.thirdPlace);

  let medal = null;

  if (playerId && championId === playerId) {
    score += SCORE_RULES.CHAMPION;
    medal = "gold";
  } else if (playerId && runnerUpId === playerId) {
    score += SCORE_RULES.RUNNER_UP;
    medal = "silver";
  } else if (playerId && thirdPlaceId === playerId) {
    score += SCORE_RULES.THIRD_PLACE;
    medal = "bronze";
  }

  // Posição final
  const positionPoints = calculatePositionPoints(
    history.finalPosition,
    league?.teamCount
  );

  score += positionPoints;

  return {
    score,
    medal,
    positionPoints,
    madePlayoffs,
  };
};

// GET /api/power-ranking
// GET /api/power-ranking?leagueType=NFL
router.get("/", async (req, res) => {
  try {
    const { leagueType } = req.query;

    const histories = await PlayerHistory.find()
      .populate("player")
      .populate({
        path: "league",
        populate: [
          {
            path: "champion",
            model: "Player",
          },
          {
            path: "runnerUp",
            model: "Player",
          },
          {
            path: "thirdPlace",
            model: "Player",
          },
        ],
      });

    const filteredHistories = leagueType
      ? histories.filter(
          (history) => history.league?.leagueType === leagueType
        )
      : histories;

    const rankingMap = new Map();

    filteredHistories.forEach((history) => {
      if (!history.player || !history.league) {
        return;
      }

      const playerId = history.player._id.toString();

      if (!rankingMap.has(playerId)) {
        rankingMap.set(playerId, {
          playerId,
          playerName: history.player.name,

          totalScore: 0,
          seasonsPlayed: 0,
          averageScore: 0,

          gold: 0,
          silver: 0,
          bronze: 0,

          regularWins: 0,
          regularLosses: 0,
          regularTies: 0,

          playoffAppearances: 0,
          playoffsWins: 0,
          playoffsLosses: 0,

          positionPoints: 0,
        });
      }

      const playerRanking = rankingMap.get(playerId);

      const seasonResult = calculateSeasonScore(history);

      playerRanking.totalScore += seasonResult.score;

      playerRanking.seasonsPlayed += 1;

      playerRanking.regularWins += history.regularWins ?? 0;
      playerRanking.regularLosses += history.regularLosses ?? 0;
      playerRanking.regularTies += history.regularTies ?? 0;

      if (seasonResult.madePlayoffs) {
        playerRanking.playoffAppearances += 1;
      }

      playerRanking.playoffsWins += history.playoffsWins ?? 0;
      playerRanking.playoffsLosses += history.playoffsLosses ?? 0;

      playerRanking.positionPoints += seasonResult.positionPoints;

      if (seasonResult.medal === "gold") {
        playerRanking.gold += 1;
      }

      if (seasonResult.medal === "silver") {
        playerRanking.silver += 1;
      }

      if (seasonResult.medal === "bronze") {
        playerRanking.bronze += 1;
      }
    });

    const ranking = Array.from(rankingMap.values())
      .map((player) => {
        const averageScore =
          player.seasonsPlayed > 0
            ? Number(
                (
                  player.totalScore /
                  player.seasonsPlayed
                ).toFixed(2)
              )
            : 0;

        return {
          ...player,
          averageScore,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((player, index) => ({
        position: index + 1,
        ...player,
      }));

    res.json({
      filter: {
        leagueType: leagueType || "ALL",
      },

      rules: SCORE_RULES,

      totalPlayers: ranking.length,

      ranking,
    });
  } catch (error) {
    console.error(
      "Erro ao gerar Power Ranking:",
      error
    );

    res.status(500).json({
      message: "Erro ao gerar Power Ranking",
      error,
    });
  }
});

module.exports = router;