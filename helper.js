const matchExistingUser = function(inputEmail, database) {
  for (let user in database) {
    if (database[user].email === inputEmail) {
      return database[user];
    }
  }
};

const generateRandomString = function() { //generates random string of 6 characters
  let x = [];
  for (let i = 0; i < 6; i++) {
    x.push(Math.floor(Math.random() * 36).toString(36));
  }
  return x.join('');
};


const urlsForUser = function(id, database) {
  let x = {};
  for (let member in database) {
    if (database[member].userID === id) {
      x[member] = (database[member]);
    }
  }
  return x;
};


module.exports = {matchExistingUser, generateRandomString, urlsForUser};