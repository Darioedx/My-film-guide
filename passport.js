const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;


  passport.use(new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password'
  }, (username, password, callback) => {
    console.log(username + '  ' + password);
    Users.findOne({ Username: username}).then((user) => {
      
  
      if (!user) {
        console.log('incorrect username');
        return callback(null, false, {message: 'Incorrect username or password.'});
      }
  
      console.log('finished');
      return callback(null, user);
    });
  }));
 
//nota: 'callback' puede tener cualquier otro nombre, es pra verificar que la tarea esta cumplida o no, esta definida dentro del constructor 'localStrategy'
//
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  },(jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
      .then((user) => {
        return callback(null, user);
      })
      .catch((error) => {
        return callback(error)
      });
  })); 