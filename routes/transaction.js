const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const TransactionControl = require("../controllers/transaction");

router.get("/:id", auth, TransactionControl.getTransaction);

module.exports = router;