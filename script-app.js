$(document).ready(function () {
    
    var lat, long;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successFunction);
    } else {
        alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
    }

    function successFunction(position) {
        lat = position.coords.latitude;
        long = position.coords.longitude;
        
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://us1.locationiq.com/v1/reverse?key=pk.a19b36c541b2259c22749dd3c4981283&lat="+lat+"&lon="+long+"&format=json&",
            // "url": "https://us1.locationiq.com/v1/nearby?key=pk.a19b36c541b2259c22749dd3c4981283&lat="+lat+"&lon="+long+"&radius=100&format=json",
            "method": "GET"
        }
    
        $.ajax(settings).done(function (response) {
            console.log(response);
        });
        
        //Add your LocationIQ Maps Access Token here (not the API token!)
        locationiq.key = 'pk.a19b36c541b2259c22749dd3c4981283';
        //Define the map and configure the map's theme
        var map = new maplibregl.Map({
            container: 'map',
            style: locationiq.getLayer("Streets"),
            zoom: 15,
            center: [long, lat]
        });
        
        //Define layers you want to add to the layer controls; the first element will be the default layer
        var layerStyles = {
            "Streets": "streets/vector",
            "Dark": "dark/vector",
            "Light": "light/vector"
        };
        
        map.addControl(new locationiqLayerControl({
            key: locationiq.key,
            layerStyles: layerStyles
        }), 'top-right');

        $.getJSON("pharmacies.json", function(json) {
            console.log(json);
            
            for(var i=0; i<json.length; i++) {
                var nearest;
                console.log(json[i][7] + ' - ' + json[i][6])

                if (distance(lat, long, json[i][7], json[i][6], "K") <= 0.1) {
                    console.log(json[i][1]);
                }
            }
            
            for(var i=0; i<json.length; i++) {
                var geojson = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {
                                "message": "Foo",
                                "iconSize": [10, 10]
                            }
                        }
                    ]
                }

                //1. Add it while creating the marker
                // Create a popup
                var popup = new maplibregl.Popup()
                .setHTML('<b>Name: </b>'+json[i][1]+'<br> <b>Address: </b>'+json[i][5]+', '+json[i][4]+', '+json[i][3]+', '+json[i][2]);
            
                geojson.features.forEach(function(marker) {
                    var el = document.createElement('div');
                    el.id = 'markerWithExternalCss';
                    el.style.width = '30px';
                    el.style.height = '30px';
                    
                    // finally, create the marker
                    var markerWithExternalCss = new maplibregl.Marker(el)
                        .setLngLat([json[i][6], json[i][7]])
                        .setPopup(popup)
                        .addTo(map);
                })
            }
        });
    }

    function distance(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        
        return dist
    }
})