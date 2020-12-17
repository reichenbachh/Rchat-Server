const admin = require("firebase-admin");
const serviceAccount = require("./rchat-5ff88-firebase-adminsdk-7s4p3-ef4e7694d5.json");
const { once } = require("nodemon");
const url = "https://rchat-5ff88-default-rtdb.firebaseio.com";

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
    const messageRef = db.ref("/rooms").push(roomData);
  };

  readFromDB = () => {
    const db = admin.database();
  };

  addUserToDb = (userName, userId) => {
    const db = admin.database();
    const userRef = db.ref("/activeUsers").child(userId);
    userRef.update({ userName });
  };

  fetchUser = (userId) => {
    const db = admin.database();
    const userRef = db
      .ref(`/activeUsers/${userId}`)
      .once("value", (snapShot) => {
        if (!snapShot.exists()) {
          return "no such user exists";
        }
        return {
          userName: snapShot.val().userName,
          userId: snapShot.key,
        };
      });
    return userRef;
  };
}

module.exports = Firebase;
