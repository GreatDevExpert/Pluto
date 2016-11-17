/**
 * Created by owl on 5/24/16.
 */
app.controller('MenuController', function($scope, $ionicPopup, $state, $cordovaSQLite, $ionicLoading, $ionicHistory) {

	$("#side_menu_user_name").html(localStorage.getItem('user_name'));
	$("#side_menu_email_address").html(localStorage.getItem('user_email'));

	$scope.goTo = function(a)
	{
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
		if (a == 'menu.transactions')
		{
			$ionicLoading.show({template: "Loading transaction data..."});
			setTimeout(function(){
				$ionicLoading.hide();
				if (localStorage.getItem('tutorial_transaction_first') != 'no')
				{
					localStorage.setItem('tutorial_transaction_first', 'no');
					$("#tutorial_transaction").css('display', '');
				}

			}, 2000);
		}
		setTimeout(function() {
			$state.go(a);
		}, 100)



	};

	$scope.onSignOut = function()
	{

		$ionicLoading.show({template: "Signing out..."});
		var formData = {

		};



		$.ajax({
			url: WEBSERVICE_URL_PREFIX + 'me/clearToken',
			data: {token: localStorage.getItem('user_token')},
			timeout: 10000,
			method: "PUT"
		}).success(function(a, b) {

				//clear all the old data and initialize the app

				localStorage.setItem('user_token', '');
				localStorage.setItem('user_id', '');
				localStorage.setItem('user_name', '');
				localStorage.setItem('user_email', '');
				localStorage.setItem('current_goal_id', '');
				localStorage.setItem('current_challenge_id', '');
				localStorage.setItem('current_challenge_category', '');
				localStorage.setItem('user_data', '{"email":"", "password": ""}');
				globalAccounts = globalBanks = globalChallenges = globalGoals = globalTransactions = null;


				var tempInterval = setInterval(function()
				{
					if (localStorage.getItem('loadingGlobalData') == 'false')
					{

						clearInterval(loadingTimer);
						loadingTimer = null;
						$ionicLoading.hide();
						$state.go('login');
						clearInterval(tempInterval);
						tempInterval = null;
					}
				}, 1500);

			})
			.error(function(a, b) {
				$ionicLoading.hide();
				showAlert($scope, $ionicPopup, 'Failure', 'Network connection problem!', 'alert');
			});



	};
})