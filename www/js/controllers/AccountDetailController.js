/**
 * Created by owl on 5/24/16.
 */

app.controller('AccountDetailController', function($scope, $ionicPopup, $state, $cordovaSQLite, $rootScope, $ionicLoading, $ionicHistory, $stateParams) {



    $scope.$on('$ionicView.beforeEnter', function(e,data){
        $scope.$root.showMenuIcon = false;
    });

    //Returning the category icons from the category value
    $scope.getCategoryIcon = function(a)
    {
        var b = a.category[0];
        switch (b)
        {
            case 'Food and Drink':
                return 'img/assets/food_and_drink_category.png';
            case 'Travel':
                return 'img/assets/travel_category.png';
            case 'Shops':
                return 'img/assets/shopping_category.png';

        }
        return 'img/assets/other_category.png';
    };


    //Applying back button event
    $("#account_detail #back_button").off().click(function()
    {
        $ionicHistory.goBack();
    });

    //Get the string format and proper color of the dollar value

    $scope.getAmountValue = function(a)
    {
        if (a.amount < 0) return '$ ' + (-a.amount) + "";
        else return '$ ' + a.amount + "";
    };

    $scope.getColor = function(a)
    {
        if (a.amount >= 0) return {color: "rgb(190,0,0)"};
        else return {color:"rgb(96,190,204)"};
    };

    //Event of the account detail page
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (toState.name != 'account_detail') return;

        var bankID = $stateParams.bankID || toParams.bankID;


        var allTransactions = [];
        $ionicLoading.show({template: "Loading..."});

        for (var j = 0; j < globalTransactions.length; j++)
            if (bankID == globalTransactions[j]._account)
            {
                allTransactions.push(globalTransactions[j]);
            }

        //Getting the bank information and sort the transaction data based on the transaction date
        var bank = findElementById(globalAccounts, bankID);
        allTransactions.sort(function(a,b){
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        var total = bank.balance.current;


        $("#account_detail #total_dollar_in_account_detail").html(total);
        $("#account_detail #view_title").html(bank.institution_type);

        $scope.allTransactions = allTransactions;

        $ionicLoading.hide();


        if (!$rootScope.bankLoadingStatus)
            $rootScope.bankLoadingStatus = {};


        $("#account_detail #unlink_button").off().click(function()
        {
            $ionicLoading.show({template: "Please wait..."});

            var account = findElementById(globalAccounts, bankID);
            $.ajax({
                url: WEBSERVICE_URL_PREFIX + 'banks/' + account._bank,
                data: {token: localStorage.getItem('user_token')},
                timeout: 10000,
                method: "DELETE"
            }).success(function(a, b) {


                if (b == 'success' && a.success == true) {


                    $rootScope.bankLoadingStatus[bank.institution_type] = '';
                    loadAllData($cordovaSQLite, $state, false, $ionicLoading, function()
                    {
                        $ionicLoading.hide();
                        $ionicHistory.goBack();
                    });
                } else {
                    $rootScope.bankLoadingStatus[bank.institution_type] = 'failed';
                    $ionicLoading.hide();
                }

                $rootScope.$apply();

            }).error(function(a, b) {
                $rootScope.bankLoadingStatus[bank.institution_type] = 'failed';
                $rootScope.$apply();
                $ionicLoading.hide();
            });
        });
    });

    $("#more_bank").off().click(function() {
        $state.go('linkbankaccount');
    });


});