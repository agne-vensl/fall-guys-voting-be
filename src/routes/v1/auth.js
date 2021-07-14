const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const router = express.Router();

const { mysqlConfig } = require("../../config");
const { isRegisterDataCorrect } = require("../../middleware");

router.post("/register", isRegisterDataCorrect, async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.userData.password, 10);

    const con = await mysql.createConnection(mysqlConfig);

    const [user] = await con.execute(
      `SELECT id FROM users WHERE email = ${mysql.escape(req.userData.email)}`
    );

    if (user.length) {
      return res
        .status(400)
        .send({ error: "User with that email already exists" });
    }

    const [data] = await con.execute(
      `INSERT INTO users (name, email, password) VALUES (${mysql.escape(
        req.userData.name
      )}, ${mysql.escape(req.userData.email)}, '${hashedPassword}')`
    );
    con.end();

    if (data.affectedRows != 1) {
      return res.status(500).send({
        error: "Failed to register an account. Please contact an admin",
      });
    }

    res.send({ message: "Account successfully registered" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ error: "Error in database. Please contact an admin" });
  }
});

module.exports = router;
