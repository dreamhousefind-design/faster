// DRIVER DATA
let drivers = [
  { name: "Rahul", vehicle: "Bike", number: "BR01AB1234" },
  { name: "Amit", vehicle: "Auto", number: "BR02XY5678" },
  { name: "Suresh", vehicle: "Car", number: "BR03CD9999" }
];

function getDriver() {
  return drivers[Math.floor(Math.random() * drivers.length)];
}


// Google-like map tiles
// ✅ STEP 1: Map create (यह सबसे पहले होना चाहिए)
var map = L.map('map').setView([25.5941, 85.1376], 13);

// ✅ STEP 2: सही tile (Google वाला हटाओ)
var tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
});

// ✅ STEP 3: map पर add करो
tile.addTo(map);
// GET LOCATION
async function getCoordinates(place) {
  let url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}`;
  let res = await fetch(url);
  let data = await res.json();

  if (!data.length) {
    alert("Location not found");
    return null;
  }

  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// DISTANCE
function getDistance(lat1, lon1, lat2, lon2) {
  let R = 6371;
  let dLat = (lat2 - lat1) * Math.PI / 180;
  let dLon = (lon2 - lon1) * Math.PI / 180;

  let a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// FARE
function calculateFare(distance, type) {
  let rate = { bike:10, auto:15, car:20 , parcel:15 };
  let base = { bike:30, auto:50, car:80 , parcel:100 };

  return base[type] + distance * rate[type];
}

// MAIN
async function setRoute() {
  let pickupText = document.getElementById("pickup").value;
  let dropText = document.getElementById("drop").value;

  if (!pickupText || !dropText) {
    alert("Enter both locations");
    return;
  }

  let pickup = await getCoordinates(pickupText);
  let drop = await getCoordinates(dropText);

  if (!pickup || !drop) return;

  // Clear old
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  // Markers
  L.marker(pickup).addTo(map);
  L.marker(drop).addTo(map);

  let route = L.polyline([pickup, drop]).addTo(map);
  map.fitBounds(route.getBounds());

  // Distance + Fare
  let distance = getDistance(pickup[0], pickup[1], drop[0], drop[1]);
  let type = document.getElementById("rideType").value;
  let fare = calculateFare(distance, type);

  document.getElementById("result").innerText =
    `Distance: ${distance.toFixed(2)} km | Fare: ₹${fare.toFixed(0)}`;

  // Driver
  let d = getDriver();
  document.getElementById("driverName").innerText = d.name;
  document.getElementById("vehicle").innerText = d.vehicle;
  document.getElementById("number").innerText = d.number;
  document.getElementById("fare").innerText = fare.toFixed(0);

  document.getElementById("rideCard").style.display = "block";
}

// CLICK SERVICE → SELECT TYPE
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    let type = card.innerText.toLowerCase();
    if (type.includes("bike")) document.getElementById("rideType").value = "bike";
    if (type.includes("auto")) document.getElementById("rideType").value = "auto";
    if (type.includes("car")) document.getElementById("rideType").value = "car";
    if (type.includes("parcel")) document.getElementById("rideType").value = "parcel";
  });
});
let userMarker;

// Start tracking
function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      let lat = pos.coords.latitude;
      let lng = pos.coords.longitude;

      console.log("Live Location:", lat, lng);

      // First time marker
      if (!userMarker) {
        userMarker = L.marker([lat, lng]).addTo(map)
          .bindPopup("You are here")
          .openPopup();
      } else {
        // Update position
        userMarker.setLatLng([lat, lng]);
      }

      // Move map
      map.setView([lat, lng], 15);
    },
    (err) => {
      alert("Location error: " + err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}
let driverMarker = L.marker([25.5941, 85.1376]).addTo(map)
  .bindPopup("Driver");

function updateDriver(lat, lng) {
  driverMarker.setLatLng([lat, lng]);
}