const {matchExistingUser} = require ("../helper");
const {assert} = require ("chai");


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = matchExistingUser("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined for invalid email', function() {
    const user = matchExistingUser("useradfadf@example.com", testUsers)
    assert.isUndefined(user);
  });
});