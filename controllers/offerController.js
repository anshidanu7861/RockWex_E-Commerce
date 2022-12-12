const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');


module.exports.adminAddOffer = async(req, res)=>{
    let Product =await productHelpers.showAllProduct()
    res.render('admin/addOffers',{admin:true, Product})
}

module.exports.adminAddOfferPost = (req, res)=>{
    productHelpers.addOffer(req.body, req.params.id)
   
    res.redirect('/admin/addOffers')
}

module.exports.adminAddCoupons = (req, res)=>{
    res.render('admin/addCoupons',{admin:true})
}

module.exports.adminAddCouponPost = (req, res)=>{
    productHelpers.insertCoupon(req.body)
    res.redirect('/admin/addCoupons')
}

module.exports.getCoupons = (req, res)=>{
    userHelpers.getCoupon(req.params.id).then((response)=>{
      res.json(response)
    
    })  
}