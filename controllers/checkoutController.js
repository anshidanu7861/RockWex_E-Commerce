const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const { viewUserDetails } = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');
const paypal = require('paypal-rest-sdk');
const dotenv = require('dotenv').config();


module.exports.checkoutPage = async(req, res)=>{
    if(req.session.user){
     let User = req.session.user
      let total =await userHelpers.getTotalAmout(req.session.user._id).then(async(total)=>{
        let userAddress=await userHelpers.getAddress(req.session.user._id)
        cartCount =await userHelpers.getCartCount(req.session.user._id)
        let showCoupon = await userHelpers.checkCoupon(req.session.user._id)
        let walletBalance = await walletHelpers.findWalletBalance(req.session.user._id)
        res.render('checkout',{user:true, User, total, userAddress, cartCount, showCoupon, walletBalance})
      })
    }else{
      res.redirect('/login') 
    }
  
}

module.exports.checkoutPost = async(req, res)=>{ 
    let products = await userHelpers.getCartProductList(req.session.user._id)
    let totalPrice = await userHelpers.getTotalAmout(req.session.user._id)
    userHelpers.placeOrder(req.body,products,totalPrice,req.session.user._id).then(async(orderId)=>{
    userHelpers.newTotal(orderId, req.body)
    userHelpers.pushUser(req.body, req.session.user._id)
    
      if(req.body.paymentMethod === 'COD'){
        let response = {paymentMethod:'COD'}
        res.json(response) 
      }
      else if(req.body.paymentMethod == 'RazorPay'){
        userHelpers.generateRazopay(orderId, totalPrice).then((data)=>{
          let response={paymentMethod:'RazorPay',razorpayDetails:data}
          res.json(response)
        })
      }else if(req.body.paymentMethod == 'PayPal'){
       let data =await  userHelpers.generatePaypal(orderId, totalPrice)
        let response={
          paymentMethod:'PayPal',
          paypalDetails:data
        }
        res.json(response)
      }else if(req.body.paymentMethod == 'wallet'){
        userHelpers.walletMoney(totalPrice, req.session.user._id).then((response)=>{
          res.json(response)
        })  
      }
     
    }) 
}

module.exports.paypalPayment = (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
    if (error) {
        throw error;
    } else {
    
        console.log(JSON.stringify(payment));
        userHelpers.changePaymentStatus(req.params.orderId).then((respones)=>{
          res.redirect('/OrderSuccess');
        })
    }
  });
}

module.exports.PaymentCancel = (req, res) => res.redirect('/userDashBoard')

module.exports.verifyPayments = (req, res)=>{
    userHelpers.verifyPayment(req.body).then(()=>{
     userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true}) 
     })
    }).catch((err)=>{
     res.json({status:false,errMsg:''})
    })
}

module.exports.orderSuccess = async(req, res)=>{

    if(req.session.user){
      let User = req.session.user
      let total = await userHelpers.getOrderTotal(req.session.user._id)
         res.render('orderSuccess',{user:true, User, total})
    }else{
      res.redirect('/login')
    }
  
}

module.exports.userAddressPage = (req, res)=>{ 
    let User = req.session.user
   res.render('addAddress',{user:true, User})
}

module.exports.editAddressCheckPage = async(req, res)=>{
    User = req.session.user
    userHelpers.getUserAddress(req.params.id).then((editData)=>{
      res.render('editAddress',{user:true,User,editData}) 
    })
}

module.exports.editAddressPostCheck = async(req, res)=> {
    Addresses = req.body
    userHelpers.updateUserAddress(req.params.id, Addresses).then((userDetails)=>{
    res.redirect('/checkout')
   })
   }