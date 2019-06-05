var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var cropdealschema = require("./cropdeal").schema;
var passportLocalMongoose = require("passport-local-mongoose");

var userschema = new mongoose.Schema({
    firstname : String,
    lastname:String,
    contact:Number,
    address : String,
    mandal:String,
    district : String,
    password : String,
    orders : [
        cropdealschema
    ]
});
userschema.plugin(passportLocalMongoose);
/*userschema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
}); */

module.exports = mongoose.model("user",userschema);