
const topFilms = require('./topFilm.js');// import my coustom module

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
//main
app.get('/', (req, res) => {
    res.send('Welcome to my app!');;
});
app.get('/documentation.html', (req, res) => {
  res.sendFile('documentation.html');
});

//get movies titles list
let titles = [];
app.get('/movies', (req, res) => {
  topFilms.topFilms.forEach((item)=> titles.push(item.title));
  res.status(200).json(titles);
  //res.json(titles);
  
});

//get all data of a specific movie search by title
app.get('/movies/:title', (req, res) => {
  const {title}= req.params;
  const movieData = topFilms.topFilms.find((movie )=> movie.title === title);

  if (movieData){
     return res.status(200).json(movieData);
      
    }
    else{
       res.status(400).send("NOT FOUND in my top 10!!!!");
    }
    });

//get list of movies of a particular genre
app.get('/movies/genres/:genreName', (req, res) => {

  res.send('Successful GET request returning list of movies that match with the requested genre');
  
    });

//get all data of a specific movie by director and or/ actors
app.get('/movies/directors/:directorName', (req, res) => {

  res.send('Successful GET request returning list of movies that match with the requested director');
  
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
