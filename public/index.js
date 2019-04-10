'use strict';

const apiKey = 'f7c47301f582dd3869c9aa73bae209c92d24eb8c';

//Used to store game guids
let storeIds = { 
  games: []
};
//stores the data about the games
let storeGameData = {
  games: []
};
//used to store the initial top results
let topGames = {
  games: []
};
//handles the error messages that are displayed
const errorMessages = {
  noInput: 'The search field was left blank. Please type the name of a game.',
  noResults: 'There were no results for this search. Please search for a different game.',
  errorCondition: false,
};

const BASE_URL_SEARCH = 'https://www.giantbomb.com/api/search/';
const BASE_URL_GAME = 'https://www.giantbomb.com/api/game/';
const BASE_URL = 'https://www.giantbomb.com/';
const BASE_URL_TOP_GAMES = 'https://www.giantbomb.com/api/games/'; 
const baseID = '3030-';
let searchedGame;
const currentList = [];
const listOfID = [];

//function that handles the search input and uses that to find related games
function searchForGames(searchTerm, callback){
  $.ajax({
    url: BASE_URL_SEARCH,
    data: {
      api_key : apiKey, 
      query: `${searchTerm}`,
      resources: 'game',
      format: 'jsonp',
      limit: 10,
      filter: 'expected_release_year:2019|2020|2021|2022'},
    dataType:'jsonp',
    type:'GET',
    jsonp: 'json_callback',
    success: callback,
  });
}
//function that will get information about a specific game
function loadGameDetails(gameID){
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${BASE_URL_GAME}${baseID}${gameID}/`,
      data: {
        api_key : apiKey, 
        format: 'jsonp',
        limit: 1 },
      dataType:'jsonp',
      type:'GET',
      jsonp: 'json_callback',
      success: resolve,
      failure: reject,
    });
  });
}
//function used to load the initial game results
function loadTopGames(callback){
  $.ajax({
    url: `${BASE_URL_TOP_GAMES}`,
    data: {
      api_key : apiKey, 
      format: 'jsonp',
      limit: 10,
      filter: 'expected_release_year:2019|2020' },
    dataType:'jsonp',
    type:'GET',
    jsonp: 'json_callback',
    success: callback,
  });
}

function addTopGamesToStore(response){
  topGames.games = response;
  renderTopGames();
}
//creates the HTML for the initial game results
function generateTopGamesHTML(game){
  let topExpectedReleaseDay = '';
  let topExpectedReleaseMonth = 'TBA';
  let topExpectedReleaseYear = '';

  if(game.expected_release_day !== null){
    topExpectedReleaseDay = game.expected_release_day;
  }
  
  if(game.expected_release_quarter !== null){
    topExpectedReleaseMonth = game.expected_release_quarter;
  }
  else if (game.expected_release_month !== null) topExpectedReleaseMonth = game.expected_release_month;
  
  if(game.expected_release_year){
    topExpectedReleaseYear = game.expected_release_year;
  }

  if(typeof topExpectedReleaseMonth === "number"){
    if(topExpectedReleaseMonth.toString().length == 1)
    {topExpectedReleaseMonth = '0' + topExpectedReleaseMonth;}
  }
  if(typeof topExpectedReleaseDay === "number"){
    if(topExpectedReleaseDay.toString().length == 1)
    {topExpectedReleaseDay = '0' + topExpectedReleaseDay;}
  }

  let topDate = '';
  if (topExpectedReleaseYear) topDate += topExpectedReleaseYear + '-' 
    topDate += topExpectedReleaseMonth;
  if (topExpectedReleaseDay) topDate += '-' + topExpectedReleaseDay ;

  return `
  <li data-id="${game.id}" class="gameCard" >
    <div class="cardWrapper">
       <div class="gameName">${game.name}</div> 
       <img src="${game.image.small_url}" alt="This is a clickable picture that will take you to the game" class="cardImage" title="Related Game Image"> 
        <span class="gameID">Expected Release Date: ${topDate}</span>
      <div>
        <button id="wishButton" onclick="addToWishList('${game.id}', '${game.name}', '${game.image.small_url}', '${topDate}')">+ Add to Wishlist</button><a href="${BASE_URL}${game.name}/${baseID}${game.id}/" target="_blank"><button id="infoButton"> ≡ More Info</button></a>
      </div>
       
    </div>
  </li>`;
}
      
function addToWishList(thisGameID, thisGameName, thisGameImage, thisGameDate){
  const currentID = localStorage.getItem("userID");
  const currentName = localStorage.getItem("userName");
  console.log(thisGameDate);
  var extraValue = true;
  console.log(extraValue);
  currentList.push({"gameID":thisGameID,"gameName":thisGameName,"gameImage":thisGameImage,"gameDate":thisGameDate});  
  
  for (var i = 0; i < listOfID.length; i++){
    if (listOfID[i] == thisGameID){
      window.alert(thisGameName + " is already in your wishlist!!");
      currentList.pop();
      extraValue = false;
      break;
    }
  }
  if(extraValue == true)
  {
    window.alert(thisGameName + " has been added to your wishlist!");
  }

  console.log(currentList);
  
  $.ajax({
      url: "/api/users/" + currentID ,
      data: JSON.stringify({
        "id" : currentID,
        "username" : currentName, 
        "wishlist": currentList,
        }),
      contentType: 'application/json',
      dataType:'json',
      type:'PUT',
      success: function(){
        if(extraValue == true){window.location.href = "/";}
      }
    });
}

function renderTopGames(){
  const gameElements = topGames.games.results.map (game => {
    return generateTopGamesHTML(game);
  });
  $('.popularGames').html(gameElements);
}

function initialFormatRelatedGames(response){//formats the guid of each related game so that they can be fed into a new request to get details back
  if(!response.results.length){
    return generateError(errorMessages.noResults);
  }
  let formattedResults = response.results.map(item => ({
    name: item.name,
    id: item.id,
  }));
  let storedGames = addRelatedGamesToStore(formattedResults);
  handleDetailResponse(storedGames);
}

function addRelatedGamesToStore(formattedResults){
  storeIds.games = formattedResults;
  return storeIds.games;
}

function handleDetailResponse(storedGames){//uses promise.all to wait for all responses before adding them to our store so that they can be rendered
  let promises = [];
  for (let i = 0; i < storedGames.length; i++){
    promises.push(loadGameDetails(storedGames[i].id));  
  }
  Promise.all(promises).then(function(results){
    addFinalDetailsToStore(results);
    render();
    $('.loaderDiv').hide();
  });
}

function addFinalDetailsToStore(response){//adds the final related game objects to the store so that they can be accessed for rendering the page
  storeGameData.games = response;
}
//creates the HTML for the results text
function generateResultsText(numResults){ 
  let myHTML = `<p class="resultsText">Displaying the top ${numResults} results for your searched game: <b>${searchedGame}</b>. 
  <br>Click a picture below to get more information about the game!</p>`;
  $('.text-results').html(myHTML);
}
//creates the HTML for the searched games
function generateGamesHTML(game){
  let originalReleaseDate = '';
  let expectedReleaseDay = '';
  let expectedReleaseMonth = 'TBA';
  let expectedReleaseYear = '';

  if (game.results.expected_release_day !== null) 
    expectedReleaseDay = game.results.expected_release_day;

  if (game.results.expected_release_quarter !== null)
    expectedReleaseMonth = game.results.expected_release_quarter;
  else if (game.results.expected_release_month !== null) expectedReleaseMonth = game.results.expected_release_month;

  if (game.results.expected_release_year) {
    expectedReleaseYear = game.results.expected_release_year;
  }

  if (game.results.original_release_date !== null) {
    originalReleaseDate = game.results.original_release_date.substring(0,10);
  }

  if(typeof expectedReleaseMonth === "number"){
    if(expectedReleaseMonth.toString().length == 1)
    {expectedReleaseMonth = '0' + expectedReleaseMonth;}
  }
  if(typeof expectedReleaseDay === "number"){
    if(expectedReleaseDay.toString().length == 1)
    {expectedReleaseDay = '0' + expectedReleaseDay;}
  }

  let extraCaption = 'Original Release Date: ';
  if (game.results.expected_release_year || !game.results.original_release_date)
    extraCaption = 'Expected Release Date: ';
  
  let date = '';
  if (originalReleaseDate) {
    date = originalReleaseDate;
  } 
  else {
    if (expectedReleaseYear) date += expectedReleaseYear + '-' 
    date += expectedReleaseMonth;
    if (expectedReleaseDay) date += '-' + expectedReleaseDay ;
  }
  
  let resultsDate = extraCaption + date;

  return `
  <li data-id="${game.results.id}" class="gameCard" >
    <div class="cardWrapper">
        <div class="gameName">${game.results.name}</div> 
        <img src="${game.results.image.small_url}" 
          alt="This is a clickable picture that will take you to 
          the game" class="cardImage" title="Related Game Image"> 
        <span class="gameID">${resultsDate}</span>
      <div>
        <button id="wishButton" onclick="addToWishList('${game.results.id}', '${game.results.name}', '${game.results.image.small_url}', '${resultsDate}')">+ Add to Wishlist</button><a href="${BASE_URL}${game.results.name}/${baseID}${game.results.id}/" target="_blank"><button id="infoButton"> ≡ More Info</button></a>
      </div>
      </a>
    </div>
  </li>`;
}

function render(){
  let numResults = storeGameData.games.length;
  generateResultsText(numResults);
  const gameElements = storeGameData.games.map (game => {
    return generateGamesHTML(game);
  });
  $('.alternateMethod').hide();
  $('.results').html(gameElements);
}

function generateError(error){
  $('.loaderDiv').hide();
  $('.errorMessage').html(error); 
}

function formSubmit() { 
  $('form').on('submit', function(event){ 
    event.preventDefault();
    $('.errorMessage').html(''); 
    let input = $('#search-term');
    let query = input.val().trim();
    input.val('')
    if (!query.length)
      return generateError(errorMessages.noInput);
    $('.loaderDiv').show();
    searchedGame = query;
    searchForGames(query,initialFormatRelatedGames);
  });
}

function loadWishList()
{
  const currentID = localStorage.getItem("userID");
  const currentToken = localStorage.getItem("token");
 $.ajax({
    url: "/api/users/" + currentID,
    contentType: 'application/json',
    type:'GET',
    headers: {'Authorization': 'Bearer ' + currentToken},
    success: function(data){
      data.wishlist.forEach(function(element){currentList.push(element);});
      data.wishlist.forEach(function(item){listOfID.push(item.gameID);});
    }
  });
}


$(function () {
  formSubmit();
  loadTopGames(addTopGamesToStore);
  if(localStorage.getItem("userID")){
    loadWishList();
  }
  
});
