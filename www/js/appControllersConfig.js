/**
 * Created by owl on 5/24/16.
 */

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('index', {
            url: '/',
            templateUrl: 'templates/home.html',
            controller: 'SplashController'
        })



        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })



        .state('signup', {
            url: '/signup',
            templateUrl: 'templates/signup.html',
            controller: 'SignupController'
        })



        .state('welcome_screen', {
            url: '/welcome_screen',
            templateUrl: 'templates/welcome_screen.html',
            controller: 'WelcomeScreenController'
        })



        .state('linkbankaccount', {
            url: '/linkbankaccount',
            templateUrl: 'templates/linkbankaccount.html',
            // params : ['data', 'success', 'failed'],
            params: {
                data: null,
                success: null,
                failed: null
            },
            controller: 'LinkBankAccountController'
        })



        .state('amex', {
            url: '/amex',
            templateUrl: 'templates/amex.html',
            controller: 'AmexController'
        })



        .state('adjust_benchmark', {
            url: '/adjust_benchmark',
            templateUrl: 'templates/adjust_benchmark.html',
            controller: 'AdjustBenchmarkController',
            // params: ['average', 'challengeID']
            params:    {average: null, challengeID : null}

        })



        .state('create_goal', {
            url: '/create_goal',
            templateUrl: 'templates/create_goal.html',
            controller: 'CreateGoalController',
            // params: ['goalID']
            params : {goalID : null}
        })


        .state('account_detail_pluto', {
            url: '/account_detail_pluto',
            templateUrl: 'templates/account_detail_pluto.html',
            controller: 'AccountDetailPlutoController'
        })



        .state('pick_challenge', {
            url: '/pick_challenge',
            templateUrl: 'templates/pick_challenge.html',
            controller: 'PickChallengeController'
        })


        .state('menu', {
            url: '/menu',
            templateUrl: 'templates/menu.html',
            controller: 'MenuController',
            abstract : true
        })



        .state('menu.goal_list', {
            url: '/goal_list',
            views: {
                'menuContent' : {
                    templateUrl: 'templates/goal_list.html',
                    controller: 'GoalListController'
                }
            }
        })
        .state('insights', {
            url: '/insights',
            templateUrl: 'templates/insights.html',
            controller: 'InsightsController'

        })


        .state('menu.challenge_detail', {
            url: '/challenge_detail',
            
            views: {
                'menuContent' : {
                    templateUrl: 'templates/challenge_detail.html',
                    controller: 'ChallengeDetailController',
                    params : ['challengeID', 'fromPush']
                }
            },
            params : {challengeID: null, fromPush: null}
        })



        .state('menu.transactions', {
            url: '/transactions',
            params : {category: null},
            // params : ['category'],
            views: {
                'menuContent' : {
                    templateUrl: 'templates/transaction.html',
                    controller: 'TransactionController'

                }
            }
        })

        

        .state('goal_edit', {
            url: '/goal_edit',
            templateUrl: 'templates/goal_edit.html',
            controller: 'GoalEditController',
            params: {goalID: null, fromPush: null}
            // params : ['goalID']
        })



        .state('transaction_detail', {
            url: '/transaction_detail',
            templateUrl: 'templates/transaction_detail.html',
            controller: 'TransactionDetailController',
            params: {transactionID: null, categoryID : null, challengeID : null}
            // params : ['goalID']
        })


        .state('menu.accounts', {
            url: '/accounts',
            views: {
                'menuContent' : {
                    templateUrl: 'templates/accounts.html',
                    controller: 'AccountController'
                }}
            // params : ['goalID']
        })

        .state('account_detail', {
            url: '/account_detail',
            templateUrl: 'templates/account_detail.html',
            controller: 'AccountDetailController',
            params : {bankID : null}
        })


        .state('transaction_detail_edit', {
            url: '/transaction_detail_edit',
            templateUrl: 'templates/transaction_edit_detail.html',
            controller: 'TransactionDetailEditController',
            params: {transactionID: null, categoryID : null, challengeID : null}
            // params : ['goalID']
        })


        .state('forgotpassword', {
            url: '/forgotpassword',
            templateUrl: 'templates/forgotpassword.html',
            controller: 'ForgotController'
        });
    $urlRouterProvider.otherwise('/');
});
