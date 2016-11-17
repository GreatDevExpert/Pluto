
function showAlert($scope, $ionicPopup, title, subTitle, type) 
{
      $scope.showPopup = function() {
        $scope.data = {};

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
              template: '<input type="password" ng-model="data.wifi">',
              title: title,
              subTitle: subTitle,
              scope: $scope,
              buttons: [
                { text: 'Cancel' },
                {
                  text: '<b>Save</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                    if (!$scope.data.wifi) {
                      //don't allow the user to close unless he enters wifi password
                      e.preventDefault();
                    } else {
                      return $scope.data.wifi;
                    }
                  }
                }
              ]
          });

          myPopup.then(function(res) {
            console.log('Tapped!', res);
          });

          $timeout(function() {
             myPopup.close(); //close the popup after 3 seconds for some reason
          }, 3000);
     };

 // A confirm dialog
     $scope.showConfirm = function() {
       var confirmPopup = $ionicPopup.confirm({
         title: title,
         template: subTitle
       });

       confirmPopup.then(function(res) {
         if(res) {
           console.log('You are sure');
         } else {
           console.log('You are not sure');
         }
       });
     };

     // An alert dialog
     $scope.showAlert = function() {
       var alertPopup = $ionicPopup.alert({
         title: title,
         template: subTitle
       });

       alertPopup.then(function(res) {
         console.log('Thank you for not eating my delicious ice cream cone');
       });
     };

     if (type == 'alert')
     {
        $scope.showAlert()
     }
     else $scope.showConfirm();
}