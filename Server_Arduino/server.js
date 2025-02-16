const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.get("/", (req, res) => {   
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("connected...");
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

app.listen(3000, () => {
  console.log("server on!");
});

const port = new SerialPort({
  path: "COM8",
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

parser.on("data", (result) => {
  console.log("data dari arduino : ", result);
  io.emit("data", { data: result });
});

app.post("/arduinoApi", (req, res) => {
  const data = req.body.data;

  port.write(data, (err) => {
    if (err) {
      console.log("err: ", err);
      res.status(500).json({ error: "write data error" });
    }
    console.log("data terkirim", data);
    res.end();
  });
});