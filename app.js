//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const md5 = require("md5");

//For mongoose encryption
/*const encrypt = require("mongoose-encryption");*/

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema =  new mongoose.Schema({
    email: String,
    password: String
}) ; 

//encrypting the database passwords of user using mongoose-encryption
/*userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});*/

//creating collection using mongoose.model
const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save(function (err) {
        if(err){
            console.log(err);
        }
        else{
            res.render("secrets"); 
        }
    });
})

app.post("/login", function (req, res) {
    const userEmail = req.body.username;
    const userPassword = md5(req.body.password);
    User.findOne({email: userEmail}, function (err, foundUser) {
        if (foundUser === null || foundUser === ""){
            res.redirect("/register")
        }
        else{
            if (userPassword === foundUser.password){
                res.render("secrets");
            }
            // else{
            //     res.render("/login");
            // }
        }
    })
})
























let port = process.env.PORT
if (port == null || port == ""){
    port = 3000;
}

app.listen(port, function () {
    console.log("The app has started on port: " + port);
})