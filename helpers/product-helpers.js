// const { response } = require('../app')
const { response } = require('express');
const collections = require('../config/collection')
const db = require('../config/connection')



const objectId = require('mongodb').ObjectId
 
module.exports = {

    /*ADD ALL PRODUCT */
    addProduct:(product)=> {
        product.stock = parseInt(product.stock)
        product.price=parseInt(product.price)
        return new Promise (async(resolve, reject)=> {
            try{
                db.get()
                .collection(collections.PRODUCT_COLLECTION)
                .insertOne(product)
                .then((data)=> {         
                 
                    resolve(data.insertedId)                
                })
            } catch (error) {
                reject(error)
           }

        })
    },

    /* GET PRODUCTS */
    getAllProduct:()=> {
        return new Promise(async(resolve, reject)=> {
            try {
                let products = await
                db.get().
                collection(collections.PRODUCT_COLLECTION)
                .find().limit(8).toArray()
                resolve(products)
            }
            catch(error) {
                reject(error)
            }
        })
    },

    getProduct:(productId)=>{
        return new Promise(async(resolve, reject)=>{
         let getSameProduct = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(productId)})
            resolve(getSameProduct)
        })
        
    },


    showAllProduct:()=>{
        return new Promise(async(resolve, reject)=>{
          let showProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
                resolve(showProducts)
            
        })
    },


getAllProductsAdmin:()=>{
    return new Promise(async(resolve, reject)=>{
        let allProduct = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
        resolve(allProduct)
    })
},


    /*_______DELETE PRODUCT_____ */
    productDelete:(productId) =>{
        return new Promise ((resolve, reject)=>{
            try {

                db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)}).then(()=>{
                    resolve()
                })
            }
            catch (error){
                reject(error)
            }
        })

    },
    editProducts:(editId)=>{
        return new Promise((resolve, reject)=>{
            try{

                let product=db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(editId)}).then((product)=>{
                    resolve(product)
                })
            }
            catch (error){
                reject(error)
            }
        })
    },
    updateProduct:(proId, prodetails)=>{
        
        return new Promise((resolve, reject)=>{
            try{
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{
                    name:  prodetails.name,
                    price: parseInt (prodetails.price),
                    description: prodetails.description,
                    stock: parseInt( prodetails.stock),
                    color: prodetails.color,
                    category:prodetails.category,
                    img: prodetails.image
                }}).then(()=>{
                    resolve()
                })
                   
            }
            catch(error){
                reject(error)
            }
        })
    },

    getProDetailsEdit:(id)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                let Product = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(id)})
                resolve(Product);
            }
            catch (error){
                reject(error)
            }
        })
    },

    addCategory:(category)=> {
        return new Promise(async(resolve, reject)=> {
            try {
                db.get().collection(collections.CATEGORY_COLLECTION).insertOne(category)
            }
            catch {

            }
        })
    },

    getCategoryDetails:()=>{
        
        return new Promise(async(resolve, reject)=>{
            try {
               let catDetails =  db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
               resolve(catDetails)
            }
            catch {

            }
        })
    },

    deleteCategory:(categoryId)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({_id:objectId(categoryId)}).then(()=>{
                    resolve()
                })
            }
            catch(error){
                reject(error)
            }
        })
    },

    editCategory:(catId)=>{
        return new Promise(async(resolve, reject)=>{
           let category = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
                resolve(category)
            
        })
    },

    

    updateCategory:(catID, catDetails)=>{
        return new Promise(async(resolve, reject)=>{
           await db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(catID)},{
                $set:{
                    name:catDetails.name,
                    description:catDetails.description,
                    image:catDetails.image
                }
            }).then((data)=>{
                console.log(data);
                resolve()
            })
        })
    },




    getOrder:()=>{
        return new Promise(async(resolve, reject)=>{
           let orders=await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
                resolve(orders)
          
        })
    },

    

    addBanner:(banners)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.BANNER_COLLECTION).insertOne(banners).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },

    getAllBanners:()=>{
        return new Promise(async(resolve, reject)=>{
          let banners = await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
            resolve(banners)
        
        })
    },


    deleteBanner:(bannerDetails)=> {
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.BANNER_COLLECTION).deleteOne({_id:objectId(bannerDetails)}).then(()=>{
                resolve()
            })
        })
    },


    editBanner:(ID)=>{
        return new Promise(async(resolve, reject)=>{
           let banners = await db.get().collection(collections.BANNER_COLLECTION).findOne({_id:objectId(ID)})
                resolve(banners)
            
        })
    },

    updateBanner:(ID, BannerDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.BANNER_COLLECTION).updateOne({_id:objectId(ID)},{
                $set:{
                    name:BannerDetails.name,
                    description:BannerDetails.description,
                    img:BannerDetails.image
                }
            }).then(()=>{
                resolve()
            })
        })
    },


    addOffer:(changeOffer, proId)=>{
        return new Promise(async(resolve, reject)=>{
            let convert = parseInt(changeOffer.offers)
            let products =await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})

            let oldPrice = products.price
            let offers = products.price-(products.price*convert/100)
            offers = Math.round(offers)
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                     price:offers,
                     oldPrice:products.price
                }
            }).then((data)=>{
                resolve(data)
            })
        })

    }, 

  

    insertCoupon:(coupons)=>{
        coupons.couponOffer = parseInt(coupons.couponOffer)
        coupons.users = []
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.COUPON_COLLECTION).insertOne(coupons).then(()=>{
                resolve()
            })
        })
    },

    
    
    orderProducts:(id)=>{
        return new Promise(async(resolve, reject)=>{
          let = orderItems = await  db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(id)}
                },
                {
                    $unwind:'$products',
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                        trackOrder:'$products.trackOrder',
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product',
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        trackOrder:1,
                        product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
              resolve(orderItems)
        })
    },


  //  ________________________________SALES REPORT________________________________


    dailySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$date',
                            dailySaleAmount: { $sum: '$totalAmount' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            dailySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((dailysales) => {
                    let totalAmount = 0
                    dailysales.forEach(element => {
                        totalAmount += element.dailySaleAmount
                    });
                    dailysales.totalAmount = totalAmount
                    resolve(dailysales)
                })
        })
    },

    monthlySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$month',
                            monthlySaleAmount: { $sum: '$totalAmount' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            monthlySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((monthlysales) => {
                    let totalAmount = 0
                    monthlysales.forEach(element => {
                        totalAmount += element.monthlySaleAmount
                    });
                    monthlysales.totalAmount = totalAmount
                    resolve(monthlysales)
                })
        })
    },


    yearlySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$year',
                            yearlySaleAmount: { $sum: '$totalAmount' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            yearlySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((yearlysales) => {
                    let totalAmount = 0
                    yearlysales.forEach(element => {
                        totalAmount += element.yearlySaleAmount
                    });
                    yearlysales.totalAmount = totalAmount
                    resolve(yearlysales)
                })
        })
    },

    getDailysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).aggregate([


                {
                    $group:
                    {
                        _id: "$date",
                        DailySaleAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }


                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getDailysalesreportfordownload) => {

                console.log(getDailysalesreportfordownload)

                resolve(getDailysalesreportfordownload)
            })
        })
    },

    getMonthlysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).aggregate([


                {
                    $group:
                    {
                        _id: "$month",
                        MonthlySaleAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }


                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getMonthlysalesreportfordownload) => {

                console.log(getMonthlysalesreportfordownload)

                resolve(getMonthlysalesreportfordownload)
            })
        })
    },

    getYearlysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).aggregate([


                {
                    $group:
                    {
                        _id: "$year",
                        YearlySaleAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }


                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getYearlysalesreportfordownload) => {

                console.log(getYearlysalesreportfordownload)

                resolve(getYearlysalesreportfordownload)
            })
        })
    },dailySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$date',
                            dailySaleAmount: { $sum: '$totalAmount' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            dailySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((dailysales) => {
                    let totalAmount = 0
                    dailysales.forEach(element => {
                        totalAmount += element.dailySaleAmount
                    });
                    dailysales.totalAmount = totalAmount
                    resolve(dailysales)
                })
        })
    },

    monthlySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$date',
                            monthlySaleAmount: { $sum: '$totalAmount' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            monthlySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((monthlysales) => {
                    let totalAmount = 0
                    monthlysales.forEach(element => {
                        totalAmount += element.monthlySaleAmount
                    });
                    monthlysales.totalAmount = totalAmount
                    resolve(monthlysales)
                })
        })
    },

    yearlySailsReport: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: {
                            Status: { $ne: 'pending' },
                            trackorder: { $ne: 'canclled' }
                        }
                    },
                    {
                        $group: {
                            _id: '$date',
                            yearlySaleAmount: { $sum: '$totalAmount' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            yearlySaleAmount: 1,
                            count: 1,
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    }
                ]).toArray().then((yearlysales) => {
                    let totalAmount = 0
                    yearlysales.forEach(element => {
                        totalAmount += element.yearlySaleAmount
                    });
                    yearlysales.totalAmount = totalAmount
                    resolve(yearlysales)
                })
        })
    },

    getDailysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).aggregate([

                {
                    $group:
                    {
                        _id: "$date",
                        DailySaleAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }
            ]).toArray().then((getDailysalesreportfordownload) => {
                resolve(getDailysalesreportfordownload)
            })
        })
    },


    getMonthlysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $group:
                    {
                        _id: "$month",
                        MonthlySaleAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }

                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getMonthlysalesreportfordownload) => {
                resolve(getMonthlysalesreportfordownload)
            })
        })
    },

    getYearlysalesreportfordownload: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).aggregate([


                {
                    $group:
                    {
                        _id: "$year",
                        YearlySaleAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }


                    }
                },
                {
                    $sort: {
                        '_id': -1
                    }
                }, {
                    $limit: 30
                }


            ]).toArray().then((getYearlysalesreportfordownload) => {
                resolve(getYearlysalesreportfordownload)
            })
        })
    },

    getReturnProductAdmin:()=>{
        return new Promise(async(resolve, reject)=>{
           let data = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    'products.trackOrder':"Return Request"
                }
            },
            {
                $unwind: '$products'
            },
            {
                $match:{
                    'products.trackOrder':"Return Request"
                }
            },
            {
                $lookup:{
                    from:collections.PRODUCT_COLLECTION,
                    localField:'products.item',
                    foreignField:'_id',
                    as:'productDetails'
                }
            },
            {
                $unwind:'$productDetails'
            }
            ]).toArray()
            resolve(data)
        })   
    }

} 