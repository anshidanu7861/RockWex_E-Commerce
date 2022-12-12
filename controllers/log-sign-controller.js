const collections = require('../config/collection')
const db = require('../config/connection')
const productHelpers = require("../helpers/product-helpers");
const { upload } = require("../public/javascripts/fileUpload");
const userHelper = require('../helpers/user-helpers');
const { response } = require('express');
const session = require('express-session');
const { userAddress } = require('../helpers/user-helpers');
const walletHelpers = require('../helpers/wallet-helpers');
const userHelpers = require('../helpers/user-helpers');
const dotenv = require('dotenv').config();




const Admin = {
    email : 'admin@gmail.com',
    password : 12345
}


const verifyUser =(req, res, next)=>{
    if(req.session.loggedIn){
       next()
    }else{
      res.redirect('/login')
    }
} 



let otp;
let YOUR_ACCOUNT_SID = process.env.Twilio_SID
let YOUR_AUTH_TOKEN = process.env.Twilio_TOKEN 

const client = require("twilio")(
    YOUR_ACCOUNT_SID,
    YOUR_AUTH_TOKEN
  );


  module.exports.sendCodeOtp = (req, res) => {
    client.verify
    .services(process.env.Twilio_Servies_ID) // Change service ID
      .verifications.create({
        to: `+91${req.body.phonenumber}`,
        channel:  "sms",
      })
      .then(async(data) => {
      let otpUser= await userHelpers.otpVerifiction(req.body.phonenumber)
      if(otpUser.otpStatus){
        otp=req.body.phonenumber
        req.session.loggedIn = true
        req.session.user = otpUser.user
        res.redirect('/verifyotp')
      }else{
        req.session.msg = 'Invalid Number'
        res.redirect('otpLogin')
      }
      });
}


module.exports.verifyOTPpost = (req, res) => {
    client.verify
      .services(process.env.Twilio_Servies_ID) // Change service ID
      .verificationChecks.create({
        to: `+91${otp}`,
        code: req.body.otp,
      })
      .then((data) => {
        if (data.status === "approved") {
          res.redirect('/')
          
        } else {
          req.session.Msg = 'Invalid OTP'
         res.redirect('/verifyotp')
        }
      });
}

module.exports.getOtpPage = (req, res)=>{
    let User=req.session.user
    otpErr = req.session.msg
    res.render('otp-login',{otpErr})
    req.session.msg = ''
}

module.exports.getOtpVerify = (req,res)=>{
    otpError = req.session.Msg
    res.render('verifyotp',{otpError})
    req.session.Msg = ''
  }



module.exports.loginUser = (req, res, next)=> {
    if(req.session.loggedIn){
       res.redirect('/')
    }else{
        res.render('user-login', { loginError:req.session.logginErr })
        req.session.logginErr = false
    }
}

module.exports.signUser = (req, res, next)=> {
    res.render('user-signup',{error:req.session.userAlreadyExist})
    req.session.userAlreadyExist=''
}

module.exports.signUpUser = (req, res, next)=>{
    try{
        userHelper.doSignUp(req.body).then((response)=> {
            if(response.userAlreadyExist){
                req.session.userAlreadyExist = 'Email Already Exist'
                res.redirect('/sign')
            }else{
                res.redirect('/login')
            }
        })   
    }
    catch {
        res.redirect('/userError')
    }  
}

module.exports.loginUserHome = (req, res)=>{ 
    res.render('login')
}

module.exports.loginUserPost = (req, res)=>{
    try{   
        userHelper.doLogin(req.body).then((response)=> {
            if(response.status&&response.user.userStatus){
                req.session.loggedIn = true
                req.session.user = response.user
                res.redirect('/')
            }
            else{
                req.session.logginErr = true             
                res.redirect('/login')
            }
        })    
    }
    catch {
        res.redirect('/userError')
    }
}

module.exports.userLogout = (req, res)=> {
    try{
        req.session.destroy()
        res.redirect('/')
    }
    catch{
        res.redirect('/userError')
    }
}


/*_________________________________________ADMIN LOGIN______________________________________________________*/


module.exports.adminLogin = async(req, res, next) => {   
if(req.session.adminLogIn){
    let Dailysales =await productHelpers.dailySailsReport()
    let MonthlySales = await productHelpers.monthlySailsReport()
    let YearlySale = await productHelpers.yearlySailsReport()
    res.render("admin/admin-index",{ admin:true, Dailysales, MonthlySales, YearlySale}) 
}
else{
errMsg = req.session.Msg
res.render("admin/adminlogin",{errMsg})
req.session.Msg = "";

}}

module.exports.adminLoginPost = (req, res) => {
        if(Admin.email == req.body.email && Admin.password == req.body.password){
            req.session.adminLogIn = true;
            res.redirect("/admin");
        }
        else{
            req.session.Msg = "Invalid Username or password"
            res.redirect("/admin"); 
        }
}

module.exports.adminLogoutPage = (req, res)=>{
    req.session.adminLogIn=false
    res.redirect('/admin')
  }