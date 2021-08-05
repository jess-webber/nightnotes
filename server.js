const dotenv = require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes.js');
const auth = require('./auth.js');


const app = express();
app.set('view engine', 'pug');

app.use(cors())

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  routes(app, myDataBase);
  auth(app, myDataBase)

}).catch((e) => {
  app.route('/home').get((req, res) => {
    res.render('pug', {title: e, message: 'Unable to login'});
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + process.env.PORT);
});

