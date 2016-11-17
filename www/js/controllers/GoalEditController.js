/**
 * Created by owl on 5/24/16.
 */
app.controller('GoalEditController', function($scope, $ionicHistory, $state, $ionicPopup, $ionicActionSheet, $ionicLoading, $stateParams) {


    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (toState.name == 'goal_edit') {} //Validating if this is the right page
        else return;

        var goalID =  $stateParams.goalID || toParams.goalID || localStorage.getItem('current_goal_id');


        //When clicked End Goal button
        $scope.endGoal = function(){

            $ionicActionSheet.show({
                buttons: [{
                    text: "Yes"
                }],
                titleText: "Are you sure to end this goal?",
                cancelText: "No",
                cancel: function () {

                },
                buttonClicked: function (index) {

                    //To end the goal, set the deadline of the goal to current datetime.
                    var goal = findElementById(globalGoals, goalID);
                    var time = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
                    goal.deadline = dateFormat(new Date(time), 'yyyy-mm-dd') + 'T' + dateFormat(new Date(time), 'HH:MM:ss') + 'Z';
                    goal['token'] = localStorage.getItem('user_token');

                    $ionicLoading.show({template: "Ending..."});
                    $.ajax({
                        url: WEBSERVICE_URL_PREFIX + 'goals/' + goal._id,
                        data: goal,
                        timeout: 150000,
                        method: ("PUT")

                    }).success(function (a, b) {
                        if (a.success == true)
                        {
                            //Updating the goal deadline to current timestamp
                            $.get(WEBSERVICE_URL_PREFIX + 'goals?token=' + localStorage.getItem('user_token'), function(response, successed) {

                                $ionicLoading.hide();
                                if (successed == 'success' && response && response.success == true)
                                {
                                    var goals = [];
                                    for (c in response.data) {
                                        goals.push(response.data[c]);
                                    }
                                    globalGoals = goals;
                                    $state.go('menu.goal_list');
                                }
                            });


                        }
                        else if (typeof (a.data) !== 'undefined') {

                            $ionicLoading.hide();

                        }
                        else
                        {
                            $ionicLoading.hide();
                            showAlert($scope, $ionicPopup, 'Error', "Error updating goal!");
                        }

                    }).error(function (a, b) {
                        $ionicLoading.hide();
                        showAlert($scope, $ionicPopup, 'Error', "Error updating goal!");
                    });


                    return true;
                }
            });



        };



        //When back button is clicked
        $("#goal_edit #back_button").off().click(function () {

            //Depending on the previous page, the actions are different

            if ((toParams.fromPush || $stateParams.fromPush))
                $state.go('menu.goal_list');
            else if (localStorage.getItem('goal_edit') == 'challenge_detail') {
                $state.go('menu.challenge_detail', {challengeID: localStorage.getItem('goal_edit_from_value')});
                localStorage.setItem('goal_edit', '');
                localStorage.setItem('goal_edit_from_value', '');
            }
            else
                $state.go('menu.goal_list');
        });

        //Go to the page where you can edit the goal details (the same page as create goal page)
        $("#goal_edit #goal_edit_button").off().click(function()
        {
            $state.go('create_goal', {goalID : goalID}, {reload: true});
        });



        //If there are at least existing goals
        if (globalGoals) {
            for (var i = 0; i < globalGoals.length; i++) {
                if (globalGoals[i]._id != goalID) continue;
                //Perform an action if this goal is the one from parameters.

                var goal = JSON.parse(JSON.stringify(globalGoals[i]));

                if (typeof goal.deadline === 'undefined' || goal.deadline == null || goal.deadline == "" || new Date(goal.deadline).getTime() > new Date().getTime()) { //If currently available goal
                    $("#goal_edit #goal_edit_button").css('display', '');
                    $("#goal_edit #add_new").css('display', '');
                    $("#goal_edit #end_goal_button").css('display', '');
                    $("#goal_edit #goal_edit_background_image").css('height', 'calc(100% - 50px)');
                }
                else { //Completed / finished goal?
                    $("#goal_edit #goal_edit_button").css('display', 'none');
                    $("#goal_edit #add_new").css('display', 'none');
                    $("#goal_edit #end_goal_button").css('display', 'none');
                    $("#goal_edit #goal_edit_background_image").css('height', '100%');
                }



                //Showing the currently available challenges
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




                for (j = 0; j < challenges.length; j++) {
                    $("#goal_edit #" + challenges[j]._category.replace(/ /gi, '_') + ".challenge").css('display', '');

                }

                j = 0;
                $("#goal_edit ion-scroll  div.challenge").each(function (ind, ele) {

                    if ($(this).css('display') == 'none') return;
                    $(this).css('left', 3 + (j * 32) + '%');
                    j++;
                    if (typeof goal.deadline === 'undefined' || goal.deadline == null || goal.deadline == "" || new Date(goal.deadline).getTime() > new Date().getTime())

                        $(this).click(function () {
                            if ($(this).attr('id') == 'add_new') {
                                localStorage.setItem('current_goal_id', goalID);
                                localStorage.setItem('pick_challenge', 'goal_edit');
                                $state.go('pick_challenge', {goalID: goalID}, {reload: true});
                            }
                            else {
                                for (j = 0; j < challenges.length; j++) {
                                    if (challenges[j]._category.replace(/ /gi, '_') == $(this).attr('id')) {
                                        localStorage.setItem('current_goal_id', goalID);
                                        $state.go('menu.challenge_detail', {challengeID: challenges[j]._id}, {reload: true});
                                        return;
                                    }
                                }
                            }
                        });
                });


                //Calculating the progress of the goals.

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

                //Considering the pluto savings assigned
                totalSum += considerPlutoSaving(goal._id);



                goal.currentScore = "$" + totalSum + " / $" + goal.amount;
                setTimeout(function() {
                    $('#goal_edit_background_image').css('background-image', "url(" + goal.image_url + ")");
                }, 100);


                $scope.goal = goal;
                $("#goal_name").html(goal.name);
                $("#goal_currentScore").html(goal.currentScore);
                $("#percent_of_goal_in_goal_detail_page").html(Math.round(totalSum * 100.0 / goal.amount) + '%');


                //Draw the arc with rocket progress
                var arc = document.getElementById('canvas_in_goal_detail');
                var ctx = arc.getContext('2d');
                var drawArc = function (currentProgress, possibleProgress) {

                    if (possibleProgress < 0) possibleProgress = 0;
                    if (currentProgress > 1) {
                        currentProgress = 1;
                        possibleProgress = 0;
                    }

                    if (currentProgress + possibleProgress > 1) {
                        possibleProgress = 1 - currentProgress;
                    }
                    ctx.clearRect(0, 0, 1000, 1000);

                    ctx.strokeStyle = "rgb(170,170,170)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(150, 189, 180, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.stroke();


                    var PI = Math.PI;
                    var middleAngle1 = 1.5 * PI - (0.5 - currentProgress) / 0.5 * 0.313 * PI;
                    var middleAngle2 = 1.5 * PI - (0.5 - currentProgress - possibleProgress) / 0.5 * 0.313 * PI;


                    ctx.strokeStyle = "rgb(153,221,221)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();

                    ctx.arc(150, 189, 180, 0, middleAngle1);

                    ctx.stroke();

                    ctx.strokeStyle = "rgb(248,173,78)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(150, 189, 180, middleAngle1, middleAngle2);

                    ctx.stroke();

                    var img = new Image();
                    img.src = 'img/assets/rocket.png';
                    img.onload = function () {
                        if (currentProgress < 0.05) currentProgress = 0.05;
                        if (currentProgress > 0.95) currentProgress = 0.95;
                        var angle = (0.5 - currentProgress) / 0.5 * 0.313 * PI;
                        var x = 150 - Math.sin(angle) * 180;
                        var y = 189 - Math.cos(angle) * 180;
                        ctx.translate(x, y);
                        ctx.rotate(-angle);

                        ctx.drawImage(img, -20, -10, 40, 20);
                        ctx.rotate(angle);
                        ctx.translate(-x, -y);
                    };


                };

                drawArc(totalSum / goal.amount, 0);

                $("#canvas_in_goal_detail").css('-webkit-transform', 'scalex(' + ($(window).width() - 40) / (375 - 40) + ')');
                $("#canvas_in_goal_detail").css('transform', 'scalex(' + ($(window).width() - 40) / (375 - 40) + ')');
            }


        }
    });
});