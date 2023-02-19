const Client = require("./model");

const getClient = async (obj) => {
  try {
    return Client.findOne({
      _id: obj,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getClient,
};
