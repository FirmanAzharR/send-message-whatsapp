const express = require("express");
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).send("Hello server is running").end();
});

app.post("/whatsapp/send", async (req, res) => {
  try {
    const number = req.body.number;

    await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const SESSION_FILE_PATH = "./session.json";
    let sessionData;

    if (fs.existsSync(SESSION_FILE_PATH)) {
      sessionData = require(SESSION_FILE_PATH);
    }

    const client = new Client({
      session: sessionData,
    });

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log("QR RECEIVED", qr);
    });

    client.on("authenticated", (session) => {
      sessionData = session;
      fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
          console.error(err);
        }
      });
    });

    client.on("ready", async () => {
      const text = "Your OTP 749381";
      // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
      const chatId = number.substring(1) + "@c.us";
      // Sending message.
      await client
        .sendMessage(chatId, text)
        .then(() => res.send("success-send-message"))
        .catch((e) => res.send(e));
    });

    client.initialize();
  } catch (e) {
    //fs.unlink("./session.json");
    console.log(e);
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`app is running on port 8080`);
});
