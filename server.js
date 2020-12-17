const express = require("express");
const uuid = require("uuid");
const Faker = require("faker");
const helmet = require("helmet");
const http = require("http");
const color = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const dotEnv = require("dotenv");
const dbAccess = require("./firebaseDatabaseClass");

//loading env vars
dotEnv.config({ path: "./config.env" });

//creating server instance
const app = express();
//creating http server
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:3000" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
io.on("connection", (socket) => {
  console.log("user is connected");

  socket.on("message", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    /* … */
  });
});

//database Access
const db = new dbAccess();
db.initialiseApp();

app.get("/createRoom", (req, res) => {
  try {
    //get todays date
    let today = new Date().toDateString();

    //generate username
    let userName = Faker.internet.userName();

    //generate user id
    let userId = uuid.v4();
    //generate room data
    let roomData = {
      roomID: `room-${uuid.v4()}`,
      roomCreator: userName,
      createdAt: today,
    };
    db.writeToDB(roomData);
    db.addUserToDb(userName, userId);
    res
      .status(200)
      .json({ success: true, msg: "room created", user: { userName, userId } });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, msg: "something went wrong" });
  }
});

app.post("/chatExists", async (req, res) => {
  let userId = req.body.userId;
  const userExists = db.fetchUser(userId);
  if (userExists === "no such user exists") {
    return res.status(401).json({ success: false, msg: "no user" });
  }
  console.log(await userExists);
  res.status(200).json({ success: true, user: await userExists });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(
    `App listening on port ${PORT} in ${process.env.NODE_ENV} mode `.green
      .underline
  );
});
