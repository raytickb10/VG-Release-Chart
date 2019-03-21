// init project
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express(); 
app.use(express.static('public'));
app.use(bodyParser.json());

const {PORT, DATABASE_URL} = require('./config');

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/my-list.html', function(request, response) {
  response.sendFile(__dirname + '/views/my-list.html');
});

app.get('/login.html', function(request, response) {
  response.sendFile(__dirname + '/views/login.html');
});

let server;

function runServer(databaseUrl, port=PORT) {
  console.log(databaseUrl);
  return new Promise((resolve, reject) => {
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

// listen for requests
/*var server = app.listen(3000, function () {
  console.log("Listening on port %s", server.address().port);
});*/
