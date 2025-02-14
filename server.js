const http = require("http");
const server = http.createServer();
const { Server } = require("socket.io");
const PORT = process.env.PORT || 4000;

const io = new Server(server, {
  cors: {
    origin:"*", 
  },
});
let users = [];
console.log(users);
io.on("connection", (socket) => {
  socket.on("join", (data) => {
    const user = {
      socketId: socket.id,
      name: data.name,
      coords: { latitude: data.latitude, longitude: data.longitude },
    };
    users = users.map((u) => {
      if (u.socketId === socket.id) {
        return {
          socketId: socket.id,
          name: data.name,
          coords: { latitude: data.latitude, longitude: data.longitude },
        };
      }
      socket.broadcast.emit("message", users);
      return u;
    });
    if (!users.find((u) => u.socketId === socket.id)) {
      users.push(user);
    }
    socket.broadcast.emit("new-user", user);
    socket.emit("current-user", user);
    socket.emit("users", users);
    socket.emit("message", users);
  });
  socket.on("position-change", (data) => {
    users = users.map((u) => {
      if (u.socketId === data.socketId) {
        return data;
      }
      console.log(users);
      socket.emit("message", users);
      return u;
    });
    io.emit("position-change", data);
    console.log(users);
  });
  socket.on("get-data", (data) => {
    socket.emit("message", users);
  });
  socket.on("disconnect", () => {
    users = users.filter((u) => u.socketId !== socket.id);
    socket.broadcast.emit("users", users);
  });
});
server.on("request", (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, World!");
  }
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
