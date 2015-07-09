var map;
var circle;
var arrMarkers = new Array(0);
var bounds;
var zoom = 14;
var markers = [];           // array to hold markers
var kmRadius1 = {'min': 5, 'max': 10};
var kmRadius2 = {'min': 0.5, 'max': 1};
var last_point;
var fancyObject = {
    'width': 700,
    'height': 500,
    'padding': 10,
    'href': '#mainContent',
    'transitionIn': 'elastic',
    'transitionOut': 'elastic',
    'closeBtn': false,
    'closeClick': false,
    'autoSize': false,
    keys: {
        close: null
    },
    helpers: {
        overlay: {closeClick: false} // prevents closing when clicking OUTSIDE fancybox
    }
};
var i = 0,
        delay = 1000,
        animate = 200;
var registrandoPosicion = false, idRegistroPosicion, ultimaPosicionUsuario, marcadorUsuario;
google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function() {

    if ($('body').hasClass('homepage')) {
        doStart();
    }

});

function showResult() {
    var latitude = $.cookie('user_latitude');
    var longitude = $.cookie('user_longitude');

    var lt = new google.maps.LatLng(latitude, longitude);

    console.log(lt);

    map.setZoom(zoom);
    map.panTo(lt);

    createMarker(lt);
}

function doStart() {
    setTimeout(function() {
        $.fancybox(fancyObject);
    }, 1000);


    $('form.register').submit(function() {
        i = 0;
        var ul = $('<ul></ul>');

        $('#mainContent').html(ul);
        $('#mainContent').append("<form class='do'><input type='submit' value='enviar'></form>");

        ul.append('<li>Buscando</li>');

        var labels = ["Saab", "Volvo", "BMW"];

        $.each(labels, function(index, value) {

            ul.append('<li>' + value + '</li>');
        });

        animateList(showButton);

        return false;
    });
}

function animateList(funcToExecute) {

    var list = $('ul');
    var imax = list.find("li").length - 1;
    list.find("li:eq(" + i + ")")
            .show()
            .animate({"fontSize": "80px"}, animate)
            .animate({"fontSize": "80px"}, delay)
            .animate({"fontSize": "30px"}, animate, function() {
                i++;
                if (i <= imax) {
                    animateList(funcToExecute);
                } else {
                    funcToExecute();
                }
            });

}
;

function showButton() {
    $('form.do').show();

    $('form.do').submit(function() {
        i = 0;
        var ul = $('<ul></ul>');

        $('#mainContent').html(ul);


        var labels = ["Saab", "Volvo", "Generando Mapa"];

        $.each(labels, function(index, value) {

            ul.append('<li>' + value + '</li>');
        });

        animateList(registrarPosicion);

        return false;
    });
}


function initialize() {
    var mapOptions = {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

    if ($('body').hasClass('result')) {
        google.maps.event.addListenerOnce(map, 'idle', showResult);
    }
}
function registrarPosicion() {
    if (registrandoPosicion) {
        registrandoPosicion = false;
        navigator.geolocation.clearWatch(idRegistroPosicion);
        limpiarUbicacion();
    } else {
        idRegistroPosicion = navigator.geolocation.watchPosition(exitoRegistroPosicion, falloRegistroPosicion, {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        });
    }
}

function exitoRegistroPosicion(position) {
    if (!registrandoPosicion) {
        // Es la primera vez 
        registrandoPosicion = true;
        ultimaPosicionUsuario = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        marcadorUsuario = new google.maps.Marker({
            position: ultimaPosicionUsuario,
            map: map
        });

        $.cookie('user_latitude', position.coords.latitude, {expires: 7, path: '/'});
        $.cookie('user_longitude', position.coords.longitude, {expires: 7, path: '/'});
    } else {
        var posicionActual = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        ultimaPosicionUsuario = posicionActual;
        marcadorUsuario.setPosition(posicionActual);
        $.cookie('user_latitude', position.coords.latitude, {expires: 7, path: '/'});
        $.cookie('user_longitude', position.coords.longitude, {expires: 7, path: '/'});
    }
    map.panTo(ultimaPosicionUsuario);
    firstResult();

}

function firstResult() {
    map.setZoom(zoom);
    navigator.geolocation.clearWatch(idRegistroPosicion);
    $.fancybox.close();
    setTimeout(function() {
        fancyObject.content = $("#paypalContent");
        fancyObject.helpers = {
            overlay: {
                opacity: 1,
                css: {'background-color': '#ffffff'}
            }
        };
        console.log(fancyObject);
        $.fancybox(fancyObject);
    }, 5000);
}

function falloRegistroPosicion() {
    alert('No se pudo determinar la ubicación');
    limpiarUbicacion();
}


function placeMarker(location, text)
{
    var iconFile = 'http://www.daftlogic.com/images/gmmarkersv3/stripes.png';
    var marker = new google.maps.Marker({position: location, map: map, icon: iconFile, title: text.toString(), draggable: false});
    return marker;
}

function createMarker(coord) {
    var pos = new google.maps.LatLng(coord.lat(), coord.lng());
    var marker = new google.maps.Marker({
        position: pos,
        map: map
    });
    markers.push(marker);



    addRadious(Math.random() * (kmRadius1.max - kmRadius1.min) + kmRadius1.min, 1, map.getCenter(), '#088DA5');
    addRadious(Math.random() * (kmRadius2.max - kmRadius2.min) + kmRadius2.min, 10, last_point, '#FFF68F');
}

function addRadious(kmR, maxPoints, center, hexa) {
    console.log("KM+" + kmR);
    circle = new google.maps.Circle({
        center: center,
        radius: kmR * 1000, // meters
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: hexa,
        fillOpacity: 0.26
    });

    circle.setMap(map);

    var bounds = circle.getBounds();
    map.fitBounds(bounds);
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    for (var i = 0; i < maxPoints; i++) {
        var ptLat = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
        var ptLng = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
        var point = new google.maps.LatLng(ptLat, ptLng);
        last_point = point;
        if (google.maps.geometry.spherical.computeDistanceBetween(point, circle.getCenter()) < circle.getRadius()) {
            addMarker(map, point, "marker " + i);
        }
    }
}

function addMarker(map, point, content) {
    var iconFile = 'http://www.daftlogic.com/images/gmmarkersv3/stripes.png';

    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: iconFile
    });
    google.maps.event.addListener(marker, "click", function(evt) {
        infowindow.setContent(content + "<br>" + marker.getPosition().toUrlValue(6));
        infowindow.open(map, marker);
    });
    return marker;
}