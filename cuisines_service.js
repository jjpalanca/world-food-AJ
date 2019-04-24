/*
*Programmer: Ariel Villasenor
*Assignment: Homework 7
*CSC 337 9:30am-10:45 Tues-Thurs
*Description:This is the webservice page for the bestreads website. In this
*JS file we app.get since
*/
const express = require("express");
const app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
let fs = require('fs');

app.use(express.static('public'));

/* Here we create a Google API client. It is because of this that we can
* access Google's "Maps" API. It is here that Google asks for our API key.
*/
const googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyBD1gtaoKZCrOhf3SJ-7AhLpTou6vpV1yc'
});

/* The "find_line" function is called when we are splitting a line on it's
 * '\n' character.
 */
console.log('web service started');
function find_line(text, operation) {
	let lines = text.split("\n");
	if(operation=="Dine-In"){
	return lines[0];
  }
}
/* The "read_file" function, uses "file_name" to open that file. We then
	return it's contents.
*/
function read_file(file_name) {
	let data = 0;
	try {
	    data = fs.readFileSync(file_name, 'utf8');
	    //console.log(data);
	} catch(e) {
	    console.log('Error:', e.stack);
	}
	return data;
}
/* The "build_json" function creates a JSON object. If the operation is
 * "Dine-In", a list of JSON objects will be created. It will have 2 keys, "title"
 and "folder". Once the list is complete, we will return a JSON object where
 the key is "dishes" and the value is the created list.*/
function build_json(list1, list2, operation){
  if(operation=="Dine-In"){
		let list = [];
		for (let i = 0; i < list1.length; i++){
			list[i] = {"title": list2[i], "folder": list1[i]};
		}
		let data = {"dishes":list};
		return data;
	}
}
/*Here we have our app.get. When the makes makes a request for information,
this function will be called.*/
app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");

	let mode = req.query.mode;
	let type = req.query.type;
	let dish = req.query.dish;
	let restaurant = req.query.restaurant;
	let latitude = req.query.lat;
	let longitude = req.query.long;

	let json=null;
	/* This if statement will return a JSON object with the names
	 * of dishes for the specified culture, and there folder names.
	 * This will be used in the cuisines.js file to obtain the photos
	 * of each of these dishes.
	*/
  if(mode=="Dine-In" && dish == "none"){
    let files= mode+"/"+type;
  	let dishes=fs.readdirSync(files);
    let titles=[];
    for (let i = 0; i < dishes.length; i++){
			let file_name="Dine-In/" + type +"/"+ dishes[i]+"/info.txt";
      let text=read_file(file_name);
      titles=titles.concat(find_line(text,"Dine-In"));
		}
    json=build_json(dishes, titles, mode);
    res.send(JSON.stringify(json));
  }
	/* This if statement will return a JSON object where there will be the keys
	 "name", "description", "ingredients", "instructions" and "imgULR". This if
	 statement is passed when the user clicks on a photo of one of the dishes. This
	 will be used in the cuisines.js file in order to display the information for this
	 dish.
	*/
  else if(mode == "Dine-In" && dish != "none"){
	  let filename = mode + "/" + type + "/" + dish;
	  let dishObject = {};
	  let info = fs.readFileSync(filename + "/info.txt", 'utf8');
	  let lines = info.split("\n");
	  dishObject["name"] = lines[0];
	  dishObject["description"] = lines[1];
	  let ingredients = fs.readFileSync(filename + "/ingredients.txt", 'utf8');
	  dishObject["ingredients"] = ingredients;
	  let instructions = fs.readFileSync(filename + "/instructions.txt", 'utf8');
	  dishObject["instructions"] = instructions;
	  dishObject["imgURL"] = filename + "/img.jpg";
	  res.send(JSON.stringify(dishObject));
  }
	/*This if statement will return a list of JSON objects. These JSON objects will have
	* the keys "name", "address", "folder", "distance" and "duration". Distance being
	* how far away the user currently is in terms of miles, and duration being how
	* long to get to location via vehicle.*/
	else if(mode== "Dine-Out"&&restaurant == "none"){
		let files = mode+"/"+type;
		let restaurantNames = fs.readdirSync(files);
		let restaurantObj = {};
		let restaurantList = [];
		let list=[];
		let counter = 0;
		let newerObj = {};
		for (let i = 0; i < restaurantNames.length; i++){
			let newObj ={};
			let restaurantFolder = mode+"/"+type+"/"+restaurantNames[i];
			let info = fs.readFileSync(restaurantFolder+"/info.txt",'utf8');
			let location = fs.readFileSync(restaurantFolder+"/location.txt",'utf8');
			let infoLines = info.split("\n");
			let locLines = location.split("\n");
			let origins=latitude+","+longitude;
			let destinations=locLines[0] + "," + locLines[1];
			newObj["name"] = infoLines[0];
			newObj["address"] = infoLines[1];
			newObj["folder"] = restaurantNames[i];
			/*Here we make a query to our Google API. Our "origins" and "destinations"
			variable are strings that have the format "latitude,longitude". We put these
			into our parameters, if there is no error. We receive JSON object's within
			JSON objects. We will obtain the "distance" and "duration" information and
			save it into our own JSON object. This object, will then be appended to a list.
			Because we are unale to remove any information outside of the scope of this
			query, once the counter has reached the number of restaurants, it will create
			another JSON object, where it's key is "restaurant" and it's value is the
			created list.
			*/
			googleMapsClient.directions({
				origin: origins,
				destination: destinations }, function(err, response) {
				if (!err) {
					let timeduration= response.json.routes[0].legs[0].duration.text;
					timeduration=timeduration.split(" ");
					newObj["distance"] = response.json.routes[0].legs[0].distance.text;
					newObj["duration"] =parseInt(timeduration[0]);
				}
				counter+=1;
				list.push(newObj);
				if(counter==restaurantNames.length){
					newerObj["restaurant"]=list;
					res.send(JSON.stringify(newerObj));
				}
				});
		}
	}
	/* Here we have our if statment for when we are trying to access a specific
	 * restaurant's information. Here we create a JSON object that has the keys "name"
	 * "address", "hours", "latitude" and longitude. We access it's "info.txt" and
	 * "location.txt" file.
	 */
	else if(mode=="Dine-Out"&&restaurant!="none"){
		let files=mode+"/"+type+"/"+restaurant;
		let filename=files+"/info.txt";
		let info=read_file(filename).split("\n");
		let restaurantInfo={};
		restaurantInfo["name"]=info[0];
		restaurantInfo["address"]=info[1];
		restaurantInfo["hours"]=info[2];
		filename=files+"/location.txt";
		info=read_file(filename).split("\n");
		restaurantInfo["latitude"]=info[0];
		restaurantInfo["longitude"]=info[1];
		res.send(JSON.stringify(restaurantInfo));
	}

})

app.listen(process.env.PORT);
