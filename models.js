const mongoose = require("mongoose");
const Schema = mongoose.Schema;

DB_NAME = "shoten";

const Users = new Schema({
  _id: Schema.Types.ObjectId,
  name: {type: String, unique: true},
  line_id: {type: String, unique: true},
  usage_amount: {type: Number,  default: 0}
});

const Items = new Schema({
  _id: Schema.Types.ObjectId,
  name: {type: String, unique: true},
  price: {type: String},
  image_url: {type: String},
});

const Logs = new Schema({
  _id: Schema.Types.ObjectId,
  user_id: {type: Schema.Types.ObjectId, ref: 'Users'},
  item_id: {type: Schema.Types.ObjectId, ref: 'Items'},
  datetime: {type: Date, default: new Date}
});

const config = require('./mongo.config.js').mongo;
const dbuser = config.username;
const dbpassword = config.password;
const dburl = config.url;

mongoose.connect("mongodb://"+dbuser+":"+dbpassword+dburl);
module.exports.Users = mongoose.model('Users', Users);
module.exports.Items = mongoose.model('Items', Items);
module.exports.Logs = mongoose.model('Logs', Logs);
