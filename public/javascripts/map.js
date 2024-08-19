function createMap() {
    var map = L.map('map').setView({lon: 0, lat: 0}, 2.5);

    const southWest = L.latLng(-90, -180);
    const northEast = L.latLng(90, 180);
    const bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    map.on('drag', function () {
        map.panInsideBounds(bounds, {animate: false});
    });

    // add the OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        minZoom: 2,
        maxZoom: 9,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
    // show the scale bar on the lower left corner
    L.control.scale({imperial: true, metric: true}).addTo(map);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/map-data', true);
    xhr.responseType = 'json';

    const markers = L.markerClusterGroup();

    xhr.onload = function () {
        if (xhr.status === 200) {
            const results = xhr.response;
            console.log(results.length);
            for (var i = 0; i < results.length; i++) {
                if (typeof results[i].longitude === 'number' && typeof results[i].latitude === 'number') {
                    const marker = L.marker({
                        lon: parseFloat(results[i].longitude),
                        lat: parseFloat(results[i].latitude)
                    // }).bindPopup("<a href=\"/datasets/" + results[i].assembly + "/antismash/index.html \" target='_blank'> " + results[i].assembly + "</a>");
                    }).bindPopup("<a href=\"/antismash?dataset=" + results[i].assembly + " \" target='_blank'> " + results[i].assembly + "</a>");
                    markers.addLayer(marker);
                }
            }
        }
    };

    map.addLayer(markers);

    xhr.send();
}

function getSampleInfo() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/sample-info', true);
    xhr.responseType = 'json';

    console.log("getting sample info");
    xhr.onload = function () {
        if (xhr.status === 200) {
            const results = xhr.response;
            document.getElementById("samples-count").innerHTML = results[0].sample_count;
            document.getElementById("analyzed-count").innerHTML = results[0].success;
            document.getElementById("running-count").innerHTML = results[0].running;
            document.getElementById("bgcs-count").innerHTML = results[0].protoclusters;
            document.getElementById('compl-bgcs').innerHTML = results[0].complbgcscount;
        }
    }
    xhr.send()
}
