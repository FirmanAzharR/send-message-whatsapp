const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Hello server is running").end();
});

app.listen(3000, () => {
  console.log(`app is running on port 3000`);
});
