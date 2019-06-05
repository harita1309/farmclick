var express = require("express");
var app = express();
var mongoose = require("mongoose");
var passport = require("passport");
var user = require("./models/user")
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var CustomStrategy = require("passport-custom");
var passportLocalMongoose = require("passport-local-mongoose");
mongoose.connect("mongodb://localhost/authdb",{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.use(require("express-session")({
    secret : "I am bored as hell",
    resave:false,
    saveUninitialized :false
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.get("/",function(req,res){
    res.render("home");
    
});
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",function(req,res){
    req.body.contact;
    req.body.password;
    req.body.name;
    var userdata = {
           name: req.body.name,
    }
    user.create(userdata, function (err, user) {
             if (err) {
                console.log(err);
            } else {
                user.register(new user({username:req.body.contact}),req.body.password,function(err,addeduser){
                    if(err){
                        console.log("register");
                        console.log(err);
                        res.render("register");
                    }
                    passport.authenticate("local")(req,res,function(){
                        res.redirect("/register");
                    });
                })

        }
    });

});

app.get("/login",function(req,res){
    res.render("login");
})
app.post("/login",passport.authenticate("local",{
     successRedirect:"/secret",
     failureRedirect:"/login"
    }),function(req,res){
    
});
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

app.get("/secret",isLoggedIn,function(req,res){
    res.send("this is the secret page");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("sever started");
})
