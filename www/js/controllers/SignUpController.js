/**
 * Created by owl on 5/24/16.
 */
app.controller('SignupController', function($scope, $ionicPopup, $state, $cordovaSQLite, $ionicLoading, $ionicHistory) {

    $("#signup_page #back_button").click(function()
    {
        $ionicHistory.goBack();
    });

    //$("#logo_area_in_signup_page").css('height', $(window).height() - $("#signup_area_in_login_page").height() + 'px');
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (toState.name !=  'signup') return;

        document.getElementById('signup').onclick = function () {
            if (document.getElementById('first_name').value.length == 0) {
                document.getElementById('first_name').focus();
                showAlert($scope, $ionicPopup, 'Validation', "First name can't be empty!");
            } else if (document.getElementById('last_name').value.length == 0) {
                document.getElementById('last_name').focus();
                showAlert($scope, $ionicPopup, 'Validation', "Last name can't be empty!");
            } else if (document.getElementById('signup_email').value.length == 0) {
                document.getElementById('signup_email').focus();
                showAlert($scope, $ionicPopup, 'Validation', "Email can't be empty!");

            } else if (!validateEmail(document.getElementById('signup_email').value)) {
                document.getElementById('signup_email').focus();
                showAlert($scope, $ionicPopup, 'Validation', "Invalid email address!");
            } else if (document.getElementById('signup_password').value.length == 0) {
                document.getElementById('signup_password').focus();
                showAlert($scope, $ionicPopup, 'Validation', "Password can't be empty!");
            } else {

                localStorage.setItem('user_token', '');
                localStorage.setItem('user_id', '');
                localStorage.setItem('user_name', '');
                localStorage.setItem('user_email', '');
                localStorage.setItem('current_goal_id', '');
                localStorage.setItem('current_challenge_id', '');
                localStorage.setItem('current_challenge_category', '');
                localStorage.setItem('user_data', '{"email":"", "password": ""}');
                globalAccounts = globalBanks = globalChallenges = globalGoals = globalTransactions = null;
                var tempInterval = setInterval(function () {
                    if (localStorage.getItem('loadingGlobalData') == 'false') {
                        clearInterval(loadingTimer);
                        loadingTimer = null;
                        $ionicLoading.hide();

                        clearInterval(tempInterval);
                        tempInterval = null;
                        console.log('-------------------eee------')
                    }
                }, 500);


                var formData = {
                    'first_name': document.getElementById('first_name').value,
                    'last_name': document.getElementById('last_name').value,
                    email: document.getElementById('signup_email').value,
                    password: document.getElementById('signup_password').value,
                    device_token: localStorage.getItem('device_token'),
                    timezone: new Date().getTimezoneOffset()
                };

                $ionicLoading.show({
                    template: "Signing up..."
                });
                $.ajax({
                    url: WEBSERVICE_URL_PREFIX + 'register',
                    data: formData,
                    timeout: 10000,
                    method: "POST"
                }).success(function (a, b) {
                    $ionicLoading.hide();
                    if (b == 'success') {


                        if (a.success == true) {
                            localStorage.setItem('user_data', JSON.stringify(formData));
                            localStorage.setItem('user_token', a.api_token)
                            localStorage.setItem('user_id', a.id)
                            $state.go('welcome_screen');

                            loadingTimer = setInterval(function () {
                                loadAllData($cordovaSQLite, $state)
                            }, 25000);

                            loadAllData($cordovaSQLite, $state);

                        } else {
                            showAlert($scope, $ionicPopup, 'Error', "Error creating account");
                        }
                    } else
                        showAlert($scope, $ionicPopup, 'Error', "Error creating account");
                }).error(function (a, b) {

                    $ionicLoading.hide();
                    console.log(a);
                    console.log(b);

                    if (a.status == 200)
                        $state.go('welcome_screen')
                    else if (a.status == 401)
                        showAlert($scope, $ionicPopup, 'Failure', a.responseJSON['showToUser'] || "Failed to create account", 'alert');
                    else
                        showAlert($scope, $ionicPopup, 'Error', "Error creating account");
                });
            }
        }

    });
})