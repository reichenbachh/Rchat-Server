// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

//calculates and returns distance as the crow flies
function returnCrowDistance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

exports.calcAndReturnDistance = async (
  roomResponseObject,
  clientLon,
  clientLat
) => {
  let roomArray = [];
  let nearRoomsArray = [];
  for (let room in roomResponseObject) {
    roomArray.push(roomResponseObject[room]);
  }
  roomArray.forEach((room) => {
    let serverLat = room.coordinates.lat;
    let serverLon = room.coordinates.lon;
    let roomDistanceFromClient = returnCrowDistance(
      clientLat,
      clientLon,
      serverLat,
      serverLon
    );
    if (roomDistanceFromClient >= 0 && roomDistanceFromClient <= 3.0) {
      nearRoomsArray.push(room);
    }
  });
  return nearRoomsArray;
};

exports.generateNotification = (type, user, roomID) => {
  if (type === 'join') {
    return {
      text: `${user} has joined the conversation`,
      timestamp: Date.now(),
      type: 'notification',
      roomID,
    };
  }
  if (type === 'leave') {
    return {
      text: `${user} has left the conversation`,
      timestamp: Date.now(),
      type: 'notification',
      roomID,
    };
  }
  if (type === 'create') {
    return {
      text: `${user} has created the conversation`,
      timestamp: Date.now(),
      type: 'notification',
      roomID,
    };
  }
};
