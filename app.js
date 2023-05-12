var createError = require("http-errors");
require("dotenv").config({ path: "./configure.env" });
var express = require("express");
const session = require("express-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const http = require("http");
const socketIO = require("socket.io");
const cors = require('cors');



// const server = require('./bin/www')

//routes
var apiRouter = require("./routes/api");
var adminRouter = require("./routes/admin");

var app = express();

app.use(cors());


//setup socketIO server
// const server = http.createServer(app)

// const io = socketIO(server, {
//   path: "/socketio",
// });

// //logic for socketIO
// io.on("connection", (socket) => {
//   console.log("a user is connected");
//   console.log(
//     `Socket ${socket.id} connected from ${socket.request.headers.host}`
//   );

//   socket.on("join-room", (roomid) => {
//     console.log(`joining room ${roomid}`);
//     socket.join(roomid);
//     io.to(roomid).emit("user-joined", "A new user has joiend the room");
//   });
// });

//setup and connect to mongoose
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log("connected to mongoose");
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api", apiRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
