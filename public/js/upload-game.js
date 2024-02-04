//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});
let result = document.querySelector(".result");
let upload = document.querySelector("#file-input");

// on change show image with crop options
upload.addEventListener("change", (e) => {
  if (e.target.files.length) {
    // start file reader
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.result) {
        // create new image
        let img = document.createElement("img");
        img.id = "image";
        img.src = e.target.result;
        // clean result before
        result.innerHTML = "";
        // append new image
        result.appendChild(img);
        // show save btn and options
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

//create new-update-game-form submit event
document
  .querySelector("#update-game-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData();

    formData.append("image", form.image.files[0]);

    formData.append("hints_1", form.hints_1.value);

    formData.append("hints_2", form.hints_2.value);
    formData.append("answer_name", form.answer_name.value);
    formData.append("answer_address", form.answer_address.value);
    formData.append("answer_description", form.answer_description.value);
    formData.append("targeted_location", getMarkerLocation());

    const res = await fetch("/game", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    form.reset();

    if (res.ok) {
      alert("創建遊戲成功");
      window.location = "/";
    }
  });

var marker;
let selected_location;
let currentLocation;
let currentLocationForMarker;
// Get current location

const getCurrentLocation = navigator.geolocation.watchPosition((position) => {
  const { latitude, longitude } = position.coords;
  currentLocation = position;
  console.log("current location:", currentLocation);
  // console.log(currentLocation.coords.latitude);
  // console.log(currentLocation.coords.longitude);
  // Show a map centered at latitude / longitude.
  currentLocationForMarker = new google.maps.LatLng(
    currentLocation.coords.latitude,
    currentLocation.coords.longitude
  );
});
function stopCurrentLocation() {
  // Cancel the updates when the user clicks a button.
  navigator.geolocation.clearWatch(watchId);
}

function placeMarker(location) {
  if (marker) {
    //if marker already was created change position
    marker.setPosition(location);
  } else {
    //create a marker
    marker = new google.maps.Marker({
      position: location,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      icon: "/push_pin_black_24dp.svg",
    });
    marker.addListener("click", toggleBounce);
  }
}
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
function initMap() {
  myLatLng = new google.maps.LatLng(22.28780558413936, 114.14833128874676);
  // Create a new StyledMapType object, passing it an array of styles,
  // and the name to be displayed on the map type control.

  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  const map = new google.maps.Map(document.getElementById("map"), {
    center: myLatLng,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    // mapTypeControlOptions: {
    //   mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain", "styled_map"],
    // },
  });

  google.maps.event.addListener(map, "click", function (mapsMouseEvent) {
    guessLatLng = new google.maps.LatLng(
      mapsMouseEvent.latLng.lat(),
      mapsMouseEvent.latLng.lng()
    );
    placeMarker(mapsMouseEvent.latLng);

    // To add the marker to the map, call setMap();
    marker.setMap(map);
    // DOM Events
    // document.getElementById("hint_1").innerHTML = `Hint1: You are ${Math.floor(
    //   distance * 1000
    // )}m away from the destination!`;
    // document.getElementById(
    //   "original_coordinate"
    // ).innerHTML = `Coordinate: ${myLatLng}`;
    // document.getElementById(
    //   "coordinate"
    // ).innerHTML = `Coordinate: ${guessLatLng}`;
  });
}

function getMarkerLocation() {
  return `${marker.position.lat()}, ${marker.position.lng()}`;
}
