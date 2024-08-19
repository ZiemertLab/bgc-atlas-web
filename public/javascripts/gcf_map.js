function createMapGCF() {
    const map = L.map('map').setView({lon: 0, lat: 0}, 2.5);

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

    // Get the gcf query parameter from the URL
    const gcf = window.location.search.split('=')[1];

    // Include the gcf query parameter in the request URL
    const url = gcf ? `/map-data-gcf?gcf=${gcf}` : '/map-data-gcf';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    const markers = L.markerClusterGroup();

    // Create a new LatLngBounds object
    const markerBounds = L.latLngBounds();

    // Variables to store the sum of all latitudes and longitudes
    let latSum = 0;
    let lngSum = 0;
    let count = 0;

    xhr.onload = function () {
        if (xhr.status === 200) {
            const results = xhr.response;
            for (let i = 0; i < results.length; i++) {
                if (typeof results[i].longitude === 'string' && typeof results[i].latitude === 'string') {
                    const marker = L.marker({
                        lon: parseFloat(results[i].longitude),
                        lat: parseFloat(results[i].latitude)
                    }).bindPopup("<a href=\"https://www.ebi.ac.uk/metagenomics/samples/" + results[i].sample + "\" target='_blank'> " + results[i].sample + "</a>");
                    markers.addLayer(marker);

                    // Extend the bounds with the marker's coordinates
                    markerBounds.extend(marker.getLatLng());

                    // Add the marker's latitude and longitude to the sums
                    latSum += parseFloat(results[i].latitude);
                    lngSum += parseFloat(results[i].longitude);
                    count++;
                }
            }
        }

        // Adjust the map view to the average latitude and longitude of all markers
        if (count > 0) {
            const avgLat = latSum / count;
            const avgLng = lngSum / count;
            map.setView([avgLat, avgLng]);
        }
    };

    map.addLayer(markers);

    xhr.send();
}
