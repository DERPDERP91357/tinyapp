const uuid = require("uuid");

// function to return user object based on email input
const matchExistingUser = function(inputEmail, database) {
  for (let user in database) {
    if (database[user].email === inputEmail) {
      return database[user];
    }
  }
};

//random string generator for short link IDs
const generateRandomString = function() { //generates random uuid v4 string
  return uuid.v4();
};

//filter for short link object based on id input
const urlsForUser = function(id, database) {
  let x = {};
  for (let member in database) {
    if (database[member].userID === id) {
      x[member] = (database[member]);
    }
  }
  return x;
};

//check if vistorid is in unique visitor array for link
const arrayCheck = function (visitorId, linkId, database) {
  let array = database[linkId].uniqueVisitors;
  for (let member of array) {
    if (member === visitorId){
      return true;
    }
  }
  return false;
}

//databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "sfe2sg23rt23",
    times : 0,
    uniqueVisitors: [],
    allVisits : [{
    }]
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "sfe2sg23rt23",
    times : 0
  },
  iadf0r: {
    longURL: "https://www.wanikani.com",
    userID: "afe2sg23rt23",
    times : 0
  }
};

const users = {
  sfe2sg23rt23 : {
    id : 'sfe2sg23rt23',
    email : 'apple@com',
    hashedPass : '$2a$10$3or6DQiNxnPfDJlE4Tdkr.mUTWY1suo4Lwl/Bwk.iglPHAQRF65Bq'
  }
};

module.exports = {
  matchExistingUser,
  generateRandomString,
  urlsForUser,
  arrayCheck,
  urlDatabase,
  users
};