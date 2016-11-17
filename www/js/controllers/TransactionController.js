/**
 * Created by owl on 5/24/16.
 */

app.controller('TransactionController', function($ionicListDelegate, $ionicNavBarDelegate, $rootScope, $scope, $ionicPopup, $state, $cordovaSQLite, $ionicActionSheet, $ionicLoading, $ionicHistory, $stateParams) {

    //$ionicLoading.hide();
    $scope.$on('$ionicView.afterEnter', function (scopes, states)
    {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    });

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (toState.name != 'menu.transactions') return;

        //Show tutorial

        $ionicLoading.show({template: "Please wait"});

        $ionicNavBarDelegate.showBackButton(false);



        var categoryValue = $stateParams.category || toParams.category || "All";

        if (fromState.name == 'transaction_detail')
            categoryValue = fromParams.categoryID;

        //Show the dollar Value in some format
        $scope.getDollarValue = function (a, pending) {
            var pendingString = '';
            if (pending == true) pendingString = ' (Pending)';
            if (a < 0) return '$' + getTransactionAmountString(Number(-a)) + pendingString;
            return '$' + getTransactionAmountString(Number(a)) + pendingString;
        };


        //Return the image path of the category
        $scope.getCategoryName = function (a) {
            switch (a) {
                case 'Food and Drink':
                    return 'img/assets/food_and_drink_category.png';
                case 'Travel':
                    return 'img/assets/travel_category.png';
                case 'Shops':
                    return 'img/assets/shopping_category.png';

            }
            return 'img/assets/other_category.png';
        };


        //Delete transaction
        $scope.deleteTransaction = function (id) {
            var tID = id._id;
            $ionicActionSheet.show({
                buttons: [{
                    text: "Yes"
                }],
                titleText: "Are you sure to delete this transaction?",
                cancelText: "No",
                cancel: function () {

                },
                buttonClicked: function (index) {

                    $ionicLoading.show({template: "Deleting..."});

                    $.ajax({
                        url: WEBSERVICE_URL_PREFIX + 'transactions/' + tID,
                        data: {token: localStorage.getItem('user_token')},
                        timeout: 10000,
                        method: "DELETE"
                    }).success(function (a, b) {


                            if (b == 'success') {
                                if (a.success == true) {
                                    $ionicHistory.goBack();
                                } else {
                                    $ionicLoading.hide();
                                }
                            } else {
                                $ionicLoading.hide();

                            }
                        })
                        .error(function (a, b) {
                            $ionicLoading.hide();

                        });
                    return true;
                }
            });
        };

        $scope.allTransactions = [];


        //Refresh the page (when selecting the category)
        $scope.refreshPage = function (category) {
            category = category || 'All';

            $ionicLoading.show({template: "Please wait..."});
            setTimeout(function() {
                globalTransactions.sort(function (b, a) {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                });


                var todayString = dateFormat(new Date(), "ddd, mmm dd yyyy").toUpperCase();
                var yesterdayString = dateFormat(new Date(), "ddd, mmm dd yyyy").toUpperCase();

                var alltransactions = [];
                var dayStringArray = [];
                var prevString = '';

                //Group by the date of transactions
                for (var i = 0; i < globalTransactions.length; i++) {
                    var flag = 0;

                    if (typeof(globalTransactions[i].category) === 'undefined') globalTransactions[i].category = [""];
                    if (category == 'All') flag = 1;
                    else if (category != 'Other' && category == globalTransactions[i].category[0]) flag = 1;
                    else if (category == 'Other' && ['Food and Drink', 'Shops', 'Travel'].indexOf(globalTransactions[i].category[0]) == -1) flag = 1;

                    if (!flag) continue;

                    var dayString = dateFormat(new Date(globalTransactions[i].date), "ddd, mmm dd yyyy").toUpperCase();
                    if (dayString == todayString) dayString = 'TODAY';
                    else if (dayString == yesterdayString) dayString = 'YESTERDAY';
                    else dayString = dayString.toUpperCase();

                    if (prevString == dayString && alltransactions[alltransactions.length-1][alltransactions[alltransactions.length-1].length - 1]._id != globalTransactions[i]._id)
                        alltransactions[alltransactions.length - 1].push(globalTransactions[i]);
                    else {
                        alltransactions.push([globalTransactions[i]]);
                        dayStringArray.push(dayString);
                    }

                    prevString = dayString;
                }

                $scope.allTransactionsData = alltransactions;
                $scope.dayStringArray = dayStringArray;



                //View transaction detail
                $scope.viewTransaction = function (id) {
                    localStorage.setItem('transaction_detail', 'menu.transactions');
                    $state.go('transaction_detail', {transactionID: id._id, categoryID : category}, {reload: true});
                    console.log('view');
                    return;
                };

                //Edit transaction detail
                $scope.editTransaction = function(id)
                {
                    $ionicListDelegate.closeOptionButtons();
                    localStorage.setItem('transaction_detail_edit', 'menu.transactions');
                    $state.go('transaction_detail_edit', {transactionID: id._id, categoryID : category}, {reload: true});
                    console.log('edit');
                    console.log({transactionID: id._id, categoryID : category});
                    //$state.go('transaction_detail_edit', {categoryID : $stateParams.categoryID || toParams.categoryID, transactionID : $stateParams.transactionID || toParams.transactionID || "bzMrqrBAmxhdPJKR055nhPm68y4kpzfxwRM65"})
                };


                $ionicLoading.hide();
            }, 1);

        };


        //Select by category

        $("#transactions div.challenge").off().click(function () {
            $ionicLoading.show({template: "Loading"});
            var id = $(this).attr('id').replace(/_/gi, ' ');
            $scope.refreshPage(id);

            $(this).parent().find("*").removeClass('selected');
            $(this).find('*').addClass('selected');
            $ionicLoading.hide();
        });

        $("#transactions div.challenge").each(function (ind, ele) {
            var id = $(this).attr('id').replace(/_/gi, ' ');

            if (id == categoryValue)
                $(this).click();
        });

        $ionicLoading.hide();

    });



});