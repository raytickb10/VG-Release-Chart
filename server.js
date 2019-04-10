'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

//const jsonParser = bodyParser.json();
const app = express(); 
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('common'));

const {PORT, DATABASE_URL} = require('./config');
const {User} = require('./users/models');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/my-list', function(request, response) {
  response.sendFile(__dirname + '/views/my-list.html');
});

app.get('/login', function(request, response) {
  response.sendFile(__dirname + '/views/login.html');
});

app.get('/register', function(request, response) {
  response.sendFile(__dirname + '/views/register.html');
});

app.put('/api/users/:id', (req, res) => {
  console.log(req.body);
  const requiredFields = ['id', 'username'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating wish list item \`${req.params.id}\``);
  const query = { _id: req.params.id } 
  const conditions = {} 
  if (req.body.username) conditions.username = req.body.username 
  if (req.body.wishlist) conditions.wishlist = req.body.wishlist 
  User.findOneAndUpdate(query, conditions).then(() => { res.status(204).end() })
});

app.get('/api/users/:id', jwtAuth, (req, res) => {
  if (req.params.id !== req.user.id) {
    const message = `Request path id (${req.params.id}) and authenticated user id (${req.user.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  User.findOne({_id: req.params.id}).then((user) => { res.json(user) });
});

let server;

function runServer(databaseUrl, port=PORT) {
  console.log(databaseUrl);
  return new Promise((resolve, reject) => {
    mongoose.set('useCreateIndex', true);
    mongoose.connect(databaseUrl,{ useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };
