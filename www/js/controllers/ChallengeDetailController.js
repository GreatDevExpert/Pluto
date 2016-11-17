/**
 * Created by owl on 5/24/16.
 */

app.controller('ChallengeDetailController', function($scope, $ionicListDelegate, $ionicPopup, $state, $cordovaSQLite, $ionicLoading, $ionicHistory, $stateParams) {

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {


        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();


        if (toState.name == 'menu.challenge_detail') {
            $(".menu-content *").each(function(ind, ele) {
                if ($(this).attr('id') == 'challenge_detail' && $(this).css('opacity') == 0)
                {
                    $(this).remove(); //Clearing old pages which contains the same ID of this page
                }
            });
        }
        else //This case is not for challenge_detail page entering
        {
            return;
        }


        //Showing the tutorial if this is first time to enter this screen
        if (localStorage.getItem('tutorial_challenge_first') != 'no')
        {
            localStorage.setItem('tutorial_challenge_first', 'no');
            $("#tutorial_challenge").css('display', '');
        }

        var goalID = localStorage.getItem('current_goal_id');


        //Calculating the available goals
        var availableGoals = [];
        for (var i = 0; i < globalGoals.length; i++)
            if (typeof(globalGoals[i].deadline) === 'undefined' || globalGoals[i].deadline == null || globalGoals[i].deadline == "" || new Date(globalGoals[i].deadline).getTime() >= new Date().getTime())
                availableGoals.push(globalGoals[i]._id);

        if (availableGoals.length == 0) //If no available goal
        {
            console.log(globalGoals);
            $ionicLoading.show({template: 'No available goals'});
            setTimeout(function() {$ionicLoading.hide();}, 2000);
            return;

        }


        //Opening the first available goal if can't find any proper goal in the list
        if (availableGoals.indexOf(goalID) == -1)
            goalID = availableGoals[0];

        //Go to goal_detail page event
        $("#challenge_detail_goto_goal_detail").off().click(function() {
            localStorage.setItem('goal_edit', 'challenge_detail');
            localStorage.setItem('goal_edit_from_value', challenges[$scope.currentIndex]._id);
            $state.go('goal_edit', {goalID: goalID}, {reload:true});
        });
        //Go to goal_detail page event (same as above)
        $("#challenge_detail_goto_goal_detail *").off().click(function() {
            localStorage.setItem('goal_edit', 'challenge_detail');
            localStorage.setItem('goal_edit_from_value', challenges[$scope.currentIndex]._id);
            $state.go('goal_edit', {goalID: goalID}, {reload:true});
        });


        //When editing the challenge (top-right button clicked)
        $scope.editChallenge = function()
        {
            if ($(".right_top_button").html() == 'New Goal') { //New goal button is clicked
                localStorage.setItem('current_goal_id', '');
                $state.go('create_goal');
            }
            else if ($(".right_top_button").html() == 'Add New') { //Add new challenge button is clicked
                localStorage.setItem('current_goal_id', goalID);
                localStorage.setItem('pick_challenge', 'goal_edit');
                $state.go('pick_challenge');
            }
            else if ($(".right_top_button").html() == 'Edit') { //Edit button is clicked
                var challengeID = challenges[$scope.currentIndex]._id;
                localStorage.setItem('current_challenge_category', challenges[$scope.currentIndex]._category);
                $state.go('adjust_benchmark', {challengeID: challengeID}, {reload: true});
            }
            else { //Unexpected status
                $ionicLoading.show({template: "Un-recognized status."});
                setTimeout(function() {$ionicLoading.hide();}, 1000);
            }
        };

        


        //If there is no available goal, show the error text and do nothing
        if (availableGoals.length == 0)
        {
            $("#background_layer_no_goals").css('display', '');
            $("#challenge_detail ion-content").css('display', 'none');
            $("#background_layer_no_goals_text").html('No Active Goals &amp; Challenges<br>Please add a new goal before creating new challenges.');
            setTimeout(function() {
                $(".right_top_button").html('New Goal');
            }, 1);

            return;
        }


        $("#background_layer_no_goals").css('display', 'none');
        $("#challenge_detail ion-content").css('display', '');
        $(".right_top_button").html('Edit');




        //Drawing arc based on the progress of goal
        var challenges = [],
            allchallenges = [];
        var arc = document.getElementById('arc_canvas');
        var ctx = arc.getContext('2d');
        var drawArc = function (currentProgress, possibleProgress) { //Drawing the arc with current progress and expected progress

            if (possibleProgress < 0) possibleProgress = 0;
            if (currentProgress > 1) {
                currentProgress = 1;
                possibleProgress = 0;
            }

            if (currentProgress + possibleProgress > 1) {
                possibleProgress = 1 - currentProgress;
            }
            ctx.clearRect(0, 0, 1000, 1000);

            ctx.strokeStyle = "rgb(216,216,216)";
            ctx.lineWidth = 0.8;
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


        $ionicLoading.show({
            template: "Loading challenges..."
        });


        //Show the challenge of the given goal based on its index
        var showCurrentChallenge = function (index) {

            //If no challenges, show pick_challenge page
            if (challenges.length == 0) 
            {
                $ionicLoading.show({template: "No available challenge"});
                setTimeout(function() {
                    $ionicLoading.hide();
                    localStorage.setItem('current_goal_id', goalID);
                    localStorage.setItem('pick_challenge', 'empty_challenge');
                    $state.go('pick_challenge', {goalID: goalID}, {reload: true});
                }, 3000);
                return;
            }


            var challenge = challenges[index] || challenges.item(index);
            if (!challenge || typeof(challenge) === 'undefined') {
                return; //If unexpected status, do nothing
            }


            $scope.currentIndex = index;
            localStorage.setItem('current_challenge_id', challenge._id);

            $("#challengeDetail_categoryName").html(challenge._category == 'Travel' ? 'Transportation' : challenge._category);
            $("#challengeDetail_index").html(index + 1 + " of " + challenges.length);


            var todaystr = dateFormat(new Date(challenge.createdAt), "ddd, mmm dd");
            $("#go_to_challenge_detail_from_adjust_benchmark").click(function () {
                document.getElementById('preview_dialog').style.display = 'none';
                $state.go('menu.challenge_detail');
            });

            var sunday = new Date(challenge.createdAt).getTime();
            var todayWeekDay = 0;


            var days = 1;
            while (dateFormat(new Date(sunday), 'ddd') != 'Sun') {


                sunday += 86400000;
                days++;
                if (dateFormat(new Date(sunday), 'ddd') == dateFormat(new Date(), 'ddd'))
                    todayWeekDay = days - 1;
            }

            //Setting the position of days with good-looking proportion
            var percentagesWidth = [
                ['50%'],
                ['40%', '60%'],
                ['30%', '50%', '70%'],
                ['20%', '40%', '60%', '80%'],
                ['10%', '30%', '50%', '70%', '90%'],
                ['0%', '20%', '40%', '60%', '80%', '100%'],
                ['0%', '16.6%', '33.3%', '50%', '66.6%', '83.3%', '100%'],
            ];

            $("#challenge_detail .day:not(:first-child)").remove();

            for (c = 0; c < days; c++) {
                if (c > 0) {
                    var cloneObj = $($("#challenge_detail .day")[0]).clone();
                    cloneObj.insertAfter($($("#challenge_detail .day")[c - 1]));
                    cloneObj.find("#day_no").html(c + 1);
                    
                }
                $($("#challenge_detail .day")[c]).css('left', percentagesWidth[days - 1][c]);

                if (c == todayWeekDay) $($("#challenge_detail .day")[c]).addClass('selected');
                else $($("#challenge_detail .day")[c]).removeClass('selected');
            }
            var sundayDate = sunday;

            sunday = dateFormat(sundayDate, 'ddd, mmm dd');

            $("#challenge_detail #period").html(todaystr + ' &mdash; ' + sunday);

            var goals = [];
            for (var k = 0; k < globalGoals.length; k++)
                if (globalGoals[k]._id == goalID) goals.push(globalGoals[k]);


            //Show the transaction list and circular progress bar
            {
                var goal = goals[0];



                $("#challenge_detail #goal_limit").html("$" + goal.amount);
                $("#challenge_detail #goal_title").html(goal.name);

                var recentTransactions = [];
                for (k = 0; k < globalTransactions.length; k++) {

                    if (typeof (globalTransactions[k].category) !== 'undefined' && globalTransactions[k].category.length > 0)
                        if ((typeof (globalTransactions[k].category) == 'object' && globalTransactions[k].category[0] == challenge._category)
                            || (typeof (globalTransactions[k].category) == 'string' && (JSON.parse(globalTransactions[k].category))[0] == challenge._category))
                        recentTransactions.push(globalTransactions[k]);
                }

                recentTransactions.sort(function(c,b) {
                    return new Date(b.date).getTime() - new Date(c.date).getTime();
                });



                {
                    var min = function (a, b) {
                        return a > b ? b : a;
                    };

                    var getCategoryIcon = function(a)
                    {
                        switch (a)
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


                    var recentTransactionList = [];
                    for (var i = 0; i < min(recentTransactions.length, 5); i++) {
                        var c = JSON.parse(JSON.stringify(recentTransactions[i]));

                        c['dateText'] = dateFormat(new Date(c.date), "ddd, mmm dd");
                        c['priceText'] =  (Number(c['amount']) > 0) ?
                            '$' + getTransactionAmountString(c['amount']) :
                            '$' + getTransactionAmountString(- Number(c['amount'] ));
                        c['colorStyle'] = {"color" : (Number(c['amount']) > 0) ? "rgb(255,100,100)" : "rgb(96,193,204)"};
                        c['icon'] = getCategoryIcon(c.category[0]);
                        recentTransactionList.push(c);
                    }

                    $scope.recentTransactions = recentTransactionList;
                    var sum = 0;
                    var sundayString = dateFormat(new Date(sundayDate), "yyyy-mm-dd");
                    var firstString = dateFormat(new Date(challenge.createdAt), "yyyy-mm-dd");


                    for (i = 0; i < recentTransactions.length; i++) {
                        var c = recentTransactions[i];

                        var transDate = c.date.substr(0,10);
                        if (transDate <= sundayString && transDate >= firstString) {
                            sum += c.amount;
                        }
                    }

                    var banks = [];
                    for (k = 0; k < globalBanks.length; k++)
                        if (globalBanks[k]._user == localStorage.getItem('user_id'))
                            banks.push(globalBanks[k]);



                    var banksData = [];
                    for (i = 0; i < banks.length; i++)
                        //banksData.push("'" + banks[i]._id + "'");
                        banksData.push(banks[i]._id);

                    var transactions = [];
                    for (i = 0; i < globalTransactions.length; i++)
                        if (globalTransactions[i].date > allchallenges[0].createdAt.substr(0, 10) && banksData.indexOf(globalTransactions[i]._bank) > -1)
                            transactions.push(globalTransactions[i]);



                    var totalSum = 0;


                    for (i = 0; i < allchallenges.length; i++) {
                        if (new Date(allchallenges[i].createdAt).getWeek() < new Date().getWeek()) {
                            var challenge1 = allchallenges[i];

                            var subTotalConsumed = 0;
                            for (var j = 0; j < transactions.length; j++) {

                                if (transactions[j].date >= challenge1.createdAt.substr(0, 10) && new Date(transactions[j].date).getWeek() == new Date(challenge1.createdAt).getWeek()) {
                                    subTotalConsumed += max(0, transactions[k].amount);
                                }
                            }
                            if (subTotalConsumed < challenge1.amount && subTotalConsumed > 0) totalSum += (challenge1.amount - subTotalConsumed);
                            console.log(totalSum, challenge1.amount, subTotalConsumed);
                        }
                    }
                    totalSum += considerPlutoSaving(goal._id);

                    drawArc(totalSum / goal.amount, max(0, challenge.amount - sum) / goal.amount);
                    $("#challenge_detail_goto_goal_detail").css('transform', 'scalex(' +  $(window).width() / 375.0 + ')');
                    $("#challenge_detail_goto_goal_detail").css('-webkit-transform', 'scalex(' + $(window).width() / 375.0  + ')');
                    $("#zero_start_value").css('transform', 'scalex(' +  1 / ($(window).width() / 375.0) + ')');
                    $("#zero_start_value").css('-webkit-transform', 'scalex(' + 1 / ($(window).width() / 375.0)  + ')');
                    $("#goal_limit").css('transform', 'scalex(' +  1 / ($(window).width() / 375.0) + ')');
                    $("#goal_limit").css('-webkit-transform', 'scalex(' + 1 / ($(window).width() / 375.0)  + ')');
                    console.log(considerPlutoSaving(goal._id), totalSum, goal.amount, totalSum / goal.amount, max(0, challenge.amount - sum) / goal.amount);
                    if (challenge.amount < sum) {
                        $("#challenge_detail #saving_header").html('By overspending');
                        $("#challenge_detail #saving_footer").html('you are making');
                        $("#challenge_detail #saving_amount").html('');
                        $("#challenge_detail #saving_amount_progress").html('0%');
                    }
                    else
                    {

                        var p = (Math.floor(100 * (challenge.amount - sum) / goal.amount) / 1);
                        if (p == 0) p = (Math.round(1000 * (challenge.amount - sum) / goal.amount) / 10.0) ;
                        $("#challenge_detail #saving_header").html('By saving ');
                        $("#challenge_detail #saving_footer").html('you will make');
                        $("#challenge_detail #saving_amount").html('$' + Math.floor(challenge.amount - sum));
                        $("#challenge_detail #saving_amount_progress").html('+' + p + '%');
                    }





                    $("#challenge_detail #dollar").html((Math.round(challenge.amount - sum) >= 0 ? '$' + Math.round(challenge.amount - sum) : '-$' + -Math.round(challenge.amount - sum)) + " ");

                    var circleWidth = 250;

                    var amount = challenge.amount;
                    var rate = sum * 1.0 / amount;


                    if (rate > 1 - 3.0 / 26 && rate < 1) rate = 1 - 3.0 / 26;
                    else if (rate < 3.0 / 26 && rate > 0) rate = 3.0 / 26;

                    $("#challenge_detail #gray_part").css('height', 'calc(100% * ' + min(1, rate) + ")");
                    $("#challenge_detail #real_part").css('height', 'calc(100% * ' + max(0, 1 - rate) + ")");
                    $("#challenge_detail #real_part.main_part > div:nth-child(1)").css('top', 'calc(76px - 250px * ' + min(1, rate) + ")");
                    $("#challenge_detail #real_part.main_part > div:nth-child(2)").css('top', 'calc(115px - 250px * ' + min(1,rate) + ")");
                    $("#challenge_detail #real_part.main_part > div:nth-child(3)").css('top', 'calc(160px - 250px * ' + min(1,rate) + ")");
                    $("#challenge_detail #real_part.main_part > div:nth-child(4)").css('top', 'calc(180px - 250px * ' + min(1,rate) + ")");

                    $("#challenge_detail #saved_amount").html('SAVE: $' + Math.round(challenge.amount - sum));
                    $("#challenge_detail #spent_amount").html('SPENT: $' + Math.round(sum) + ' / $' + challenge.amount);

                    if (rate > 1) {
                        $("#challenge_detail #real_part").css('background-color', 'rgb(255,255,255)');
                        $("#challenge_detail #gray_part").css('background-color', 'rgb(180,180,190)');
                        $("#challenge_detail #gray_part").css('color', 'rgb(255,255,255)');
                        //$("#challenge_detail #circle_progress_text").html("Keep it up!");
                        $("#challenge_detail #gray_part > #on_track_to_save").html("OVERSPENT");
                        $("#challenge_detail #gray_part > div:last-child > #circle_progress_text").html("Dude...&#128557;");
                        $("#challenge_detail #gray_part > div:last-child > img").css('display', 'none');
                    }
                    else if (rate == 1)
                    {
                        $("#challenge_detail #real_part").css('background-color', 'rgb(128,128,128)');
                        $("#challenge_detail #gray_part").css('color', 'rgb(128,128,128)');
                        $("#challenge_detail #circle_progress_text").html("Slow down a bit!");
                        $("#challenge_detail #gray_part > #on_track_to_save").html("ON TRACK TO SAVE");
                    }
                    else if (rate > 0.75) { //red
                        $("#challenge_detail #real_part").css('background-color', 'rgb(180,0,0)');
                        $("#challenge_detail #gray_part").css('color', 'rgb(180,0,0)');
                        $("#challenge_detail #circle_progress_text").html("Slow down a bit!");
                        $("#challenge_detail #gray_part > #on_track_to_save").html("ON TRACK TO SAVE");
                    } else if (rate > 0.5) { //orange
                        $("#challenge_detail #real_part").css('background-color', 'rgb(248,173,78)');
                        $("#challenge_detail #gray_part").css('color', 'rgb(248,173,78)');
                        $("#challenge_detail #circle_progress_text").html("Keep it up!");
                        $("#challenge_detail #gray_part > #on_track_to_save").html("ON TRACK TO SAVE");
                    } else if (rate > 0) { //teal
                        $("#challenge_detail #real_part").css('background-color', 'rgb(153,221,221)');
                        $("#challenge_detail #gray_part").css('color', 'rgb(153,221,221)');
                        $("#challenge_detail #circle_progress_text").html("You killin' it");
                        $("#challenge_detail #gray_part > #on_track_to_save").html("ON TRACK TO SAVE");
                    } else
                    {
                        $("#challenge_detail #real_part").css('background-color', 'rgb(153,221,221)');
                        $("#challenge_detail #gray_part").css('color', 'rgb(153,221,221)');
                        $("#challenge_detail #circle_progress_text").html("You killin' it");
                        $("#challenge_detail #gray_part > #on_track_to_save").html("ON TRACK TO SAVE");
                        $("#challenge_detail #saved_amount").html('SPENT: $0 / $' + challenge.amount);
                    }

                }
            }
        };

        //Set the right-top button title based on the count of available challenges
        var a = [];
        for (var j = 0; j < globalChallenges.length; j++)
            if (globalChallenges[j]._goals[0].indexOf(goalID) > -1)
                a.push(globalChallenges[j]);

        if (a.length == 0)
        {
            $("#background_layer_no_goals").css('display', '');
            $("#background_layer_no_goals_text").html('No Active Challenges');
            $("#challenge_detail ion-content").css('display', 'none');
            $(".right_top_button").html('Add New');
            return;
        }
        else
        {
            $("#background_layer_no_goals").css('display', 'none');
            $("#challenge_detail ion-content").css('display', '');
            $(".right_top_button").html('Edit');
        }

        a.sort(function(b,c) {
            return new Date(b.createdAt).getTime() - new Date(c.createdAt).getTime();
        });


        //Show the current index of challenge
        {
            allchallenges = a;
            var index = 0;
            for (var i = 0; i < allchallenges.length; i++) {
                if (new Date(allchallenges[i].createdAt).getWeek() == new Date().getWeek())
                    challenges.push(allchallenges[i]);

            }

            var cID = toParams.challengeID || $stateParams.challengeID;
            if (typeof (cID) !== 'undefined')
                for (i = 0; i < challenges.length; i++)
                    if (challenges[i]._id == cID) {
                        index = i;
                        console.log("That's the index " + i);
                    }
            showCurrentChallenge(index);
            $ionicLoading.hide();
        }

        $("#challenge_detail #percent_circle_background").off().click(function () {
            if ($("#challenge_detail .main_part:first-child").css('display') == 'none') {
                $("#challenge_detail .main_part").css('display', '');
                $("#challenge_detail .secondary_part").css('display', 'none');
            } else {
                $("#challenge_detail .main_part").css('display', 'none');
                $("#challenge_detail .secondary_part").css('display', '');
            }
        });

        // Show the next/prev challenge (based on step (-1, 1))
        $scope.gotoNextChallenge = function(step){
            showCurrentChallenge(($scope.currentIndex + challenges.length + step) % challenges.length);
        };

        //When click the transaction
        $scope.viewTransaction = function (id) {
            localStorage.setItem('transaction_detail', 'challenge_detail');
            $state.go('transaction_detail', {transactionID: id._id, challengeID : challenges[$scope.currentIndex]._id}, {reload: true});
        };

        // When click to edit the transaction
        $scope.editTransaction = function(id)
        {
            $ionicListDelegate.closeOptionButtons();
            localStorage.setItem('transaction_detail_edit', 'challenge_detail');
            $state.go('transaction_detail_edit', {transactionID: id._id, challengeID : challenges[$scope.currentIndex]._id}, {reload: true});
        };



        //When click More Transactions button
        $("#recent_transaction_more").off().click(function()
        {
            var category = challenges[$scope.currentIndex]._category;

            $state.go('menu.transactions', {category: category}, {reload: true});
        });

        //Close the push notification popup
        $("#push_OK").off().click(function(){
            $("#push_dialog").css('display', 'none');
        });

        if (toParams.fromPush || $stateParams.fromPush) {
            $("#push_dialog").css('display', '');
            $("#push_alert").html(localStorage.getItem('push_text'));
        }

    });

});