angular.module('exisChat.controller', [])

.controller('HomeCtrl', function($scope, $riffle, $ionicScrollDelegate) {

  $scope.msgs = [];

  //Login anonymously to Exis (requires Auth appliance level 0)
  $riffle.login().then(join);

  //notify everyone we've joined
  function join(){
    $riffle.publish('exisChat', $riffle.user.username());
    $scope.welcome = "Welcome " + $riffle.user.username() + "!";
  }

  //a handler that only wants message objects
  var wantMsg = $riffle.want(receiveMsg, {username: String, msg: String});

  //a handler that only wants join events
  var wantJoinEvent = $riffle.want(joinEvent, String);

  //subscribe for out 2 different types of msgs
  $riffle.subscribe('exisChat', wantMsg);
  $riffle.subscribe('exisChat', wantJoinEvent);

  //handle messages here
  function receiveMsg(msg){
    msg.received = true;
    displayMsg(msg);
  }

  //handle join events
  function joinEvent(user){
    var msg ={username: user, join: true};
    displayMsg(msg);
  }
   

  //send messages
  $scope.sendMsg = function(text){
    var msg = {username: $riffle.user.username(), msg: text}
    $riffle.publish('exisChat', msg);
    $scope.input.msg = "";
    displayMsg(msg);
  }

  //display messages
  function displayMsg(msg){
    $scope.msgs.push(msg);
    $ionicScrollDelegate.scrollBottom();
  }
});
