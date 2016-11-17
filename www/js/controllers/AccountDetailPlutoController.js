/**
 * Created by owl on 5/24/16.
 */



app.controller('AccountDetailPlutoController', function($scope, $ionicPopup, $state, $cordovaSQLite, $rootScope, $ionicLoading, $ionicHistory, $stateParams) {
    $scope.selectedIndex = -1;
    $scope.firstInput = true;

    $scope.options = {
        visible: false,
        hideOnOutsideClick: false,
        leftControl: '.',
        rightControl: '&#8592;',
        onKeyPress: function(value, source)
        {
            $scope.options.visible = true;
            if (source === 'LEFT_CONTROL')
            {
                if ($scope.firstInput)
                    $scope.number = '0';
                else if ($scope.number.indexOf('.') === -1) {
                    $scope.number += value;
                }

                $scope.firstInput = false;
            }
            else if (source === 'RIGHT_CONTROL')
            {
                if ($scope.firstInput)
                    $scope.number = '0';
                else
                    $scope.number = $scope.number.substr(0, $scope.number.length - 1);

                if ($scope.number.length == 0) $scope.number = '0';

                $scope.firstInput = false;
            }
            else if (source === 'NUMERIC_KEY')
            {
                if ($scope.firstInput || $scope.number == '0') $scope.number = '';

                $scope.number += value;
                $scope.firstInput = false;
            }
        }
    };

    $scope.$on('$ionicView.beforeEnter', function(e,data){
        $scope.$root.showMenuIcon = false;
    });

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

    $("#account_detail #back_button").off().click(function()
    {
        $ionicHistory.goBack();
    });

    $("#assign_pltuo_saving").off().click(function() {
        $("#assign_savings_dialog").css('display', '');
    });

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        var timeNow = new Date();

        if (toState.name != 'account_detail_pluto') return;

        console.log(localStorage.getItem('tutorial_pluto_assign_first'));
        if (localStorage.getItem('tutorial_pluto_assign_first') != 'no')
        {
            localStorage.setItem('tutorial_pluto_assign_first', 'no');
            $("#tutorial_pluto_assign").css('display', '');

        }



        $scope.number = 0;
        $scope.getAmountValue = function (a, b) {
            if (typeof a == 'object') ;
            else a = {amount: Number(a)};

            if (b == 1)
            {
                if (a.amount < 0) return '$' + (-a.amount);
                else return '$' + a.amount ;
            }

            if (a.amount < 0) return '-$' + (-a.amount);
            else return '$' + a.amount;
        };


        $scope.onClickItem = function (ind, obj) {
            $scope.selectedIndex = ind;
            $("#assign_button_in_pluto_savings").prop('disabled', false);
            localStorage.setItem('selected_pluto_save_index', "" + ind);
        };

        //Refresh page after status has been changed
        var refreshPage = function() {
            var allTransactions = [];

            var list = [];
            for (var i in globalPluto) {
                var goal = findElementById(globalGoals, globalPluto[i]._goal);
                list.push({name: goal.name, amount: goal.amount});
            }
            $scope.list = list;




            var goals = [], oldGoals = [], myGoalIDs = [], myPlutos = [], spentPlutoAmount = 0, totalExtra = 0;
            var myGoalArray = {};

            //Filtering the current available goals and completed/finished goals
            for (i in globalGoals) {
                if (typeof(globalGoals[i].deadline) === 'undefined' || globalGoals[i].deadline == null || globalGoals[i].deadline == "" || new Date(globalGoals[i].deadline).getTime() >= new Date().getTime()) {
                    goals.push(globalGoals[i]);
                }
                else oldGoals.push(globalGoals[i]);

                myGoalIDs.push(globalGoals[i]._id);
                myGoalArray[globalGoals[i]._id]  = globalGoals[i].name;
            }

            //Calculating the pluto amount
            for (i in globalPluto)
            {
                if (myGoalIDs.indexOf(globalPluto[i]._goal) > -1) {
                    myPlutos.push([globalPluto[i], myGoalArray[globalPluto[i]._goal]]);
                    spentPlutoAmount += max(globalPluto[i].amount, 0);
                }
            }

            $scope.goals = goals;
            $scope.myPlutos = myPlutos;

            //Calculating the assigned & unassigned amount of pluto savings for each finished goal
            for (index in oldGoals) {

                var goalID = oldGoals[index]._id;
                var goal = oldGoals[index];
                var allchallenges = [];
                var a = [];



                //Getting the challenges of the given goal
                for (var j = 0; j < globalChallenges.length; j++)
                {
                    if (globalChallenges[j]._goals[0].indexOf(goalID) > -1)
                        a.push(globalChallenges[j]);
                }


                a.sort(function(b,c) {
                    return new Date(b.createdAt).getTime() - new Date(c.createdAt).getTime();
                });

                allchallenges = a;

                var mytransactions = globalTransactions;
                var totalSum = 0;


                //Calculating the income of the challenges
                for (var i = 0; i < allchallenges.length; i++) {
                    if (new Date(allchallenges[i].createdAt).getWeek() <= timeNow.getWeek()) {
                        var challenge1 = allchallenges[i];

                        var subTotalConsumed = 0;
                        for (var j = 0; j < mytransactions.length; j++) {

                            if (new Date(mytransactions[j].date).getWeek() == new Date(challenge1.createdAt).getWeek()) {// && mytransactions[j].date >= challenge1.createdAt.substr(0, 10)) {
                                subTotalConsumed += max(0, mytransactions[j].amount);
                            }
                        }
                        if (subTotalConsumed < challenge1.amount  && subTotalConsumed > 0) totalSum += (challenge1.amount - subTotalConsumed);

                    }

                }

                //Plus the pluto saving amount
                totalSum += considerPlutoSaving(goal._id);

                totalExtra += totalSum;

            }

            $scope.number = String(totalExtra - spentPlutoAmount);
            $("#total_dollar_in_account_detail_pluto").html($scope.getAmountValue(totalExtra));
            $("#unassigned_value_in_pluto").html($scope.getAmountValue(totalExtra - spentPlutoAmount));
            $("#assigned_value_in_pluto").html($scope.getAmountValue(spentPlutoAmount));

            $scope.totalExtra = totalExtra;
            $scope.spentPlutoAmount = spentPlutoAmount;


        };

        refreshPage();

        $("#close_area_in_pluto").off().click(function()
        {
            $scope.options.visible = false;
            $("#assign_savings_dialog").css('display', 'none');
        });

        $("#close_area_in_pluto *").off().click(function()
        {
            $scope.options.visible = false;
            $("#assign_savings_dialog").css('display', 'none');
        });


        //When assign button is clicked
        $scope.onClickAssignButton = function () {

            if (Number($scope.number) <= 0) return;

            if (Number($scope.number) > $scope.totalExtra - $scope.spentPlutoAmount)
            {
                showAlert($scope, $ionicPopup, "Error", "You entered the number greater than available amount");
                return;
            }

            $ionicLoading.show({
                template: "Processing..."
            });


            var formData = {
                token: localStorage.getItem('user_token'),
                _goal: $scope.goals[Number(localStorage.getItem('selected_pluto_save_index'))]._id,
                amount: Number($scope.number)
            };

            $.ajax({
                url: WEBSERVICE_URL_PREFIX + 'unassigneds',
                data: formData,
                timeout: 10000,
                method: "POST"
            }).success(function (a, b, xhr) {


                    console.log(a, xhr);
                    if (b == 'success') {
                        if (a.success == true) {

                            //Reload all the data from the backend
                            clearInterval(loadingTimer);

                            loadingTimer = setInterval(function () {
                                loadAllData($cordovaSQLite, $state)
                            }, 25000);

                            loadAllData($cordovaSQLite, $state, true, $ionicLoading, function () {
                                var list = [];
                                for (i in globalPluto) {
                                    var goal = findElementById(globalGoals, globalPluto[i]._goal);
                                    list.push({name: goal.name, amount: goal.amount});
                                }
                                $scope.list = list;
                                $scope.$apply();
                                $ionicLoading.hide();
                            });


                        } else {
                            $ionicLoading.hide();
                            showAlert($scope, $ionicPopup, 'Failure', 'Failed to assign savings!', 'alert');
                        }
                    } else {
                        $ionicLoading.hide();
                        showAlert($scope, $ionicPopup, 'Failure', 'Bad network status!', 'alert');
                    }
                })
                .error(function (a, b, xhr) {
                    $ionicLoading.hide();
                    showAlert($scope, $ionicPopup, 'Failure', 'Unexpected network problem!', 'alert');
                });
        };
    });

    $("#more_bank").off().click(function() {
        $state.go('linkbankaccount');
    });

    $scope.showKeyboard = function()
    {
        $scope.firstInput = true;
        $scope.options.visible = !($scope.options.visible);
    };

    $("#assign_savings_dialog").off().click(function() {
        $scope.options.visible = false;
    });
});