var WEBSERVICE_URL_PREFIX = 'http://ec2-54-210-243-213.compute-1.amazonaws.com:3300/api/v1/';
var db = null;
var currentTime = null;
var loadingTimer = null;
var weeklyAverage = {
  shops: 0,
  transportation: 0,
  foodanddrink: 0
};

var globalBanks = null, globalPluto = null,
    globalGoals= null, globalChallenges = null,
    globalTransactions = null, globalAccounts = null,
    globalInsights = null, loadedTime = '';

var loadingGlobalData = false;
var app = angular.module('Pluto', ['ionic', 'ngCordova', 'ngRoute', 'ngCordova.plugins.camera', 'jrCrop', 'dbaq.ionNumericKeyboard']);


localStorage.setItem('loadingGlobalData', 'false');

app.run(function($ionicPlatform, $cordovaSQLite, $state, $ionicConfig, $ionicLoading) {
  $ionicPlatform.ready(function() {

    if (window.cordova) {

      //Push notification
      var push = new Ionic.Push({
        "debug": true,
        "onNotification": function (notification) {
          var payload = notification.payload;
          if (payload.type == 'challenge') { // When challenge push notification
            if (globalChallenges && globalChallenges.length > 0) {
              localStorage.setItem('current_goal_id', JSON.parse(payload.data._goals)[0]);
              localStorage.setItem('push_text', payload.text.replace('away', 'away<br>'));
              $state.go('menu.challenge_detail', {challengeID: payload.data._id, fromPush: true}, {reload: true});
            }
            else {
              loadingTimer = setInterval(function () {
                loadAllData($cordovaSQLite, $state)
              }, 25000);

              loadAllData($cordovaSQLite, $state, true, $ionicLoading, function () {
                localStorage.setItem('current_goal_id', JSON.parse(payload.data._goals)[0]);
                localStorage.setItem('push_text', payload.text.replace('away', 'away<br>'));
                $state.go('menu.challenge_detail', {challengeID: payload.data._id, fromPush: true}, {reload: true});
              });
            }
          }
          else if (payload.type == 'goal') { // When goal push notification
            if (globalGoals && globalGoals.length > 0) {
              localStorage.setItem('current_goal_id', payload.data._id);
              localStorage.setItem('push_text', payload.text.replace('away', 'away<br>'));
              $state.go('goal_edit', {goalID: payload.data._id, fromPush: true}, {reload: true});
            }
            else {
              loadingTimer = setInterval(function () {
                loadAllData($cordovaSQLite, $state)
              }, 25000);

              loadAllData($cordovaSQLite, $state, true, $ionicLoading, function () {
                localStorage.setItem('current_goal_id', payload.data._id);
                localStorage.setItem('push_text', payload.text.replace('away', 'away<br>'));
                $state.go('goal_edit', {goalID: payload.data._id, fromPush: true}, {reload: true});
              });
            }
          }
          console.log(notification, payload);
        },
        "onRegister": function (data) {
          console.log(data.token);
        }
      });
      $ionicLoading.show({});

      push.register(function (token) {
        console.log(typeof token);
        $ionicLoading.hide();
        push.saveToken(token);
        localStorage.setItem('device_token', token.token);
        console.log("Device token: " + JSON.stringify(token));
      });
    }
    else $ionicLoading.hide();

    $ionicConfig.views.swipeBackEnabled(false);
    $ionicConfig.views.maxCache(50);


    //Initializing the values
    localStorage.setItem('user_token', '');
    localStorage.setItem('user_id', '');

    console.log('set no token');


    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();

    }

    //Auto login within 1 second
    setTimeout(function() {
      $state.go('login');
    }, 1000);


    //Arranging the position of plaid popup

    setTimeout(function() {
      var $head = $("#plaid-link-iframe").contents().find('head');

      $head.append("<style type = 'text/css'>#plaid-link-container{top:120px;} .mobile .outrigger-resend{top:540px}</style>");
    }, 3000);


  });
});


