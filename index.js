const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Hello server is running").end();
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`app is running on port 8080`);
});
