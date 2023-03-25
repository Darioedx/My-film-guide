
const topFilms = require('./topFilm.js');

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


app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');;
});
app.get('/documentation.html', (req, res) => {
  res.sendFile('documentation.html');
});

//get all movies titles

let titles = [];
app.get('/movies', (req, res) => {
  topFilms.topFilms.forEach((item)=> titles.push(item.title));
  res.json(titles);
});

//get all data of a specific movie by title



//get all data of a specific movie by genre


//get all data of a specific movie by director and or/ actors


//create new user and user own list




// error hadlr

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//port
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
