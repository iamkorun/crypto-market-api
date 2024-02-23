// const Trade = require("../models/trade");

// const openOrder = async (
//   pair,
//   type,
//   side,
//   amount,
//   avgPrice,
//   fee,
//   total,
//   wallet_id,
//   user_id,
//   takeProfit,
//   stopLoss
// ) => {
//   let result;
//   try {
//     const thispair = pair;
//     let tradeCreated;
//     let openTrade = await Trade.find({
//       user_id: user_id,
//       wallet_id: wallet_id,
//       status: "Openning",
//     });

//     if (openTrade.length != 0) {
//       const hasOpen = await openTrade.find(({ pair }) => {
//         return pair === thispair;
//       });
//       if (hasOpen) {
//         let newAmount = parseFloat(hasOpen.amount) + parseFloat(amount);
//         let newFee = parseFloat(hasOpen.fee) + parseFloat(fee);
//         let newTotal = parseFloat(hasOpen.total) + parseFloat(total);
//         let avgMethod = newTotal / newAmount;
//         const newOrder = {
//           $set: {
//             amount: newAmount,
//             avgPrice: avgMethod,
//             fee: newFee,
//             total: newTotal,
//           },
//         };
//         if (newOrder) {
//           updateTradeOrder = await Trade.findOneAndUpdate(
//             {
//               _id: hasOpen._id,
//             },
//             newOrder
//           );
//           if(updateTradeOrder){
//             result = tradeCreated;
//           }else{
//             result = {
//               error: true,
//               message: "Can't Open Order",
//             };
//           }
//         }
//       } else {
//         tradeCreated = await Trade.create({
//           pair: thispair,
//           type,
//           side,
//           amount,
//           avgPrice,
//           fee,
//           total,
//           wallet_id,
//           user_id,
//           takeProfit,
//           stopLoss,
//           status: "Openning",
//         });
//         if (tradeCreated) {
//           result = tradeCreated;
//         } else {
//           error = true;
//           result = {
//             error: true,
//             message: "Can't Open Order",
//           };
//         }
//       }
//     } else {
//       tradeCreated = await Trade.create({
//         pair: thispair,
//         type,
//         side,
//         amount,
//         avgPrice,
//         fee,
//         total,
//         wallet_id,
//         user_id,
//         takeProfit,
//         stopLoss,
//         status: "Openning",
//       });

//       if (tradeCreated) {
//         result = tradeCreated;
//       } else {
//         result = {
//           error: true,
//           message: "Can't Open Order",
//         };
//       }
//     }
//     return result;
//   } catch (e) {
//     result = {
//       error: true,
//       message: "Something went wrong",
//     };
//     console.log(e);
//     return result;
//   }
// };

// const editOrder = async () => {};

// const closeOrder = async () => {};

// module.exports = {
//   openOrder,
//   closeOrder,
// };
