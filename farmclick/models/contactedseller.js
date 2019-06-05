var mongoose = require("mongoose");
mongoose.connect("mongodb:// localhost/farmclick",{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var contactedsellerschema=new mongoose.Schema({
    sellerid : String
});

module.exports = mongoose.model("contactedseller",contactedsellerschema);