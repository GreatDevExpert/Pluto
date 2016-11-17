/**
 * Created by owl on 5/24/16.
 */

//Amex screen of plaid bank account

app.controller('AmexController', function($scope, $state, $ionicPopup, $ionicHistory) {

    $(window).bind('load', function() {
        document.getElementById('overlay-container').style.display = '';
    });

    window.onload = function() {
        document.getElementById('overlay-container').style.display = '';
    };
    $(".exit-button").off().click(function() {
        history.go(-1);
    });

    $("input[type=submit]").click(function() {
        var formData = {
            'client_id': '570cbe080259902a3980eaa6',
            'secret': 'b335f16d572941e5a68e2f78d8620a',
            username: document.getElementById('amexusername').value,
            institution_type: "amex",
            token: localStorage.getItem('user_token'),
            password: document.getElementById('amexpassword').value
        };




        $.ajax({
            url: WEBSERVICE_URL_PREFIX + 'addConnectUser',
            data: formData,

            timeout: 10000,
            method: "POST"
        }).success(function(a, b) {

            if (b == 'success' && a.success == true) {
                $state.go('linkbankaccount', {
                    data: a,
                    success: true,
                    failed: false
                });
            } else {
                $state.go('linkbankaccount', {
                    failed: true,
                    data: null,
                    success: false
                });
            }
        }).error(function(a, b) {
            $state.go('linkbankaccount', {
                failed: true,
                data: null,
                success: false
            });
        });
    })

    $scope.goToState = function(status, id) {
        if (id) document.getElementById(id).style.display = 'none';
        $state.go(status)
    }

})