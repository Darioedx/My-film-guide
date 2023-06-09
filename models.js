const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
      Name: [String],
      Description: String
    },
    Director: {
      Name: String,
      Bio: String
    },
    Plot:String,
    Year: String,
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
  });

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoritesMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]});

 
userSchema.statics.hashPassword = (password, salt) => {
  return bcrypt.hashSync(password, salt);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};  

let Movie = mongoose.model('Movie', movieSchema);

let User = mongoose.model('User', userSchema);
module.exports.Movie = Movie;
module.exports.User = User;

