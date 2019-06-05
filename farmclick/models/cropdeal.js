var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/farmclick",{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var user = require("./user.js");
var cropdealschema = new mongoose.Schema({
    cropname:String,
    orderid:String,
   units : String,
   numofunits : String,
    status : String,
   seller : [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }    
   ]
   
});
module.exports = mongoose.model("cropdeal",cropdealschema);
