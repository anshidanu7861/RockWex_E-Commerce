const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const { upload } = require("../public/javascripts/fileUpload");

module.exports.addCategory = (req, res)=> {
    res.render('admin/add-category', { admin: true })
  }

module.exports.addCategoryPost = (req, res, next)=> {
  const category = req.body
  category.image = req.files[0].filename
  productHelpers.addCategory(req.body)
  res.redirect('/admin/addCategory')
  }

