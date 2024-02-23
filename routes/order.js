const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const OrderControl = require("../controllers/order");

router.get("/:id", auth, OrderControl.getOrder);
router.get("/pending/:id", auth, OrderControl.getPendingOrder);
router.post("/limit", auth, OrderControl.limitOrder);
router.post("/market", auth, OrderControl.marketOrder);
router.post("/cancel/:id", auth, OrderControl.CancelOrder);

module.exports = router;
