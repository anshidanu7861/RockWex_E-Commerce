const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const hbs = require('express-handlebars')
const app = express();
const db = require('./config/connection');
const { err } = require('console');
const multer = require('multer')
const session = require('express-session')
const nocache = require("nocache");
let Handlebars = require('handlebars');
const { handlebars } = require('hbs');
const voucher_codes = require('voucher-code-generator');
const dotenv = require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname + '/views/layout',partialsDir:__dirname + '/views/partials'}))

app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'Key',cookie:{maxAge:6000000000}}))






Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

Handlebars.registerHelper("stockStatus", function(value, options){
  return value < 1  ? true: false
})

Handlebars.registerHelper("cancelOrder", function(value, options){
  return value === "cancel"  ? true: false
}) 

Handlebars.registerHelper("orderDispach", function(value, options){
  return value === "dispach"  ? true: false
}) 


Handlebars.registerHelper("orderShipped", function(value, options){
  return value === "shipped"  ? true: false
}) 

Handlebars.registerHelper("orderDelivered", function(value, options){
  return value === "delivered"  ? true: false
})

Handlebars.registerHelper("returnOrder", function(value, options){
  return value === "Return Request" ? true: false
})


Handlebars.registerHelper("paymentStatusWallet", function(value, options){
  return value === "credited" ? true: false
})

Handlebars.registerHelper("paymentStatusWalletDebit", function(value, options){
  return value === "debited" ? true: false
})

Handlebars.registerHelper("retunOrderRefund", function(value, options){
  return value === "Approved" ? true:false
})





db.connect(()=>{
  if(err){
    console.log("Error Connection"+err);
  }
  else{
    console.log("Connected to Port 27017");
  }
})

app.use("/", userRouter);
app.use("/admin", adminRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
