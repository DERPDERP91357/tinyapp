//setup
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require ("morgan")
const app = express();
const PORT = 8080;

//middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));//body  parser library to convert buffer to string
app.use(cookieParser());
app.use(morgan('dev'));

//functions
const generateRandomString = function() { //generates random string of 6 characters
  let x = [];
  for (let i = 0; i < 6; i++) {
    x.push(Math.floor(Math.random() * 36).toString(36));
  }
  return x.join('');
};

const matchFromDatabase = function (key, input) {
  for (let user in users) {
    if (users[user][key] === input) {
      return users[user];
    }
  }
  return null;
};

const matchExistingUser = function (inputEmail) {
  return matchFromDatabase("email", inputEmail);
};

const matchExistingPassword = function (inputPassword) {
  return matchFromDatabase("password", inputPassword);
};

//databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

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
    urls: urlDatabase,
    username: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if(!req.cookies.user_id){
    return res.status(403).send("Only Registered Users May Create New Shortened Links!!")
  }
  let x = generateRandomString();
  urlDatabase[x] = req.body.longURL;
  res.redirect(`/urls/${x}`);
});


//create new links
app.get("/urls/new", (req, res) => {
  if(!req.cookies.user_id){
    return res.redirect("/login");
  }
  const templateVars = {
    username: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});


//link specific page
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]){
    return res.status(400).send("Shortened Link ID Does Not Exist!!");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.new_URL;
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});



//account login and logout
app.post("/login", (req, res) => {
  let currentUser = matchExistingUser(req.body.email);
  let currentPass = matchExistingPassword(req.body.password);
  if (currentUser === null) {
    return res.status(403).send("Invalid login information!")
  }
  if (currentPass === null) {
    return res.status(403).send("Invalid login information!")
  }
  res.cookie("user_id", currentUser.id);
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  if(req.cookies.user_id){
     return res.redirect("/urls");
  }
  const templateVars = {
    username: users[req.cookies.user_id]
  };  
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


//registration
app.get("/register", (req, res) => {
  if(req.cookies.user_id){
    return res.redirect("/urls");
  }
  const templateVars = {
    username: users[req.cookies.user_id]
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
    users[id] = {id, email, password};
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
  return res.status(400).send("Email has already been used!");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});