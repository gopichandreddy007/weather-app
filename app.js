// Open-Meteo is free and doesn't need an API key
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const currentCard = document.getElementById("current-weather");

// Open-Meteo sends a number (WMO weather code), so we map it to text and an icon
const weatherCodes = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Freezing fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Drizzle", icon: "🌦️" },
  55: { text: "Heavy drizzle", icon: "🌧️" },
  56: { text: "Freezing drizzle", icon: "🌧️" },
  57: { text: "Freezing drizzle", icon: "🌧️" },
  61: { text: "Light rain", icon: "🌦️" },
  63: { text: "Rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  66: { text: "Freezing rain", icon: "🌧️" },
  67: { text: "Freezing rain", icon: "🌧️" },
  71: { text: "Light snow", icon: "🌨️" },
  73: { text: "Snow", icon: "🌨️" },
  75: { text: "Heavy snow", icon: "❄️" },
  77: { text: "Snow grains", icon: "🌨️" },
  80: { text: "Rain showers", icon: "🌦️" },
  81: { text: "Rain showers", icon: "🌧️" },
  82: { text: "Heavy showers", icon: "⛈️" },
  85: { text: "Snow showers", icon: "🌨️" },
  86: { text: "Heavy snow showers", icon: "❄️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with hail", icon: "⛈️" },
  99: { text: "Thunderstorm with hail", icon: "⛈️" },
};

function getWeatherInfo(code) {
  return weatherCodes[code] || { text: "Unknown", icon: "🌡️" };
}

// step 1: turn a city name into latitude and longitude
async function getCityLocation(city) {
  const url = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    return null;
  }

  const place = data.results[0];
  return {
    name: place.name,
    country: place.country,
    lat: place.latitude,
    lon: place.longitude,
  };
}

// step 2: get the weather for that location
async function getWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "auto",
  });

  const res = await fetch(`${WEATHER_URL}?${params}`);
  return res.json();
}

function showCurrentWeather(place, weather) {
  const current = weather.current;
  const info = getWeatherInfo(current.weather_code);

  document.getElementById("weather-icon").textContent = info.icon;
  document.getElementById("description").textContent = info.text;
  document.getElementById("city-name").textContent = `${place.name}, ${place.country}`;
  document.getElementById("date-text").textContent = new Date().toDateString();
  document.getElementById("temperature").textContent = Math.round(current.temperature_2m) + "°C";
  document.getElementById("feels-like").textContent = Math.round(current.apparent_temperature) + "°C";
  document.getElementById("humidity").textContent = current.relative_humidity_2m + "%";
  document.getElementById("wind").textContent = Math.round(current.wind_speed_10m) + " km/h";

  currentCard.classList.remove("hidden");
}

async function searchCity(city) {
  const place = await getCityLocation(city);
  if (!place) {
    alert("City not found");
    return;
  }

  const weather = await getWeather(place.lat, place.lon);
  showCurrentWeather(place, weather);
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    searchCity(city);
  }
});
