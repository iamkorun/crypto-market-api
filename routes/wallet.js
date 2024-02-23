const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const WalletControl = require("../controllers/wallet");

router.get("/", auth, WalletControl.getAllWallet);
router.get("/allwallet", auth,WalletControl.AllWallet);
router.get("/:id", auth, WalletControl.getWalletById);
router.get("/list/details", auth, WalletControl.getAllWalletDetails);
router.get("/details/:id", auth, WalletControl.getWalletDetailsById);
router.post("/create", auth, WalletControl.createWallet);
router.patch("/:id", auth, WalletControl.updateWalletById)
router.delete("/:id", auth, WalletControl.deleteWalletById);

module.exports = router;
