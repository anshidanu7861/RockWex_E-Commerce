const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');


module.exports.userBlockAdmin = (req, res)=>{
    userHelpers.userBlock(req.params.id).then(()=>{
      res.redirect('/admin/viewUsers')
    })
}

module.exports.userUnblockAdmin = (req, res)=>{
    userHelpers.userUnblock(req.params.id).then(()=>{
      res.redirect('/admin/viewUsers')
    })
  }