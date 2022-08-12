//setup
const express = require('express');
const sessionession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const morgan = require("morgan");
const methodOverride = require('method-override');
const PORT = 8080;

//functions and databases
const {
  generateRandomString,
  matchExistingUser,
  urlsForUser,
  urlDatabase,
  users
} = require("./helper");

//middleware
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));//body  parser library to convert buffer to string
//sets cookie session named 'session"
app.use(sessionession({
  name: 'session',
  keys: ['1a535d9f-a610-4f90-b613-204dcd956328'], //key generated using 'npx uuid' from the command line
  maxAge: 24 * 60 * 60 * 1000
}));

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
    urls: urlsForUser(req.session.userId, urlDatabase),
    userObj: users[req.session.userId]
  };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {   //referenced by make new urls page
  if (!req.session.userId) {
    return res.status(403).send("Only Registered Users May Create New Shortened Links!!");
  }
  let x = generateRandomString();
  urlDatabase[x] = {
    longURL : req.body.longURL,
    userID : req.session.userId
  };
  res.redirect(`/urls/${x}`);
});


//create new links page
app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  const templateVars = {
    userObj: users[req.session.userId]
  };
  res.render("urls_new", templateVars);
});


//short link specific pages
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("Shortened Link ID Does Not Exist!!");
  }
  if (!req.session.userId) {
    return res.status(401).send("Shortened Link can only be accessed by Registered Users!!");
  }
  if (req.session.userId !== urlDatabase[req.params.id].userID) {
    return res.status(401).send("Users may only access their own links!!");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userObj: users[req.session.userId],
    times: urlDatabase[req.params.id].times,
    unique : urlDatabase[req.params.id].uniqueVisitors.length
  };
  res.render("urls_show", templateVars);
});
app.put("/urls/:id", (req, res) => {   //take input from edit field on short link specific pages to change databaes
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("Shortened Link ID Does Not Exist!!");
  }
  if (!req.session.userId) {
    return res.status(401).send("Shortened Link can only be edited by Registered Users!!");
  }
  if (req.session.userId !== urlDatabase[req.params.id].userID) {
    return res.status(401).send("Users can only edit their own links!!");
  }
  urlDatabase[req.params.id].longURL = req.body.new_URL;
  res.redirect(`/urls`);
});

//redirection link when shortURL id is clicked on its unique page
app.get("/u/:id", (req, res) => {
  const URL = urlDatabase[req.params.id].longURL;
  urlDatabase[req.params.id].times ++;
  if(!req.session.vistorid){
  req.session.vistorid = generateRandomString();
  urlDatabase[req.params.id].uniqueVisitors.push(req.session.vistorid);
  }
  res.redirect(URL);
});

//deletes links from delete button on main /urls page
app.delete("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("Shortened Link ID Does Not Exist!!");
  }
  if (!req.session.userId) {
    return res.status(401).send("Shortened Link can only be deleted by Registered Users!!");
  }
  if (req.session.userId !== urlDatabase[req.params.id].userID) {
    return res.status(401).send("Users can only delete their own links!!");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});



//account login and logout
app.get("/login", (req, res) => {  //login page
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = {
    userObj: users[req.session.userId]
  };
  res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {  //inputs from login page used to verify and complete login if able
  let currentUser = matchExistingUser(req.body.email, users);
  let currentPass = bcrypt.compareSync(req.body.password, currentUser.hashedPass);
  if (!currentUser) {
    return res.status(403).send("Invalid login information (userObj)!!");
  }
  if (!currentPass) {
    return res.status(403).send("Invalid login information (password)!!");
  }
  req.session.userId = currentUser.id;
  res.redirect(`/urls`);
});
app.post("/logout", (req, res) => {  //logout button action
  req.session = null;
  res.redirect("/urls");
});


//registration
app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/urls");
  }
  const templateVars = {
    userObj: users[req.session.userId]
  };
  res.render("urls_register", templateVars);
});
app.post("/register", (req, res) => {   //takes input and modifies global users object
  if (!matchExistingUser(req.body.email, users)) {
    let id = generateRandomString();
    let {email, password} = req.body;
    if (email.length === 0 || password.length === 0) {
      return res.status(400).send("Invalid registration information");
    }
    let hashedPass = bcrypt.hashSync(password, 10);
    users[id] = {id, email, hashedPass};
    req.session.userId = id;
    res.redirect("/urls");
  } else {
    return res.status(400).send("Email has already been used!");
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp is now listening on port ${PORT}!`);
});