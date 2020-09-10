const mongoose = require("mongoose");

const mongoOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost:27017/chat", mongoOption)
  .then((conn) => {
    console.log("Connected to database");
  });

module.exports = { mongoose };
