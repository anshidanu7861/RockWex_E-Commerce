const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const { viewUserDetails } = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');

module.exports.viewUser = (req, res) => {
    userHelpers.viewUserDetails().then((UserDetails)=>{    
        res.render("admin/viewUsers", { admin:true, UserDetails});
    })
    
  }

module.exports.homePage = async(req, res, next)=> {
    
    let User = req.session.user
    let catDetails =await productHelpers.getCategoryDetails()
    let showBanners =await productHelpers.getAllBanners()
    let cartCount = null
    if(req.session.user){
    cartCount =await userHelpers.getCartCount(req.session.user._id)
    }else{
    cartCount=0
    }
    productHelpers.getAllProduct().then((Product)=> {
        res.render('index',{user:true, Product, User, catDetails, cartCount, showBanners});
    })
   
}
 
module.exports.userError = (req, res)=> {
    try{
        res.render('userError')
    }
    catch {
        res.redirect('/userError')
    }
}

module.exports.categoryProducts = (req, res)=>{
    let User = req.session.user
    userHelpers.showCategory(req.params.name).then((showCat)=>{
        res.render('categoryPro',{user:true, showCat,User})
    })    
}

module.exports.showAllProducts = async(req, res)=>{
    if(req.session.user){
      let User = req.session.user
      let allProducts =await productHelpers.showAllProduct()
      cartCount =await userHelpers.getCartCount(req.session.user._id)
      res.render('showAllProducts',{user:true, User, allProducts, cartCount})
    }else{
      let allProducts =await productHelpers.showAllProduct()
      res.render('showAllProducts',{user:true, allProducts})
    }
  
}

module.exports.searchProducts = (req, res)=>{
    userHelpers.searchProducts(req.body).then((searchData)=>{
      res.render('searchProducts', {user:true, searchData})
    })
  
  }