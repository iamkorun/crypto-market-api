const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const ComulativeControl = require("../controllers/comulative");

router.get("/:id", auth, ComulativeControl.fetchComulativesWalletById);
router.post("/record", ComulativeControl.recordComulativeWallet);
router.get("/data/all", ComulativeControl.getComulativeWallet);

module.exports = router;
