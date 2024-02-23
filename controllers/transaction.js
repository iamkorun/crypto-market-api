const Transaction = require("../models/transaction");

const getTransaction = async (req, res) => {
  let response;
  try {
    const id = req.params.id;

    let transaction = await Transaction.find({ order_id: id });
    if (transaction) {
      let data = [];
      transaction.forEach((element) => {
        if (!data.includes(element)) {
          data.push(element);
        }
      });
      response = data;
    } else {
      response = {
        error: true,
        message: "Authorization failed",
      };
    }
    res.json(response);
  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

module.exports = {
  getTransaction,
};
