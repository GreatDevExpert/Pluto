/**
 * Created by owl on 5/24/16.
 */

app.controller('AccountController', function($scope, $ionicPopup, $state, $cordovaSQLite, $ionicLoading, $ionicHistory, $stateParams) {
    //$ionicLoading.hide();

    //Clearing the history
    $scope.$on('$ionicView.afterEnter', function (scopes, states)
    {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    });

    //Showing the left menu icon
    $scope.$on('$ionicView.beforeEnter', function(e,data){
        $scope.$root.showMenuIcon = false;
    });

    //When entered the screen
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (toState.name != 'menu.accounts') return;

        if (localStorage.getItem('tutorial_account_first') != 'no') //Showing the tutorial
        {
            localStorage.setItem('tutorial_account_first', 'no');
            $("#tutorial_account").css('display', '');
        }


        $scope.gotoInsights =function() { //Go to Insights screen
            $state.go('insights');
        };


        var allBanks = [];
        $ionicLoading.show({template: "Loading..."});


        //Initializing the bank data from the global bank data

        for (var i = 0; i < globalAccounts.length; i++)

        {
            var total = globalAccounts[i].balance.current;
            var bank = {id : globalAccounts[i]._id, name: globalAccounts[i].meta['name'] + ' ( ' + globalAccounts[i].meta['number'] + ' )', totalAmount: (total) >= 0 ? '$' + getTransactionAmountString(total) : '-$' + getTransactionAmountString(-1 * (total))};
            allBanks.push(bank);
        }
       /*

        for (var i = 0; i < globalBanks.length; i++)
        {
            var total = 0;
            for (var j = 0; j < globalAccounts.length; j++)
            {
                if (globalAccounts[j]._bank == globalBanks[i]._id)
                {
                    total += globalAccounts[j].balance.current;
                }
            }
            var bank = {id : globalBanks[i]._id, name : globalBanks[i].institution_type,
                totalAmount: ((total) >= 0 ? '$' + getTransactionAmountString(total) : '-$' + getTransactionAmountString(-1 * (total)))};
            allBanks.push(bank);
        }
*/
        $scope.allBanks = allBanks;
        $ionicLoading.hide();

        $scope.goPlutoLink = function() //Event for transitioning to account pluto detail screen
        {
            $state.go('account_detail_pluto');
        };

        $scope.goLink = function(bankIndex) //Event for transitioning to account detail screen
        {
            $state.go('account_detail', {bankID : $scope.allBanks[bankIndex].id});
        };



        if (globalGoals) {  //If there is currently available goal.
            var totalSum = 0;
            for ( i = 0; i < globalGoals.length; i++) {  //Calculate the goal progress
                var goal = JSON.parse(JSON.stringify(globalGoals[i]));

                var allchallenges = [], challenges = [];

                for ( j = 0; j < globalChallenges.length; j++)
                    if (JSON.parse(globalChallenges[j]._goals).indexOf(goal._id) > -1)
                        allchallenges.push(globalChallenges[j]);

                allchallenges.sort(function (a, b) {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });



                for (j = 0; j < allchallenges.length; j++) {
                    if (new Date(allchallenges[j].createdAt).getWeek() == new Date().getWeek())
                        challenges.push(allchallenges[j]);
                }


                var banksData = [];
                for (j = 0; j < globalBanks.length; j++)
                    banksData.push(globalBanks[j]._id);

                var transactions = [];
                for (j = 0; j < globalTransactions.length; j++)
                    if ((new Date(globalTransactions[j].date)).getTime() > (new Date(allchallenges[0].createdAt)).getTime())
                        if (banksData.indexOf(globalTransactions[j]['_bank']) > -1)
                            transactions.push(globalTransactions[j]);




                //Calculating the savings from challenges

                for (j = 0; j < allchallenges.length; j++) {
                    if (new Date(allchallenges[j].createdAt).getWeek() < new Date().getWeek()) {
                        var challenge1 = allchallenges[j];

                        var subTotalConsumed = 0;
                        for (var k = 0; k < transactions.length; k++) {

                            if (new Date(transactions[k].date).getWeek() == new Date(challenge1.createdAt).getWeek()) {
                                subTotalConsumed += max(0, transactions[k].amount);
                            }
                        }
                        if (subTotalConsumed < challenge1.amount && subTotalConsumed > 0)
                            totalSum += (challenge1.amount - subTotalConsumed);
                    }
                }


                totalSum += considerPlutoSaving(goal._id); // calculate the plus of the assigned from pluto savings
                console.log(totalSum);
            }
            $scope.totalSum = totalSum >= 0 ? '$ '+ getTransactionAmountString(totalSum) : '-$ ' + getTransactionAmountString(-totalSum);
        }
        else $scope.totalSum = '$ 0.00';


    });

    $("#more_bank").off().click(function() { //Go to more link
        $state.go('linkbankaccount');
    });


});