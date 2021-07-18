const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { mysqlConfig, jwtSecret } = require("../../config");
const {
  isRegisterDataCorrect,
  isLoginDataCorrect,
} = require("../../middleware");

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

router.post("/login", isLoginDataCorrect, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT id, email, password FROM users WHERE email = ${mysql.escape(
        req.userData.email
      )}`
    );
    con.end();

    if (data.length !== 1) {
      return res.status(400).send({ error: "Incorrect email or password" });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.userData.password,
      data[0].password
    );

    if (!passwordIsValid) {
      return res.status(400).send({ error: "Incorrect email or password" });
    }

    const token = jwt.sign(
      {
        id: data[0].id,
        email: data[0].email,
      },
      jwtSecret,
      { expiresIn: 60 * 60 }
    );

    return res.send({ message: "Successfully logged in", token });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ error: "Error in database. Please contact an admin" });
  }
});

module.exports = router;
