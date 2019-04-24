/*
*Programmer: Ariel Villasenor
*Assignment: Homework 6
*CSC 337 9:30am-10:45 Tues-Thurs
*Description:This is the JS file for the voting district data website. In this
*JS file, we use ajax to fetch the data that is formatted in JSON.
*/
(function(){
  'use strict';
  let type=null;
  let userLocationLat = 0.0;
  let userLocationLong = 0.0;

  let option2= document.getElementById("DineOut");
  let option1 = document.getElementById("DineIn");

    window.onload = function(){
    hide();
    display();
    let option1 = document.getElementById("DineIn");
    option1.addEventListener("click", function(){listDishes();});
    let option2= document.getElementById("DineOut");
    option2.addEventListener("click", function(){listRestaurants();});
    document.getElementById("search").onclick=listOptions;
    let button=document.getElementById("home");
    button.addEventListener("click", function(){display();});
    getLocation();
    };
    function display(){
      hide();
      document.getElementById("searchdiv").style.display = "block";
      document.body.style.backgroundImage="url('foods.jpg')";
    }
    /**
    */
    function listOptions(){
      hide();
      type=document.getElementById("CuisineOptions").value;
      document.body.style.backgroundImage="none";
      document.getElementById("DineIn-DineOut").style.display="flex";
    }
    /**
    */
    function hide(){
      document.getElementById("RestaurantInfo").style.display="none";
      document.getElementById("Maps").style.display="none";
      document.getElementById("DineIn-DineOut").style.display="none";
      document.getElementById("OneDish").style.display = "none";
      document.getElementById("searchdiv").style.display = "none";
      document.getElementById("AllRestaurants").innerHTML="";
      document.getElementById("AllRestaurants").style.display = "none";
      document.getElementById("AllDishes").style.display = "none";
      document.getElementById("AllDishes").innerHTML="";
      document.getElementById("RestaurantInfo").innerHTML="";
      document.getElementById("OneDish").style.display = "none";
    }
    /**
    */
    function listDishes(){
      hide();
      document.getElementById("AllDishes").style.display = "block";
      let url = "http://world-food.herokuapp.com:/?mode=Dine-In&type="+type+"&dish=none";
      fetch(url)
        .then(checkStatus)
          .then(function(responseText){
            let json = JSON.parse(responseText);
                    let dishesDiv=document.getElementById("AllDishes");
                    for(let i=0; i<json.dishes.length; i++){
                    let div=document.createElement("div");
                    let img=document.createElement("img");
                    img.id=json.dishes[i].folder;
                    img.addEventListener("click", function(){listRecipe(this.id);});
                    let text=document.createElement("P");
                    text.innerHTML=json.dishes[i].title;
                    //console.log(text);
                    img.src="Dine-In/"+type+"/"+json.dishes[i].folder+"/img.jpg";
                    div.appendChild(text);
                    div.appendChild(img);
                    dishesDiv.appendChild(div);
                }
              });
    }
    /**
    */
    function listRestaurants(){
      hide();
      //console.log("repeat");
      document.getElementById("AllRestaurants").style.display = "block";
      document.getElementById("AllRestaurants").innerHTML="";
      let url = "http://world-food.herokuapp.com:/?mode=Dine-Out&type="+type+"&restaurant=none&lat=";
      url+=userLocationLat+"&long="+userLocationLong;
      fetch(url)
        .then(checkStatus)
          .then(function(responseText){
              let json=JSON.parse(responseText);
              let sortedObj = json.restaurant;
              sortFunction(sortedObj);
              let allRestaurants = document.getElementById("AllRestaurants");
              let subtitle = document.createElement("h2");
              subtitle.innerHTML = type + " restaurants near you";
              allRestaurants.appendChild(subtitle);
              for(let i = 0; i < sortedObj.length; i++){
                  let newDiv = document.createElement("div");
                  let img= document.createElement("img");
                  img.src = "Dine-Out/"+type+"/"+sortedObj[i].folder+"/img.jpg";
                  newDiv.appendChild(img);
                  newDiv.id = sortedObj[i].folder;
                  newDiv.addEventListener("click", function(){displayRestaurantInfo(this.id);});
                  newDiv.classList.add("restaurantDiv");
                  let name = document.createElement("h3");
                  name.innerHTML = sortedObj[i].name;
                  newDiv.appendChild(name);
                  let distance = document.createElement("h5");
                  distance.innerHTML = sortedObj[i].distance + " away";
                  newDiv.appendChild(distance);
                  let duration = document.createElement("p");
                  duration.innerHTML = sortedObj[i].duration + " mins";
                  newDiv.appendChild(duration);
                  allRestaurants.appendChild(newDiv);
              }
          });
    }
    /**
    */
    function displayRestaurantInfo(id){
      hide();
      document.getElementById("OneRestaurant").style.display = "flex";
      document.getElementById("Maps").style.display="block";
      let div1=document.getElementById("RestaurantInfo");
      div1.style.display="flex";
      let url = "http://world-food.herokuapp.com:/?mode=Dine-Out&type="+type+"&restaurant=" + id;
      //console.log(id);
      fetch(url)
        .then(checkStatus)
          .then(function(responseText){
            let json=JSON.parse(responseText);
            createMap(json);
            //console.log(responseText);
            let file="Dine-Out/"+type+"/"+id+"/img.jpg";
            let img = document.createElement("img");
            img.src=file;
            //document.getElementById("RestaurantPic").src=file;
            let paragraph = document.createElement('p');
            paragraph.innerHTML=json.name;
            div1.append(paragraph);
            div1.append(img);
            paragraph=document.createElement('p');
            paragraph.innerHTML=json.address;
            div1.append(paragraph);
            paragraph=document.createElement('p');
            paragraph.innerHTML=json.hours;
            div1.append(paragraph);
          });
    }
    function createMap(json){
        //console.log(json.latitude);
        let userLoc = new google.maps.LatLng(userLocationLat, userLocationLong);
        let restaurantLoc = new google.maps.LatLng(parseFloat(json.latitude), parseFloat(json.longitude));
        let directionsDisplay = new google.maps.DirectionsRenderer();
        let directionsService = new google.maps.DirectionsService();
        var map;

        var mapOptions = {
                center: userLoc,
                zoom: 14
        };
        map = new google.maps.Map(document.getElementById("Maps"),mapOptions);
        directionsDisplay.setMap(map);

        let request = {
            origin: userLoc,
            destination: restaurantLoc,
            travelMode:'DRIVING'
        };
        directionsService.route(request, function(result, status) {
            if (status == "OK") {
                directionsDisplay.setDirections(result);
            }
        });
    }
    /**
    */
    function sortFunction(newObj){
        newObj.sort(function(a,b){
            return a.duration - b.duration;
        });
    }
    /**
    */
    function getLocation() {
      let x=document.getElementById("AllDishes");
      if (navigator.geolocation) {
        console.log("2");
        navigator.geolocation.getCurrentPosition(showPosition);
      } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
      }
    }
    /**
    */
    function showPosition(position) {
      console.log('1');
      userLocationLat = position.coords.latitude;
      userLocationLong = position.coords.longitude;
      console.log(userLocationLat);
      console.log(userLocationLong);
    }
    /**
    */
    function listRecipe(dish){
      /*
      */
        hide();
        document.getElementById("OneDish").style.display = "block";
        //console.log("gibberish");
        console.log(dish);
        let url = "http://world-food.herokuapp.com:/?mode=Dine-In&type="+type+"&dish=" + dish;
        fetch(url)
            .then(checkStatus)
            .then(function(responseText){
                let dishInfo = document.getElementById("dishInfo");
                let ingredientsDiv = document.getElementById("Ingredients");
                let instructionsDiv = document.getElementById("Instructions");
                let json = JSON.parse(responseText);
                let img = document.createElement("img");
                img.src = json.imgURL;
                dishInfo.appendChild(img);
                let name = document.createElement("h2");
                name.innerHTML = json.name;
                dishInfo.appendChild(name);
                let description = document.createElement("p");
                description.innerHTML = json.description;
                description.id = "description";
                dishInfo.appendChild(description);
                let ingredientsList = json.ingredients.split("\n").filter(Boolean);
                let ul = document.createElement("ul");
                for (let i = 0; i < ingredientsList.length; i++){
                    let li = document.createElement("li");
                    li.innerHTML = ingredientsList[i];
                    ul.appendChild(li);
                }
                ingredientsDiv.appendChild(ul);
                let ul2 = document.createElement("ol");
                let instructionsList = json.instructions.split("\n");
                for(let i = 0; i < instructionsList.length; i++){
                    if (i == instructionsList.length - 1 && instructionsList[i] == ""){
                        break;
                    }
                    let li = document.createElement("li");
                    //li.id = "noBulletPoint";
                    li.innerHTML = instructionsList[i];
                    ul2.appendChild(li);
                }
                instructionsDiv.appendChild(ul2);
        });
        /**/
    }
    /**
    */
    function checkStatus(response) {
      /***/
      if (response.status >= 200 && response.status < 300) {
        return response.text();
      }
}

})();
