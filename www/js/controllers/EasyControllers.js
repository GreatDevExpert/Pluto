/**
 * Created by owl on 5/24/16.
 */
app.controller('ForgotController', function($cordovaSQLite) {

    $cordovaSQLite.execute(db, "select * from messages").then(function(res) {

    })

}).controller('SplashController', function($cordovaSQLite) {



}).controller('WelcomeScreenController', function($scope) {

    var user_data = JSON.parse(localStorage.getItem('user_data'));
    $scope.first_name = user_data.first_name;

});