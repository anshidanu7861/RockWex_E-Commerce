const express = require('express');
const { response, render } = require('../app');
const { Product, } = require('../controllers/admProductController');
const { loginUser, signUser, signUpUser, loginUserHome, loginUserPost, userLogout, sendCodeOtp, verifyOTPpost, getOtpPage, getOtpVerify } = require('../controllers/log-sign-controller');
const { homePage, userError, categoryProducts, showAllProducts, searchProducts } = require('../controllers/userController');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const router = express.Router();
const paypal = require('paypal-rest-sdk');
const { userAddress } = require('../helpers/user-helpers');
const walletHelpers = require('../helpers/wallet-helpers');
const { AddToCart, viewAllCartProducts, changeQuantitys, deleteCartItems, addToCartProductsSide, wishlist, wishlistPage, deleteWishlistProducts, moveToCart, addToCartSearchPagess, wishlistSearchPage } = require('../controllers/cartWishlistController');
const { checkoutPage, checkoutPost, paypalPayment, PaymentCancel, verifyPayments, orderSuccess, userAddressPage, editAddressCheckPage, editAddressPostCheck } = require('../controllers/checkoutController');
const { addressPost, userDashBoardPage, addAddressPost, editAddressPostMethod, editAddressGetMt, viewOrderProfile, deleteAddressDash, cancelOrders, returnOrders, returnProducts, viewOrderProducts } = require('../controllers/dashBoardController');
const { getCoupons } = require('../controllers/offerController');



//______SEND OTP_____________
router.post("/sendcode", sendCodeOtp);
  
//_______VERIFY OTP_____________
router.post("/verify", verifyOTPpost);
  
//_________LOGIN OTP______________
router.get('/otpLogin',getOtpPage)

//________VERIFY OTP GET________
router.get('/verifyotp', getOtpVerify)


/* GET home page. */
router.get('/', homePage);

/* PRODUCT */
router.get('/product/:id',Product);  

/* LOGIN USER */
router.get('/login', loginUser)

/* SINGIN USER */
router.get('/sign', signUser)

/* SIGNUP USER */
router.post('/signup', signUpUser)

/* LOGIN USER HOME PAGE */
router.route('/login').get(loginUserHome).post(loginUserPost)

/* USER ERROR */ 
router.get('/userError',userError)

/* USER LOGOUT */ 
router.get('/logout', userLogout)

 //________CATEGORY PRODUCTS__________
router.get('/categoryPro/:name',categoryProducts)

 //________ADD TO CART____________ 
router.get('/addToCart/:id',AddToCart)

//__________VIEW CART PRODUCTS____________
router.get('/viewCartProducts',viewAllCartProducts)       
 
//__________CHANGE QUANTITY_______________
router.post('/changeProductQuatity',changeQuantitys) 

//_____________REMOVE CART ITEM_____________
router.delete('/removeCartItem',deleteCartItems)

//____________CHEKOUT PAGE_______  
router.get('/checkout',checkoutPage)
     
//___________CHECKOUT PAGE POST___________
router.post('/checkout',checkoutPost)         
  
//____________ORDER SUCCESS__________
router.get('/success/:orderId', paypalPayment)

//________CANCEL PAYMENT_________
router.get('/cancel', PaymentCancel);

//___________VERIFY PAYMENT____________
router.post('/verifyPayment', verifyPayments)  

//_______ADDRESS POST____________
router.post('/address',addressPost)  

//__________USER DASHBOARD_________
router.get('/userDashBoard', userDashBoardPage) 

//___________ADD ADDRESS POST_________
router.post('/addUserAddress',addAddressPost)
 
//_________EDIT ADDRESS POST_________
router.post('/eidtAddressProfileSide/:id',editAddressPostMethod)

//__________EDIT ADDRESS GET_________
router.get('/editAddressProfile/:id', editAddressGetMt)

//________VIEW ORDERS_________
router.get('/viewOrder', viewOrderProfile)

//___________ORDER SUCCESS____________ 
router.get('/OrderSuccess',orderSuccess)   

//__________USER ADDRESS PAGE___________
router.get('/addAddress',userAddressPage)

//___________USER EDIT ADDRESS CHECK PAGE___________
router.get('/editAddress/:id', editAddressCheckPage)

//________EDIT USER ADDRESS POST CHECK PAGE  
router.post('/editUserAddress/:id',editAddressPostCheck)

//__________DELETE ADDRESS DASH PAGE____________
router.get('/deleteAddress/:id',deleteAddressDash) 

//_____________SHOW PRODUCTS___________
router.get('/showProducts', showAllProducts)
 
//_________ADD TO CART PRODUCTS SIDE__________
router.get('/addToCartProducts/:id',addToCartProductsSide)
 
// ___________WISHLIST_______________
router.get('/viewWishlist/:id',wishlist)

//_________WISHLIST PAGE__________
router.get('/wishlist',wishlistPage)
  
//________DELETE WISHLIST_______
router.delete('/deleteWishlist',deleteWishlistProducts) 
 
//__________MOVE TO CART_____________
router.get('/moveToCart/:id',moveToCart)   

//___________CANCEL ORDER___________
router.post('/cancelOrder',cancelOrders) 
   
//_____________RETURN ORDER________
router.post('/returnOrder',returnOrders) 
 
//__________RETURN ORDER GET METHOD________
router.get('/returnProductPage/:id',returnProducts)

//_________GET COUPONS____________
router.get('/getCoupon/:id',getCoupons)

//__________VIEW ORDER PRODUCTS___________
router.get('/viewOrderPro/:id',viewOrderProducts)
 
//__________SEARCH____________
router.post('/search', searchProducts)

//____________CART SEARCH__________
router.get('/addToCartSearchPage/:id',addToCartSearchPagess)

//__________WISHLIST SEARCH
router.get('/addWishlistSearchPage/:id',wishlistSearchPage)

module.exports = router;  
     