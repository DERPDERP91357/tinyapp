//setup
const express = require('express');
const sessionession = require('cookie-session');
const bcrypt = require("bcryptjs");
const morgan = require ("morgan");
const app = express();
const PORT = 8080;

//middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));//body  parser library to convert buffer to string
app.use(morgan('dev'));
//sets cookie session named 'session"
app.use(sessionession({
  name: 'session',
  keys: ['1a535d9f-a610-4f90-b613-204dcd956328'], //key generated using 'npx uuid' from the command line
  maxAge: 24 * 60 * 60 * 1000
}))

//functions
const generateRandomString = function() { //generates random string of 6 characters
  let x = [];
  for (let i = 0; i < 6; i++) {
    x.push(Math.floor(Math.random() * 36).toString(36));
  }
  return x.join('');
};

const matchExistingUser = function (inputEmail) {
  for (let user in users) {
    if (users[user].email === inputEmail) {
      return users[user];
    }
  }
  return null;
};


const urlsForUser = function (id) {
  let x = {};
  for (let member in urlDatabase) {
    if (urlDatabase[member].userID === id){
      x[member] = (urlDatabase[member]);
    }
  }
  return x;
};

//databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "sfe2sg23rt23",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "sfe2sg23rt23",
  },
  iadf0r: {
    longURL: "https://www.wanikani.com",
    userID: "afe2sg23rt23",
  }
};
const users = {
  sfe2sg23rt23 : {
    id : 'sfe2sg23rt23',
    email : 'apple@com',
    hashedPass : '$2a$10$3or6DQiNxnPfDJlE4Tdkr.mUTWY1suo4Lwl/Bwk.iglPHAQRF65Bq'
  }
};

//misc test pages used in initial setup
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//main page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    username: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if(!req.session.user_id){
    return res.status(403).send("Only Registered Users May Create New Shortened Links!!")
  }
  let x = generateRandomString();
  urlDatabase[x] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  };
  res.redirect(`/urls/${x}`);
});


//create new links
app.get("/urls/new", (req, res) => {
  if(!req.session.user_id){
    return res.redirect("/login");
  }
  const templateVars = {
    username: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});


//link specific pages
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]){
    return res.status(400).send("Shortened Link ID Does Not Exist!!");
  }
  if(!req.session.user_id){
    return res.status(401).send("Shortened Link can only be used by Registered Users!!");
  }
  if(req.session.user_id !== urlDatabase[req.params.id].userID){
    return res.status(401).send("Users may only access their own links!!");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]){
    return res.status(400).send("Shortened Link ID Does Not Exist!!");
  }
  if(!req.session.user_id){
    return res.status(401).send("Shortened Link can only be edited by Registered Users!!");
  }
  if(req.session.user_id !== urlDatabase[req.params.id].userID){
    return res.status(401).send("Users can only edit their own links!!");
  }
  urlDatabase[req.params.id].longURL = req.body.new_URL;
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const URL = urlDatabase[req.params.id].longURL;
  res.redirect(URL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]){
    return res.status(400).send("Shortened Link ID Does Not Exist!!");
  }
  if(!req.session.user_id){
    return res.status(401).send("Shortened Link can only be deleted by Registered Users!!");
  }
  if(req.session.user_id !== urlDatabase[req.params.id].userID){
    return res.status(401).send("Users can only delete their own links!!");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});



//account login and logout
app.post("/login", (req, res) => {
  console.log (req.body);
  let currentUser = matchExistingUser(req.body.email);
  let currentPass = bcrypt.compareSync(req.body.password, currentUser.hashedPass);
  console.log(currentPass);
  if (currentUser === null) {
    return res.status(403).send("Invalid login information (username)!!")
  }
  if (currentPass === false) {
    return res.status(403).send("Invalid login information (password)!!")
  }
  req.session.user_id = currentUser.id;
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  if(req.session.user_id){
     return res.redirect("/urls");
  }
  const templateVars = {
    username: users[req.session.user_id]
  };  
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//registration
app.get("/register", (req, res) => {
  if(req.session.user_id){
    return res.redirect("/urls");
  }
  const templateVars = {
    username: users[req.session.user_id]
  };  
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (matchExistingUser(req.body.email) === null) {
    let id = generateRandomString() + generateRandomString();
    let {email, password} = req.body;
    if (email.length === 0 || password.length === 0) {
      return res.status(400).send("Invalid registration information");
    }
    let hashedPass = bcrypt.hashSync(password, 10);
    console.log(hashedPass);
    users[id] = {id, email, hashedPass};
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
  return res.status(400).send("Email has already been used!");
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp is now listening on port ${PORT}!`);
});