/**
 * Created by owl on 5/24/16.
 */
app.controller('AdjustBenchmarkController', function($scope, $ionicPopup, $ionicActionSheet, $state, $stateParams, $cordovaSQLite, $ionicLoading, $ionicHistory ) {

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (toState.name != 'adjust_benchmark') return;


        var challengeID = toParams.challengeID || $stateParams.challengeID; //Corresponding challenge
        var dollar_value = $stateParams.average || toParams.average; //Initial value of benchmark

        var this_challenge = null;
        var todaystr = dateFormat(new Date(), "ddd, mmm dd");

        if (typeof (challengeID) !== 'undefined' && challengeID != null)  //If this adjust benchmark screen is for editing the existing benchmark
        {
            this_challenge = findElementById(globalChallenges, challengeID);
            dollar_value = this_challenge.amount;
            todaystr = dateFormat(new Date(this_challenge.createdAt), "ddd, mmm dd");
            $("#letsdoit").html("SAVE");
        }

        $("#go_to_challenge_detail_from_adjust_benchmark").off().click(function () { //Save and return to challenge detail screen

            var t = localStorage.getItem('current_challenge_id');
            $state.go('menu.challenge_detail', {challengeID : t}, {reload:true});
            localStorage.setItem('current_challenge_id', '');

        });

        //Getting the sunday date
        var sunday = new Date().getTime();
        var days = 1;
        while (dateFormat(new Date(sunday), 'ddd') != 'Sun') {

            sunday += 86400000; days++;
        }
        sunday = dateFormat(new Date(sunday), 'ddd, mmm dd');

        if (todaystr == sunday)
            $("#adjust_benchmark #period").html(sunday);
        else
            $("#adjust_benchmark #period").html(todaystr + ' <div style = "letter-spacing:-1px; color:black; opacity:0.8; display:inline; transform:scaleX(3.0);">&mdash;</div> ' + sunday);

        //When numeric keypad has appeared
        $("#adjust_benchmark #keypad").off().click(function () {
            $("#adjust_benchmark #keyboard").css('display', '');
        });
        $("#adjust_benchmark #editing_done").off().click(function () {
            document.getElementById("keyboard").style.display = "none";
            $("#adjust_benchmark #dollar_value").html('$' + Number($("#adjust_benchmark #dollar_value").html().substr(1)));
        });

        //When numeric keys are tapped
        $(".key_cell").off().click(function () {
            var key = $(this).data('value');
            var currentValue = ($("#adjust_benchmark  #dollar_value").html().substr(1));
            if (key == ',') {
                currentValue = currentValue.substr(0, currentValue.length - 1);
            }
            else if (key == '.') {
                if (currentValue == '') currentValue = '0';
                if (currentValue.indexOf('.') == -1)
                    currentValue = currentValue + ".";
            }
            else currentValue = currentValue + (key);

            $("#adjust_benchmark #dollar_value").html('$' + currentValue);
        })


        //Clicked Save button
        $("#adjust_benchmark #letsdoit").off().click(function () {
            $ionicLoading.show({
                template: ($(this).html() == 'SAVE' ? "Saving..." : "Creating challenge...")
            });

            var formData = {
                name: 'Challenge',
                image_url: '',
                _category: localStorage.getItem('current_challenge_category'),
                amount: $("#adjust_benchmark #dollar_value").html().substr(1),
                _user: localStorage.getItem('user_id'),
                token: localStorage.getItem('user_token'),
                _goals: JSON.stringify([localStorage.getItem('current_goal_id')])
            };

            var tempObj = JSON.parse(JSON.stringify(this_challenge));

            if (this_challenge) { //If this is for updating the existing benchmark
                tempObj.amount = Number(($("#dollar_value").html().substr(1)));
                formData = JSON.parse(JSON.stringify(tempObj));
            }

            formData.token = localStorage.getItem('user_token');

            $.ajax({
                url: WEBSERVICE_URL_PREFIX + 'challenges' + (this_challenge ? "/" + this_challenge._id : ""),
                data: formData,
                timeout: 10000,
                method: (this_challenge ? "PUT" : "POST")
            }).success(function (a, b) {


                    if (b == 'success') {
                        if (a.success == true) {

                            $ionicLoading.hide();
                            if (this_challenge) //IF this saving is for updating
                            {
                                var i = findIndexOfElementById(globalChallenges, this_challenge._id);

                                globalChallenges[i].amount = Number($("#adjust_benchmark #dollar_value").html().replace('$', ''));
                                console.log('ehehehehehe 1');
                                $state.go('menu.challenge_detail', {challengeID: this_challenge._id}, {reload: true});
                                return;
                            }
                            else //IF this is for creating
                                globalChallenges.push(a.data);

                            localStorage.setItem('current_challenge_id', a.data._id);
                            $("#preview_dialog").css('display', '');
                        } else {
                            $ionicLoading.hide();
                            showAlert($scope, $ionicPopup, 'Failure', 'Failed to create a challenge!', 'alert');
                        }
                    } else {
                        $ionicLoading.hide();
                        showAlert($scope, $ionicPopup, 'Failure', 'Failed to create a challenge!', 'alert');
                    }
                })
                .error(function (a, b) {
                    $ionicLoading.hide();
                    showAlert($scope, $ionicPopup, 'Failure', 'Failed to create a challenge!', 'alert');
                });


        });

        //Clicked the emoticons (-10%, -5%, 0%, 5%, 10%)
        $("#adjust_benchmark .adjust_benchmark_button").off().click(function () {
            var newVal = Number($("#adjust_benchmark #dollar_value").html().substr(1)) * Number($(this).data('coeff'));
            newVal = Math.ceil(newVal);
            $("#adjust_benchmark #dollar_value").html('$' + newVal);


            if ($(this).find('#perf').length > 0) {
                document.getElementById('letsdoit').disabled = false;
            }
            else
                document.getElementById('letsdoit').disabled = true;


            var imgDiv = $(this).parent().clone();
            imgDiv.insertAfter($(this).parent());

            imgDiv.find("div > div:nth-child(2)").html('');

            var dcenterx = $("#adjust_benchmark #dollar_value").offset().left + $("#adjust_benchmark #dollar_value").width() / 2;
            var dcentery = $("#adjust_benchmark #dollar_value").offset().top + $("#adjust_benchmark #dollar_value").height() / 2;


            var scenterx = imgDiv.offset().left;
            var scentery = imgDiv.offset().top;

            var xtrans;
            if (dcenterx > scenterx) xtrans = '+=' + (dcenterx - scenterx);
            if (dcenterx < scenterx) xtrans = '-=' + (scenterx - dcenterx);
            imgDiv.css('opacity', '0.5')

            var position = imgDiv.offset();
            position.left += imgDiv.width() / 2;
            imgDiv.offset(position);
            imgDiv.animate({left: xtrans, top: '-=' + (scentery - dcentery) + 'px'}, 400, 'linear', function () {
                imgDiv.remove();
            })
        });
        $("#adjust_benchmark #sub_title_text").html(localStorage.getItem('current_challenge_category') == 'Travel' ? "Transportation" : localStorage.getItem('current_challenge_category'))
        $("#adjust_benchmark #dollar_value").html('$' + dollar_value);



        //Back button is clicked
        $("#adjust_benchmark #back_button").off().click(function()
        {
            if (fromState.name == 'menu.challenge_detail') { //This page is coming from challenge_detail screen, confirm the changes

                console.log($("#adjust_benchmark #dollar_value").html().substr(1));
                console.log(dollar_value);

                if (Number($("#adjust_benchmark #dollar_value").html().substr(1)) != Number(dollar_value))
                {
                    $ionicActionSheet.show({
                        buttons: [{
                            text: "Yes"
                        }],
                        titleText: "Are you sure to go back without saving changes?",
                        cancelText: "No",
                        cancel: function () {

                        },
                        buttonClicked: function (index) {

                            $state.go('menu.challenge_detail', fromParams, {reload:true});

                            return true;
                        }
                    });

                }
                else $state.go('menu.challenge_detail', {challengeID : challengeID}, {reload: false});

            }
            else $ionicHistory.goBack();
        });
    });

});