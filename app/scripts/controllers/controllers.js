'use strict';

angular.module('galleryGenApp')
  .controller('MainCtrl', function ($scope, $rootScope, $sce, $log, imageProvider) {
        $scope.processing = false;
        // An array of {original: <Dom Image object>, thumb: <Dom Image Object>, filename: <str>}'s
        $scope.images = imageProvider.images;

        $scope.download = {show: false};

        $scope.maxHeight = 500;
        $scope.$watch('maxHeight', function(value){
            imageProvider.setMaxHeight(parseInt(value));
        });

        function updateImages(){
            $log.info("Updating images...");
            $scope.$apply(function(){
                $scope.images = imageProvider.images;
            });

        }
        imageProvider.registerObserver(updateImages);

        $scope.processImages = function(){
            $log.info("Ok processing all the images now...");
            $scope.processing = true;

            // Make JSON file?
            var allImageData = [];
            var zip = new JSZip();
            var imgFolder = zip.folder("images");

            $scope.images.forEach(function(img){
                $log.info("Processing img: " + img.filename);

                var filename = img.filename + ".png";
                var thumbnailFilename = img.filename + "_thumb" + ".png";

                var data= {
                    source: "images/" + thumbnailFilename,
                    width: img.thumbnail.width,
                    height: img.thumbnail.height,
                    images: [
                        {
                            height: img.original.height,
                            width: img.original.width,
                            source: 'images/' + filename
                        }
                    ]
                };

                if(img.filename){data.id = img.filename}
                if(img.original.title){data.name = img.title}

                allImageData.push(data);

                // TODO check if the image.thumbnail is screwing it up...?
                // http://stackoverflow.com/questions/11211713/is-it-possible-to-dynamicly-zip-files-before-downloading-from-another-servers
                function getBase64Image(imgage) {
                    var canvas = document.createElement("canvas");
                    canvas.width = imgage.width;
                    canvas.height = imgage.height;

                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(imgage, 0, 0);

                    var dataURL = canvas.toDataURL("image/png");
                    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                }

                //var imData = getBase64Image(img) + '\n';
                var thData = getBase64Image(img.thumbnail) + '\n';//.replace(/^data:image\/(png|jpg);base64,/, "") + '\n';

                //$log.debug(imData.length);
                //$log.debug(thData.length);

                imgFolder.file(thumbnailFilename, thData, {base64: true});
                //imgFolder.file(filename, imData, {base64: true});

            });

            $scope.imageData = angular.toJson(allImageData, true);


            zip.file("images.json", $scope.imageData);
            $log.info("Creating zip....");

            var content = zip.generate({type: 'blob'});
            $log.info("Zip ready! Size is: " + content.length);
            $scope.download = function() {
                //location.href = $sce.trustAsResourceUrl("data:application/zip;base64," + content);
                saveAs(content, "gallery_thumbnails.zip");
            };

            $scope.download.show = true;
        };
  });
