
//import and conect to db
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const uri = "mongodb+srv://Dario40669995:Dario40669995@cluster0.bemi4wp.mongodb.net/moviesDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//cors beefore auth=require(auth)(app)  and beefore route middleware////////////////////////////
const cors = require('cors');
app.use(cors());
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));
////////////////////////////////////////////////////////////////////////////////////////////////

uuid = require('uuid');
const express = require('express');
var morgan = require('morgan');
var fs = require('fs'); // import built in node modules fs and path 
var path = require('path');
const app = express();
//import and setup passportjs and auth.js
let auth = require('./auth')(app)//esto importa '/login' que esta en auth
const passport = require('passport');
require('./passport');

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//// Parsing incoming requests
const bodyParser = require('body-parser');

var methodOverride = require('method-override');// needed for err handlr

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//route middleware:
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));

////get movies titles list///////
let titles = [];
app.get('/movies',passport.authenticate('jwt', { session: false }),(req, res) => {
  Movies.find().then((films)=>{
  films.forEach((item) => {
    titles.push(item.Title)
  });
  res.status(200).json(titles)})
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
  
});

//get all data of a specific movie ,search by title/////
app.get('/movies/:title', (req, res) => {
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
app.get('/movies/genres/:genreName', (req, res) => {
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
app.get('/movies/directors/:directorName', (req, res) => {

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
app.post('/users', function(req, res){
  let hashedPassword = Users.hashPassword(req.body.Password);//encripting password
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

app.put('/users/:Username', (req, res) => {
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
  app.put('/users/:Username/movies/:MovieID', function(req, res){
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
app.delete('/users/:Username/movies/:MovieID', function(req, res){
   
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
app.delete('/users/:Username', function(req, res){
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

     
  
  
  
  
 

// error hadlr

app.use(bodyParser.urlencoded({
  extended: true
}));



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//port
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});







