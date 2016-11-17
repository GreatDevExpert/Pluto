/**
 * Created by owl on 5/24/16.
 */
app.controller('TransactionDetailController', function($scope, $stateParams, $ionicPopup, $state, $cordovaSQLite,$ionicActionSheet, $ionicLoading, $ionicHistory) {


    $scope.getCategoryIcon = function(a)
    {
        switch (a)
        {
            case 'Food and Drink':
                return 'img/Transactions/Food_Drinks.png';
            case 'Travel':
                return 'img/Transactions/Transportation.png';
            case 'Shops':
                return 'img/Transactions/Shopping.png';

        }
        return 'img/Transactions/Other.png';
    };


    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {


        //Validate the current page
        if (toState.name == 'transaction_detail') {}
        else
        {
            return;
        }


        //Back button event
        $("#transaction_detail_page #back_button").off().click(function () {
            //if (($stateParams.challengeID || toParams.challengeID) == null)
            if (localStorage.getItem('transaction_detail') == 'menu.transactions')
                $state.go('menu.transactions', {category:$stateParams.categoryID || toParams.categoryID});
            else if (localStorage.getItem('transaction_detail') == 'challenge_detail')
                $state.go('menu.challenge_detail', {challengeID : ($stateParams.challengeID || toParams.challengeID)});
            return;
        });

        //Edit transaction detail
        $("#transaction_detail_page #edit_this_transaction").off().click(function()
        {
            localStorage.setItem('transaction_detail_edit', 'transaction_detail');
            $state.go('transaction_detail_edit', {transactionID : $stateParams.transactionID || toParams.transactionID, challengeID : $stateParams.challengeID || toParams.challengeID, categoryID : $stateParams.categoryID || toParams.categoryID}, {reload:true});
        });



        //Show the actionsheet when deleting the transaction
        $scope.showActionSheet = function () {
            $ionicActionSheet.show({
                buttons: [{
                    text: "Yes"
                }],
                cancelText: "No",
                cancel: function () {

                },
                buttonClicked: function (index) {

                    $ionicLoading.show({template: "Deleting..."});

                    $.ajax({
                        url: WEBSERVICE_URL_PREFIX + 'transactions/' + ($stateParams.transactionID || toParams.transactionID),
                        data: {token: localStorage.getItem('user_token')},
                        timeout: 10000,
                        method: "DELETE"
                    }).success(function(a, b) {

                        $ionicLoading.hide();

                        if (b == 'success') {
                            if (!($stateParams.challengeID || toParams.challengeID))
                                $state.go('menu.transactions', {category:$stateParams.categoryID || toParams.categoryID});
                            else
                                $state.go('menu.challenge_detail', {challengeID : ($stateParams.challengeID || toParams.challengeID)});
                        } else
                            showAlert($scope, $ionicPopup, 'Error', "Failed to delete transaction");

                    }).error(function(a, b) {

                        $ionicLoading.hide();
                        showAlert($scope, $ionicPopup, 'Error', "Failed to delete transaction");
                    });



                    return true;
                }
            })
        };


        $("#transaction_detail_page #delete_button").off().click(function () {
            $scope.showActionSheet();
            return;
        });

        $ionicLoading.show({template : "Please wait..."});

        //Refresh the page
        var refresh = function() {
            $scope.transaction = findElementById(globalTransactions, $stateParams.transactionID || toParams.transactionID || "bzMrqrBAmxhdPJKR055nhPm68y4kpzfxwRM65");
            $scope.price = $scope.transaction.amount >= 0 ? '$' + getTransactionAmountString(Number($scope.transaction.amount)) : '-$' + getTransactionAmountString(Number(-$scope.transaction.amount));
            //$scope.where = $scope.transaction.name; //$scope.transaction.meta.location.address;
            $("#transaction_detail_page #where").val($scope.transaction.name);
            $("#transaction_detail_page #price").val($scope.price);
            $scope.when = dateFormat(new Date($scope.transaction.date), "ddd, mmm dd yyyy");
            $("#transaction_detail_page #when").val($scope.when);
            var account = findElementById(globalAccounts, $scope.transaction._account);
            //$scope.account = account.institution_type;
            $scope.account = account.meta.name + ' ' + account.meta.number;
            $("#transaction_detail_page #account").val($scope.account);
            $ionicLoading.hide();
        };


        refresh();

    });
})