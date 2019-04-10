'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  wishlist: [
    {
      gameID: {type: String},
      gameName: {type: String},
      gameImage: {type: String},
      gameDate: {type: String}
    }
  ]

});

UserSchema.methods.serialize = function() {
  return {
    id: this.id,
    username: this.username,
    wishlist: this.wishlist
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};
