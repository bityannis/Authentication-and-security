const mongoose = require("mongoose");
const username = "usertest";
const password = "test123_";
const DB = "marketplace";

const URI = `mongodb+srv://${username}:${password}@cluster-clickcollectmer.75bbd7k.mongodb.net/${DB}?retryWrites=true&w=majority`;

const MongoDBClient = {
  init: () => {
    try {
      const client = mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      client.then(() => {
        console.log(`Successfully connected to MongoDB!! 😄`);
      });
    } catch (e) {
      throw Error(e);
    }
  },
};

module.exports = MongoDBClient;
