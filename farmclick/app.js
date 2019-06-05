var express = require("express");
var app = express();
var mongoose = require("mongoose");

 //auth configuration
var passport = require("passport");
var user = require("./models/user");
var cropdeal = require("./models/cropdeal");
var crop = require("./models/crop");
var contactedseller=require("./models/contactedseller");
var bodyParser = require("body-parser");
var bcrypt = require("bcrypt");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var orderidgen = require('order-id')('myscret');
var client = require('twilio')('ACa12225f16590882a46875dec80f4326a','69db2df2e01c3b587574db90e8fc3631');

//alertmessages





mongoose.connect("mongodb://localhost/farmclick",{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret : "I am bored as hell",
    resave:false,
    saveUninitialized :true,
    
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
        usernameField: 'contact',
		passwordField: 'password'},user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use(express.static('public'));
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})
app.set("view engine","ejs");

//landing page route
var otpsent;
var verified = 0;
var savedcontact;
app.get("/",function(req,res){
    verified = 0;
    res.render("landing",{currentUser : res.locals.currentUser,verified:verified,alert:"none"});
});
//otp route

app.post("/genotp",function(req,res){
    savedcontact = req.body.contact;
    var min=100000; 
    var max=10000000;  
    verified = 1;
    var random =Math.floor(Math.random() * (+max - +min)) + +min; 
    otpsent = random.toString()
    var clientnumber = '+91'+savedcontact;
    client.messages.create({
        to: clientnumber,
        from: '+12015142271',
        body:"Your OTP for FARMCLICK is "+ otpsent,
      },(err, message) => {
        if(err){
          console.log(err);
        }
        else{
            console.log(otpsent);
            console.log(message.sid);
        }
     }
    );
    
    res.render("landing",{verified:verified,contact:savedcontact});
});

//verifyotp route
app.post("/verifyotp",function(req, res) {
    var otp = req.body.otp;
    if(otp == otpsent){
        verified = 2;
        res.render("landing",{verified:verified,contact:savedcontact,alert:"none"});

    }
    else{
        verified = 0;
        res.render("landing",{verified:verified,contact:savedcontact,alert:"display"});
    }
}); 

//signup page post route
app.post("/signup",function(req,res){
      req.body.contact;
      req.body.password;
      req.body.firstname;
      var newuser = new user({username: req.body.contact});
      user.register(newuser, req.body.password, function(err,saveduser){
        if(err){
            console.log(err);
            res.render("landing",{verified:2,alert:"display",contact:""});
        }
        else{
            user.findById(saveduser._id,function(err,user){
                if(err){
                    console.log("err");
                }
                else{
                    user.firstname = req.body.firstname;
                    user.lastname = req.body.lastname;
                    user.address = req.body.address;
                    user.mandal = req.body.mandal;
                    user.district = req.body.district;
                    user.save(function(err,user){
                        if(err){
                            console.log("update error");
                        }
                        else{
                            console.log(user);
                        }
                    })
                }
            });
            passport.authenticate("local")(req,res,function(){
                verified = 0;
                res.render("landing",{verified:verified,alert:"none"});
            });
        }
      });     
    
});
//login page routes
app.get("/login",function(req,res){
    res.render("login",{alert:"none"});
});
app.get("/login/fail",function(req,res){
   res.render("login",{alert:"display"}); 
});
app.post("/login",passport.authenticate("local",{
        successRedirect:"/",
        failureRedirect:"/login/fail",
    })
);

//forgot password routes
app.get("/forgotpassword",function(req,res){
        res.render("forgotpass",{sending:0,alert:"none"});
});
app.post("/forgotpassword1",function(req,res){
    var savedcontact=req.body.mobile;
    console.log(savedcontact);
    var min=100000; 
    var max=10000000;  
    var random =Math.floor(Math.random() * (+max - +min)) + +min; 
    otpsent = random.toString()
    var clientnumber = '+91'+savedcontact;
    client.messages.create({
        to: clientnumber,
        from: '+12015142271',
        body:"Your OTP for FARMCLICK is "+ otpsent,
      },(err, message) => {
        if(err){
          console.log(err);
        }
        else{
            console.log(otpsent);
            console.log(message.sid);
        }
     }
    );
    res.render("forgotpass",{sending:1});
});
app.post("/forgotpassword2",function(req, res){
    var otp = req.body.otp;
    if(otp == otpsent){
        res.render("forgotpass",{sending:2});

    }
    else{
        res.render("forgotpass",{sending:0,alert:"display"});
    }
});
app.post("/forgotpassword3",function(req,res){
    var password = req.body.password;
});
//logout page routes
app.get("/logout",function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/crops",function loggedIn(req,res,next){
     if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
},function(req,res){
    res.render("index");
})
app.post("/crops/sell",function(req,res){
    var cropname = req.body.cropname;
    if(req.body.cropname == "others"){
        var cropname = req.body.othercrop;
    }

    var id = orderidgen.generate();
    var deal = {cropname:cropname,orderid:id,units:req.body.units,numofunits:req.body.numofunits,status:"not sold"};
    cropdeal.create(deal,function(err,cropdeal){ 
        if(err){
            console.log(err);
        }
        else{
            cropdeal.seller.push(res.locals.currentUser._id);
            cropdeal.save();
            res.locals.currentUser.orders.push(cropdeal);
            res.locals.currentUser.save();
            crop.findOne({cropname:cropname},function(err,founduser){
                if(err){
                    console.log(err);
                }
                else{
                    if(!founduser){
                        crop.create({cropname:req.body.othercrop},function(err,newuser){
                            if(err){
                                console.log("new error");
                            }
                            else{
                                newuser.deals.push(cropdeal._id);
                                newuser.save();
                            }
                        }) 
                    } 
                    else{
                    
                        founduser.deals.push(cropdeal._id);
                        founduser.save(); 
                    }
                }
            });
            //res.render("profile",{orders:res.locals.currentUser.orders,user:res.locals.currentUser});
            res.redirect("/profile");
        }
    })
});

app.post("/crops/buy",function(req,res){
   var cropname=req.body.cropname;
   if(req.body.cropname=="others"){
       cropname = req.body.othercrop;
       console.log("cropname");
   }
   cropdeal.find({cropname:cropname},function(err,foundCrop){
       if(err){
           console.log("found error");
           console.log(err);
       } else { 
                if(isEmpty(foundCrop)==true){
                    res.send("No deals found");
                }
                else{
                   res.render("cropdisplay",{foundCrop:foundCrop}); 
                }
       }
   });
});
app.get("/profile",isLoggedIn,function(req, res) {
    res.render("profile",{orders:res.locals.currentUser.orders,user:res.locals.currentUser});
});
app.post("/profile",function(req,res){
    if(req.body.sold == "sold"){
        cropdeal.findById(req.body.orderid,function(err,foundeal){
           if(err){
               console.log(err);
           } 
           else{
               foundeal.status = "sold";
               foundeal.save();
           }
        });
        console.log(res.locals.currentUser);
        for(var i=0;i<res.locals.currentUser.orders.length;i++){
                    if(res.locals.currentUser.orders[i]._id == req.body.orderid){
                        res.locals.currentUser.orders[i].status = "sold";
                        res.locals.currentUser.save();
                    }
                }
            res.redirect("/profile");
                
    } 
    
});

app.get("/crops/:id",function(req,res){

   user.findById(req.params.id,function(err,foundcontact){
                if(err){
                    console.log();
                }
                else{
                    //console.log(foundcontact);
                        res.render("showseller",{founduser:foundcontact});

                }
            });
}); 


//Edit profile
app.get("/editprofile",function(req,res){
   res.render("editprofile",{user:res.locals.currentUser}); 
});

app.post("/editprofile",function(req,res){
    var firstname=req.body.firstname;
    var lastname=req.body.lastname;
    var contact=req.body.contact;
    var address=req.body.address;
    var mandal=req.body.mandal;
    var district=req.body.district;
    var edited={firstname:firstname,lastname:lastname,contact:contact,address:address,mandal:mandal,district:district};
    user.findById(res.locals.currentUser.id,function(err,found){
       if(err){
            console.log(err);
       } else {
            // console.log(found);
            found.update(edited,function(err,doneediting){
                if(err){
                    console.log(err);
                } else {
                    console.log(doneediting);
                }
            });    
       }
    });
    res.redirect("/profile");

});
app.get("/emi",function(req,res){
    res.render("emi");
});

app.post("/emicalculator",function(req,res){
    console.log(req.body);
    var p=req.body.amount;
    var r=req.body.interest;
    var n=req.body.terms;
    var t=req.body.time;
    var type=req.body.type;
    res.render("calculate",{amount:p,interest:r,terms:n,time:t,type:type});
}); 


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/");
    }
}
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("server started");
}); 
