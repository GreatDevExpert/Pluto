/**
 * Created by owl on 5/24/16.
 */
app.controller('CreateGoalController', function($scope, $ionicPopup, $state, $cordovaSQLite, $cordovaImagePicker, $stateParams, $ionicLoading, $ionicActionSheet, $ionicHistory, $jrCrop) {

    //For the goal amount textfield (numeric keypad)
    $scope.number = '';
    $scope.firstInput = true;
    $scope.options = {
        visible: false,
        hideOnOutsideClick: false,
        leftControl : '.',
        rightControl: '&#8592;',
        onKeyPress: function(value, source)
        {
            $scope.options.visible = true;

            if (source === 'LEFT_CONTROL') {
                if ($scope.firstInput) $scope.number = '0';
                else if ($scope.number.indexOf('.') === -1) {
                    $scope.number += value;
                }
            }
            else if (source === 'RIGHT_CONTROL')
            {
                $scope.number = $scope.number.substr(0, $scope.number.length - 1);
                if ($scope.firstInput || $scope.number == '') $scope.number = '0';
            }
            else if (source === 'NUMERIC_KEY')
            {
                if ($scope.firstInput || $scope.number == '0') $scope.number = '';

                $scope.number += value;
            }

            //$scope.number = String("" + Number($scope.number));
            $scope.firstInput = false;
        }
    };

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        var goalID = $stateParams.goalID || toParams.goalID || localStorage.getItem('current_goal_id');


        //Show the tutorial

        document.addEventListener("deviceready", init, false);

        var this_goal = null;

        if (goalID)  //This page is for updating the goal ?
        {
            this_goal = findElementById(globalGoals, goalID);

            $("#create_goal #view_title").html("Edit Goal");

            //Show the image of the goal
            toDataUrl(this_goal.image_url, function(base64Img){
                console.log('ToDataURL is called');
                var image = $("#create_goal #goal_image");
                image.attr('src', base64Img);
                image.css('display', '');
                $('#placeholder_image_area').css('opacity', 0.8);
            });

            $("#create_goal #for_what").val(this_goal.name);
            $scope.number = String("" + this_goal.amount);

            if (typeof(this_goal.deadline) === 'undefined' || this_goal.deadline == null || this_goal.deadline == '')
                $("#create_goal #deadline").val("");
            else
                $("#create_goal #deadline").val(dateFormat(new Date(this_goal.deadline), "yyyy-mm-dd"));
        }
        else //IF this is the first screen of the app and the previous screen is login screen
        {
            if (fromState.name != 'welcome_screen' && (globalGoals == null || globalGoals.length == 0))
            {
                $("#create_goal #back_button").html('Sign out');
            }
        }

        //When back button is pressed
        $("#create_goal #back_button").off().click(function () {
            if ($("#create_goal #back_button").html() == 'Sign out')
                $state.go('login');
            else if (fromState.name == 'pick_challenge') {
                localStorage.setItem('pick_challenge_page_from', 'create_goal');
                $state.go('pick_challenge');
            }
            else if (fromState.name == 'welcome_screen' || (fromState.name == 'linkbankaccount'))
                $state.go('welcome_screen');
            else if (fromState.name == 'goal_edit')
                $state.go('goal_edit', {goalID : localStorage.getItem('current_goal_id')}, {reload:true});
            else if (fromState.name == 'goal_list')
                $state.go('menu.goal_list');
            else $state.go('menu.challenge_detail');

        });



        //When create new goal/Edit goal button is clicked
        $("#create_goal #create_button").off().click(function () {
            var formData;
            var blob = document.getElementById('goal_image').src;

            //If this is for creating a new goal?
            if (globalGoals && globalGoals.length > 0 && !goalID)
            {
                //IF there is already one existing goal, you can't create more than one.
                for (var i  in globalGoals)
                    if (new Date(globalGoals[i].deadline).getTime() > new Date().getTime()) {
                        $ionicLoading.show({template: "You can't create more than one goal"});
                        setTimeout(function () {
                            $ionicLoading.hide();
                        }, 3000);
                        return;
                    }
            }



            $ionicLoading.show({
                template: (this_goal ? "Updating Goal..." : "Creating goal...")
            });
            if (validateFormField('for_what', 'empty', 'text', $ionicLoading, "Please enter the goal title")) {
                //Do nothing, just show the error text
            }
            else {

                if (Number($scope.number) <= 0)  //Goal Amount validation
                {
                    $ionicLoading.hide();
                    showAlert($scope, $ionicPopup, "Error", "You have to enter the number greater than 0");
                    return;
                }

                formData = {
                    name: document.getElementById('for_what').value,
                    amount: Number($scope.number),
                    deadline: document.getElementById('deadline').value == "" ? ('') : document.getElementById('deadline').value,
                    token: localStorage.getItem('user_token'),
                    image: blob,
                };
                if (this_goal) {
                    formData = this_goal;
                    formData.name = document.getElementById('for_what').value;
                    formData.amount = Number($scope.number);
                    formData.deadline = document.getElementById('deadline').value == "" ? ('') : document.getElementById('deadline').value;
                    formData.token = localStorage.getItem('user_token');
                    formData.image = blob;
                }


                formData.deadline = getEndTimeOfTheDay(formData.deadline);



                //Creating the new goal / Updating the existing goal in the server DB by calling web services
                $.ajax({
                    url: WEBSERVICE_URL_PREFIX + 'goals' + (this_goal ? "/" + this_goal._id : ""),
                    data: formData,
                    timeout: 450000,
                    method: (this_goal? "PUT" : "POST")

                }).success(function (a, b) {

                    if (goalID && a.success == true)    //IF this was for updating.
                    {
                        //Reload all the goal data after creating/updating goal.
                        $.get(WEBSERVICE_URL_PREFIX + 'goals?token=' + localStorage.getItem('user_token'), function(response, successed) {

                            $ionicLoading.hide();
                            if (successed == 'success' && response && response.success == true)
                            {
                                var goals = [];
                                for (c in response.data) {
                                    goals.push(response.data[c]);
                                }
                                globalGoals = goals;
                                if (fromState.name == 'pick_challenge')
                                    $state.go('pick_challenge');
                                else $state.go('goal_edit', {goalID : localStorage.getItem('current_goal_id')}, {reload: true});
                            }
                        });


                    }
                    else if (typeof (a.data) !== 'undefined') { //If this was for creating a new goal and the response is a correct format

                        //Reload all the goal data after creating/updating goal.
                        $.get(WEBSERVICE_URL_PREFIX + 'goals?token=' + localStorage.getItem('user_token'), function(response, successed) {

                            if (successed == 'success' && response && response.success == true)
                            {
                                var goals = [];
                                for (c in response.data) {
                                    goals.push(response.data[c]);
                                }
                                globalGoals = goals;
                                $("#goal_saved_popup").css('display', '');
                                localStorage.setItem('current_goal_id', a.data['_id']);
                                $ionicLoading.hide();
                            }
                            else
                                console.log(response);
                        });
                    }
                    else //If the response is in error
                    {
                        $ionicLoading.hide();
                        if (!this_goal)
                            showAlert($scope, $ionicPopup, 'Error', "Error creating goal!");
                        else
                            showAlert($scope, $ionicPopup, 'Error', "Error updating goal!");
                    }

                }).error(function (a, b) {
                    $ionicLoading.hide();
                    if (!this_goal)
                        showAlert($scope, $ionicPopup, 'Error', "Error creating goal!");
                    else
                        showAlert($scope, $ionicPopup, 'Error', "Error updating goal!");
                });
            }
        });



        function init() { //As soon as the page is fully loaded

            function onSuccess(imageData) { //Callback function when the image is successfully loaded

                $ionicLoading.hide();
                $jrCrop.crop({
                    url: "data:image/jpeg;base64," + imageData,
                    width: $("#add_image_section").width(),
                    height: $("#add_image_section").height()
                    //width:200,
                    //height:200
                }).then(function(canvas) {

                    var image = $('#create_goal #goal_image');
                    var newCanvas = document.createElement('canvas');
                    var ctx = newCanvas.getContext('2d');
                    var img = new Image();

                    img.src = canvas.toDataURL();
                    img.onload = function () {
                        newCanvas.width = $("#add_image_section").width() * 2;
                        newCanvas.height = $("#add_image_section").height() * 2;
                        ctx.drawImage(img, 0, 0, newCanvas.width, newCanvas.height);
                        image.attr('src', newCanvas.toDataURL());
                        image.css('display', '');
                        $('#placeholder_image_area').css('opacity', 0);
                        setTimeout(function() {$("#create_goal #create_button").prop('disabled', false); }, 500);
                    };


                }, function()
                {
                    $("#create_goal #create_button").prop('disabled', false);

                });


            }

            function onFail(message) { //Callback when the image is failed to be loaded successfully
                $("#create_goal #create_button").prop('disabled', false);
                $ionicLoading.hide();
            }

            $("#add_image_section").off().click(function () { //Show the actionsheet for loading the image
                $("#create_goal #create_button").prop('disabled', true);
                $scope.showActionSheet();
            });

            $scope.showActionSheet = function () {
                $ionicActionSheet.show({
                    buttons: [{
                        text: "TAKE PHOTO",
                        className : "buttonClass_CreateGoal"
                    }, {
                        text: "CHOOSE PHOTO",
                        className : "buttonClass_CreateGoal"
                    }],
                    cancelText: "CANCEL",
                    cancel: function () {
                        $ionicLoading.hide();
                        $("#create_goal #create_button").prop('disabled', false);
                    },
                    buttonClicked: function (index) {
                        //Load the image from Photo library or Camera

                        $ionicLoading.show({template: "Wait a moment..."});
                        if (index == 1) {
                            //document.querySelector("#add_image_section").addEventListener("touchend", function() {
                            navigator.camera.getPicture(onSuccess, onFail, {
                                quality: 50,
                                //allowEdit: true,
                                destinationType: Camera.DestinationType.DATA_URL,
                                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                                correctOrientation: true
                            });

                            //});
                        } else {
                            //document.querySelector("#add_image_section").addEventListener("touchend", function() {
                            navigator.camera.getPicture(onSuccess, onFail, {
                                quality: 50,
                                destinationType: Camera.DestinationType.DATA_URL,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                //allowEdit: true,
                                correctOrientation: true,
                                encodingType: Camera.EncodingType.JPEG,
                                //saveToPhotoAlbum: true,
                                //targetWidth:400,
                                //targetHeight:400
                            });

                            //});
                        }

                        return true;
                    }
                })
            }
        }

        $scope.goToState = function (status, id) { //Move to the next state (page)
            if (id) document.getElementById(id).style.display = 'none';
            if (banks && banks.length > 0) $state.go('pick_challenge')
            //else  $state.go('linkbankaccount')
            $state.go(status);

        };

        $scope.goToNextScreen_In_CreateGoal = function() //After creating the new goal, go to the next screen
        {
            document.getElementById('goal_saved_popup').style.display = 'none';
            if (globalBanks == null || globalBanks.length == 0) {
                localStorage.setItem('linkbankaccount_page_from', 'create_goal');

                $state.go('linkbankaccount');
            }
            else {
                localStorage.setItem('pick_challenge_page_from', 'create_goal');
                $state.go('pick_challenge');
            }
        };
         //window.location.href = '#/linkbankaccount';

        $scope.showKeyboard = function() //Show customized numeric keyboard when the goal amount text field is focused.
        {
            $scope.options.visible = true;
            $scope.firstInput = true;
        };

        $("#create_goal").off().click(function() { //Hide the keyboard
            $scope.options.visible = false;
        })
    });
})