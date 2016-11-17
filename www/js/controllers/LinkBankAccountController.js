/**
 * Created by owl on 5/24/16.
 */
app.controller('LinkBankAccountController', function($cordovaSQLite, $ionicLoading, $compile, $scope, $rootScope, $stateParams, $routeParams, $state, $ionicPopup, $ionicHistory) {



    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {


        if (toState.name != 'linkbankaccount') return;

        //Close the popup
        $("#linkbankaccount_page #uhahahaha").off().click(function() {
            document.getElementById('almost_done').style.display = 'none';
            clearInterval(loadingTimer);
            loadingTimer = setInterval(function() {
                loadAllData($cordovaSQLite, $state)
            }, 25000);
            loadAllData($cordovaSQLite, $state, false, $ionicLoading, function() {
                $state.go('pick_challenge');
            });
        });


        //When backbutton is clicked
        $("#linkbankaccount_page #back_button").off().click(function()
        {
            if (localStorage.getItem('linkbankaccount_page_from') == 'create_goal') {
                localStorage.setItem('create_goal_page_from', 'linkbankaccount');
                localStorage.setItem('linkbankaccount_page_from', '');
                $state.go('create_goal');
            }
            else
            {
                $ionicHistory.goBack();
            }
        });



        //Open the plaid connect popup supported by plaid API
        var appScheme = 'linkApp';

        var sandboxHandler = Plaid.create({
            env: 'tartan',
            clientName: 'Client',
            key: '11063f927c4371963042d5e4956ddf',
            product: 'auth',


            onSuccess: function(public_token, metadata) {

                var action = 'handlePublicToken';
                var url = appScheme + '://' + action + '#' + public_token;

                if ($rootScope.bankLoadingStatus == undefined) {
                    $rootScope.bankLoadingStatus = {};

                }

                $rootScope.bankLoadingStatus[metadata.institution.type] = 'loading';
                $rootScope.$apply();
                var formData = {
                    'institution_type': metadata.institution.type,
                    'token': localStorage.getItem('user_token'),
                    'public_token': public_token,
                    'user': localStorage.getItem('user_id')
                }
                $.ajax({
                    url: WEBSERVICE_URL_PREFIX + 'banks',
                    data: formData,
                    timeout: 10000,
                    method: "POST"
                }).success(function(a, b) {

                    if (b == 'success' && a.success == true) {
                        $rootScope.bankLoadingStatus[metadata.institution.type] = 'ok';
                    } else {
                        $rootScope.bankLoadingStatus[metadata.institution.type] = 'failed';
                    }

                    $rootScope.$apply();

                }).error(function(a, b) {
                    $rootScope.bankLoadingStatus[metadata.institution.type] = 'failed';
                    $rootScope.$apply();
                });



                window.location.href = url; // send public_token back to the ViewController delegate



            },
            onExit: function() {
                var action = 'handleOnExit';
                var url = appScheme + '://' + action;
                window.location.href = url;

            },
            onLoad: function() {
                var action = 'handleOnLoad';
                var url = appScheme + '://' + action;
                window.location.href = url;


            }
        });


        //Link each institutions
        $("#bank_list li").off().click(function() {

            if (document.getElementById('almost_done').style.display == 'none') {

                if ($rootScope.bankLoadingStatus[$(this).data('type')] == 'ok')
                {
                    showAlert($scope, $ionicPopup, 'Error', "Already added! Please select another institution");
                }
                else if ($rootScope.bankLoadingStatus[$(this).data('type')] == 'loading')
                {
                    showAlert($scope, $ionicPopup, 'Error', "Please keep patience! We're trying to connect now");
                }
                else if ($(this).data('type') == 'amex') {
                    $state.go('amex');
                } else sandboxHandler.open($(this).data('type'));
            }
        });


        $scope.openPlaid = function() {
            sandboxHandler.open();
        };


        $rootScope.bankLoadingStatus = {};


        //Load Bank Info to your Pluto Account

        $.ajax({
            url: WEBSERVICE_URL_PREFIX + 'banks',
            data: {
                token: localStorage.getItem('user_token')
            },
            timeout: 10000,
            method: "GET"
        }).success(function(a, b) {

            if (b == 'success' && a.success == true) {
                $rootScope.bankLoadingStatus = {};
                for (c in a.data)
                    $rootScope.bankLoadingStatus[a.data[c]['institution_type']] = 'ok';
            }

            $rootScope.$apply();

        }).error(function(a, b) {

            $rootScope.bankLoadingStatus = {};
            $rootScope.$apply();
        });

        $("#linkbankaccount_page #next_button").off().click(function() {
            if (Object.keys($rootScope.bankLoadingStatus).length == 0)
            {
                showAlert($scope, $ionicPopup, 'Error', "You have to add at least one institution.");
                return;
            }
            if (fromState.name == 'menu.accounts')
            {
                $ionicHistory.goBack();
            }
            else document.getElementById("almost_done").style.display = "";
        });




        // Link bank account



        if (typeof($rootScope.bankLoadingStatus) === 'undefined' || $rootScope.bankLoadingStatus === null) {
            $rootScope.bankLoadingStatus = {};

        }

        if (toParams.failed === true) {
            $rootScope.bankLoadingStatus['amex'] = 'failed';
        } else if (toParams.success === true) {

            $rootScope.bankLoadingStatus['amex'] = 'loading';

            var formData = {
                'institution_type': 'amex',
                'token': localStorage.getItem('user_token'),
                'access_token': toParams.data[1]['access_token'],
                'user': localStorage.getItem('user_id')
            }
            $.ajax({
                url: WEBSERVICE_URL_PREFIX + 'banks',
                data: formData,
                timeout: 10000,
                method: "POST"
            }).success(function(a, b) {

                if (b == 'success' && a.success == true) {
                    $rootScope.bankLoadingStatus['amex'] = 'ok';
                } else {
                    $rootScope.bankLoadingStatus['amex'] = 'failed';
                }

                $rootScope.$apply();

            }).error(function(a, b) {

                $rootScope.bankLoadingStatus['amex'] = 'failed';
                $rootScope.$apply();
            });
        }
    });



    if ($stateParams['parent_screen'] == 'welcome_screen' || $routeParams['parent'] == 'welcome')
        document.getElementById('back_button').innerHTML = 'Log out';

    //$ionicLoading.show({template: "Loading bank information...."});




});