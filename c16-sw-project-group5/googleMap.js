require("dotenv").config();

const apiKey = process.env.MAP_API_KEY;

// module.exports = apiKey;
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=&v=weekly`;

// Append the script element to the HTML body
document.body.appendChild(script);
console.log("append api key");
