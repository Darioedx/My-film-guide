const { response } = require('express');
const { Client } = require('pg');

const client = new Client({
  user: 'dario', // nombre de usuario
  host: 'localhost',
  database: 'movies_db', // nombre de la base de datos
  password: '123456', // reemplaza con tu contraseña de acceso
  port: 5432, // este es el puerto por defecto de Postgres
});

const values = [[
    'Martin Scorsese',
    'Martin Scorsese is an American filmmaker and historian, widely regarded as one of the most significant and influential filmmakers in cinema history. Scorsese\'s body of work explores themes such as Italian-American identity, Catholic concepts of guilt and redemption, faith, machismo, modern crime, and gang conflict. He was born on November 17, 1942, in Queens, New York City.',
    '1942-11-17',
    
  ]];
const qText= 'INSERT INTO directors(name, bio, birthyear) VALUES ($1,$2,$3)';

client.connect();

values.forEach((item) => {
    client.query(qText, item, (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log('Valores insertados correctamente');
      }
    });
  });


client.query('SELECT * FROM directors', (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log(res.rows);
    }
    client.end();
  });
 
 


