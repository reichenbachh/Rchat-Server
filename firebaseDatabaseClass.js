const admin = require('firebase-admin');
const serviceAccount = require('./rchat-5ff88-firebase-adminsdk-7s4p3-ef4e7694d5.json');
const { once } = require('nodemon');
const url = 'https://rchat-5ff88-default-rtdb.firebaseio.com';

class Firebase {
  static url = url;
  static serviceAccount = serviceAccount;

  initialiseApp = () => {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: url,
    });
  };

  writeToDB = (roomData) => {
    const db = admin.database();
    console.log(roomData);
    const messageRef = db.ref('/rooms').child(roomData.roomID);
    messageRef.update(roomData);
  };

  readFromDB = () => {
    const db = admin.database();
  };

  fetchMessage = async (roomID) => {
    const db = admin.database();
    const roomMessageRef = await db
      .ref(`/rooms/${roomID}/Messages`)
      .once('value', (snapShot) => {});
    return roomMessageRef.val();
  };

  persistMessageToDb = (messageObject, roomID) => {
    const db = admin.database();
    const messageRef = db
      .ref(`/rooms/${messageObject.roomID}`)
      .child('Messages');
    messageRef.push(messageObject.messageObject);
  };

  addUserToDb = (userName, roomName, userId) => {
    const db = admin.database();
    const userRef = db.ref('/activeUsers').child(userId);
    userRef.update({ userName, roomName });
  };

  fetchAllRooms = () => {
    const db = admin.database();
    const userRef = db.ref(`/rooms`).once('value', (snapShot) => {
      if (!snapShot.exists()) {
        return 'There are no rooms';
      }
      return {
        userName: snapShot.val().userName,
        userId: snapShot.key,
      };
    });
    return userRef;
  };

  fetchUser = (userId) => {
    const db = admin.database();
    const roomRef = db
      .ref(`/activeUsers/${userId}`)
      .once('value', (snapShot) => {
        if (!snapShot.exists()) {
          return null;
        }
        roomRef.push(snapShot.val());
      });
    return roomRef;
  };
}

module.exports = Firebase;
