const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const { viewUserDetails } = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');


module.exports.AddToCart = (req, res)=>{
    if(req.session.user){
      userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
        res.json({status:true})
    }) 
    }else{ 
      res.redirect('/login')
    }
     
}

module.exports.viewAllCartProducts = async(req, res)=>{ 
    if(req.session.user){
      let User = req.session.user
      let total = await userHelpers.getTotalAmout(req.session.user._id).then(async(total)=>{
        let product =await userHelpers.getCartProducts(req.session.user._id)
        cartCount =await userHelpers.getCartCount(req.session.user._id)
          res.render('viewCart',{user:true,User, product,total,cartCount}) 
      })
    
    }else{
      res.redirect('/login')
    }
    
}

module.exports.changeQuantitys = (req, res, next)=>{ 
    userHelpers.changeProductQuatity(req.body).then(async(response)=>{
    response.total = await userHelpers.getTotalAmout(req.session.user._id)
    res.json(response)  
  })
}

module.exports.deleteCartItems = (req, res, next)=>{
    userHelpers.removeCartItem(req.body).then((response)=>{
      res.json(response) 
    }) 
}

module.exports.addToCartProductsSide = (req, res)=>{
    if(req.session.user){
      userHelpers.addToCart(req.params.id, req.session.user._id)
      res.json({status:true})
    }else{
      res.redirect('/login')
    }
  
}

module.exports.wishlist = (req, res)=>{
    if(req.session.user){
      userHelpers.addWishlist(req.params.id, req.session.user._id).then((respons)=>{
        res.json({status:true})
      })
    }else{
      res.redirect('/wishlist')
    }
    
}

module.exports.wishlistPage = async(req, res)=>{ 
    if(req.session.user){
    
      let User = req.session.user
      let total =await userHelpers.getTotalAmoutWishlist(req.session.user._id).then(async(total)=>{
       let product =await  userHelpers.getWishlistProducts(req.session.user._id)
       console.log(product);
        res.render('wishlist',{user:true, total,product,User})
      })
    }else{
      res.redirect('/login')
    }
    
    
}

module.exports.deleteWishlistProducts = (req, res)=>{
    userHelpers.wishlistProductRemove(req.body).then((response)=>{
      res.json(response)
    })
}

module.exports.moveToCart = (req, res)=>{
    userHelpers.moveCart(req.params.id, req.session.user._id).then((response)=>{
    res.json({status:true})
  }) 
  }

 module.exports.addToCartSearchPagess = (req, res)=>{
    if(req.session.user){
      let User = req.session.user
      userHelpers.addToCart(req.params.id, req.session.user._id)
      res.json({status:true, User})
    }else{
      res.redirect('/login')
    }
}

module.exports.wishlistSearchPage = (req, res)=>{
    if(req.session.user){
      userHelpers.addWishlist(req.params.id, req.session.user._id).then((respons)=>{
        res.json({status:true})
      })
    }else{
      res.redirect('/wishlist')
    }
    
   }