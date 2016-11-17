/**
 * Created by owl on 5/24/16.
 */

app.controller('GoalListController', function($scope, $state, $ionicHistory, $ionicPopup) {

    $scope.$on('$ionicView.afterEnter', function (scopes, states)
    {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    });


    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $scope.ongoingList = [];
        $scope.pastList = [];

        if (toState.name == 'menu.goal_list') {}
        else return;

        if (localStorage.getItem('tutorial_goal_first') != 'no')
        {
            localStorage.setItem('tutorial_goal_first', 'no');
            $("#tutorial_goal").css('display', '');
        }


        //If any goals
        if (globalGoals) {
            //Show the goals into the list
            for (var i = 0; i < globalGoals.length; i++) {
                var goal = JSON.parse(JSON.stringify(globalGoals[i]));


                //Calculate the progress of the goals
                var allchallenges = [], challenges = [];

                for (var j = 0; j < globalChallenges.length; j++)
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


                var totalSum = 0;


                for (j = 0; j < allchallenges.length; j++) {
                    if (new Date(allchallenges[j].createdAt).getWeek() < new Date().getWeek()) {
                        var challenge1 = allchallenges[j];

                        var subTotalConsumed = 0;
                        for (var k = 0; k < transactions.length; k++) {

                            if (new Date(transactions[k].date).getWeek() == new Date(challenge1.createdAt).getWeek()) {
                                subTotalConsumed += max(0, transactions[k].amount);
                            }
                        }
                        if (subTotalConsumed < challenge1.amount  && subTotalConsumed > 0) totalSum += (challenge1.amount - subTotalConsumed);
                    }
                }

                //considering the pluto savings with the calculated goal progress
                totalSum += considerPlutoSaving(goal._id);

                goal.currentScore = "$" + totalSum + " / $" + goal.amount;

                //Add the calculated data to the goal list

                if (typeof goal.deadline === 'undefined' || goal.deadline == null || goal.deadline == "" || new Date(goal.deadline).getTime() > new Date().getTime()) {
                    $scope.ongoingList.push(goal);
                }
                else
                    $scope.pastList.push(goal);
            }

            $scope.pastList.sort(function(a,b){
                return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
            });
        }

        //Edit the goal Event
        $("#add_new_goal_button_in_goallist").off().click(function () {

            $state.go('goal_edit');
            localStorage.setItem('goal_edit', 'goal_list');

        });

        //Create the new goal Event
        $scope.gotoNewgoals = function () {
            if ($scope.ongoingList.length > 0) //If existing goal
            {
                showAlert($scope, $ionicPopup, 'Error', "Ongoing goal already exists", 'alert');
                return;
            }
            else { //Otherwise
                localStorage.removeItem('current_goal_id');
                $state.go('create_goal');
                return;
            }
            $state.go('goal_edit');
            localStorage.setItem('goal_edit', 'goal_list');
        };


        //Open the goal details
        $scope.openGoal = function (goalID) {
            $state.go('goal_edit', {goalID: goalID}, {reload: true});
            localStorage.setItem('goal_edit', 'goal_list');
        };
    });
});