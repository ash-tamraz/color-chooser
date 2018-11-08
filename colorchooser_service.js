
/*
  author: Adam Holm
  file:   colorchooser_service.js
  purpose:  csc337 final project
          node.js service for colorchooser webapp
*/

// importing the Express module
const express  = require('express');

// creating Express application
const app    = express();

//  importing MongoDB client
const MongoClient =  require('mongodb').MongoClient;

//  connection url for mongod
const  mongoUrl  =  "mongodb://localhost:27017/ansiColorsDB";

//  mongo database name
const  dbName    =  'ansiColorsDB';

//  mongo database collection name
const collName   = "ansiColorsList";

// loading fs module
const fs    = require('fs');


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(express.static('fpFiles'));

const bodyParser  =  require("body-parser");
const jsonParser  =  bodyParser.json();


app.post('/load', jsonParser, function(req, res){
  
  var db = null;
  var collection = null;

  
  MongoClient.connect(mongoUrl, function(err, client){
    db = client.db(dbName);
    collection = db.collection("userColors"); 
    

    collection.findOne({"saveName" : { $eq: req.body.name } }, 
      function(err, r){
        if(err){
          console.log(err);
        }
        res.send(JSON.stringify(r));  
      });

    client.close();
  });// end  MongoClient.connect(mongoUrl, function(err, client)
});// end app.post('/load', jsonParser, function(req, res)


app.post('/save', jsonParser, function(req, res){
  
  var db = null;
  var collection = null;

  
  MongoClient.connect(mongoUrl, function(err, client){
    db = client.db(dbName);
    collection = db.collection("userColors"); 
    
    var name = req.body.name;

    console.log( req.body.userdata);

    collection.insertOne({"saveName" : req.body.name, 
                          "usercolors" : req.body.userdata }, 
      function(err, r){
        if(err){
          console.log(err);
        }

      });

    client.close();
  });// end  MongoClient.connect(mongoUrl, function(err, client)
  res.send("added user info");
});// end app.post('/save', jsonParser, function(req, res)

app.post('/', jsonParser, function(req, res){

  var db = null;
  var collection = null;

  var initial = 0;
  var limit = 0;  

  MongoClient.connect(mongoUrl, function(err, client){
    db = client.db(dbName);
    collection = db.collection(collName);
    var tagToUse = req.body.tag;

    console.log( "server in post request");
    console.log( req.body.tag);
    collection.find({tags: tagToUse}).toArray(function(err, doc){
  
      res.send(JSON.stringify(doc));
    });//end collection findOne

  }); //end mongoclient.connect

});// end post request 

app.get('/redirect', function(req, res) {

  return res.redirect(301, 'http://localhost:3000/test.html');

}); // end app.get('/redirect', function(req, res) 


/*
  get request for initial injection of colors
  into page
*/
app.get('/inject', function(req, res) {

  var db = null;
  var collection = null;

  MongoClient.connect(mongoUrl, function(err, client){
    db = client.db(dbName);  
    collection = db.collection(collName);

    collection.find({}).toArray(function(err, doc){

      res.send(JSON.stringify(doc));
    });//end collection findOne
  }); // end MongoCLient.connect

}); // end app.get('/inject', function(req, res) 

app.get('/', function(req, res) {

  /*
   *  first need to check if mongo database has been
   *  created or not 
   */
  var db = null;
  var collection = null;
  var returnmsg = "";
  MongoClient.connect(mongoUrl, function(err, client){
    if(err){
      //  print error if we run into one while connecting
      console.log("Error: Problem when connecting to mongo database");
      console.log(err);
    }
    //  good response from mongo server
    console.log("Connected successfully to mongo server");
    // creating database and then collection
    db = client.db(dbName);
    collection = db.collection(collName);  
    // calling function to check collection

    if(collection === null){
      console.log( "Collection doesn't exist, creating new collection");  
      return;
    }  

    /*
      use readFile to read from file, then will
      pass to helper function to sanitize returned
      data and create an array of json objects
    */
    // list has 753 elts, if the database is larger
    // or smaller, something is wrong, so refill it
    var coun;
    collection.stats(null, function(err, r){
      if(err){ 
        console.log(err);
      }
      console.log( "count="+r.count);  
      coun = r.count;
    if(coun == 753){
      console.log( "Collection already exists");
      returnmsg = "service: Found collection";
      return;
    }
    if(coun != 753){
      fs.readFile('rgb.txt', 'utf8', function(err, data) {
        if(err) {
          console.log("error when reading file");
        }
        // call json builder function to build data
        // inline, then insert into MongoDB
        // (doing like this as readFile is asynchronous)
        collection.insertMany(jsonBuilder(data));

        console.log("inserted data successfully");
        returnmsg = "service: Created collection";
        return;
      });
    }

    });
  
  }); // end MongoCLient
    
  res.send(returnmsg);  

}); // end route for apt.get


function jsonBuilder(fileString) {

  var rawArray = fileString.split('\n');

  //  this regex patter works well for
  //  removing whitespace between rgb values
  //  and color name  
  var patt = /\s{2,}(?=[a-z]+)/i;
  
  //  array for individual color json objects
  var colorJsonArray = [];

  // array for parsing input into appropriate
  // json objects
  function getRGBVals(element, index, array){

    if(typeof element !== undefined ){

    var temp = element.split(patt);

    if(temp.length > 2){
      console.log( "Error with "+temp);
    }
    var rgbJson  =  rgbJsonBuilder(temp[0]);  

    var tags = rgbJsonTagGenerator(rgbJson);

    var tempElt =  {"name" : temp[1],
            "rgbVals" : rgbJson,
            "tags" : tags };

    /*
      sanitizing array as we add to it.
      if name value is 'undefined', don't add
      to the array
    */
    if(tempElt.name !== undefined){
       colorJsonArray.push(tempElt);
      }
    }

  }
  
  Array.from(rawArray).forEach(getRGBVals);


  return colorJsonArray;

} // end jsonBuilder()

function removeDuplicates(array){

  var db = null;
  var collection = null;
  
}// end function removeDuplicates

function rgbJsonBuilder(x){

  var tempStr = x.trim();
  var patt = /\s+/i;
  var rgbarray = tempStr.split(patt);

  var rgbJson = {"r"  :  rgbarray[0],
          "g"  :  rgbarray[1],
          "b"  :  rgbarray[2] };

  return rgbJson;

} // end function rgbJsonBuilder(x)


function rgbJsonTagGenerator(x){

  //  x is the rgbJson obj passed by
  //  caller  
  var tagsArray = [];

  //  tagging reds
  if( parseInt(x.r,10) >= (parseInt(x.g,10) +parseInt(x.b,10) ) ){
    tagsArray.push("reds");

  }
  //  tagging greens 
  if( parseInt(x.g,10) >= (parseInt(x.r,10) +parseInt(x.b,10) ) ){
    tagsArray.push("greens");

  }

  //  tagging blues 
  if( parseInt(x.b,10) >= (parseInt(x.r,10) +parseInt(x.g,10) ) ){
    tagsArray.push("blues");

  }

  //  tagging whites/greys 
  //    will refine selection criteria later if this is 
  //    too broad
  if( Math.abs(parseInt(x.r,10) - parseInt(x.g,10)) < 30 &&
      Math.abs(parseInt(x.r,10) - parseInt(x.b,10)) < 30 &&
      Math.abs(parseInt(x.g,10) - parseInt(x.b,10)) < 30 ){

    tagsArray.push("whites");

  }

  console.log( "tags built by service: "+tagsArray);
  return tagsArray;
} // end function rgbJsonTagGenerator(x)


app.listen(3000);
