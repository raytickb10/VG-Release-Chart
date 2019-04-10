const BASE_URL = 'https://www.giantbomb.com/'; 
const baseID = '3030-';

const currentList = [];

function generateTopGamesHTML(game){
  
  if(game.gameDate.startsWith('Original'))
    game.gameDate = game.gameDate;
  else
    game.gameDate = "Expected Release Date: " + game.gameDate;
  
  return `
  <li data-id="${game.gameID}" class="gameCard" >
    <div class="cardWrapper">
       <div class="gameName">${game.gameName}</div> 
       <img src="${game.gameImage}" alt="This is a clickable picture that will take you to the game" class="cardImage" title="Related Game Image"> 
        <span class="gameID">${game.gameDate}</span>
      <div>
        <button id="deleteButton" onclick="removeFromList('${game.gameID}', '${game.gameName}')" >- Remove Game</button><a href="${BASE_URL}${game.name}/${baseID}${game.gameID}/" target="_blank"><button id="infoButton"> ≡ More Info</button></a>
      </div>
       
    </div>
  </li>`;
}

function removeFromList(thisGameID, thisGameName){
  var idToRemove = thisGameID;

  const newArray = currentList.filter(function(item) {
    return item.gameID != idToRemove;
  });
  console.log(newArray);
  window.alert(thisGameName + " has been removed from your wishlist!");
  reformWishList(newArray);
}

function reformWishList(thisList){
  const currentID = localStorage.getItem("userID");
  const currentName = localStorage.getItem("userName");
  
  $.ajax({
      url: "/api/users/" + currentID ,
      data: JSON.stringify({
        "id" : currentID,
        "username" : currentName, 
        "wishlist": thisList,
        }),
      contentType: 'application/json',
      dataType:'json',
      type:'PUT',
      success: function(){
        window.location.href = "/my-list";
      }
    });
}


function renderTopGames(extra){
  const gameElements = extra.map (game => {
    return generateTopGamesHTML(game);
  });
  $('.popularGames').html(gameElements);
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
      console.log(data);
      var extraValue = data.wishlist;
      console.log(extraValue);
      renderTopGames(extraValue);
      data.wishlist.forEach(function(element){currentList.push(element);});
    }
  });
  
}

$(function (){
  if(localStorage.getItem("userID")){
    loadWishList();
  }
});
