/**
 * Created by owl on 5/24/16.
 */

app.controller('InsightsController', function($scope, $stateParams, $ionicPopup, $state, $cordovaSQLite, $ionicLoading, $ionicHistory) {

    var slider;


    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $("#insights #back_button").off().click(function () {
            $state.go('menu.accounts');
        });


        if (toState.name != 'insights') return;

        $("#insights #loadedTime").html('Updated: ' + loadedTime);


        var items = [];
        for (var i in globalInsights)
        {
            if (new Date(globalInsights[i].createdAt).getTime() >= new Date().getTime() - 86400000)
                items.push({'type' : globalInsights[i].type.substr(0, 1) == 'c' ? '#CHALLENGE' : '#GOAL', 'title' : globalInsights[i].title, 'createdAt' : globalInsights[i].createdAt});
            console.log(globalInsights[i].createdAt);
        }

        items.sort(function(a,b) {
            return new Date(b).getTime() - new Date(a).getTime();
        })
        $scope.items = items;
        console.log(items);
        console.log(globalInsights);
    });
})