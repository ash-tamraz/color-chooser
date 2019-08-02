/*
  author: Adam Holm
  file: colorchooser.js
  purpose: csc337 final project
    "color chooser"
    client side javascript
*/

"use strict";

(function(){ // beginning "modular" style



// onload behavior
window.onload = function(){

  //  button to move forward by 8 colors
  document.getElementById("forward").addEventListener("click", nextEightColors, false);

  // button to move backwards by 8 colors
  document.getElementById("back").addEventListener("click", prevEightColors, false);

  // button to reset empty color slots
  document.getElementById("reset").addEventListener("click", resetButton, false);

  // button to save ansi colors
  document.getElementById("save").addEventListener("click", saveButton, false);

  // button to load ansi colors
  document.getElementById("load").addEventListener("click", loadButton, false);

  // adding event listeners for tag selector buttons
  let buttons = document.getElementsByClassName("tagSelect");

  // using this forEach so don't have to do each
  // individually
  function addListener(element, index, array){
   document.getElementById(element.id).addEventListener("click", selectColorTags, false);
  }
  Array.from(buttons).forEach(addListener);

  ondropForColorChooseElts();
  // helper function to check if collection exists
  // and if not, tell the service to fill it
  checkCollection();

  // helper funciton to inject data from service into
  // the html
  populateColorList();


}; // end onload

// ------new
/*
  Helper function that adds dragover and drop event listeners for
  elements color0, ... , color7, of the colorchoose
  div element.

  This is called onload, and enables colors from the colorlist
  on the right hand side of the screen to be able to be dragged
  and dropped into the slots on the left hand side.
*/
function ondropForColorChooseElts(){

  //  HTMLColleciton object of all child elements
  //  of div "colorchoose". (they're just divs)
  let objs =  document.getElementById("colorchoose").children;

  function addDragListeners(element, index, array){

    element.addEventListener("dragover", dragOverHelperFunction, false);
    element.addEventListener("drop", dropHelperFunction, false);

  }//end addDragListeners

  Array.from(objs).forEach(addDragListeners);

} // end function ()

/*
  Helper for dragover events.

  Elements by default don't allow elements to be dragged
  into them, so this prevents that default and enables
  dropping an element into the target.
*/
function dragOverHelperFunction(ev){

  ev.preventDefault();

}

/*
  Helper for drop events.

  Gets data from the dragged element (the id of the dragged
  element), and then sets the backgroundColor of the target
  element.

  Setting background color instead of adding child elements,
  to avoid confusion of whether or not to remove chosen color
  from the list, how to reorder the list, and css box sizing
  and alignment issues.
*/
function dropHelperFunction(ev){

  ev.preventDefault();

  let data = ev.dataTransfer.getData("text");

  ev.target.style.backgroundColor =
    document.getElementById(data).style.backgroundColor;

  ev.target.style.cursor = "pointer";

  // resetting background color to initial value if
  // element being dragged was in 'colorchoose' div
  if(/color[0-7]/.test(data)){

    document.getElementById(data).style.backgroundColor =
      "initial";
    document.getElementById(data).setAttribute("draggable", "false");

    document.getElementById(data).style.cursor = "default";
  }

  // now want to make the target div draggable, so
  // user can move color to a different slot if they
  // change their mind
  ev.target.setAttribute("draggable", "true");
  ev.target.addEventListener("dragstart", dragStartFunc, false);

}// end function dropHelperFunction(ev){

// -----end new

function hideLoadAndSave(targetId, oper){

  // storing colorchoose div in this var
  let ccDiv = document.getElementById("colorchoose");

  // storing colorlist div in this var
  let cLDiv = document.getElementById("colorlist");

  // storing tagAndListContainer div
  let tALCDiv = document.getElementById("tagAndListContainer");

  // storing container for save and load divs
  let sALDiv = document.getElementById("saveAndLoad");

  // getting target div to unhide
  let target = document.getElementById(targetId);

  cLDiv.style.display = ( oper === "hide"? "none" : "initial" );
  ccDiv.style.display = "none";
  tALCDiv.style.display = "none";
  sALDiv.style.display = "initial";
  target.style.display = "flex";

  let targetDivNodes = target.children;

  function unhide(element, array, index){
    element.className = "donthide";
  }
  Array.from(targetDivNodes).forEach(unhide);


}// end function hideLoadAndSave(targetId){

/*
  helper function to hide relevant
  elements when load button is clicked, then
  change event listener for load button to
  call function which sends request to service
*/
function loadButton(){

  hideLoadAndSave("userinputload");

/*
  //  getting child nodes
  let objs =  document.getElementById("colorchoose").children;

  //  hiding elements
  function getBGColor(element){
    element.className = "hide";
  }
  Array.from(objs).forEach(getBGColor);

  //  unhiding relevant user input elements
  document.getElementById("userinputload").className = "donthide";
  //  putting child elements into array so can
  //  loop through and unhide
  let usrinArr = document.getElementById("userinputload").children;

  //  using for loop to loop through and set
  //  classname values
  for(let i=0; i<Array.from(usrinArr).length; i++){
    Array.from(usrinArr)[i].className = "donthide";
  }

  //  hiding other elements don't want seen while this
  //  process happens
  document.getElementById("userinput").className = "hide";
  usrinArr = document.getElementById("userinput").children;

  //  for loop to hide child elements
  for(let i=0; i<Array.from(usrinArr).length; i++){
    Array.from(usrinArr)[i].className = "hide";
  }
*/

  //  adding event listener to submit button.
  //  don't add on onload in order to avoid accidental
  //  load requests to the server
  document.getElementById("loadUsrCol").addEventListener("click", submitLoad, false);


}// end function loadButton()

/*
  helper function that is onclick function for
  load submit button. sends POST request to the
  service with the user input as the POST body
*/
function submitLoad(){

  //  getting value to send
  let name = document.getElementById("nameToLoad").value;

  //  url for fetch path
  //  giving a different path, so it goes to
  //  post request for instances of just loading
  //  user data
  let fetchUrl = "http://localhost:3000/load";

  let tosend = { "name" : name };

  let options = { method: 'POST',
                  credentials: 'include',
                  headers: {'Accept': 'application/json',
                      'Content-Type': 'application/json' },
                  body: JSON.stringify(tosend)};

  //  fetching
  fetch(fetchUrl, options)
    .then(function(response){
      return response.text();
    })
    .then( function(rtext){
      /*
         injecting returned data from service
         in this thread to avoid headaches of
         the asynchronous nature of fetch
      */
      let found = JSON.parse(rtext);
      let objs = document.getElementById("colorchoose").children;

      // hide/unhide things again
      document.getElementById("userinputload").className = "hide";
      document.getElementById("userinput").className = "hide";
      let usrinArr = document.getElementById("userinputload").children;

      for(let i=0; i<Array.from(usrinArr).length; i++){
        Array.from(usrinArr)[i].className = "hide";
      }


      //  injecting loaded color information here
      objs = document.querySelectorAll("#colorchoose > div[id*=color]");

      function getBGColor(element, index){
        element.className = "donthide";
        element.style.backgroundColor = "rgb("+
          found.usercolors[index].r+","+
          found.usercolors[index].g+","+
          found.usercolors[index].b+")";
      }
      Array.from(objs).forEach(getBGColor);

  });

}// end function submitLoad()

/*
  helper function that hides elements and shows
  correct elements for user input for saving
  users colors
*/
function saveButton(){

  /*
    hide user colors and prompt for name for
    ANSI colors to be saved under, with
    displaying a text input area and submit
    button
  */

  /*
    will get colors in palette by getting child
    elements of colorchooser div, then reading
    their .style.backgroundColor values, then can
    send values to service
  */

  //  getting child nodes
  let objs =  document.getElementById("colorchoose").children;

  //  hiding elements we don't need right now
  function getBGColor(element){
    element.className = "hide";
  }
  Array.from(objs).forEach(getBGColor);

  //  unhiding elements we do need
  document.getElementById("userinput").className = "donthide";
  let usrinArr = document.getElementById("userinput").children;

  for(let i=0; i<Array.from(usrinArr).length; i++){
    Array.from(usrinArr)[i].className = "donthide";
  }

  //  adding onclick function for submit button
  //  doing so now in order to avoid accidental
  //  service requests before they are desired
  document.getElementById("submit").addEventListener("click", submitSave, false);

}// end function saveButton

/*
  helper function for onclick function for saving
  functionality's submit button
  reads color values currently in users color area
  and then sends them to the service via a POST
  request. the server will store the values
  along with the name of the ANSI colors with
  MongoDB
*/
function submitSave(){

  //  array for the bg color values
  let array = [];

  //  getting child nodes
  let objs =  document.getElementById("colorchoose").children;

  //  making array of color values
  function getBGColor(element){
    array.push(element.style.backgroundColor);
  }
  Array.from(objs).forEach(getBGColor);

  //  getting "name" user input
  let name = document.getElementById("name").value;

  let fetchUrl = "http://localhost:3000/save";

  //  sanitizing color information before sending
  //  to service
  let arrayToSend = sanitizeUserColors(array);

  let tosend = { "name" : name, "userdata": arrayToSend  };

  let options = { method: 'POST',
                  credentials: 'include',
                  headers: {'Accept': 'application/json',
                      'Content-Type': 'application/json' },
                  body: JSON.stringify(tosend)};

  //  fetching
  fetch( fetchUrl, options)
    .then( function(response){
       return response.text();
      })
    .then( function(rtext){
      /*
        just saving, so on return, will just
        hide and unhide elements as needed
      */
      let objs =  document.getElementById("colorchoose").children;

      // hide/unhide things again
      document.getElementById("userinput").className = "hide";

      let usrinArr = document.getElementById("userinput").children;

      for(let i=0; i<Array.from(usrinArr).length; i++){
        Array.from(usrinArr)[i].className = "hide";
      }

      let obj = document.getElementById("colorchoose").firstChild;
      for(let i=0; i<9; i++){
        obj.className = "donthide";
        obj = obj.nextElementSibling;
      }

    });


}// end submitSave

/*
  helper function to hide elements
*/
function rehideElts(){
  let objs =  document.getElementById("colorchoose").children;

  // hide/unhide things again
  document.getElementById("userinput").className = "hide";

  function getBGColor(element){
    element.className = "donthide";
  }
  Array.from(objs).forEach(getBGColor);

}// end function rehideElts

/*
  colors are returned as a string that looks like
  'rgb(<val>, <val>, <val>)', so this function
  pulls the numeric r,g,b numeric values out of
  the string an array of the numeric values to the
  caller
*/
function sanitizeUserColors(arr){

  let userJson = [];

  //  regex patterns used to help with sanitizing
  //  this looks for 1 or more digits
  let patt0 = /\d+/i;

  //  this looks for a non-whitespace character
  let patt1 = /\S/i;

  //  this looks for any non-digit characters
  let patt2 = /\D/gi;

  //  callback to loop through array of strings
  //  that was passed in as a parameter
  function sanitize(element, index, array){

    //  if there are no non-whitespace
    //  chars, discard junk element
    if(!element.match(patt1)){
      array.pop(element);
    }
    if(element.match(patt1)){
      // first split element along ','
      let temp = element.split(",");

      let tempjson = {};
      // should have three elements of temp arr
      // now strip non digit chars from the r, g, b
      // values

      tempjson = { "r": temp[0].replace(patt2, ""),
                "g" : temp[1].replace(patt2, ""),
                "b"  :  temp[2].replace(patt2, "")};

      userJson.push(tempjson);
      }
    }
  arr.forEach(sanitize);

  return userJson;

}// end function sanitizeUserColors(arr){

/*
  onclick for button that returns user color
  area to initial values
*/
function resetButton(){

  //  HTMLColleciton object of all child elements
  //  of div "colorchoose". (they're just divs)
  let objs =  document.getElementById("colorchoose").children;

  /*
    callback function to reset all of the child
    nodes of 'colorchoose' to their initial
    color property, 'resetting' the color chooser
  */
  function resetBGColor(element){
    element.style.backgroundColor = "initial";
  }
  Array.from(objs).forEach(resetBGColor);

} // end function resetButton()

function selectColors(event){

  console.log( "client: got to selectColors");
  let object = event.target;
  console.log("client: event.id: "+object.id);

  let emptyslot = document.querySelector("#colorchoose > .notfilled");
  if(!emptyslot){
    let objs =  document.querySelectorAll("#colorchoose > .filled");

    document.getElementById("color0").className = "notfilled";
    document.getElementById("color1").className = "notfilled";
    document.getElementById("color2").className = "notfilled";
    document.getElementById("color3").className = "notfilled";
    document.getElementById("color4").className = "notfilled";
    document.getElementById("color5").className = "notfilled";
    document.getElementById("color6").className = "notfilled";
    document.getElementById("color7").className = "notfilled";

    emptyslot = document.getElementById("colorchoose").firstElementChild;


  }

  console.log("client: id of empty slot "+object.id);
  emptyslot.style.backgroundColor = object.style.backgroundColor;

  emptyslot.className = "filled";

} // end function selectColorTags(event)

function selectColorTags(event){

  let passedInColor = event.target.id;
  console.log("client: event.id: "+passedInColor);
  // first hide all colors
  let objarray = document.querySelectorAll("donthide");

  document.getElementById("colorlist").className = "hide";
  document.getElementById("tagcolorlist").className = "donthide";

  document.getElementById("tagcolorlist").innerHTML = "";
  function hideElements(element, index, array){
    element.className = "tempHidden";
  }
  Array.from(objarray).forEach(hideElements);

  // then query db
  let fetchUrl = "http://localhost:3000";

  let tosend = { "tag" : passedInColor };


  let options = { method: 'POST',
                  credentials: 'include',
                  headers: {'Accept': 'application/json',
                      'Content-Type': 'application/json' },
                  body: JSON.stringify(tosend)};

  fetch( fetchUrl, options)
  .then( function(response){
     return response.text();
    })
  .then( function(rtext){
     return injectData(JSON.parse(rtext), "tagcolorlist") ;
  });

}//end function selectColors

function prevEightColors(){

  let targetDiv = "colorlist";

  if(document.getElementById("colorlist").className == "hide"){
    targetDiv = "tagcolorlist";
  }


  let firstObj = document.querySelectorAll("#"+targetDiv+" > .donthide");

  /*
    hide the first 8 elements
  */
  function changeClass(element, index, array){
    element.className = "hide";
  }
  Array.from(firstObj).forEach(changeClass);

  let tempObj = firstObj[0].previousSibling;
  /*
    unhide the next 8 elements
  */
  for(let i=0; i<8; i++){
    tempObj.className = "donthide";

    tempObj = tempObj.previousSibling;

  }

}//end function prevEightColors

function nextEightColors(){

  let targetDiv = "colorlist";

  if(document.getElementById("colorlist").className == "hide"){
    targetDiv = "tagcolorlist";
  }


  let firstObj = document.querySelectorAll("#"+targetDiv+" > .donthide");


  /*
    hide the first 8 elements
  */
  function changeClass(element, index, array){
    element.className = "hide";
  }
  Array.from(firstObj).forEach(changeClass);

  let tempObj = firstObj[7].nextSibling;
  /*
    unhide the next 8 elements
  */
  for(let i=0; i<8; i++){
    tempObj.className = "donthide";

    tempObj = tempObj.nextSibling;

  }


}//end nextEightColors

function dragStartFunc(ev){

  ev.dataTransfer.setData("text", ev.target.id);

}

function injectData(data, targetDivId){

  //  target div element
  let  tarDiv = document.getElementById(targetDivId);

  function makeDivs(element, index, array){


    // creating color string for backgroundColor style
    // of div, from data from database
    let tempRgb = 'rgb('+element.rgbVals.r+','+element.rgbVals.g+','+element.rgbVals.b+')';

    let tempDiv = document.createElement("DIV");
    tempDiv.id = index+"-"+(element.name).replace(/\s+/g, "");

    tempDiv.className = (index < 8 ? "donthide":"hide" );
    tempDiv.style.backgroundColor = tempRgb;

    // changes to make draggable, remove if break
    tempDiv.setAttribute("draggable", "true");
    tempDiv.addEventListener("dragstart", dragStartFunc, false);
    // end changes for draggability

    tempDiv.innerHTML = element.name;

  /*
    adding event listeners for divs that are currently
    displayed. doing here because the "hide" and
    "donthide" classnames are set above.
    (was not working when set in window.onload function)
  */
    //tempDiv.addEventListener("click", selectColors, false);

    tarDiv.appendChild(tempDiv);


  }

  (Array.from(data)).forEach(makeDivs);

}// end function injectData(data, targetDivId)


function checkCollection(){

  fetch("http://localhost:3000/",
      { method: 'GET',
      credentials: 'include' } )
    .then( function(response){
      return response.text();
    })
    .then( function(rtext){
      console.log("response from server: ", rtext);
    });

}

function populateColorList(){


  let url = "http://localhost:3000/inject";

  fetch(url, {method: 'GET'})
    .then(function(response){
      if(response.ok){
        return response.text();
      }
      else{
        console.log("Error: "+response.status+": "+response.statusText);
      }
    })
    .then(function(responseText) {
      //  call helper function to inject
      //  data into html page
      console.log(responseText);
      injectData(JSON.parse(responseText), "colorlist");
    })
    .catch(function(error) {
      console.log(error);
       });


}

})(); // end of "modular" style


