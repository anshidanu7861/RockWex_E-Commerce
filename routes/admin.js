const express = require("express");
const productHelpers = require("../helpers/product-helpers");
const router = express.Router();
const helpers = require("../helpers/product-helpers");
const { upload, upload2, upload3 } = require("../public/javascripts/fileUpload");
let { addProduct,addProductPost,viewProduct, Product, adminErrors, deleteProduct, editProductPost, editProductsGet, viewCategorys, deletCategory, editCat, editCatPost, adminAddBanners, adminAddBannersPost, adminViewAllBanners, adminDeleteBanners, adminEditBanners, adminEditBannerPost, adminViewSalesReport } = require('../controllers/admProductController');
const { viewUser, } = require("../controllers/userController");
const { addCategory, addCategoryPost } = require("../controllers/categoryController");
const { adminLogin, adminLoginPost, adminLogoutPage,} = require("../controllers/log-sign-controller");
const userHelpers = require("../helpers/user-helpers");
const { response } = require("../app");
const walletHelpers = require("../helpers/wallet-helpers");
const { userBlock } = require("../helpers/user-helpers");
const { userBlockAdmin, userUnblockAdmin } = require("../controllers/adminUserController");
const { adminViewOrder, adminOrderList, changeOrderStatus, approveReturnStatus, approveReturnStatusPost } = require("../controllers/adminOrderController");
const { adminAddOffer, adminAddOfferPost, adminAddCoupons, adminAddCouponPost } = require("../controllers/offerController");



/*_______ADMIN DASHBOARD_____*/
router.get("/", adminLogin);

/*_________ADMIN LOGIN________*/
router.post("/adminlogin", adminLoginPost);

//________ADMIN LOGOUT___________
router.get('/adminLogout',adminLogoutPage)

/*_________ VIEW USER____________ */
router.get("/viewUsers", viewUser);

/*________ ADD PRODUCT _________*/
router.route("/addProducts")  .get(addProduct) .post(upload.array("image") ,addProductPost);

/*_________VIEW PRODUCT_________*/
router.get("/viewProduct",viewProduct);

/*_________ADD CATEGORY*__________*/
router.get('/addCategory', addCategory)

/*___________ADD CATEGORY POST____________ */
router.post('/addCategory', upload2.any('image') ,addCategoryPost)

 
/*__________ ADMIN ERROR_________*/
router.get('/adminErrors' ,adminErrors)

/*_______DELETE PRODUCTS_________*/
router.delete('/deleteproduct/:id', deleteProduct)

//_______________EDIT PRODUCTS GET METHOD_______________
router.get('/editProducts/:id',editProductsGet)

//__________EDIT PRODUCTS POST_______________________
router.post('/editProducts/:id',upload.array('image'),editProductPost)

//__________VIEW CATEGORY__________________
router.get('/viewCategory',viewCategorys)

//___________DELETE CATEGORY_________________
router.delete('/deleteCategory/:id',deletCategory)

//____________EDTI CATEGORY
router.get('/editCategory/:id',editCat)

//___________EDIT CATEGORY POST_________________
router.post('/editCategory/:id',upload2.any('image'),editCatPost)

//___________BLOCK USER_____________
router.get('/block/:id',userBlockAdmin)

//___________UNBLOCK USER____________
router.get('/unblock/:id',userUnblockAdmin)

//______________ADMIN VIEW ORDER_________
router.get('/viewOrder',adminViewOrder) 

//____________ORDER LIST________________
router.get('/orderList/:id',adminOrderList) 

//__________CHANGE ORDER STATUS___________
router.post('/changeStatus',changeOrderStatus)

//____________RETURN APPROVE STATUS_____________
router.get('/retunApprove',approveReturnStatus)

//___________APPROVE STATUS POST_________________
router.post('/approveStatus/:id',approveReturnStatusPost)

//__________ADMIN ADD BANNER_________
router.get('/addBanner',adminAddBanners)

//________ADMIN ADD BANNER POST_______________
router.post('/addBanner', upload3.array('image'),adminAddBannersPost)

//________ADMIN VIEW BANNERS_________
router.get('/viewBanner',adminViewAllBanners)

//___________DELETE BANNERS_______
router.delete('/deleteBanner/:id',adminDeleteBanners)

//__________EDIT BANNERS__________
router.get('/editBanner/:id',adminEditBanners)

//__________EDIT BANNER POST_______
router.post('/editBanner/:id',upload3.array('image'),adminEditBannerPost)

//_______ADD OFFER___________
router.get('/addOffers',adminAddOffer)

//__________ADD OFFER POST_______
router.post('/addOffer/:id',adminAddOfferPost)   
 
//________ADD COUPONS___________
router.get('/addCoupons',adminAddCoupons)

//_________ADD COUPONS POST________
router.post('/addCoupon',adminAddCouponPost)

//__________SALES REPORT_________
router.get('/salesReport',adminViewSalesReport)

module.exports = router; 
