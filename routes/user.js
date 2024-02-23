const express = require("express");
const router = express.Router();
const UserControl = require('../controllers/user');
const auth = require("../middlewares/auth");


router.post('/login',UserControl.userLogin);
router.post('/register',UserControl.userRegister);
router.get('/userName', auth, UserControl.getUser);
router.patch('/update', auth, UserControl.update);
router.patch('/updateprofilepic', auth, UserControl.updateProfilePic);
router.post('/upload/:userID', auth, UserControl.uploadPic);
router.patch('/addfavcoins', auth, UserControl.AddFavCoins);
router.patch('/removefavcoins', auth, UserControl.RemoveFavCoins);
router.get('/getfavcoins', auth, UserControl.getFavCoins);
router.get('/getalluser', auth, UserControl.getAllUser);

module.exports = router;