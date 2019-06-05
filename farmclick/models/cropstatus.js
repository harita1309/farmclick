var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/farmclick",{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var cropstatusschema = new mongoose.Schema({
  orderid : String,
  buyercontact : Number
});
module.exports = mongoose.model("cropstatus",cropstatusschema);
