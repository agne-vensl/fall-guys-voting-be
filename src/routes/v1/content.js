const express = require("express");
const mysql = require("mysql2/promise");
const Joi = require("joi");
const router = express.Router();

const { mysqlConfig } = require("../../config");
const { loggedIn } = require("../../middleware");

const scoreSchema = Joi.object({
  score: Joi.number().required(),
  skinId: Joi.number().required(),
});

router.post("/all-skins", loggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT skins.id, rarities.title as rarity, season, name, image, 
      (SELECT COALESCE(CAST(SUM(score) AS SIGNED), 0) FROM scores WHERE skins.id = skin_id) AS score, 
      (SELECT COUNT(id) FROM scores WHERE skins.id = skin_id AND user_id = ${req.userData.id}) AS voted 
      FROM skins 
      JOIN rarities ON rarity_id = rarities.id 
      JOIN seasons ON season_id = seasons.id 
      ORDER BY score DESC, rarity_id DESC`
    );
    con.end();

    res.send(data);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ error: "Unexpected error. Please contact an admin" });
  }
});

router.post("/add-score", loggedIn, async (req, res) => {
  let scoreData;

  try {
    scoreData = await scoreSchema.validateAsync({
      score: req.body.score,
      skinId: req.body.skinId,
    });

    req.scoreData = scoreData;
  } catch (e) {
    return res.status(400).send({ error: "Incorrect data" });
  }

  if (req.scoreData.score < -1 || req.scoreData.score > 1) {
    return res.status(400).send({ error: "Incorrect data" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [alreadyVoted] = await con.execute(
      `SELECT id FROM scores WHERE user_id = ${mysql.escape(
        req.userData.id
      )} AND skin_id = ${mysql.escape(req.scoreData.skinId)}`
    );

    if (alreadyVoted.length) {
      return res
        .status(400)
        .send({ error: "You have already voted for this skin" });
    }

    const [result] = await con.execute(
      `INSERT INTO scores (user_id, skin_id, score) VALUES (${mysql.escape(
        req.userData.id
      )}, ${mysql.escape(req.scoreData.skinId)}, ${mysql.escape(
        req.scoreData.score
      )})`
    );
    con.end();

    if (result.affectedRows != 1) {
      return res
        .status(500)
        .send({ error: "Unexpected error occured. Please try again later" });
    }

    res.send({ message: "Vote has been recorded" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ error: "Unexpected error. Please contact an admin" });
  }
});

module.exports = router;
