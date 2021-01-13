const admin = require('firebase-admin');
const serviceAccount = require('./rchat-5ff88-firebase-adminsdk-7s4p3-ef4e7694d5.json');
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

  writeToDB = async (roomData) => {
    const db = admin.database();
    const messageRef = db.ref('/rooms').child(roomData.roomID);
    await messageRef.update(roomData);
  };

  getUserCount = async (roomID) => {
    const db = admin.database();
    return db.ref(`/rooms/${roomID}/users`);
  };

  fetchMessage = (roomID) => {
    const db = admin.database();
    const roomMessageRef = db.ref(`/rooms/${roomID}/Messages`);
    return roomMessageRef;
  };

  persistMessageToDb = async (messageObject) => {
    console.log(messageObject);
    const db = admin.database();
    const messageRef = db
      .ref(`/rooms/${messageObject.roomID}`)
      .child('Messages');
    await messageRef.push(messageObject);
  };

  removeFromDB = (parentRef, parentId, childId, addressString) => {
    const db = admin.database();
    const dataRef = db.ref(
      `/${parentRef}/${parentId}/${addressString}/${childId}`
    );
    dataRef.remove();
  };

  addUserToDb = async (userName, roomID, userId) => {
    const db = admin.database();
    const userRef = db.ref('/activeUsers').child(userId);
    const messageUsersRef = await db
      .ref(`/rooms/${roomID}/users`)
      .child(userId)
      .set({ userId });
    await userRef.update({ userName, roomID });
  };

  deleteRoom = async (roomID) => {
    const db = admin.database();
    const roomRef = db.ref(`/rooms/${roomID}`);
    await roomRef.remove();
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
