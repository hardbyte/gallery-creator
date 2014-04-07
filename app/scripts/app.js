'use strict';

angular.module('galleryGenApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
    .factory("imageProvider", function($log, $rootScope){
        $log.info("Service ready");
        var observerCallbacks = [];
        var images = [];

        $rootScope.$on("new-image", function(e, image){
            $log.info("Got new image data!");
            images.push({src:image, name: ''});
            notifyObservers();
            e.stopPropagation();
        });

        var notifyObservers = function(){
            angular.forEach(observerCallbacks, function(cb){cb();});
        };

        return {
            images: images,
            registerObserver: function(callback){
                observerCallbacks.push(callback);
            }
        }

    })
    .directive('droppable', function($compile, $rootScope, $log){
        return {
            restrict: "A",
            link: function(scope, element, attrs){

                element.context.ondragover = function(event){
                    element.addClass("indicate-drop");
                    return false;
                };

                element.context.ondragleave = function(event){
                    element.removeClass("indicate-drop");
                };

                element.context.ondrop = function(event){
                    $log.info("Something has been dropped!");

                    var files = event.dataTransfer.files;

                    $log.info("Files received:");
                    $log.info(files);

                    for(var i=0; i<files.length; i++){
                        var f = files[i];
                        var reader = new FileReader();
                        reader.onload = (function(){return function(e){
                            $log.info("File loaded");
                            $log.info(e);

                            // e.target.result now has the image as a data uri


                            $log.info("Now we try share...");
                            $rootScope.$emit("new-image", e.target.result);


                        };})(f);
                        reader.readAsDataURL(f);
                    }


                    element.removeClass("indicate-drop");
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                };
            }
        };
    });
