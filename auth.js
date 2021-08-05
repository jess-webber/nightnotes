const passport = require('passport');
const ObjectId = require('mongodb').ObjectId;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = function (app, myDataBase) {

    passport.serializeUser((user, done) => {
        done(null, user._id);
      });
      
      passport.deserializeUser((id, done) => {
        myDataBase.findOne({ _id: new ObjectId(id) }, (err, doc) => {  
          if (err) return console.error(err);
          done(null, doc);
        });
      });

      passport.use(new LocalStrategy(
        function(username, password, done) {
          myDataBase.findOne({username: username}, function (err, user) {
            console.log('User ' + username + ' attempted to log in.');
            if (err) {
            return done(err); 
            }
            if (!user) { 
            console.log("User doesn't exist");
            return done(null, false); 
            }
            if (!bcrypt.compareSync(password, user.password)) {
            console.log("Incorrect password");
            return done(null, false); 
            }
            console.log("done");
            return done(null, user);
          });
        }
      ))
      
    
      
      function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/home');
      };

}