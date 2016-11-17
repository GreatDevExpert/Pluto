/**
 * Created by owl on 5/24/16.
 */
app.controller('PickChallengeController', function($scope, $ionicPopup, $stateParams, $state, $cordovaSQLite, $ionicLoading, $ionicHistory) {

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        console.log(fromState.name );
        if (toState.name != 'pick_challenge') return;

        var refreshPage = function() {

            //Back button clicked

            $("#pick_challenge #back_button").off().click(function () {
                if (localStorage.getItem('pick_challenge') == 'goal_edit' || localStorage.getItem('pick_challenge') == 'empty_challenge') {
                    localStorage.setItem('pick_challenge', '');
                    $state.go('goal_edit', {goalID: $stateParams.goalID || toParams.goalID || localStorage.getItem('current_goal_id')}, {reload: true});
                }
                if (fromState.name == 'create_goal')
                {
                    $state.go('create_goal');
                    console.log('going back to create_goal page');
                }
                else
                    $ionicHistory.goBack();
            });


            //Getting the currently active challenges
            var goalID = localStorage.getItem('current_goal_id');
            var goal = JSON.parse(JSON.stringify(findElementById(globalGoals, goalID)));

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


            //Show the "ACTIVE" sign on the active challenges
            for (j = 0; j < challenges.length; j++) {
                $("#pick_challenge .slide[data-category='" + challenges[j]._category + "'] .challenge_active_sign").css('display', '');

            }

            $("#pick_challenge div.slide div.challenge_active_sign").each(function (ind, ele) {

                for (j = 0; j < challenges.length; j++) {

                    if ($(this).parent().parent().data('category') == challenges[j]._category) {
                        $(this).css('display', 'block');

                    }
                }
            });


            //Show the weekly average amount, and period of the new challenge
            for (c in weeklyAverage) {
                document.getElementById(c).innerHTML = '$' + weeklyAverage[c];
                document.getElementById(c + '_weekly').innerHTML = dateFormat(new Date(), 'ddd') == 'Sun' ? 'Sunday' : dateFormat(new Date(), 'ddd') + ' - Sun';
            }

            //Show the focus on the centered category
            var checkSelected = function () {
                var width = ($(window)).width();
                $(".slide").each(function (ind, ele) {
                    if ($(this).offset().left >= 0 && $(this).offset().left < width / 2) {
                        $(this).find('div').addClass('selected');
                        if ((ind - 1) >= 1 && (ind - 1) <= 3)
                            $("#sub_title_area").html((ind - 1) + " of " + 3);
                    } else $(this).find('div').removeClass('selected');
                })
            };

            $ionicLoading.hide();

            // Show the sliding categories
            var jssor_1_options = {
                $AutoPlay: false,
                $SlideWidth: $(window).width() / 10 * 8,
                $Cols: 5,
                $Align: $(window).width() / 10,
                $Loop: false,
                $BulletNavigatorOptions: {
                    $Class: $JssorBulletNavigator$,
                    $ChanceToShow: 3,
                    $AutoCenter: 1
                }
            };


            var jssor_1_slider = new $JssorSlider$("jssor_1", jssor_1_options);
            //$("#jssor_1").css('left', '350px');
            $("#jssor_1").width($(window).width() * 0.8 * 5);
            $("#jssor_1").height($(window).height() / 2);
            $("#jssor_1 > div").width($("#jssor_1").width());
            $("#jssor_1 > div").height($("#jssor_1").height());
            $("#jssor_1 > div > div").width($("#jssor_1").width());
            $("#jssor_1 > div > div").removeClass('centerx_area');
            $("#jssor_1 > div > div").addClass('center_area');
            $("#jssor_1 > div > div").height($(window).height() / 2);
            $("#jssor_1 > div > div").css({
                top: '50%'
                ,
                left: '50%'
            });


            $(".full_height").height($(window).height() / 2);

            //When position changes, focus  the category at the center of the screen
            jssor_1_slider.$On($JssorSlider$.$EVT_POSITION_CHANGE, function (slideIndex, progress) {
                checkSelected();
            });


            //The event of selecting the category.
            document.getElementById("goto_adjust_benchmark").onclick = (function () {

                var width = ($(window)).width();
                $(".slide").each(function (ind, ele) {
                    if ($(this).offset().left >= 0 && $(this).offset().left < width / 2) {
                        if ((ind - 1) >= 1 && (ind - 1) <= 3)
                            $("#sub_title_area").html((ind - 1) + " of " + 3);

                        if ($(this).find('.challenge_active_sign').css('display') == 'none') {
                            localStorage.setItem('current_challenge_category', $(this).data('category'));
                            $state.go('adjust_benchmark', {average: $(this).find('span.average_value').html().substr(1)});
                        }
                        else showAlert($scope, $ionicPopup, 'Error', 'This challenge is already active. Try another one.', 'alert');
                    }
                    else
                        $(this).find('div').removeClass('selected');
                });


            });
        };


        $ionicLoading.show({template: "Calculating data..."});
        if (fromState.name == 'linkbankaccount')
        {
            if (localStorage.getItem('loadingGlobalData') == 'true')
            {
                //Waiting for the updated bank account info to apply to the transactions
                var interval = setInterval(function(){
                    if (localStorage.getItem('loadingGlobalData') == 'false')
                    {
                        if (globalTransactions && globalTransactions.length > 0) {
                            $ionicLoading.hide();
                            for (c in weeklyAverage) {
                                document.getElementById(c).innerHTML = '$' + weeklyAverage[c];
                            }
                            clearInterval(interval);
                            interval = null;


                            loadingTimer = setInterval(function() {
                                loadAllData($cordovaSQLite, $state);
                            }, 25000);
                            refreshPage();

                        }
                    }
                }, 2000);
            }
            else if (globalTransactions == null || globalTransactions.length == 0) {

                //Reload data if transaction data is empty
                if (loadingTimer == null)
                {
                    loadingTimer = setInterval(function() {
                        loadAllData($cordovaSQLite, $state);
                    }, 10000);
                    loadAllData($cordovaSQLite, $state);
                }
                var interval = setInterval(function(){
                    if (localStorage.getItem('loadingGlobalData') == 'false')
                    {
                        if (globalTransactions.length > 0) {
                            $ionicLoading.hide();
                            for (c in weeklyAverage) {
                                document.getElementById(c).innerHTML = '$' + weeklyAverage[c];
                            }
                            clearInterval(interval);
                            interval = null;
                            clearInterval(loadingTimer);
                            loadingTimer = null;

                            loadingTimer = setInterval(function() {
                                loadAllData($cordovaSQLite, $state);
                            }, 25000);

                            refreshPage();
                        }
                    }
                }, 2000);
            }
            else {
                refreshPage();
            }
        }
        else if (fromState.name == 'login')
        {

            //Wait until all the data is fully loaded and then show the data
            var interval = setInterval(function(){
                if (localStorage.getItem('loadingGlobalData') == 'false')
                {
                    $ionicLoading.hide();
                    for (c in weeklyAverage) {
                        document.getElementById(c).innerHTML = '$' + weeklyAverage[c];
                    }
                    clearInterval(interval);
                    interval = null;
                    console.log('erased');
                    refreshPage();
                }
            }, 100);
        }
        else refreshPage();

    });
})