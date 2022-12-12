const collections = require("../config/collection");
const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectID } = require("bson");
const collection = require("../config/collection");
const { response } = require("../app");
const Razorpay = require("razorpay");
const { resolve } = require("path");
const paypal = require("paypal-rest-sdk");
const voucher_codes = require("voucher-code-generator");
const { Console, log } = require("console");

module.exports = {
  userWallet: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.WALLET_COLLECTION)
        .insertOne({
          userID: userId,
          balance: parseInt(0),
          Transactions: [],
        });
    });
  },

  addWalletAmount: (userId) => {
    let DateAndTime = new Date()
    return new Promise((resolve, reject) => {
      refferalData = {
        amount: parseInt(50),
        date:DateAndTime.getDate()+'/'+(DateAndTime. getMonth()+1)+'/'+DateAndTime.getFullYear(),
        time:DateAndTime.getHours()+':'+(DateAndTime. getMinutes()+1)+':'+DateAndTime.getSeconds(),
        status: "Credited",
        message: "Refferal Amount",
      };
      db.get()
        .collection(collections.WALLET_COLLECTION)
        .updateOne(
          { userID: ObjectID(userId) },
          {
            $inc: {
              balance: parseInt(50),
            },
            $push: {
              Transactions: refferalData,
            },
          }
        );
    });
  },

  refferalAmount: (refferals, amt) => {
    return new Promise((resolve, reject) => {

      let DateAndTime = new Date()
  
        refferalData = {
          amount: parseInt(100),
          date:DateAndTime.getDate()+'/'+(DateAndTime. getMonth()+1)+'/'+DateAndTime.getFullYear(),
          time:DateAndTime.getHours()+':'+(DateAndTime. getMinutes()+1)+':'+DateAndTime.getSeconds(),
          status: "Credited",
          message: "Refferal Amount",
        };
         db
          .get()
          .collection(collections.WALLET_COLLECTION)
          .updateOne(
            { userID: refferals._id },
            {
              $inc: {
                balance: amt,
              },
              $push: {
                Transactions: refferalData,
              },
            }
          );
      
    });
  },


  walletDetails:(user)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.WALLET_COLLECTION).findOne({userID:ObjectID(user)}).then((respons)=>{
            resolve(respons)
        })
    })
  },


  cancelRefund:(details, user)=>{  
    orderID = details.orderId
    productID = details.proId
    let DateAndTime = new Date()
    return new Promise(async(resolve, reject)=>{
    let getPrice = await  db.get().collection(collections.ORDER_COLLECTION).aggregate([
        {
          $match:{_id:ObjectID(orderID)}
        },
        {
          $unwind:'$products'
        },
        {
          $match:{'products.item':ObjectID(productID)}
        },
        {
          $project:{
            item:'$products.item',
            price:'$products.price',
            offerPrice:'$products.offerPrice',            
          }
        }
      ]).toArray()
      let price;
      if(getPrice[0].offerPrice)
      {
        price = getPrice[0].offerPrice;
      }
      else{
        price = getPrice[0].price;
      }
    refferalData = { 
      amount: price,
      date:DateAndTime.getDate()+'/'+(DateAndTime. getMonth()+1)+'/'+DateAndTime.getFullYear(),
      time:DateAndTime.getHours()+':'+(DateAndTime. getMinutes()+1)+':'+DateAndTime.getSeconds(),
      status: "Credited",
      message: "Refund Amount",
    };     
      let matchCOD =await db.get().collection(collections.ORDER_COLLECTION).findOne({_id:ObjectID(orderID)})
      if(matchCOD.paymentMethod == 'COD'){
        let msg = 'Cancelled'
      }else{
        db.get().collection(collections.WALLET_COLLECTION).updateOne({userID:ObjectID(user._id)},{
          $inc:{
            balance:price
          },
          $push:{
            Transactions: refferalData,
          }
          
        })
      }
    })
  },

  findWalletBalance:(user)=>{
    return new Promise((resolve, reject)=>{
      db.get().collection(collections.WALLET_COLLECTION).findOne({userID:ObjectID(user)}).then((data)=>{
        resolve(data)
      })
    })
  },

  returnRefund:(orderId)=>{
    let DateAndTime = new Date()
    return new Promise(async(resolve, reject)=>{
     let getPrice =await db.get().collection(collections.ORDER_COLLECTION).aggregate([
        {
          $match:{_id:ObjectID(orderId)}
        },
        {
          $unwind:'$products'
        },
        {
          $match:{'products.trackOrder':'Approved'}
        },
        {
          $project:{
            item:'$products.item',
            price:'$products.price',
            offerPrice:'$products.offerPrice',
            User:'userId'
          }
        }
      ]).toArray()
      
      let price;
      if(getPrice[0].offerPrice)
      {
        price = getPrice[0].offerPrice;
      }
      else{
        price = getPrice[0].price;
      }
      refferalData = { 
        amount: price,
        date:DateAndTime.getDate()+'/'+(DateAndTime. getMonth()+1)+'/'+DateAndTime.getFullYear(),
        time:DateAndTime.getHours()+':'+(DateAndTime. getMinutes()+1)+':'+DateAndTime.getSeconds(),
        status: "Credited",
        message: "Return Refund Amount",
      }; 

      let getUser =await db.get().collection(collections.ORDER_COLLECTION).findOne({_id:ObjectID(orderId)})

      db.get().collection(collections.WALLET_COLLECTION).updateOne({userID:ObjectID(getUser.userId)},{
        $inc:{
          balance:price
        },
        $push:{
          Transactions: refferalData,
        }
        
      }).then((data)=>{
        resolve(data)
      })
    })
  }




};
