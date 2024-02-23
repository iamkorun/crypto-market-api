const request = require("request");
const User = require("../models/user");
const url_line_notification = "https://notify-api.line.me/api/notify";

const lineNotify = async (id, wallet_name, pair, side, avgPrice, amount, total) => {
  console.log(id);

  const userToken = await User.findOne({ _id: id });

  // console.log(userToken);
  let message = `มีการทำรายการ ${side} เหรียญ ${pair.split("_")[0]}
ที่ราคา : ${avgPrice}
จำนวน : ${amount}
รวมราคาทั้งสิ้น : $${parseFloat(total).toFixed(2)}
ที่กระเป๋า ${wallet_name}`;

  request(
    {
      method: "POST",
      uri: url_line_notification,
      header: {
        "Content-Type": "multipart/form-data",
      },
      auth: {
        bearer: userToken.linetoken,
      },
      form: {
        message: message,
      },
    },
    (err, httpResponse, body) => {
      if (err) {
        console.log(err);
      } else {
        console.log(body);
      }
    }
  );
};

module.exports = {
  lineNotify,
};
