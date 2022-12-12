const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');


module.exports.adminViewOrder = async(req, res)=>{
    productHelpers.getOrder().then((orders)=>{
      res.render('admin/viewOrderList',{admin:true, orders})
    })
}

module.exports.adminOrderList = async(req, res)=>{
    let orders =await productHelpers.orderProducts(req.params.id)
      res.render('admin/orderProList',{orders})
}

module.exports.changeOrderStatus = (req, res)=>{
    userHelpers.changeStatus(req.body).then(()=>{
   res.json({status:true})
   })
 }

 module.exports.approveReturnStatus = (req, res)=>{
    productHelpers.getReturnProductAdmin().then((getReturnPro)=>{
      res.render('admin/retunShowPro',{user:true, getReturnPro})
    })

}

module.exports.approveReturnStatusPost = (req, res)=>{
    userHelpers.approveReturn(req.params.id).then((approved)=>{
      walletHelpers.returnRefund(req.params.id)
      res.json({status:true})
  
    })
  }