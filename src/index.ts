import express from "express";
import dotenv from "dotenv";
import { Database } from "sqlite3";
import amqp from "amqplib";

async function main() {
  dotenv.config();

  const app = express();
  const db = new Database("db.sqlite");

  const rabbitmqConn = process.env.RABBITMQ_URL || "amqp://localhost";
  const port = process.env.PORT || 3000;

  const rabbitmq = await amqp.connect(rabbitmqConn);
  const rmqChannel = await rabbitmq.createChannel();

  rmqChannel.assertQueue("queue", { durable: false });

  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        classes VARCHAR(255) NOT NULL,
        student VARCHAR(255) NOT NULL
    )
  `);

  app.use(express.json());

  app.post("/register", (req, res) => {
    const data = req.body;
    rmqChannel.sendToQueue("queue", Buffer.from(JSON.stringify(data)));
    res.send("Successfully registered");
  });

  app.get("/", (req, res) => {
    db.all("SELECT * FROM classes", (err, rows) => {
      res.send(rows);
    });
  });

  app.listen(port, () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  });
}

main();
