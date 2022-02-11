const express = require("express");
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const bodyParser = require("body-parser");
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

    const SESSION_FILE_PATH = "./session.json";
    let sessionData;

    if (fs.existsSync(SESSION_FILE_PATH)) {
      sessionData = require(SESSION_FILE_PATH);
    }

    const client = new Client({
      session: sessionData,
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
        ],
      },
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

    client.on("auth_failure", (_session) => {
      console.log("auth failed");
    });

    client.on("ready", async () => {
      const text = "Your OTP 749381";
      // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
      const chatId = number.substring(1) + "@c.us";
      // Sending message.
      await client
        .sendMessage(chatId, text)
        .then(() => {
          console.log("success send verification to whatsapp-number");
          res.send("success-send-message");
        })
        .catch((e) => res.send(e));
    });

    client.on("disconnected", (x) => {
      console.log("client disconnected");
      client.destroy();
    });

    client.initialize();
  } catch (e) {
    console.log(e);
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`app is running on port 8080`);
});
