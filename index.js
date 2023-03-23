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

// favorite films
let topfilms = [
  {
    title: 'Rosemary’s Baby',
    director: 'Roman Polanski'
  },
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppola'
  },
  {
    title: 'The Big Lebowski',
    director: 'Joel Coen'
  },
  {
    title: 'El secreto de tus hojos',
    director: 'Juan José Campanella'
  },
  {
    title: 'Goodfellas',
    director: 'Martin Scorsese '
  },
  {
    title: 'Cidade de Deus ',
    director: 'Fernando Meirelles y Kátia Lund'
  },
  {
    title: 'Lock, Stock and Two Smoking Barrels',
    director: 'Guy Ritchie'
  },
  {
    title: 'La comunidad',
    director: 'Álex de la Iglesia '
  },
  {
    title: 'Psycho',
    director: 'Alfred Hitchcock'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino'
  },
];

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app!');;
});
app.get('/documentation.html', (req, res) => {
  res.sendFile('documentation.html');
});

app.get('/movies', (req, res) => {
  res.json(topfilms);
});

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
