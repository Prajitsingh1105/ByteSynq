require("dotenv").config();
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();
const express = require("express");
const {createServer} = require('http');
const Redis = require("ioredis");
const cors = require("cors");
const {Server, Socket} = require("socket.io");
const endpointRoutes = require("./routers/endpointRoutes");
const authRoutes = require("./routers/authRoutes");
const { startCronJobs } = require("./utils/cronJobs");
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const app = express();
const httpServer = createServer(app);

// Start background cron jobs
startCronJobs();


app.use(cors({origin: '*'}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'bytesynq_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const io = new Server(httpServer,{
    cors: {origin: "*"},
});
io.on('connection',(socket)=>{
    console.log(`Client Connected with socketId: ${socket.id}`);

    socket.on("join_endpoint", (endpointId) => {
        // Leave previous rooms (except own socket id room)
        socket.rooms.forEach(room => {
            if (room !== socket.id) socket.leave(room);
        });
        socket.join(endpointId);
        console.log(`Client ${socket.id} joined endpoint room: ${endpointId}`);
    });

    socket.on("disconnect",()=>{
        console.log(`Client DIsconnected ${socket.id}`);
    })
});

const redisSubscriber = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL) 
  : new Redis({
      host: '127.0.0.1',
      port: 6385,
      family: 4
    });

redisSubscriber.psubscribe('stream:*', (err, count) => {
  if (err) {
    console.error('Failed to subscribe:', err);
  } else {
    console.log(`Broadcaster subscribed to ${count} Redis channels.`);
  }
});

redisSubscriber.on('pmessage', (pattern, channel, message) => {
  console.log(`Forwarding data from ${channel} to React UI!`);
  const parsedData = JSON.parse(message);
  const endpointId = channel.split(':')[1];
  if (endpointId) {
      io.to(endpointId).emit('new_webhook', parsedData);
  } else {
      io.emit('new_webhook', parsedData);
  }
});



app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'operational' }));

app.use("/api/v1/auth", authRoutes);
app.use("/",endpointRoutes);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running at port http://localhost:${PORT}`);
});