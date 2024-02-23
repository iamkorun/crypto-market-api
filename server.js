const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { recordTask,mainTask, task2 } = require("./controllers/task");

require("dotenv").config();

const app = express();

app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/images', express.static('images'));
app.use('/pic', express.static('pic'));

const userRoute = require("./routes/user");
const apiRoute = require("./routes/api");
const walletRoute = require("./routes/wallet");
const orderRoute = require("./routes/order");
const transactionRoute = require("./routes/transaction");
const comulativeRoute = require("./routes/comulative");

app.use("/user", userRoute);
app.use("/api", apiRoute);
app.use("/wallet", walletRoute);
app.use("/order", orderRoute);
app.use("/transaction", transactionRoute);
app.use("/comulative", comulativeRoute);

mainTask().catch((e)=>console.log(e));
// recordTask.start();
// task2().catch((e)=>console.log(e.message));

mongoose
  .connect(process.env.URL_MONGO, {
    useNewUrlParser: true,
  })
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log("Server running PORT : ", process.env.PORT);
    })
  )
  .catch((error) => {
    console.log("Error to connect database", error);
  });
