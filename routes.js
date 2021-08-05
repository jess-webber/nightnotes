const passport = require('passport');
const ObjectId = require('mongodb').ObjectId;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

module.exports = function (app, myDataBase) {
  
  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug/home')
  });

    app.route('/signin').get((req, res) => {
      res.render(process.cwd() + '/views/pug/signin', {
          showLogin: true,
          showRegistration: false
        });
      });

      app.route('/signup').get((req, res) => {
        res.render(process.cwd() + '/views/pug/signup', {
          showLogin: false,
          showRegistration: true
        });
      });

    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/signin'}), (req, res) => {
      res.redirect('/profile');
    });
    
    app.route('/profile').get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
    });
    
    app.route('/logout').get((req, res) => {
      req.logout();
      res.redirect('/');
    });

    app.route('/userdreams').get(ensureAuthenticated, (req, res) => {
      console.log('Username: ' + req.user.username);
      myDataBase.findOne({ username: req.user.username }, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data.dreams);
          res.render(process.cwd() + '/views/pug/userdreams', { 
          username: req.user.username,
          dreams: data.dreams 
        });
        };
      });
    });
    
    app.route('/register').post(
      (req, res, next) => {
      console.log(req.body.username);
        const hash = bcrypt.hashSync(req.body.password, 12);
      myDataBase.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          
          myDataBase.insertOne({
            username: req.body.username,
            password: hash,
            dreams: []
          }, (err, doc) => {
              if (err) {
                res.redirect('/');
              } else {
                // The inserted document is held within
                // the ops property of the doc
                console.log(doc.ops);
                next(null, doc["insertedId"]);
              }
            });
        }
      });
    },
    passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
          res.redirect('/profile');
        }
      );

      app.route('/savedream').post(ensureAuthenticated, 
        (req, res, next) => {
        console.log(req.body);
        myDataBase.findOneAndUpdate(
        { username: req.user.username },
        { $push: { dreams: req.body.date + ": " + req.body.dream }}, function(err, result) {
          if (err) {
            console.log(err);
          } if (result) {
            console.log(result);
            //next(null, result["insertedId"]);
            res.redirect('/userdreams');
          }
        });
      });

    
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });   
};

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };