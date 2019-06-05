var mongoose = require("mongoose");
mongoose.connect("mongodb:// localhost/farmclick",{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var cropdeal = require("./cropdeal.js");
var cropschema = new mongoose.Schema({
    cropname : {
        type:String,
    } ,
    deals : [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref : "cropdeal"
        }
    ]
});
module.exports = mongoose.model("crop",cropschema);

