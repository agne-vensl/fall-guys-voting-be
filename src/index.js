const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/v1/auth");
const contentRoutes = require("./routes/v1/content");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("OK");
});

app.use("/v1/auth", authRoutes);
app.use("/v1/content", contentRoutes);

app.all("*", (req, res) => {
  res.status(404).send({ error: "Page not found" });
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on port ${port}`));
