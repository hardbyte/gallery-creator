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

    // Todo refactor into services and filters etc
    .factory("imageProvider", function($log, $q, $rootScope){
        $log.info("Service ready");
        var observerCallbacks = [];
        var images = [];
        var maxHeight = 500;

        var notifyObservers = function(){
            angular.forEach(observerCallbacks, function(cb){cb();});
        };

        var generateThumbnail = function(originalImage){
            var deferred = $q.defer();
            setTimeout(function() {

                $log.info("Making thumbnail for " + originalImage.filename);
                $log.info("MaxHeight is currently: " + maxHeight);
                $log.info(typeof(maxHeight));

                var img = originalImage;


                // Make em small
                function foldImage(image) {

                    var width = Math.floor(image.width / 2),
                        height = Math.floor(image.height / 2);

                    // Create an off screen canvas
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');

                    // Set the canvas dimensions
                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(image, 0, 0, width, height);
                    var newImage = new Image();
                    newImage.title = image.title;
                    newImage.src = canvas.toDataURL('image/png');
                    return newImage;
                }


                while (img.height > maxHeight) {
                    // Fold the image in half
                    img = foldImage(img);
                }

                $log.info("New thumbnail height: " + img.height);

                deferred.resolve(img);
            }, 100);


            return deferred.promise;
        };
        return {
            setMaxHeight: function(value){
                $log.debug("Updating max height to: " + value);
                maxHeight = value;
            },
            addImage: function(imageData){
                $log.info("Got new image data!");
                var img = new Image();
                var filename = imageData.name;
                filename = filename.slice(0, filename.lastIndexOf("."));
                //filename = filename.split(".").join(' ').split('-').join(' ').split('_').join(' ');
                $log.info("filename: " + filename);
                img.filename = filename;
                img.src = imageData.dataURI;

                generateThumbnail(img).then(function(thumb){
                    img.thumbnail = thumb;

                });
                images.push(img);
                notifyObservers();

            },
            images: images,
            registerObserver: function(callback){
                observerCallbacks.push(callback);
            }
        }

    })
    .directive('droppable', function($compile, $rootScope, $log, imageProvider){
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
                        reader.onload = (function(f){return function(e){
                            $log.info("File loaded");
                            $log.info(f.name);
                            $log.info(e);

                            // e.target.result now has the image as a data uri
                            $log.info("Now we try share...");
                            imageProvider.addImage({name: f.name, dataURI: e.target.result});


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
