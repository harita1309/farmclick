var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userschema = new mongoose.Schema({
    contact : String,
    name : String,
    password:String
});
userschema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user",userschema);