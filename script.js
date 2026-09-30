const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const temperatureUnit = document.getElementById("temperatureUnit");

const feelsLike = document.getElementById("feelsLike");
const feelsLikeUnit = document.getElementById("feelsLikeUnit");

const weatherCondition = document.getElementById("weatherCondition");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const weatherIcon = document.getElementById("weatherIcon");
const weatherMessage = document.getElementById("weatherMessage");

const forecastContainer = document.getElementById("forecastContainer");

const fahrenheitButton =
    document.getElementById("fahrenheitButton");

const celsiusButton =
    document.getElementById("celsiusButton");


let currentUnit = "F";

let currentTemperatureF = null;
let currentFeelsLikeF = null;

let forecastData = [];


// Search with button
searchButton.addEventListener("click", getWeather);


// Search with Enter
cityInput.addEventListener("keyup", function (event) {

    if (event.key === "Enter") {
        getWeather();
    }
});


// Fahrenheit button
fahrenheitButton.addEventListener("click", function () {

    currentUnit = "F";

    fahrenheitButton.classList.add("active");
    celsiusButton.classList.remove("active");

    updateDisplayedTemperatures();
});


// Celsius button
celsiusButton.addEventListener("click", function () {

    currentUnit = "C";

    celsiusButton.classList.add("active");
    fahrenheitButton.classList.remove("active");

    updateDisplayedTemperatures();
});


// Load Nashville automatically
window.addEventListener("load", function () {

    cityInput.value = "Nashville";

    getWeather();
});


async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {

        alert("Please enter a city.");

        return;
    }

    try {

        // Get city coordinates
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const locationData =
            await locationResponse.json();


        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            alert("City not found.");

            return;
        }


        const location =
            locationData.results[0];

        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        // Get weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
        );

        const weatherData =
            await weatherResponse.json();


        // City
        if (location.admin1) {

            cityName.textContent =
                `${location.name}, ${location.admin1}`;

        } else {

            cityName.textContent =
                location.name;
        }


        // Save temperature data
        currentTemperatureF =
            weatherData.current.temperature_2m;

        currentFeelsLikeF =
            weatherData.current.apparent_temperature;


        // Humidity
        humidity.textContent =
            weatherData.current.relative_humidity_2m;


        // Wind
        windSpeed.textContent =
            Math.round(
                weatherData.current.wind_speed_10m
            );


        // Weather description
        weatherCondition.textContent =
            getWeatherDescription(
                weatherData.current.weather_code
            );


        // Theme + message
        updateWeatherTheme(
            weatherData.current.weather_code,
            weatherData.current.temperature_2m
        );


        // Forecast
        saveForecastData(
            weatherData.daily
        );


        // Show everything
        updateDisplayedTemperatures();

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while getting the weather."
        );
    }
}


function saveForecastData(dailyData) {

    forecastData = [];


    for (let i = 1; i <= 5; i++) {

        const date = new Date(
            dailyData.time[i] + "T12:00:00"
        );


        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        forecastData.push({

            day: dayName,

            code:
                dailyData.weather_code[i],

            highF:
                dailyData.temperature_2m_max[i],

            lowF:
                dailyData.temperature_2m_min[i]

        });
    }
}


function updateDisplayedTemperatures() {

    if (
        currentTemperatureF === null ||
        currentFeelsLikeF === null
    ) {
        return;
    }


    if (currentUnit === "F") {

        temperature.textContent =
            Math.round(currentTemperatureF);

        temperatureUnit.textContent = "F";


        feelsLike.textContent =
            Math.round(currentFeelsLikeF);

        feelsLikeUnit.textContent = "F";

    } else {

        temperature.textContent =
            Math.round(
                fahrenheitToCelsius(
                    currentTemperatureF
                )
            );

        temperatureUnit.textContent = "C";


        feelsLike.textContent =
            Math.round(
                fahrenheitToCelsius(
                    currentFeelsLikeF
                )
            );

        feelsLikeUnit.textContent = "C";
    }


    displayForecast();
}


function displayForecast() {

    forecastContainer.innerHTML = "";


    forecastData.forEach(function (day) {

        let highTemperature;
        let lowTemperature;


        if (currentUnit === "F") {

            highTemperature =
                Math.round(day.highF);

            lowTemperature =
                Math.round(day.lowF);

        } else {

            highTemperature =
                Math.round(
                    fahrenheitToCelsius(
                        day.highF
                    )
                );

            lowTemperature =
                Math.round(
                    fahrenheitToCelsius(
                        day.lowF
                    )
                );
        }


        const forecastCard =
            document.createElement("div");


        forecastCard.classList.add(
            "forecast-card"
        );


        forecastCard.innerHTML = `
            <p class="forecast-day">
                ${day.day}
            </p>

            <div class="forecast-icon">
                ${getWeatherIcon(day.code)}
            </div>

            <p class="forecast-high">
                ${highTemperature}°
            </p>

            <p class="forecast-low">
                ${lowTemperature}°
            </p>
        `;


        forecastContainer.appendChild(
            forecastCard
        );
    });
}


function fahrenheitToCelsius(fahrenheit) {

    return (fahrenheit - 32) * 5 / 9;
}


function getWeatherDescription(code) {

    if (code === 0) {

        return "Clear sky";

    } else if (
        code === 1 ||
        code === 2 ||
        code === 3
    ) {

        return "Partly cloudy";

    } else if (
        code === 45 ||
        code === 48
    ) {

        return "Foggy";

    } else if (
        code >= 51 &&
        code <= 57
    ) {

        return "Drizzle";

    } else if (
        code >= 61 &&
        code <= 67
    ) {

        return "Rain";

    } else if (
        code >= 71 &&
        code <= 77
    ) {

        return "Snow";

    } else if (
        code >= 80 &&
        code <= 82
    ) {

        return "Rain showers";

    } else if (
        code >= 95 &&
        code <= 99
    ) {

        return "Thunderstorms";

    } else {

        return "Unknown weather";
    }
}


function getWeatherIcon(code) {

    if (code === 0) {

        return "☀️";

    } else if (
        code >= 1 &&
        code <= 3
    ) {

        return "⛅";

    } else if (
        code === 45 ||
        code === 48
    ) {

        return "🌫️";

    } else if (
        code >= 51 &&
        code <= 67
    ) {

        return "🌧️";

    } else if (
        code >= 71 &&
        code <= 77
    ) {

        return "❄️";

    } else if (
        code >= 80 &&
        code <= 82
    ) {

        return "🌦️";

    } else if (
        code >= 95 &&
        code <= 99
    ) {

        return "⛈️";

    } else {

        return "🌤️";
    }
}


function updateWeatherTheme(code, temp) {

    weatherIcon.textContent =
        getWeatherIcon(code);


    document.body.classList.remove(
        "sunny-theme",
        "cloudy-theme",
        "rainy-theme",
        "storm-theme",
        "snow-theme",
        "fog-theme"
    );


    if (code === 0) {

        document.body.classList.add(
            "sunny-theme"
        );


        if (temp >= 85) {

            weatherMessage.textContent =
                "baby it is HOT. drink water 😭";

        } else {

            weatherMessage.textContent =
                "sunshine and good vibes ♡";
        }

    } else if (
        code >= 1 &&
        code <= 3
    ) {

        document.body.classList.add(
            "cloudy-theme"
        );

        weatherMessage.textContent =
            "a lil cloudy but still cute";

    } else if (
        code === 45 ||
        code === 48
    ) {

        document.body.classList.add(
            "fog-theme"
        );

        weatherMessage.textContent =
            "very mysterious main character weather";

    } else if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82)
    ) {

        document.body.classList.add(
            "rainy-theme"
        );

        weatherMessage.textContent =
            "grab the cute umbrella ☂️";

    } else if (
        code >= 71 &&
        code <= 77
    ) {

        document.body.classList.add(
            "snow-theme"
        );

        weatherMessage.textContent =
            "bundle up babe, it's freezing";

    } else if (
        code >= 95 &&
        code <= 99
    ) {

        document.body.classList.add(
            "storm-theme"
        );

        weatherMessage.textContent =
            "yeah... maybe stay inside 😭";

    } else {

        document.body.classList.add(
            "cloudy-theme"
        );

        weatherMessage.textContent =
            "weather is doing its own thing today";
    }
}