const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// EJS pour les vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Discord OAuth
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI,
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Routes
app.get('/login', passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  const sanctionsDB = JSON.parse(fs.readFileSync('./sanctions.json', 'utf-8'));
  const userSanctions = sanctionsDB[req.user.id] || [];

  res.render('dashboard', {
    user: req.user,
    sanctions: userSanctions
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

// Serve le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Lancer le serveur
app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});
