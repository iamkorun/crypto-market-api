const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    } else {
      token = req.body.token;
    }

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.json({
            error: true,
            message: "ไม่ได้เข้าสู่ระบบ",
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.status(401).send("Not authorized");
    }
  } catch (e) {
    res.status(400).json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

module.exports = auth;