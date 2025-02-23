//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});
//-------------review upload-----------------
let fileInput = document.querySelector(".upload-btn-wrapper input");
let reviewDiv = document.querySelector(".image-review");
fileInput.addEventListener("change", (e) => {
  document.querySelector(".image-review").innerHTML = ``;
  if (e.target.files.length) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.result) {
        reviewDiv.style.backgroundImage = `url(${e.target.result})`;
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

    if (!result.success) {
      Swal.fire("", result.msg, result.success ? "success" : "error");
      return;
    }

    form.reset();
    Swal.fire("", result.msg, result.success ? "success" : "error");
    setTimeout(() => {
      window.location = "/";
    }, 2000);
  });

var marker;
let selected_location;
let currentLocation;
let currentLocationForMarker;
// Get current location

const getCurrentLocation = navigator.geolocation.watchPosition((position) => {
  const { latitude, longitude } = position.coords;
  currentLocation = position;
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
  console.log(`marker: ${marker.position.lat()}, ${marker.position.lng()}`);
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
  });
}

function getMarkerLocation() {
  return `${marker.position.lat()}, ${marker.position.lng()}`;
}
