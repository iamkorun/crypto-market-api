const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Fav = require("../models/favcoins");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const userRegister = async (req, res) => {
  try {

    const { name, email, password } = req.body;
    const imgurl = "none-profile.png";

    let error = false;
    // Hash password

    if (!error) {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        imgurl,
      });
      res.send({ message: "Register Successfully" });
    }
  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.json({
        error: true,
        message: "Invalid Username or Password",
      });
    }
  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

const update = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);

    const data = req.body;

    const name = await User.findOneAndUpdate(
      { _id: _id.id },
      data
    );

    if (name) {
      res.json(name);

    } else {
      res.json({
        error: true,
        message: "404 not found",
      });
    }
  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

const updateProfilePic = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);

    const data = req.body;
    // console.log(data)

    const imgurl = await User.findOneAndUpdate(
      { _id: _id.id },
      data
    );
    if (imgurl) {
      res.json(imgurl);

    } else {
      res.json({
        error: true,
        message: "404 not found",
      });
    }
  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

const AddFavCoins = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);
  
    const data = req.body;
    
    const findfav = await Fav.findOne({ user_id: _id.id });

    if (findfav) {
   
      const updateFav = await Fav.findByIdAndUpdate(
        {
          _id: findfav._id,
        },
        {
          $push: { coins: { name: data.name } }
        }
      );

      if (updateFav) {
        console.log(updateFav);
      }
        
    } else {
      const result = await Fav.create({
        user_id: _id.id, coins: [{ name: data.name }]
      })
    }

  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

const RemoveFavCoins = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);
  
    const data = req.body;
    
    const findfav = await Fav.findOne({ user_id: _id.id });

    if (findfav) {
   
      const updateFav = await Fav.findByIdAndUpdate(
        {
          _id: findfav._id,
        },
        {
          $pull: { coins: { name: data.name } }
        }
      );

      if (updateFav) {
        console.log(updateFav);
      }
        
    } else {
      const result = await Fav.create({
        user_id: _id.id, coins: [{ name: data.name }]
      })
    }

  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

const uploadPic = async (req, res) => {
  var userID = req.params.userID;
  var filename;

  var storage = multer.diskStorage({
    destination: (req, file, cp) => {
      cp(null, "images");
    },
    filename: (req, file, cp) => {
      filename = userID + "-" + file.originalname;
      cp(null, filename);
    }
  })

  var upload = multer({ storage: storage }).single('file');

  upload(req, res, async (err) => {
    if (err) {
      res.json({
        result: false,
        message: err.message
      });
    } else {
      res.json({
        result: true,
        data: filename
      })
    }
    console.log(res.json.data);
  })

};

const getAllUser = async (req, res) => {
  let response;
  try {
    let name = await User.find();
    // console.log(name);
    if (name) {
      response = name;
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

const getUser = async (req, res) => {
  let response;
  try {
    const _id = req.decoded;

    let name = await User.find({ _id: _id.id });
    // console.log(name);
    if (name) {
      response = name;
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

const getFavCoins = async (req, res) => {
  let response;
  try {
    const _id = req.decoded;

    let name = await Fav.find({ user_id: _id.id });
    // console.log(name);
    if (name) {
      response = name;
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

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });
};






module.exports = { userLogin, userRegister, update, getUser, updateProfilePic, uploadPic, AddFavCoins, RemoveFavCoins, getFavCoins, getAllUser };
