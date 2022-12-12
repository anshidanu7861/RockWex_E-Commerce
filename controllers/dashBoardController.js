const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const { viewUserDetails } = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');


module.exports.addressPost = async(req, res)=>{
    userHelpers.userAddress(req.body).then((response)=>{
      res.redirect('/checkout')
  
    }) 
}

module.exports.userDashBoardPage = async(req, res)=>{
    if(req.session.user){
      let User = req.session.user
      let getRefferal = await userHelpers.getRefferal(req.session.user._id)
      let UserAddress = await userHelpers.findUserAddress(req.session.user._id)
      let allAddress = await userHelpers.getAddress(req.session.user._id)
      let showWalletDetails = await walletHelpers.walletDetails(req.session.user._id)
      userHelpers.getOrderDetails(req.session.user._id).then((OrderDetails)=>{
        res.render('userDashBoard',{user:true, OrderDetails, allAddress, UserAddress, User, showWalletDetails, getRefferal})
      }) 
    }else{
      res.redirect('/login')
    }
}

module.exports.addAddressPost = async(req, res)=>{
    await userHelpers.addUserAddressToDashBoard(req.body).then(()=>{
      res.redirect('/userDashBoard')
   
    })
}

module.exports.editAddressPostMethod = (req, res)=>{
    userHelpers.editAddressProfileSide(req.params.id, req.body)
    res.redirect('/userDashBoard')
}

module.exports.editAddressGetMt = (req, res)=>{
    let User = req.session.user
    userHelpers.showUserAddresses(req.params.id).then((editData)=>{
      res.render('editUserAddressProfileSide',{user:true, editData, User})
    })
  
}

module.exports.viewOrderProfile = (req,res)=>{
    res.render('viewProducts')
}

module.exports.deleteAddressDash = async(req, res)=>{
    userHelpers.deleteAddress(req.params.id).then(()=>{
      res.redirect('/userDashBoard')
    })
}

module.exports.cancelOrders = (req, res)=>{
    userHelpers.cancelOrderUser(req.body).then((status)=>{
      walletHelpers.cancelRefund(req.body, req.session.user)
      res.json({status:true})
    })
}

module.exports.returnOrders = (req, res)=>{
    userHelpers.returnOrderRequest(req.body).then((status)=>{
      res.json({status:true})
    })
}

module.exports.returnProducts = (req, res)=>{
    if(req.session.user){
      User=req.session.user
      userHelpers.getReturnProducts(req.params.id, req.session.user._id).then((returnData)=>{
        res.render('returnProduct',{user:true, returnData, User})
      })  
    }else{
      res.redirect('/login')
    }
}

module.exports.viewOrderProducts = async(req, res)=>{
    let User = req.session.user
   let viewOrderItems =await userHelpers.productOrders(req.params.id)
  res.render('viewProOrder',{user:true, viewOrderItems, User})
  }