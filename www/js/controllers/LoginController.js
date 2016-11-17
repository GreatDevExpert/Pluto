/**
 * Created by owl on 5/24/16.
 */
app.controller('LoginController', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaSQLite, $ionicHistory) {

    $scope.$on('$ionicView.enter', function (scopes, states)
    {
            $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    });

    //Initialize the data
    localStorage.removeItem('current_goal_id');
    localStorage.removeItem('current_challenge_id');

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (toState.name != 'login') return;

        clearInterval(loadingTimer);
        loadingTimer = null;


        globalAccounts = globalBanks = globalChallenges = globalGoals = globalTransactions = null;

        console.log(localStorage.getItem('user_data'));



        if (typeof(localStorage.getItem('user_data')) !== 'string')
            localStorage.setItem('user_data', '{}');

        var loginData = JSON.parse(localStorage.getItem('user_data'));

        document.getElementById('signin').onclick = function() {
            if (document.getElementById('email').value.length == 0) {
                document.getElementById('email').focus();
                showAlert($scope, $ionicPopup, 'Validation', "Email can't be empty!");
            } else if (!validateEmail(document.getElementById('email').value)) {
                document.getElementById('email').focus();
                showAlert($scope, $ionicPopup, 'Validation', "Invalid e-mail address!");
            } else if (document.getElementById('password').value.length == 0) {
                document.getElementById('password').focus();
                showAlert($scope, $ionicPopup, 'Validation', "Password can't be empty!");
            } else {
                var formData = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    device_token : localStorage.getItem('device_token'),
                    timezone: new Date().getTimezoneOffset()
                };

                $ionicLoading.show({
                    template: "Logging in..."
                });

                $.ajax({
                    url: WEBSERVICE_URL_PREFIX + 'login',
                    data: formData,
                    timeout: 10000,
                    method: "POST"
                }).success(function(a, b, xhr) {


                        console.log(a, xhr);
                        if (b == 'success') {
                            if (a.success == true) {

                                localStorage.setItem('user_data', JSON.stringify(formData));
                                localStorage.setItem('user_token', a.api_token)
                                localStorage.setItem('user_id', a.id)
                                localStorage.setItem('user_name', a.user['first_name'] + ' ' + a.user['last_name']);
                                localStorage.setItem('user_email', a.user['email']);



                                //Load all the data
                                loadingTimer = setInterval(function() {
                                    loadAllData($cordovaSQLite, $state)
                                }, 25000);

                                loadAllData($cordovaSQLite, $state, true, $ionicLoading);


                            } else {
                                $ionicLoading.hide();
                                showAlert($scope, $ionicPopup, 'Failure', 'Invalid Username/password!', 'alert');
                            }
                        } else {
                            $ionicLoading.hide();
                            showAlert($scope, $ionicPopup, 'Failure', 'Bad network status!', 'alert');
                        }
                    })
                    .error(function(a, b, xhr) {
                        $ionicLoading.hide();
                        console.log(xhr);

                        if (a.status == 200)
                            $state.go('welcome_screen')
                        else if (a.status == 401)
                            showAlert($scope, $ionicPopup, 'Failure', a.responseJSON['showToUser'], 'alert');
                        else showAlert($scope, $ionicPopup, 'Failure', 'Unexpected network problem!', 'alert');
                    });
            }
        }

        if (loginData == null || loginData.email == null || typeof(loginData) === 'undefined' || typeof(loginData.email) === 'undefined');
        else {
            document.getElementById('email').value = loginData.email;
            document.getElementById('password').value = loginData.password;
            //document.getElementById('signin').onclick();
        }

        $("#login_page #back_button").off().click(function()
        {
            $ionicHistory.goBack();
        });
    });
});