//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); 

//For using md5 hashing algorithms
// const md5 = require("md5");

//For mongoose encryption
/*const encrypt = require("mongoose-encryption");*/

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema =  new mongoose.Schema({
    email: String,
    password: String
}); 

userSchema.plugin(passportLocalMongoose);

//encrypting the database passwords of user using mongoose-encryption
/*userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});*/

//creating collection using mongoose.model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function (err, user) {
        if(err) {
            res.redirect("/register")
        } else{
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
    

    /*use this function to genrate only hashes of password without salting*/
    // const newUser = new User({
    //     email: req.body.username,
    //     password: md5(req.body.password)
    // });
    // newUser.save(function (err) {
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         res.render("secrets"); 
    //     }
    // });
});

app.post("/login", function (req, res) {
    const user = new User({
        email: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err){
            console.log(err);
        }
        else{
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secrets');
            });
        }
        
    });
    //for creating hash using md5 package
    // const userPassword = md5(req.body.password);
    // User.findOne({email: userEmail}, function (err, foundUser) {
    //     if (foundUser === null || foundUser === ""){
    //         res.redirect("/register")
    //     }
    //     else{
    //         /* used for hash password without salt */
    //         // if (userPassword === foundUser.password){
    //         //     res.render("secrets");
    //         // }
    //         // else{
    //         //     res.render("/login");
    //         // }
    //     }
    // })
});

app.get('/logout', function(req, res) {
    req.logout(function(err) {
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/'); 
        }
    });
});
























let port = process.env.PORT
if (port == null || port == ""){
    port = 3000;
}

app.listen(port, function () {
    console.log("The app has started on port: " + port);
})