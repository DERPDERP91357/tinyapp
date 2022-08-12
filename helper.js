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

//Date
const dateNow = function () {
  return new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })
};

//Partial Id string
const idString = function (string) {
  let x = string.slice(0, 8);
  return x + "-****-****";
};


//databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "b7c1cf1d-2389-4e95-a9ad-3d3f7b1cf821",
    times : 0,
    uniqueVisitors: [],
    allVisits : []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "b7c1cf1d-2389-4e95-a9ad-3d3f7b1cf821",
    times : 0
  },
  iadf0r: {
    longURL: "https://www.wanikani.com",
    userID: "f246b134-5ee9-4d40-8494-60bd5306f240",
    times : 0
  }
};

const users = {
  'b7c1cf1d-2389-4e95-a9ad-3d3f7b1cf821' : {
    id : 'b7c1cf1d-2389-4e95-a9ad-3d3f7b1cf821',
    email : 'apple@com',
    hashedPass : '$2a$10$3or6DQiNxnPfDJlE4Tdkr.mUTWY1suo4Lwl/Bwk.iglPHAQRF65Bq'
  }
};

module.exports = {
  matchExistingUser,
  generateRandomString,
  urlsForUser,
  arrayCheck,
  dateNow,
  idString,
  urlDatabase,
  users
};