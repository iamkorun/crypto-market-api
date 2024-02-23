const cron = require("node-cron");
const { fetchTrigger, webSocketBinance } = require("../controllers/api");
const { recordComulativeWallet } = require("../controllers/comulative");
const ccxt = require("ccxt");
const exchange = new ccxt.binance();

const recordTask = cron.schedule(
  "0 3 * * *",
  () => {
    const result = recordComulativeWallet();
    if(result.error){
      console.log("Recording Fail : ",result.message);
    }else{
      console.log("Recorded!");
    }
  },
  {
    scheduled: false,
  }
);

const mainTask = async () => {
  let data = await fetchTrigger();
  // data.map((a)=>{
  //   console.log(a.side,a.symbol,a.price,a.trigger);
  // })
  console.log(data);
  if (data) {
    setTimeout(mainTask, 1000);
  }

  //   let value = await webSocketBinance();
  //   console.log(value);
  //   if(value.symbol === "BTCUSDT"){
  //     setTimeout(task, 200);
  //   }
  //     webSocketBinance().then((value) => {
  //     setTimeout(task, 1000);
  //   });
};

// const task2 = async () => {
//   let data = await webSocketBinance();
//   console.log(data);
//   if (data) {
//     setTimeout(task2, 1000);
//   }
// };

module.exports = { recordTask, mainTask };
