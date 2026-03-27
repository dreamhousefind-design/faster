const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ Serve frontend files
app.use(express.static(path.join(__dirname)));


// Fake driver
let driver = { lat: 25.5941, lng: 85.1376 };

io.on("connection", (socket) => {
  console.log("User connected");

  setInterval(() => {
    driver.lat += (Math.random() - 0.5) * 0.001;
    driver.lng += (Math.random() - 0.5) * 0.001;

    socket.emit("driverLocation", driver);
  }, 2000);
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});