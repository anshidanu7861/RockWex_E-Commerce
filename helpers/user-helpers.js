const collections = require('../config/collection')
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { ObjectID } = require('bson')
const collection = require('../config/collection')
const { response } = require('../app')
const Razorpay = require('razorpay')
const { resolve } = require('path')
const paypal = require('paypal-rest-sdk');
const voucher_codes = require('voucher-code-generator');
const walletHelpers = require('./wallet-helpers')
const { log } = require('console')
const dotenv = require('dotenv').config();

let instance = new Razorpay({
    key_id: process.env.RazorPay_Key_ID ,
    key_secret: process.env.RazorPay_Secret_Key,
});




paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PayPal_Cliet_ID ,
  'client_secret': process.env.PayPal_Secret_ID
});



module.exports= {

    doSignUp:(userData)=> {
        return new Promise (async(resolve, reject)=> {
            
            
                let response = {}
                let findUser= await db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email})

                if(findUser) {
                    let signErr={userAlreadyExist:true}
                    resolve({ userAlreadyExist:true })
                }else{

                        if(userData.refferalCode){
                            refferals =await db.get().collection(collections.USER_COLLECTION).findOne({refferal:userData.refferalCode})
                           
                            if(refferals){
                                let amt=parseInt(100)
                                walletHelpers.refferalAmount(refferals,amt)  
                              

                              userData.userStatus = true
                              let userRefferal = voucher_codes.generate({
                                    prefix: "RockWex-",
                                    postfix: "-2022"
                                });
                                    userData.refferal = userRefferal[0]
                                    userData.password = await bcrypt.hash(userData.password,10)
                                    db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data)=>{  
                                    walletHelpers.userWallet(data.insertedId)
                                    walletHelpers.addWalletAmount(data.insertedId)
                                    resolve({userAlreadyExist:false})
                                })


                            }
                            else{

                                response.message = "Invalid Refferal",
                                resolve(response)
                            }
                        }
                        else{
                             
                    userRefferal = voucher_codes.generate({
                    prefix: "RockWex-",
                      postfix: "-2015"
                    });

                       userData.userStatus = true
                      userData.refferal = userRefferal[0]
                     userData.password = await bcrypt.hash(userData.password,10)
                     db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data)=>{  
                     walletHelpers.userWallet(data.insertedId)
                       resolve({userAlreadyExist:false})
                        })

                    }
                }
    
        })
    },


    userBlock:(userBlockId)=>{
        return new Promise (async(resolve, reject)=>{        
            try {
                db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectID(userBlockId)},{$set:{
                    userStatus:false
                }}).then(()=>{
                 
                    resolve( )
                })
            }
            catch{
            }
        })
    },

    userUnblock:(userUnblockId)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectID(userUnblockId)},{$set:{
                    userStatus:true
                }}).then(()=>{
                    resolve()
                })
            }
            catch{

            }
        })
    },


    doLogin:(userData)=> {
        return new Promise(async(resolve, reject)=> {
            try{
                let loginStatus = false
                let respones = {}
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email})
                if(user) {
                    bcrypt.compare(userData.password, user.password).then((status)=> {
                        if(status){
                            respones.user = user
                            respones.status = true
                            resolve(respones)
                        }else{
                            resolve({ status:false })
                        }
                    })
                }else{
                    resolve({ status:false})
                }
            }
            catch (error) {
                reject(error)
            }
        })
    },


       otpVerifiction:(numberDetils)=>{
        console.log(numberDetils);
            return new Promise(async(resolve, reject)=>{
                try {
                    let respones = {}
                    db.get().collection(collections.USER_COLLECTION).findOne({number:numberDetils}).then((user)=>{
                        if(user){
                            respones.user = user
                            respones.otpStatus=true
                            resolve(respones)
                        }else{
                            respones.otpStatus=false
                            resolve(respones)
                        }
                    })
           
                }
                catch (error){
                    reject(error)
                }
            })
    },


    viewUserDetails:()=> {
        return new Promise(async(resolve, reject)=>{
            try{
                let UserDetails =await db.get().collection(collections.USER_COLLECTION).find().toArray()
                resolve(UserDetails)
            }
            catch{

            }
        })
    },


    showCategory:(catName)=>{
        return new Promise(async(resolve, reject)=>{
            try{
                let showCat = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({category:catName})
                .toArray()
                resolve(showCat)   
            }
            catch (error){
                reject(error)
            }
        })
    },


  


    addToCart:(ProId,userId)=>{ 
        return new Promise(async(resolve, reject)=>{

          let findProduct = await  db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectID(ProId)})

            let productObj = {
                item:ObjectID(ProId),
                quantity:1,
                price:findProduct.price,
                
            }
            try{
                let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectID(userId)})
                if(userCart){
                    let proExist = userCart.product.findIndex(product=> product.item==ProId)
                    if(proExist!=-1){
                        db.get().collection(collections.CART_COLLECTION).updateOne({user:ObjectID(userId),'product.item':ObjectID(ProId)},
                        {
                            $inc:{'product.$.quantity':1}
                        }).then(()=>{
                            resolve()
                        })
                    }else{

                    db.get().collection(collections.CART_COLLECTION).updateOne({user:ObjectID(userId)},{
                        $push:{product:productObj}
                    }).then((respones)=>{
                        resolve()
                    })
                }
                }else{
                    let cartObj ={
                        user:ObjectID(userId),
                        product:[productObj]
                    }
                    db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((respons)=>{
                        resolve(respons)
                    })
                }
            }
            catch{
            }
        })
    },

    getCartProducts:(userId)=>{ 
        return new Promise(async(resolve, reject)=>{
            try{
                let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match:{user:ObjectID(userId)}
                    },
                    {
                        $unwind:'$product'
                    },
                    {
                        $project:{
                            item:'$product.item',
                            quantity:'$product.quantity',
                        }
                    }, 
                    { 
                        $lookup:{
                            from:collections.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $project:{
                            item:1,
                            quantity:1,
                            products:{$arrayElemAt:['$products',0]}
                        }
                    }  
                 ]).toArray()
                    resolve(cartItems)  
                }
            catch(error){
             reject(error)
            } 
        }) 
    },

    getCartCount:(userId)=>{
        return new Promise(async(resolve, reject)=>{
            let count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectID(userId)})
            if(cart){
                count=cart.product.length
            }
            resolve(count)
        })
      
    }, 

    changeProductQuatity:(cartDetails,userID)=>{
        cartDetails.count = parseInt(cartDetails.count)
        cartDetails.quantity = parseInt(cartDetails.quantity)
        return new Promise(async(resolve, reject)=>{
            try{
                if(cartDetails.count ==-1 && cartDetails.quantity==1){
                    db.get().collection(collections.CART_COLLECTION).updateOne({_id:ObjectID(cartDetails.cart)},
                    {
                        $pull:{product:{item:ObjectID(cartDetails.product)}}
                    }).then((response)=>{
                         
                        resolve({removeProduct:true})
                    })
                }else{
                    db.get().collection(collections.CART_COLLECTION).updateOne({_id:ObjectID(cartDetails.cart),'product.item':ObjectID(cartDetails.product)},
                    {
                        $inc:{'product.$.quantity':cartDetails.count}
                    }).then((response)=>{
                        resolve(response) 
                    })  
                } 
            }
            catch(error) {
                reject(error)
             
            }
        })
    }, 

    removeCartItem:(removeDetails)=>{
        return new Promise(async(resolve, reject)=>{
            let removeCartItems = await db.get().collection(collections.CART_COLLECTION).updateOne({_id:ObjectID(removeDetails.cart)},
            {
                $pull:{product:{item:ObjectID(removeDetails.product)}}
            }).then((response)=>{
                resolve({removeProduct:true}) 
            })
        })
    },

    getTotalAmout:(userId)=>{ 
        return new Promise(async(resolve, reject)=>{
            total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match:{user:ObjectID(userId)}
                }, 
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$products',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}} 
                    }
                }
            ]).toArray()
            if(total[0]){
                resolve(total[0].total)
            }else{
                resolve(total)
            }
          
        })
    },



    newTotal:(userId, Total)=>{

        return new Promise((resolve, reject)=>{
            if(Total.newTotal){
                db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectID(userId)},{$set:{
                    
                totalAmount:parseInt(Total.newTotal) 

                }}).then((data)=>{
                    resolve(data)
                })
            }
        })
        
    },


    pushUser:(coupon, userId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.COUPON_COLLECTION).updateOne({couponName:coupon.couponName},
            {$push:{
                users:ObjectID(userId)
            }}).then((data)=>{
                resolve(data)
            })
        })
    },
 


    placeOrder:(order,products,total,user)=>{     
        
         let date = new Date()
        return new Promise(async(resolve, reject)=>{

        

           let address =await db.get().collection(collections.ADDRESS_COLLECTION).findOne({_id:ObjectID(order.deliveryDetails)}) 
           let status = order.paymentMethod === 'COD'?'placed':'pending'
           let orderObj={
            deliveryDetails:{
               
                name:address.Fname,
                address:address.address,
                pincode:address.pincode,
                phonenumber:address.phonenumber,
                
            }, 
            userId:ObjectID(user),
            paymentMethod:order.paymentMethod,
            products:products,
            totalAmount:total,
            trackOrder:status,
            date:date.getDate()+'/'+(date. getMonth()+1)+'/'+date.getFullYear(),
            time:date.getHours()+':'+(date. getMinutes()+1)+':'+date.getSeconds()
           } 

           products.forEach(element => {
            element.trackOrder = 'placed'
           })

           products.forEach(element =>{
            element.couponName = order.couponName
           })   


           products.forEach(element =>{
            element.couponPercentage = order.couponPercentage
           })

           if(order.couponPercentage){
            let off = (40* parseInt( order.couponPercentage))/100
            products.forEach(element => {
                 element.offerPrice =Math.round(parseInt( element.price)-parseInt(element.price)*off/100)
                 });
           }

           db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            products.forEach(element => {
            let stock = parseInt( -element.quantity )

            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectID(element.item)},{$inc:{stock:stock}})
            });

            db.get().collection(collections.CART_COLLECTION).deleteOne({user:ObjectID(user)})
            resolve(response.insertedId) 
           }) 
        })  
    },



    getCartProductList:(userId)=>{ 
        return new Promise(async(resolve, reject)=>{
            let cart =await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectID(userId)})
              resolve(cart.product) 
        }) 
    },

  

    addUserAddressToDashBoard:(addressData)=>{
        console.log(addressData);
        return new Promise((resolve, reject)=>{
            addressData.userId = ObjectID(addressData.userId)
            db.get().collection(collections.ADDRESS_COLLECTION).insertOne(addressData).then(()=>{
                resolve()
            })
        })
    },      


    userAddress:(userAddress)=>{
        return new Promise(async(resolve, reject)=>{
            userAddress.userId=ObjectID(userAddress.userId)
            db.get().collection(collections.ADDRESS_COLLECTION).insertOne(userAddress).then((data)=>{
                resolve(data)
            })
        })
    },

    getAddress:(userDetails)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collections.ADDRESS_COLLECTION).find({userId:ObjectID(userDetails)}).toArray().then((response)=>{
                resolve(response)
            })
        }) 
    }, 

  getOrderDetails:(UserId)=>{
    console.log(UserId);
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ORDER_COLLECTION).find({userId:ObjectID(UserId)}).sort({time:-1}).toArray().then((response)=>{
            resolve(response)
        })
    })
  },

  findUserAddress:(userId)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ADDRESS_COLLECTION).findOne({userId:ObjectID(userId)}).then((data)=>{
            resolve(data)
        })
    })
  },


  getOrderTotal:(userID)=>{
    return new Promise(async(resolve, reject)=>{
       let data = await db.get().collection(collections.ORDER_COLLECTION).findOne({userId:ObjectID(userID)})
            resolve(data)
        
    })
  },




  getUserAddress:(userAddressId)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ADDRESS_COLLECTION).findOne({_id:ObjectID(userAddressId)}).then((response)=>{
            resolve(response)
        })
       
    })
  },
  
  updateUserAddress:(userId,addressDetails)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ADDRESS_COLLECTION).updateOne({_id:ObjectID(userId)},{$set:{
            Fname:addressDetails.Fname,
            Lname:addressDetails.Lname,
            company:addressDetails.company,
            country:addressDetails.country,
            address:addressDetails.address,
            apartment:addressDetails.apartment,
            location:addressDetails.location,
            state:addressDetails.state,
            pincode:addressDetails.pincode,
            phonenumber:addressDetails.phonenumber,
            email:addressDetails.email,
            userId:addressDetails.userId
            
        }}).then((userDetails)=>{
            resolve(userDetails)
        })
    })
  },


  // Address Edit Profile Side


  showUserAddresses:(ID)=>{
     return new Promise((resolve, reject)=>{
        db.get(). collection(collections.ADDRESS_COLLECTION).findOne({_id:ObjectID(ID)}).then((respons)=>{
            resolve(respons)
        })
     })
  },


  editAddressProfileSide:(userId,addressDetails)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ADDRESS_COLLECTION).updateOne({_id:ObjectID(userId)},{$set:{
            Fname:addressDetails.Fname,
            Lname:addressDetails.Lname,
            company:addressDetails.company,
            country:addressDetails.country,
            address:addressDetails.address,
            apartment:addressDetails.apartment,
            location:addressDetails.location,
            state:addressDetails.state,
            pincode:addressDetails.pincode,
            phonenumber:addressDetails.phonenumber,
            email:addressDetails.email,
            userId:addressDetails.userId
            
        }}).then((userDetails)=>{
            resolve(userDetails)
        })
    })
  },




  deleteAddress:(userId,address)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ADDRESS_COLLECTION).deleteOne({_id:ObjectID(userId)}).then(()=>{
            resolve()
        })
    })
  },


  generateRazopay:(orderId, total)=>{
    return new Promise((resolve, reject)=>{
        instance.orders.create({
            amount: total*100,
            currency: "INR",
            receipt:""+orderId,
            notes: {
              key1: "value3",
              key2: "value2"
            }
          },function(err, order){
            if(err){
                console.log(err);
            }else{
                resolve(order)
            }
          }
        ) 
    })
  },

  
  verifyPayment:(details)=>{
    return new Promise((resolve, reject)=>{
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256',process.env.RazorPay_Secret_Key)
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
        hmac=hmac.digest('hex')

        if(hmac==details['payment[razorpay_signature]']){
         resolve()   
        }else{
            reject()
        }
    })
  },

  changePaymentStatus:(orderId)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectID(orderId)},
        {
            $set:{
                trackOrder:orderId.trackOrder='placed', 
            }
        }
        ).then(()=>{
            resolve(response)
        })
    })
  },
  

generatePaypal:(orderId, total)=>{
return new Promise((resolve, reject)=>{
    const create_payment_json = {
        "intent": "sale", 
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success/"+orderId,
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            // "item_list": {
            //     "items": [{
            //         "name": "Redhock Bar Soap",
            //         "sku": "001",
            //         "price": "25.00",
            //         "currency": "USD",
            //         "quantity": 1
            //     }]
            // },
            "amount": {
                "currency": "USD",
                "total": total
            },
            "description": "Trending T-shirts"
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
              if(payment.links[i].rel === 'approval_url'){
              let link = payment.links[i].href
              resolve(link)
              }
            }
        }
      });
})
},


walletMoney:(totalAmount, user)=>{
    let DateAndTime = new Date()
    return new Promise(async(resolve, reject)=>{
     
        let money = await db.get().collection(collections.WALLET_COLLECTION).findOne({userID:ObjectID(user)})
         let walletBalance = money.balance
         refferalData = { 
            amount: totalAmount,
            date:DateAndTime.getDate()+'/'+(DateAndTime. getMonth()+1)+'/'+DateAndTime.getFullYear(),
            time:DateAndTime.getHours()+':'+(DateAndTime. getMinutes()+1)+':'+DateAndTime.getSeconds(),
            status: "Debited",
            message: "Purchase Amount",
          }; 
            let checkUpdate = await db.get().collection(collections.WALLET_COLLECTION).updateOne({userID:ObjectID(user)},{
                $inc:{
                  balance:-totalAmount
                },
                $push:{
                  Transactions: refferalData,
                }
              })
              resolve(checkUpdate)
        })
    },



  addWishlist:(proId,userId)=>{
    return new Promise(async(resolve, reject)=>{
        let productObj = {
            item:ObjectID(proId),
        }
        let userWishlist =await db.get().collection(collections.WISHLIST_COLLECTION).findOne({user:ObjectID(userId)})
        if(userWishlist){
            let proExist = userWishlist.product.findIndex(product=> product.item==proId) 
            if(proExist!=-1){
               resolve()
            }else{
                db.get().collection(collections.WISHLIST_COLLECTION).updateOne({user:ObjectID(userId)},{
                    $push:{product:productObj}
                }).then((respons)=>{
                    resolve()
                })
            }
        }else{
            let wishlistObj ={
                user:ObjectID(userId),
                product:[productObj]
            }
            db.get().collection(collections.WISHLIST_COLLECTION).insertOne(wishlistObj).then((respons)=>{
                resolve(respons)

            })
        }
    })
  },

  getTotalAmoutWishlist:(userId)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            total = await  db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                {
                    $match:({user:ObjectID(userId)})
                },
                {
                    $unwind:'$product',
                },
                {
                    $project:{
                        item:'$product.item',
                     
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'wishlists',
                    }
                },
                {
                    $project:{
                        item:1,
                        
                        product:{$arrayElemAt:['$wishlists',0]}
                    }
                },
            
            ]).toArray()
            if(total[0]){
                resolve(total[0].total)
            }else{
                resolve(total)
            }
        }catch (error){
            console.log(error);
        }
     
    })
  },

getWishlistProducts:(userId)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            let wishlistItems = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                {
                    $match:({user:ObjectID(userId)})
                },
                {
                    $unwind:'$product',
                },
                {
                    $project:{
                        item:'$product.item',
                    
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'wishlists',
                    }
                },
                {
                    $project:{
                        item:1,
                        wishlists:{$arrayElemAt:['$wishlists',0]}
                    }
                }
            ]).toArray()
            resolve(wishlistItems)
        }catch(error){
            console.log(error);
        }
       
    })
},

wishlistProductRemove:(removeDetails)=>{
    return new Promise(async(resolve, reject)=>{
       let removeItems = await db.get().collection(collections.WISHLIST_COLLECTION).updateOne({_id:ObjectID(removeDetails.wishlist)},
        {
            $pull:{product:{item:ObjectID(removeDetails.product)}}
        }).then((response)=>{
            resolve({removeProduct:true})
        })
        
    })


},


moveCart:(ProId,userId)=>{ 
    console.log(ProId);
    return new Promise(async(resolve, reject)=>{
        let productObj = {
            item:ObjectID(ProId),
            quantity:1
        }
        try{
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectID(userId)})
            if(userCart){
                let proExist = userCart.product.findIndex(product=> product.item==ProId)
                if(proExist!=-1){
                    db.get().collection(collections.CART_COLLECTION).updateOne({user:ObjectID(userId),'product.item':ObjectID(ProId)},
                    {
                        $inc:{'product.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{

                db.get().collection(collections.CART_COLLECTION).updateOne({user:ObjectID(userId)},{
                    $push:{product:productObj}
                }).then((respones)=>{
                    resolve()
                })
            }
            }else{
                let cartObj ={
                    user:ObjectID(userId),
                    product:[productObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((respons)=>{ 
                    resolve(respons)
                })
            }
        }
        catch{
        }
    })
},



changeStatus:(details)=>{

    let OrderId = details.orderId
    let ProId = details.proId
    let statusq = details.status
    return new Promise((resolve, reject)=>{
     db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectID(OrderId),'products.item':ObjectID(ProId)},
        {
            $set:{
               'products.$.trackOrder':statusq
            }
        }).then((data)=>{
            resolve(data)
        })
    })
},


productOrders:(id)=>{
    return new Promise(async(resolve, reject)=>{
      let  viewOrderItems = await  db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
                $match:{_id:ObjectID(id)}
            },
            {
                $unwind:'$products',
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                    trackOrder:'$products.trackOrder',
                    offerPrice:'$products.offerPrice',
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
                    offerPrice:1,
                    product:{$arrayElemAt:['$product',0]}
                }
            }
        ]).toArray()
          resolve(viewOrderItems)
    })
},
cancelOrderUser:(details)=>{
    let OrderId = details.orderId
    let ProId = details.proId
    let statusq = 'cancel'
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectID(OrderId),'products.item':ObjectID(ProId)},{
            $set:{
                'products.$.trackOrder':statusq
             },
        }).then((data)=>{
            resolve(data)
        })
    })
},

 returnOrderRequest:(details)=>{
    let description = details.description
    let reasons = details.reason
    let OrderId = details.orderId 
    let ProId = details.proId
    let statusq = 'Return Request'
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectID(OrderId),'products.item':ObjectID(ProId)},{
            $set:{
                'products.$.trackOrder':statusq,
                'products.$.reasonReturn':reasons,
                'products.$.description':description,
            }
        }).then((data)=>{
            resolve(data)
        })
    })
 },

 getReturnProducts:(orderID, user)=>{
    return new Promise(async(resolve, reject)=>{
       let showReturnPro =await  db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
                $match:{_id:ObjectID(orderID)}
            },
            {
                $unwind:'$products',
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                    price:'$products.price',
                    trackOrder:'$products.trackOrder',
                    offerPrice:'$products.offerPrice',
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
                    price:1,
                    trackOrder:1,
                    offerPrice:1,
                    product:{$arrayElemAt:['$product',0]}
                }
            }
        ]).toArray()
        console.log(showReturnPro);
        resolve(showReturnPro)
    })
 },

 approveReturn:(orderId)=>{
    let statusq = 'Approved'
    return new Promise(async(resolve, reject)=>{
        let getOrder =await db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:ObjectID(orderId),'products.trackOrder':'Return Request'},
        {
            $set:{
                'products.$.trackOrder':statusq
            }
        }).then((data)=>{
            console.log(data);
            resolve(data)
        })

    
    })

 },


 getCoupon:(couponId)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.COUPON_COLLECTION).findOne({_id:ObjectID(couponId)}).then((data)=>{
            resolve(data)
        })
    })
},


checkCoupon:(userId)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.COUPON_COLLECTION).find({users:{$nin:[ObjectID(userId)]}}).toArray().then((data)=>{
            resolve(data)
        })
    })
},


searchProducts:(searchedName)=>{
    let value = searchedName.search;
    return new Promise(async(resolve, reject)=>{
       let getProductDetails  =await  db.get().collection(collections.PRODUCT_COLLECTION).find({name:{$regex:value,$options:'i'}}).toArray()
        resolve(getProductDetails)
    }) 
},

getRefferal:(user)=>{
    return new Promise((resolve, reject)=>{
        db.get().collection(collections.USER_COLLECTION).findOne({_id:ObjectID(user)}).then((data)=>{
            resolve(data)
        })
    })
}






} 