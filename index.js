
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const uri = "mongodb+srv://Dario40669995:Dario40669995@cluster0.bemi4wp.mongodb.net/moviesDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });



uuid = require('uuid');
const express = require('express');
var morgan = require('morgan');
var fs = require('fs'); // import built in node modules fs and path 
var path = require('path');
const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

const bodyParser = require('body-parser');
var methodOverride = require('method-override');// needed for err handlr

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(methodOverride());
//

//get movies titles list
let titles = [];
app.get('/movies', (req, res) => {
  Movies.find().then((films)=>{
  films.forEach((item) => {
    titles.push(item.Title)
  });
  res.status(200).json(titles)})
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  })
  //res.json(titles);
  
});

//get all data of a specific movie ,search by title
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
   
    //res.json(titles);
    
  });
 
  
  

//get all data of a specific movie by director and or/ actors
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
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
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
  //name:"",
  //movie:"",
  //id:""
  
  
  
  });  
app.get('/users/', (req, res) => {
  Users.find()
    .then((user) => {
      
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
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
  //add movie title to user list
  app.put('/users/mymovies/:id', function(req, res){
   
    const {id}= req.params;
    const newTopfilm = req.body;//buscar user, buscar peli, agregar peli
    let user = topFilms.users.find((user)=> user.id == id);//diferente data type, ojo!!primero encuentro usuario
    if (user){
     user.movieList.push(newTopfilm.title);
    // return res.status(200).json(user); 
     return res.status(200).send(`${newTopfilm.title} have been added to uuser ${id}`); 
  
    }
    });
//remove movie
app.delete('/users/mymovies/:id/:movieTitle', function(req, res){
   
  const {id, movieTitle}= req.params;
 
  let user = topFilms.users.find((user)=> user.id == id);//diferente data type, ojo!!primero encuentro usuario
  if (user){
      user.movieList = user.movieList.filter((movie)=> movie !== movieTitle);
      return res.status(200).send(`${movieTitle} have been removed from user ${id}`); 

  }
    
});
//Delete user
app.delete('/users/:id', function(req, res){
   
  const {id}= req.params;
 
  let user = topFilms.users.find((user)=> user.id == id);//diferente data type, ojo!!primero encuentro usuario
  if (user){
      topFilms.users = topFilms.users.filter((user)=> user.id != id);
      return res.status(200).send(`User ${id} have been deleted`); 

  }
    
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







