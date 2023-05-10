
//import and conect to db
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;


mongoose.connect(process.env.MOVIESDB, { useNewUrlParser: true, useUnifiedTopology: true });
//
uuid = require('uuid');
const express = require('express');
var morgan = require('morgan');
var fs = require('fs'); // import built in node modules fs and path 
var path = require('path');
const app = express();
const { check, validationResult } = require('express-validator');
const cors = require("cors");
let allowedOrigins = [
    "http://localhost:8080",
    "https://git.heroku.com/movies-guide.git",
    "https://movies-guide.herokuapp.com",
    "http://testsite.com",
    "http://localhost:1234"
    
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                // If a specific origin isn’t found on the list of allowed origins
                let message =
                    "The CORS policy for this application doesn’t allow access from origin " +
                    origin;
                return callback(new Error(message), false);
            }
            return callback(null, true);
        },
    })
);


// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//// Parsing incoming requests
const bodyParser = require('body-parser');

var methodOverride = require('method-override');// needed for err handlr

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//midleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));

//import and setup passportjs and auth.js
let auth = require('./auth')(app)
const passport = require('passport');
require('./passport');


//return a list of all movies
app.get("/movies",(req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

//get all data of a specific movie ,search by title/////
app.get('/movies/:title',passport.authenticate('jwt', { session: false }), (req, res) => {
  const {title}= req.params;
  Movies.findOne({Title:title}).then((movie )=> {

  if (movie){
    
     return res.status(200).json(movie)
      
  }else{
      return res.status(404).send('No movie with this name: ' + title);

    }}).catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });

//get list of movies of a particular genre
app.get('/movies/genres/:genreName',passport.authenticate('jwt', { session: false }), (req, res) => {
  const {genreName}= req.params;
  Movies.find({'Genre.Name':genreName}).then((movie )=>{
    
     let equalGenre = [];
      movie.forEach((item) => {
      equalGenre.push(item.Title)
      })
      if (equalGenre.length < 1)
      {   
        return res.status(400).send('No movie found in that genre');
      } 
      else{
        res.status(200).json(equalGenre)
        }}).catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error)});
  });
 
  
  

//get bio and movies of a particular director,search by director name
app.get('/movies/directors/:directorName',passport.authenticate('jwt', { session: false }), (req, res) => {

  const {directorName}= req.params;
  Movies.find({'Director.Name':directorName}).then((movie )=>{
     let directorBIO = []
     let directorMovies = [];
      movie.forEach((item) => {
        directorMovies.push(item.Title)
        if (directorBIO.length < 1){
            directorBIO= item.Director;
        }
         
      })
      if (directorMovies.length < 1)
      {   
        return res.status(404).send('No movie found');
      } 
      else{
        total = [directorBIO,directorMovies]//importante los valores en array antes de pasarcelo a json ya que json solo me acepta una array
        res.status(200).json(total)
        }}).catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error)});
      
  
    });

//create new user 
app.post('/users', 
//s.s.validation
[
  check('Username', 'Username is required').isLength({min: 4}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

// check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password, 10);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password:  hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  
  
  });  

//update user info

app.put('/users/:Username',passport.authenticate('jwt', { session: false }),
//s.s.validation
[
  check('Username', 'Username is required').isLength({min: 4}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
],(req, res) => {// check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }).then((updatedUser) => {
    
      res.json(updatedUser)}).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });;
    
  
});
  //add movie id title to user list
  app.put('/users/:Username/movies/:MovieID',passport.authenticate('jwt', { session: false }), function(req, res){
    Users.findOneAndUpdate({ Username: req.params.Username  }, { $push:
      {
        FavoritesMovies:  req.params.MovieID 
      }
    },
    { new: true }).then((updtMovielist) => {
      
        res.json(updtMovielist)}).catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
        });;
      
    
  });
    
    
//remove movie
app.delete('/users/:Username/movies/:MovieID',passport.authenticate('jwt', { session: false }), function(req, res){
   
  Users.findOneAndUpdate({ Username: req.params.Username  }, { $pull:
    {
      FavoritesMovies:  req.params.MovieID 
    }
  },
  { new: true }).then((updtMovielist) => {
    
      res.json(updtMovielist)}).catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });;
});
//Delete user
app.delete('/users/:Username',passport.authenticate('jwt', { session: false }), function(req, res){
    Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

 //Get all users
app.get("/users", passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.find()
      .then((users) => {
          res.status(201).json(users);
      })
      .catch ((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
      });
});    
  
  
// error hadlr

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//port
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});






