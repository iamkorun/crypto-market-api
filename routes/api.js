const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const ApiControl = require("../controllers/api");
const LibControl = require("../libs/trade");
const ComulativeControl = require("../controllers/comulative");

router.get("/websocketbnb",ApiControl.webSocketBinance);
router.get("/markets", auth, ApiControl.fetchMarkets);
router.get("/trigger", ApiControl.fetchTrigger);
router.get("/ranking", ApiControl.fetchWalletPnlRanking);
router.post("/ticker", auth, ApiControl.fetchTicker);



// router.get("/trade",auth, LibControl.openOrderTest);

module.exports = router;
