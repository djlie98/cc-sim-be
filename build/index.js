"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const sqlite3_1 = require("sqlite3");
const amqplib_1 = __importDefault(require("amqplib"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv_1.default.config();
        const app = (0, express_1.default)();
        const db = new sqlite3_1.Database("db.sqlite");
        const rabbitmqConn = process.env.RABBITMQ_URL || "amqp://localhost";
        const port = process.env.PORT || 3000;
        const rabbitmq = yield amqplib_1.default.connect(rabbitmqConn);
        const rmqChannel = yield rabbitmq.createChannel();
        rmqChannel.assertQueue("queue", { durable: false });
        db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        classes VARCHAR(255) NOT NULL,
        student VARCHAR(255) NOT NULL
    )
  `);
        app.use(express_1.default.json());
        app.post("/register", (req, res) => {
            const data = req.body;
            //   db.exec(`
            //   INSERT INTO classes (classes, student) VALUES ('${data.classes}', '${data.student}')
            // `);
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
    });
}
main();
