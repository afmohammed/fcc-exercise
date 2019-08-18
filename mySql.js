var mongodb = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true});

// <Your code here >
var UserSchema = new mongoose.Schema({
  userName: String,
  userLog: [{
    description: String,
    duration: Number,
    date : {}
  }]
});

var User = mongoose.model('User', UserSchema);

var createUser = (userName, done) => {
  console.log("Create User Method");
  User.findOne({userName:userName}, (err,foundRecord)=>{
    if (foundRecord == null){     
      console.log("Record Not Found");
      var user = new User({userName: userName, userLog : []});
      user.save((err,data)=>{
        if(err){
          done(err);
        }
        done(null , data);
      });
    }else if (err){
      console.log("Some Error in CreateUser");
      done(err);
    }else{      
      console.log("UserName exists");
      done(null,"username exists");
    }
  });
};

var findAll = function(done) {   
  console.log("0");
  User.find((err,data)=>{
      if (err) {
        console.log("1");
        return done(err);
      }
        console.log("2");
        //console.log('urlId: ' + data);
        return done(null, data);
      });  
}; 

var createLog = (id,userLogData, done) => {
  console.log("Create Log Method");
  User.findById({_id:id}, (err,foundRecord)=>{
    if (foundRecord == null){     
      console.log("Record Not Found");
      done(null,"Record Not Found");      
    }else if (err){
      console.log("Some Error in CreatingLog");
      done(err);
    }else{  
      console.log("Insert log Data");
      //User.userLog.push(userLogData);
      foundRecord.userLog.push(userLogData);
      foundRecord.save((err, data) => {
        if (err) {
          console.log(err);
          done(err) 
        } else { 
          done(null, data) 
        }
      });
      
      /*foundRecord.update((err,data)=>        
        {_id: id},
        {$push: {userLog: userLogData}}        
      );*/
    }
  });
};

var findUserbyId = (id, done) => {
  console.log("findUserbyId");
  User.findOne({_id:id}, (err,foundRecord)=>{
    if (foundRecord == null){           
      console.log("Record Not Found");
      done(null,"Record Not Found");   
    }else if (err){
      console.log("Some Error in CreateUser");
      done(err);
    }else{      
      return done(null, foundRecord);
    }
  });
};

exports.createUser = createUser;
exports.findAll = findAll;
exports.createLog = createLog;
exports.findUserbyId = findUserbyId;
