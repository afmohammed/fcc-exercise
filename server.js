/*const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
*/
'use strict';

var express = require('express'),
    cors = require('cors'),
    router = express.Router(),
    app = express(),
    port = process.env.PORT || 3000,
    timeout = 10000;


var enableCORS = function(req, res, next) {
  if (!process.env.DISABLE_XORIGIN) {
    var allowedOrigins = ['https://marsh-glazer.gomix.me','https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin;
    if(!process.env.XORIGIN_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      console.log(req.method);
      res.set({
        "Access-Control-Allow-Origin" : origin,
        "Access-Control-Allow-Methods" : "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"
      });
    }
  }
  next();
};

const bodyParser = require('body-parser')
app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

/*Common JS Functions -- can be put into it's own Javascript*/
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

var User = require('./mySql.js').UserModel;

var newUser = require('./mySql.js').createUser;
app.post("/api/exercise/new-user", function(req, res, next) {
  //console.log("here");
  var userName = req.body.username;  
  //console.log("username" + userName);
  var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  newUser(userName,function(err, data) {
    clearTimeout(t);
    if(err){
      res.send(err);
    }else if(data == 'username exists'){
      res.send({"error": "Username already exists"});
    }else{
       /*User.findById(data._id, function(err, findData) {
         if(err) { return (next(err)); }
         res.json("data" + findData);
         //newUrl.remove();
       }); */
      res.send(data);
    }
    /*    
    if(err) { return (next(err)); }
    if(!data) {
      console.log('Missing `done()` argument');
      return next({message: 'Missing callback argument'});
    }
     newUser.findById(data._id, function(err, newUserData) {
       if(err) { return (next(err)); }
       res.json(newUserData);
       //newUrl.remove();
     });*/
  });
  //res.json({"name": firstName + ' '+ lastName});
});

var findAll = require('./mySql.js').findAll;
app.get('/api/exercise/users/', function(req, res, next) {
  console.log("find all");
  findAll(function(err, data) {
    res.json(data);
  });
});

var newUserLog = require('./mySql.js').createLog;
app.post("/api/exercise/add", function(req, res, next) {
  //console.log("here");
  //GetValid Date
  var newDate = new Date();  
  var logDate = formattedDate(newDate);
  console.log("entered Date " + req.body.date);
  if(req.body.date != ''){
    console.log("isValid Date");
    logDate = req.body.date;
  }
  var userID = req.body.userId;  
  var logData = {
    description: req.body.description,
    duration: req.body.duration,
    date: logDate
};
  var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  newUserLog(userID,logData,function(err, data) {
    clearTimeout(t);
    if(err){
      res.send(err);
    }else if(data == 'Record Not Found'){
      res.send({"error": "Record Not Found"});
    }else{
      console.log("new log" + data);       
      res.send(data);
    }    
  });  
});

function formattedDate (dt){
  const mm = dt.getMonth()+1;
  const dd = dt.getDate();
  //var strmm = '5';
  //var strdd = "" + dd + "";
  //console.log(strmm);
  //return dt.getFullYear() + "/" + mm.toString().padStart(2, '0') + "/" + dd.toString().padStart(2, '0');
  return dt.getFullYear() + "/" + String("00" + mm).slice(-2) + "/" + String("00" + dd).slice(-2) ;   
}

var findUserbyId = require('./mySql.js').findUserbyId;
app.get('/api/exercise/log/:id', function(req, res, next) {
  console.log("find all");
  findUserbyId(req.params.id, function(err, data) {
    var userLogData = data.userLog;
    
    var fromDate = new Date(req.query.from),
        toDate = new Date(req.query.to);
    var limit = Number(req.query.limit);
    console.log("date " + fromDate);
    
    if(isValidDate(fromDate) && isValidDate(toDate)){
      console.log("both dates valid");
      fromDate = formattedDate(fromDate);
      toDate = formattedDate(toDate);
      userLogData = userLogData.filter((rows)=> (rows.date >= fromDate && rows.date <= toDate));
    }else if(isValidDate(fromDate) && !isValidDate(toDate)){
      console.log("From date valid " + formattedDate(fromDate));
      //fromDate = formattedDate(fromDate);
      userLogData = userLogData.filter((rows)=> (rows.date >= fromDate));      
    }else if(!isValidDate(fromDate) && isValidDate(toDate)){
      console.log("To date valid " + formattedDate(toDate));      
      toDate = formattedDate(toDate);
      userLogData = userLogData.filter((rows)=> (rows.date <= toDate));
    }
    
    if(!isNaN(limit) && userLogData.length > limit){
      userLogData = userLogData.slice(0,limit)
    }
    
    res.json(userLogData);
  });
});

// Not found middleware
/*app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


//app.use('/_api', enableCORS, router);

*/
//https://ten-marmoset.glitch.me/
//https://ten-marmoset.glitch.me/api/exercise/users
//https://ten-marmoset.glitch.me/api/exercise/log/5d58be6fba0f93427ded6024?
//https://ten-marmoset.glitch.me/api/exercise/log/5d58be6fba0f93427ded6024?&limit=2