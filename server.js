const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/Exercise-Tracker' )

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var Schema  = mongoose.Schema;

var usernameShema = new Schema({
  usernam: String,
});

var exerciseShema = new Schema({
  userid: {type: String, required: true},
  description: {type: String, reuqired:true},
  duration: Number,
  date: Date 
 })


// Create New User Logic

var userName = mongoose.model('userName', usernameShema);




app.post("/api/exercise/new-user", (req, res, next)=>{
 
  const user_name = req.body.username
   
  var queryUserName = new userName ({
    username: user_name
  })

  queryUserName.save((err)=>{
    if (err){
      res.send("ERROR when try to save the username")
    } 
  })
  
  // set Midware for requiested user name and use it later
  var requestedUser = function (req, res, next) {
    req.equestedUser = queryUserName._id;
    next()
  }
  app.use(requestedUser)
 // 
  return res.json({"username":user_name, "_id":queryUserName._id});

})

// Add exercises loggic
var exercise = mongoose.model('excercise', exerciseShema);

app.post("/api/exercise/add", (req, res, next)=>{

    const queryExcecise = new exercise ({
      userid: req.body.userid,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date
    })

  
    queryExcecise.save((err)=>{
      if (err) {
        res.send("ERROR when try to save the Excercise!")
      }
    })
    return res.json({
    "username" : req.requestedUser,
   "description" : queryExcecise.description,
   "duration" : queryExcecise.duration,
    "_id" : queryExcecise._id,
     "date": queryExcecise.date
    })
})



// Not found middleware
app.use((req, res, next) => {
  // create application/json parser

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



 






















const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
