// Define tile layers
var streetMap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }
  );
  
  // Create a map object
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [streetMap],
  });
  
  // Grab the data with d3
  d3.json(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
  ).then(function (data) {
    // Define a LatLngBounds object to contain the markers
    var bounds = L.latLngBounds();
  
    // Loop through each feature and create a circle marker
    data.features.forEach(function (feature) {
      var coordinates = feature.geometry.coordinates;
      var magnitude = feature.properties.mag;
      var depth = coordinates[2];
      var circleMarker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: magnitude * 5,
        color: "black",
        fillColor: depth > 100 ? "red" : "green",
        fillOpacity: 0.8,
        weight: 1,
      });
  
      // Add a popup to the marker with the relevant information
      circleMarker.bindPopup(
        "Magnitude: " +
          magnitude +
          "<br>Depth: " +
          depth +
          " km<br>Date: " +
          new Date(feature.properties.time).toLocaleDateString()
      );
  
      // Add the circle marker to the map
      circleMarker.addTo(myMap);
  
      // Extend the bounds of the LatLngBounds object to include the marker
      bounds.extend(circleMarker.getLatLng());
    });
  
    // Set the map view to the bounds of the markers
    myMap.fitBounds(bounds);
  });
  
  // Create a legend for the map
  var legend = L.control({ position: "bottomright" });
  
  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML +=
      '<i style="background: green"></i> Depth &lt; 100 km<br>';
    div.innerHTML +=
      '<i style="background: red"></i> Depth &ge; 100 km<br>';
    return div;
  };
  
  legend.addTo(myMap);
  
  