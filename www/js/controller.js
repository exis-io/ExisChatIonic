angular.module('exisChat.controller', [])

.controller('LoginCtrl', function($scope, $riffle, $state, $ionicScrollDelegate, $ionicPopup, $window) {
  $scope.stayLoggedIn = {checked: false};
  $scope.firstUser = "Username";
  
  $scope.clearCookies = function() {
    $window.localStorage.removeItem('creds');
    $scope.user = "";
    $scope.firstUser = "Username";
  }
  
  $scope.login = function(user) {
    // A username has been pre-set by the creds localStorage
    if (user === undefined && $scope.firstUser != "Username") {
        cookieLogin();
    }
    // They didn't enter anything - generate a random username
    else if (user === undefined && $scope.firstUser == "Username") {
        initialLogin("");
    }
    // They typed a name, and it matches what the creds localStorage shows
    else if (user === $scope.firstUser || user == creds.username) {
        cookieLogin();
    }
    // They chose some username they want
    else {
        initialLogin(user);
    }
  }
  function initialLogin(user) {
    $scope.user = user;
    // Perform standard login
    $riffle.login({username: $scope.user}).then(joined, errored);
  }
  function cookieLogin() {
    var creds = JSON.parse($window.localStorage['creds']);
    $scope.user = creds.username;
    // Create their users "subdomain" to login as
    $riffle.user = $riffle.subdomain($scope.user);
    // Set the token from localStorage to login to Exis with
    $riffle.setToken(creds.token);
    // When we login, perform these steps to redirect to the home screen
    $scope.$on('$riffle.open', function(){
        $riffle.publish('exisChat', $scope.user);
        $state.go("home");
    });
    // Perform the actual login(join) to Exis
    $riffle.user.join();
  }
  function joined(){
    // Save credentials if they requested it
    if($scope.stayLoggedIn.checked) {
        $scope.user = $riffle.user.username();
        $window.localStorage['creds'] = JSON.stringify({username: $scope.user, token: $riffle.getToken()});
    }
    // Notify everyone we've joined
    $riffle.publish('exisChat', $riffle.user.username());
    // Redirect to home
    $state.go("home");
  }
  function errored(err) {
    $ionicPopup.alert({
      title: 'Oops!',
      template: err
    });
  }

  if($window.localStorage['creds'] !== undefined) {
      var creds = JSON.parse($window.localStorage['creds']);
      // Fill in the username if we have something in localStorage
      $scope.firstUser = creds.username;
      $scope.stayLoggedIn = {checked: true};
  }
})

.controller('HomeCtrl', function($scope, $riffle, $state, $ionicScrollDelegate) {
  $scope.msgs = [];
  
  $scope.$on('$ionicView.enter', function(){
      // Make sure they are logged in, or kick them back out
      if ($riffle.user === undefined) {
        $state.go("login");
        return;
      }
      // Display their username
      $scope.welcome = "Welcome " + $riffle.user.username();
      
      $scope.signout = function() {
        $state.go("login");
        // Disconnect from Exis when they sign out
        $riffle.leave();
      }

      // Subscribe for all messages we receive
      $riffle.subscribe('exisChat', $riffle.want(function receiveMsg(msg) {
        msg.received = true;
        displayMsg(msg);
      }, {username: String, msg: String}));

      // Subscribe for new users that joined a room
      $riffle.subscribe('exisChat', $riffle.want(function joinEvent(user){
        var msg ={ username: user, join: true };
        displayMsg(msg);
      }, String));

      // Send messages
      $scope.sendMsg = function(text){
        var msg = {username: $riffle.user.username(), msg: text}
        $riffle.publish('exisChat', msg);
        $scope.input.msg = "";
        displayMsg(msg);
      }

      // Display messages
      function displayMsg(msg){
        $scope.msgs.push(msg);
        $ionicScrollDelegate.scrollBottom();
      }
  });
});
