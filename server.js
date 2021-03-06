const express = require('express');
const uuid = require('uuid');
const Faker = require('faker');
const helmet = require('helmet');
const http = require('http');
const color = require('colors');
const morgan = require('morgan');
const cors = require('cors');
const dotEnv = require('dotenv');
const dbAccess = require('./firebaseDatabaseClass');
const { calcAndReturnDistance, generateNotification } = require('./utility');

//loading env vars
dotEnv.config({ path: './config.env' });

//creating server instance
const app = express();
//creating http server
const server = http.createServer(app);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

//database Access
const db = new dbAccess();
db.initialiseApp();

//create io instance
const io = require('socket.io')(server, {
  cors: { origin: '*' },
});
io.on('connection', (socket) => {
  console.log('new WS handshake');

  //create room connection
  socket.on('createRoom', async ({ roomName, lon, lat }) => {
    //generate username
    let userName = Faker.internet.userName();

    //generate user id
    let userId = uuid.v4();
    //generate room data

    let roomID = `room-${uuid.v4()}`;

    let roomData = {
      roomID,
      roomCreator: userName,
      roomName: roomName,
      users: {},
      coordinates: {
        lon,
        lat,
      },
      messages: {},
    };
    //write room data to database
    await db.writeToDB(roomData);
    //add user to database
    await db.addUserToDb(userName, roomID, userId);
    //add user notification to messages
    await db.persistMessageToDb(
      generateNotification('create', userName, roomID)
    );
    console.log('user and room created');
    io.sockets.emit('user_room_created', {
      userName,
      roomName,
      roomID: roomData.roomID,
    });
  });

  //send and persist message data
  socket.on('send_message', (messageObject, roomID) => {
    db.persistMessageToDb(messageObject, roomID);
  });

  socket.on('fetchMessages', async (roomID) => {
    db.fetchMessage(roomID).on('value', (snapShot) => {
      io.sockets.emit('readMessage', snapShot.val());
      console.log(snapShot.val());
    });
  });

  //get all available rooms based on loaction
  socket.on('getRooms', async ({ longitude, latitude }) => {
    const rooms = await db.fetchAllRooms();
    let nearRooms = await calcAndReturnDistance(
      rooms.val(),
      longitude,
      latitude
    );
    socket.emit('rooms-fected', nearRooms);
  });

  socket.on('joinRoom', async ({ roomID, roomName }) => {
    //generate username
    let userName = Faker.internet.userName();

    //generate user id
    let userId = uuid.v4();

    db.addUserToDb(userName, roomID, userId);
    io.sockets.emit('user_room_created', {
      userName,
      userId,
      roomName,
      roomID,
    });
    /* … */
  });

  socket.on('leaveRoom', async ({ roomID, userID }) => {
    let roomUserRef = await db.getUserCount(roomID);
    roomUserRef.once('value', (snapShot) => {
      let roomCount = Object.keys(snapShot.val()).length;
      if (roomCount <= 1) {
        db.deleteRoom(roomID);
      }
      db.removeFromDB('rooms', roomID, userID, 'users');
    });
  });
  socket.on('disconnect', () => {
    /* … */
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(
    `App listening on port ${PORT} in ${process.env.NODE_ENV} mode `.green
      .underline
  );
});
