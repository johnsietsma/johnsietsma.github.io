---
layout: post
title: Using Angular.js to view Melbourne's public art
tags: angular, art
---


I've been wanting to learn more about [Angular.JS](https://angularjs.org/) so made a quick web page to view the location all of Melbourne's public art on a Google Map.

There is an amazing amount of open data on the web. The Australian government has been releasing its data through [data.gov.au](https://data.gov.au/). The dataset of all [Melbourne's public art](https://data.melbourne.vic.gov.au/Assets-Infrastructure/Melbourne-Public-Artwork/6fzs-45an) seemed like a great place to start.

I used the [AngularJS Google Maps directives](https://angular-ui.github.io/angular-google-maps/#!/). It provdes a promise that gets called when Google Maps is loaded and ready to go. Then I fire off a http request to data.gov.au, with yet another promise that extracts the marker data and sets it the data bound markers array.
<!--more-->

I center the map over Melbourne with an appropraite zoom level and off we go.

~~~Javascript
myApp.controller( "gMap",function( $scope, $http, uiGmapGoogleMapApi ) {
    uiGmapGoogleMapApi
    .then(function(maps) {
        $scope.map = { 
            center: { latitude: -37.8141, longitude: 144.9633 }, 
            zoom: 14 
        };
        $http.get("https://data.melbourne.vic.gov.au/api/views/6fzs-45an/rows.json?accessType=DOWNLOAD")
        .then(function(response) {
            var marker = response.data.data[0];
            $scope.markers = response.data.data;
        });
    });
});
~~~

The second piece is the markers themselves. Using ng-repeat directive, AngularJS will generate all the markers withut me having to write any imperative code.

~~~Javascript
<ui-gmap-marker ng-repeat="marker in markers"
        coords="{ 'latitude': marker[19][1], 'longitude': marker[19][2] }" idkey="marker[0]">
      <ui-gmap-window>
        <div>{{marker[9]}}</div>
      </ui-gmap-window>
    </ui-gmap-marker>
  </ui-gmap-google-map>
~~~

Now hard coding the column numbers of the data set isn't the most robust solution, but it got the job done for this blog post!

[And finally here is page with the public art on a Google map.](/public_art.html)

I was amazed at how easy this was to get up and running, and I hope to write some more AngularJS soon.


