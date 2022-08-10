const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));//body  parser library to convert buffer to string
app.use(cookieParser());

function generateRandomString() { //generates random string of 6 characters
  let x = [];
  for (let i = 0; i < 6; i++) {
    x.push(Math.floor(Math.random()*36).toString(36));
  }
  return x.join('');
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  console.log('Cookies: ', req.cookies);
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
   };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let x = generateRandomString();
  urlDatabase[x] = req.body.longURL;
  res.redirect(`/urls/${x}`); 
});


//create new links
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies.username
   };
  res.render("urls_new", templateVars);
});


//link specific page
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
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
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


//registration
app.get("/register", (req, res) => {
  const templateVars = { 
    //
    username: req.cookies.username
    };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  //
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});