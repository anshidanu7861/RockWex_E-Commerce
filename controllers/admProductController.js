const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require('../helpers/user-helpers');
const { upload } = require("../public/javascripts/fileUpload");
const walletHelpers = require('../helpers/wallet-helpers');

module.exports.addProduct = (req, res) => {
  productHelpers.getCategoryDetails().then((catDetails)=>{
    res.render("admin/add-product", { admin: true, catDetails});
  }) 
}

module.exports.addProductPost =  (req, res) => {
  try{
    let files = req.files;
    let fileName = files.map((file) => {
      return file.filename;
    });
    let product = req.body;
    product.img = fileName;
    productHelpers
      .addProduct(product)
      .then((id) => {
        res.redirect("/admin/addProducts");
      })
      .catch((err) => {
        res.send(err);
      });
  }
  catch (error) {
    res.render('/admin/adminErrors')
  }
    
}

module.exports.viewProduct = (req, res, next) => {
  try{
    productHelpers.getAllProductsAdmin().then((Product)=> {
      res.render("admin/view-product", { admin: true, Product });
    }) 
  }
  catch (error) {
    res.redirect('/admin/adminErrors')
  }
 
}

module.exports.Product = (req, res,)=>{
let User = req.session.user
   productHelpers.getProduct(req.params.id).then((products)=>{
    res.render('product',{user:true,User,products })
   })
   
 
 
}

module.exports.adminErrors = (req, res)=> {
  try {
    res.render('admin/adminError')
  }
  catch {
    res.redirect('admin/adminErrors')
  }
}

module.exports.deleteProduct = (req,res)=>{
  productHelpers.productDelete(req.params.id).then(()=>{
    res.json({ status:true })
  })
}
module.exports.editProductPost = (req, res)=>{
  let product
  productHelpers.editProducts(req.params.id).then((Product)=>{
    
    if(req.files!=0){
      const files = req.files
      const fileName = files.map((file)=>{
        return file.filename
      })
      product = req.body
      product.image = fileName
    }
    else{
       product = req.body
      product.image= Product.img
    }
    productHelpers.updateProduct(req.params.id,product).then(()=>{
      res.redirect('/admin/viewProduct')
    })
  })
}

module.exports.editProductsGet = async(req, res)=>{
  let productId = await productHelpers.getProDetailsEdit(req.params.id)
  productHelpers.getCategoryDetails().then((catDetails)=>{
    res.render('admin/editProducts', { admin:true, productId, catDetails})
  })
}

module.exports.viewCategorys = (req, res)=>{
  productHelpers.getCategoryDetails().then((catDetails)=>{
    res.render('admin/viewCategory',{admin:true, catDetails})
  })
}  

module.exports.deletCategory = (req, res)=>{
  productHelpers.deleteCategory(req.params.id).then(()=>{
    res.json({ status:true })
  })
}

module.exports.editCat = (req, res)=>{
  productHelpers.editCategory(req.params.id).then((categoryDetails)=>{
    console.log(categoryDetails);
    res.render('admin/editCategory',{admin:true, categoryDetails})

  })
}

module.exports.editCatPost = async(req, res)=>{
  let category
  productHelpers.editCategory(req.params.id).then((Category)=>{
    if(req.files!=0){
      const files = req.files
      const fileName = files.map((file)=>{
        return file.filename
      })
      category = req.body
      category.image = fileName
    }
    else{
      category = req.body
      category.image = Category.image
    }
    productHelpers.updateCategory(req.params.id,category).then(()=>{
      res.redirect('/admin/viewCategory')
    })
  })

 }

 module.exports.adminAddBanners = (req, res)=>{
  res.render('admin/add-banner',{admin:true})
}

module.exports.adminAddBannersPost = (req, res)=>{

  let files = req.files;
  let fileName = files.map((file) => {
    return file.filename;
  });
  let banner = req.body;
  banner.img = fileName;
  productHelpers.addBanner(banner).then((id) => {
      res.redirect('/admin/addBanner')
})

}

module.exports.adminViewAllBanners = (req, res)=>{
  productHelpers.getAllBanners().then((banners)=>{
    res.render('admin/view-banner',{admin:true, banners})
  })
}

module.exports.adminDeleteBanners = (req, res)=>{
  productHelpers.deleteBanner(req.params.id).then(()=>{
    res.json({status:true})
  
  })
  }

  module.exports.adminEditBanners = (req, res)=>{
    productHelpers.editBanner(req.params.id).then((bannersDetails)=>{
      res.render('admin/editBanner',{admin:true, bannersDetails})
  
    })
  }

  module.exports.adminEditBannerPost = (req, res)=>{
    let banner 
    productHelpers.editBanner(req.params.id).then((Banner)=>{
      if(req.files!=0){
        const files = req.files
        const fileName = files.map((file)=>{
          return file.filename
        })
        banner = req.body
        banner.img = fileName
      }
      else{
        banner = req.body
        banner.image = Banner.img
      }
      productHelpers.updateBanner(req.params.id,banner).then(()=>{
        res.redirect('/admin/viewBanner')
      })
    })
}

module.exports.adminViewSalesReport = async(req, res)=>{
  let Dailysales =await productHelpers.dailySailsReport()
  let MonthlySales = await productHelpers.monthlySailsReport()
  let YearlySale = await productHelpers.yearlySailsReport()

  let downloadDailyReport = await productHelpers.getDailysalesreportfordownload()
  let downloadMonthlyReport = await productHelpers.getMonthlysalesreportfordownload()
  let downloadYearlyReport = await productHelpers.getYearlysalesreportfordownload()
  res.render('admin/salesReport',{admin:true, Dailysales, MonthlySales, downloadDailyReport, downloadMonthlyReport, YearlySale, downloadYearlyReport})
}