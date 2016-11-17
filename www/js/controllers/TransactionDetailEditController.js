/**
 * Created by owl on 5/24/16.
 */
var selectedInterval, rateInterval;
app.controller('TransactionDetailEditController', function($scope, $stateParams, $ionicPopup, $state, $cordovaSQLite, $ionicLoading, $ionicHistory) {

    //Editing the amount of transaction using customized numeric keyboard

    $scope.number = '';
    $scope.firstInput = true;
    $scope.sign = 0;
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
                else if ($scope.number == '-') $scope.number = '-0';
            }
            else if (source === 'NUMERIC_KEY')
            {
                if ($scope.firstInput || $scope.number == '0') $scope.number = '';

                $scope.number += value;
            }

            //$scope.number = String("" + Number($scope.number));
            console.log($scope.number);
            $scope.firstInput = false;
            if ($scope.sign == -1 && $scope.number.substr(0, 1) != '-') $scope.number = '-' + $scope.number;
        }
    };



    var slider;

    //Hide the keyboard
    $("#transaction_detail_edit_page").off().click(function(){
        $scope.options.visible = false;
    });

    //Return the image path of the category
    $scope.getCategoryIcon = function(a)
    {
        switch (a)
        {
            case 'Food and Drink':
                return 'img/Transactions/Food_Drinks.png';
            case 'Travel':
                return 'img/Transactions/Transportation.png';
            case 'Shops':
                return 'img/Transactions/Shopping.png';

        }
        return 'img/Transactions/Other.png';
    };

    //return the proper format of the dollar value
    $scope.getAmountValue = function(a)
    {
        if (a > 0 && $scope.sign > 0) return "$" + a;
        else return "-$" + (-(Number(a)));
    };

    //Show the keyboard when editing the numeric value of transaction amount
    $("#transaction_keypad").off().click(function () {
        $scope.previousValue = $scope.number;
        $scope.options.visible = true;
        $scope.firstInput = true;
        $scope.$apply();
        console.log('keyboard open');

    });





    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        //Back button event
        $("#transaction_detail_edit_page #back_button").off().click(function () {
            $("#empty_area_for_keyboard").click();
            console.log(localStorage.getItem('transaction_detail_edit'));
            if (localStorage.getItem('transaction_detail_edit') == 'transaction_detail')
                $state.go('transaction_detail', fromParams);
            else if (localStorage.getItem('transaction_detail_edit') == 'challenge_detail')
                $state.go('menu.challenge_detail', fromParams.challengeID);
            else if (localStorage.getItem('transaction_detail_edit') == 'menu.transactions')
                $state.go('menu.transactions');
        });


        if (toState.name != 'transaction_detail_edit') return;

        var screen_width = $(window).width();
        var screenCenterX = screen_width / 2;

        $ionicLoading.show({template : "Please wait..."});

        //Show action sheet when deleting the category
        $scope.showActionSheet = function () {
            $ionicActionSheet.show({
                buttons: [{
                    text: "Yes"
                }],
                cancelText: "No",
                cancel: function () {

                },
                buttonClicked: function (index) {

                    $ionicLoading.show({template: "Deleting..."});

                    $.ajax({
                        url: WEBSERVICE_URL_PREFIX + 'transactions/' + ($stateParams.transactionID || toParams.transactionID),
                        data: {token: localStorage.getItem('user_token')},
                        timeout: 10000,
                        method: "DELETE"
                    }).success(function(a, b) {

                        $ionicLoading.hide();

                        if (b == 'success') {

                            var tGlobal = [];
                            for (var i in globalTransactions)
                                if (globalTransactions[i]._id == ($stateParams.transactionID || toParams.transactionID)) {}
                                else tGlobal.push(globalTransactions);

                            globalTransactions = tGlobal;

                            if (!($stateParams.challengeID || toParams.challengeID))
                                $state.go('menu.transactions', {category:$stateParams.categoryID || toParams.categoryID});
                            else
                                $state.go('menu.challenge_detail', {challengeID : ($stateParams.challengeID || toParams.challengeID)});
                        } else
                            showAlert($scope, $ionicPopup, 'Error', "Failed to delete transaction");

                    }).error(function(a, b) {

                        $ionicLoading.hide();
                        showAlert($scope, $ionicPopup, 'Error', "Failed to delete transaction");
                    });



                    return true;
                }
            })
        };


        $("#transaction_detail_edit_page #delete_button").off().click(function () {
            $scope.showActionSheet();
            return;
        });



        //Refresh the page
        var refresh = function() {
            $scope.transaction = findElementById(globalTransactions, $stateParams.transactionID || toParams.transactionID || "bzMrqrBAmxhdPJKR055nhPm68y4kpzfxwRM65");
            $scope.number = String("" + $scope.transaction.amount);
            $scope.sign = $scope.transaction.amount >= 0 ? 1 : -1;
            $scope.where = $scope.transaction.name;
            $scope.when = new Date($scope.transaction.date);

            var account = findElementById(globalAccounts, $scope.transaction._account);
            $scope.account = account.meta.name + ' ' + account.meta.number;

            slider.$PlayTo(0, 0);

            //Applying the looking of the categories in the slider
            $("#jssor_2 img").each(function(ind, ele){

                var centerPosX = $(this).offset().left + $(this).width() / 2;

                if (centerPosX > screen_width / 2 - 30 && centerPosX < screen_width / 2 + 30) {
                    $(this).css('border', '1px solid rgb(153,221,221)');
                    $(this).addClass('selected');
                }
                else {
                    $(this).css('border', '1px solid #ddd');
                    $(this).removeClass('selected');
                }

                var category = $scope.transaction.category[0];
                if (['Food and Drink', 'Travel', 'Shops'].indexOf(category) == -1) category = 'Other';
                if ($(this).parent().data('vvv') == category) {
                    slider.$PlayTo(ind, 0.001);
                }
            });


            //Applying the looking of the categories in the slider
            setTimeout(function(){
                $("#jssor_2 img").each(function (ind, ele) {

                    var centerPosX = $(this).offset().left + $(this).width() / 2;
                    var screenCenterX = screen_width / 2;
                    var rate = (0.4 / screenCenterX * (screenCenterX - Math.abs(screenCenterX - centerPosX)) + 0.6);
                    if (rate > 0.995) rate = 1;
                    $(this).css('-webkit-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                    $(this).css('-moz-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                    $(this).css('-o-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                    $(this).css('-ms-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                    $(this).css('transform', 'translate(-50%, -50%) scale(' + rate + ')');

                    $(this).css('opacity', rate * rate);

                    centerPosX = $(this).offset().left + $(this).width() / 2;
                    if (centerPosX > screen_width / 2 - 30 && centerPosX < screen_width / 2 + 30) {
                        $(this).css('border', '1px solid rgb(153,221,221)');
                        $(this).addClass('selected');
                    }
                    else {
                        $(this).css('border', '1px solid #ddd');
                        $(this).removeClass('selected');
                    }

                    console.log(centerPosX + ", " + screen_width / 2);
                });
                $ionicLoading.hide();

            }, 500);


        };

        //Update the transaction
        $scope.updateTrans = function()
        {
            var t = $stateParams.transactionID || toParams.transactionID || "bzMrqrBAmxhdPJKR055nhPm68y4kpzfxwRM65";
            if (Number($scope.number) == 0)
            {
                showAlert($scope , $ionicPopup, "Error", "You have to enter the number rather than 0");
                return;
            }

            var gt = findElementById(globalTransactions, t);
            gt.name = $("#transaction_detail_edit_page #where").val();
            gt.date = $("#transaction_detail_edit_page #when").val();
            gt.amount = $scope.sign * Math.abs(Number($scope.number));

            if (typeof gt.category === 'object') gt.category[0] = $("#jssor_2 img.selected").parent().data('vvv');
            else gt.category = [$("#jssor_2 img.selected").parent().data('vvv')];

            var gtt = JSON.parse(JSON.stringify(gt));
            gtt.token = localStorage.getItem('user_token');

            $ionicLoading.show({template : "Saving..."});

            $.ajax({
                url: WEBSERVICE_URL_PREFIX + 'transactions/' + t,
                data: gtt,
                timeout: 10000,
                method: "PUT"
            }).success(function(a, b) {


                    $ionicLoading.hide();
                    if (b == 'success') {
                        if (a.success == true) {

                            var gt = findIndexOfElementById(globalTransactions, t);
                            globalTransactions[gt].name = $("#transaction_detail_edit_page #where").val();
                            globalTransactions[gt].date = convertDate(a.body.date);
                            globalTransactions[gt].amount = a.body.amount;
                            globalTransactions[gt].category = a.body.category;

                            if (localStorage.getItem('transaction_detail_edit') == 'transaction_detail')
                                $state.go('transaction_detail', fromParams);
                            else if (localStorage.getItem('transaction_detail_edit') == 'challenge_detail')
                                $state.go('menu.challenge_detail', fromParams.challengeID);
                            else if (localStorage.getItem('transaction_detail_edit') == 'menu.transactions')
                                $state.go('menu.transactions');
                        } else {

                        }
                    } else {


                    }
                })
                .error(function(a, b) {
                    $ionicLoading.hide();

                });
        };



        //Init the slider of the category selection

        var init_jssor = function() {
            var jssor_2_options = {
                $AutoPlay : false,
                $SlideWidth: $(window).width() / 3,
                $Cols : 3,
                $Loop: true,
                $Align : $(window).width() / 3
            };

            slider = new $JssorSlider$("jssor_2", jssor_2_options);

            $("#jssor_2").width(screen_width);

            $("#jssor_2 img").css('display' , '');
            $("#jssor_2 img").addClass('center_area');
            $("#jssor_2 img").css('width', '111px');
            $("#jssor_2 img").css('height', '111px');
            $("#jssor_2 img").css('border', '1px solid #ddd');
            $("#jssor_2 img").css('border-radius', '55px');
            $("#jssor_2 img").css('top', '50%');
            $("#jssor_2 img").css('left', '50%');



            clearInterval(selectedInterval);
            clearInterval(rateInterval);


            //When position changes in the slider, focus the centered category
            slider.$On($JssorSlider$.$EVT_POSITION_CHANGE , function(slideIndex, progress) {

                //selectedInterval = setInterval(function () {

                    $("#jssor_2 img").each(function (ind, ele) {

                        var centerPosX = $(this).offset().left + $(this).width() / 2;

                        var rate = (0.4 / screenCenterX * (screenCenterX - Math.abs(screenCenterX - centerPosX)) + 0.6);
                        if (rate > 0.995) rate = 1;

                        $(this).css('-webkit-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                        $(this).css('-moz-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                        $(this).css('-o-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                        $(this).css('-ms-transform', 'translate(-50%, -50%) scale(' + rate + ')');
                        $(this).css('transform', 'translate(-50%, -50%) scale(' + rate + ')');

                        $(this).css('opacity', rate * rate);

                        if (centerPosX > screen_width / 2 - 30 && centerPosX < screen_width / 2 + 30) {
                            $(this).css('border', '1px solid rgb(153,221,221)');
                            $(this).addClass('selected');
                        }
                        else {
                            $(this).css('border', '1px solid #ddd');
                            $(this).removeClass('selected');
                        }

                        console.log(centerPosX + ", " + screen_width / 2);
                    });
                //}, 20000000);

            });


        };

        init_jssor();

        refresh();


        //Applying the looking of the categories in the slider
        $("#jssor_2 img").each(function (ind, ele) {

            var centerPosX = $(this).offset().left + $(this).width() / 2;

            var rate = (0.4 / screenCenterX * (screenCenterX - Math.abs(screenCenterX - centerPosX)) + 0.6);
            if (rate > 0.995) rate = 1;
            $(this).css('-webkit-transform', 'translate(-50%, -50%) scale(' + rate + ')');
            $(this).css('-moz-transform', 'translate(-50%, -50%) scale(' + rate + ')');
            $(this).css('-o-transform', 'translate(-50%, -50%) scale(' + rate + ')');
            $(this).css('-ms-transform', 'translate(-50%, -50%) scale(' + rate + ')');
            $(this).css('transform', 'translate(-50%, -50%) scale(' + rate + ')');

            $(this).css('opacity', rate * rate);

            if (centerPosX > screen_width / 2 - 30 && centerPosX < screen_width / 2 + 30) {
                $(this).css('border', '1px solid rgb(153,221,221)');
                $(this).addClass('selected');
            }
            else {
                $(this).css('border', '1px solid #ddd');
                $(this).removeClass('selected');

            }
            console.log(centerPosX + ", " + screen_width / 2);
        });

    });
})