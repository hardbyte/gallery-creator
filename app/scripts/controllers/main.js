'use strict';

angular.module('galleryGenApp')
  .controller('MainCtrl', function ($scope, $log, imageProvider) {
        $scope.images = imageProvider.images;

        function updateimages(){
            $log.info("Updating images...");
            $scope.$apply(function(){
                $scope.images = imageProvider.images;
            });

        }
        imageProvider.registerObserver(updateimages);

  });
