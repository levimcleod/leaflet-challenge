// Define tile layers
var streetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

function getColor(depth) {
  // Define the minimum and maximum depth values
  var minDepth = -10;
  var maxDepth = 600;
  // Clamp the depth value between min and max
  var clampedDepth = Math.max(minDepth, Math.min(maxDepth, depth));
  // Map the depth value to a hue value between 240 and 0
  var hue = 240 * (1 - (clampedDepth - minDepth) / (maxDepth - minDepth));
  // Return the color as an HSL string
  return "hsl(" + hue + ", 100%, 50%)";
}
  
// Create a map object
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 3,
  layers: [streetMap],
});

// Create a legend control
var legend = L.control({ position: "bottomright" });

// Define the legend content
legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");
  var grades = [600, 500, 400, 300, 200, 100, 0];

  // Loop through the depth ranges and generate a label with the corresponding color
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(grades[i]) +
      '"></i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }

  return div;
};

// Add the legend to the map
legend.addTo(myMap);

  // Grab the data with d3
  d3.json(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
  ).then(function (data) {
    // Define a LatLngBounds object to contain the markers
    var bounds = L.latLngBounds();
  
    // Loop through each feature and create a circle marker
    data.features.forEach(function (feature) {
      var coordinates = feature.geometry.coordinates;
      var place = feature.properties.place;
      var magnitude = feature.properties.mag;
      var depth = coordinates[2];
      var circleMarker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: magnitude * 2.5,
        color: "black",
        fillColor: getColor(depth),
        fillOpacity: 0.8,
        weight: 1,
      });
  
      // Add a popup to the marker with the relevant information
      circleMarker.bindPopup(
        "Place: " +
        place +
          "<br>Magnitude: " +
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