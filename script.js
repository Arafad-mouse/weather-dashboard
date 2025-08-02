// API Configuration
const API_KEY = 'af5f47590e7de352c4cd02f70d710940'; // Replace with your actual OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
const weatherIcon = document.getElementById('weather-icon');
const temperatureDisplay = document.getElementById('temperature-display');
const dateTime = document.getElementById('date-time');
const weatherDescription = document.getElementById('weather-description');
const rainInfo = document.getElementById('rain-info');
const locationElement = document.getElementById('location');

// Global variable to track current unit
let currentUnit = 'C'; // 'C' for Celsius, 'F' for Fahrenheit
let lastWeatherData = null;
let lastForecastData = null;

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get city coordinates from OpenWeatherMap Geocoding API
async function getCityCoordinates(city) {
  try {
    const response = await fetch(
      `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching city coordinates:', error);
    return [];
  }
}

// Get current weather data
async function getCurrentWeather(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

// Get 7-day forecast using One Call API
async function getWeeklyForecast(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    return data.daily.slice(0, 7);
  } catch (error) {
    console.error('Error fetching weekly forecast:', error);
    return null;
  }
}

// Temperature conversion functions
function celsiusToFahrenheit(c) {
  return (c * 9/5 + 32).toFixed(1);
}

function formatTemperature(temp, unit) {
  return `${temp}°${unit}`;
}

// Update weather dashboard with new data
function updateDashboard(weatherData, forecastData, locationName) {
  if (!weatherData) {
    temperatureDisplay.textContent = '--°C';
    weatherDescription.textContent = 'No data available';
    rainInfo.textContent = 'No data available';
    locationElement.textContent = 'Location not found';
    return;
  }
  
  lastWeatherData = weatherData;
  lastForecastData = forecastData;

  // Update current weather
  let temp = Math.round(weatherData.main.temp);
  let feelsLike = Math.round(weatherData.main.feels_like);
  if (currentUnit === 'F') {
    temp = celsiusToFahrenheit(temp);
    feelsLike = celsiusToFahrenheit(feelsLike);
  }
  temperatureDisplay.textContent = formatTemperature(temp, currentUnit);
  
  weatherDescription.textContent = weatherData.weather[0].description.charAt(0).toUpperCase() + 
                                 weatherData.weather[0].description.slice(1);
  
  const rainProbability = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;
  rainInfo.textContent = rainProbability > 0 ? `Rain: ${rainProbability}mm` : 'No rain expected';
  
  locationElement.textContent = locationName;

  // Update weather icon
  const iconCode = weatherData.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = weatherData.weather[0].description;

  // Update date and time
  const now = new Date();
  const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
  dateTime.textContent = now.toLocaleDateString('en-US', options);

  // Update additional details
  updateCurrentWeatherDetails(weatherData);
  updateHighlights(weatherData);

  // Update weekly forecast if available
  if (forecastData) {
    updateWeeklyForecast(forecastData);
  }
}

// Update additional current weather details
function updateCurrentWeatherDetails(weatherData) {
  if (!weatherData) return;

  let feelsLike = Math.round(weatherData.main.feels_like);
  if (currentUnit === 'F') {
    feelsLike = celsiusToFahrenheit(feelsLike);
  }
  
  document.getElementById('feels-like').textContent = formatTemperature(feelsLike, currentUnit);
  document.getElementById('humidity-detail').textContent = `${weatherData.main.humidity}%`;
  document.getElementById('pressure').textContent = `${weatherData.main.pressure} hPa`;
  document.getElementById('wind-speed').textContent = `${weatherData.wind.speed} km/h`;
  document.getElementById('visibility').textContent = `${weatherData.visibility / 1000} km`;
}

// Update highlights section
function updateHighlights(weatherData) {
  if (!weatherData) return;

  document.getElementById('wind-speed').textContent = `${weatherData.wind.speed} km/h`;
  document.getElementById('wind-direction').textContent = getWindDirection(weatherData.wind.deg);
  document.getElementById('humidity').textContent = `${weatherData.main.humidity}%`;
  document.getElementById('visibility-highlight').textContent = `${weatherData.visibility / 1000} km`;

  const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('sunrise').textContent = sunrise;
  document.getElementById('sunset').textContent = sunset;
}

// Get wind direction from degrees
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Update weekly forecast
function updateWeeklyForecast(forecastData) {
  const weekForecast = document.querySelector('.week-forecast');
  
  if (!forecastData || forecastData.length === 0) {
    weekForecast.innerHTML = `
      <div class="flex items-center justify-center w-full py-8">
        <div class="text-gray-500 text-center">
          <div class="text-lg font-medium mb-2">No forecast data available</div>
          <div class="text-sm">Please try again later</div>
        </div>
      </div>
    `;
    return;
  }
  
  weekForecast.innerHTML = forecastData.map(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    let maxTemp = Math.round(day.temp.max);
    let minTemp = Math.round(day.temp.min);
    if (currentUnit === 'F') {
      maxTemp = celsiusToFahrenheit(maxTemp);
      minTemp = celsiusToFahrenheit(minTemp);
    }
    const icon = getWeatherIcon(day.weather[0].main);
    const description = day.weather[0].description;
    
    return `
      <div class="forecast-card bg-gray-50 rounded-xl p-4 text-center min-w-[120px] flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
        <div class="text-sm font-medium text-gray-600 mb-2">${dayName}</div>
        <div class="text-3xl mb-2">${icon}</div>
        <div class="text-lg font-semibold text-gray-800">${formatTemperature(maxTemp, currentUnit)}</div>
        <div class="text-sm text-gray-500">${formatTemperature(minTemp, currentUnit)}</div>
        <div class="text-xs text-gray-400 mt-1 truncate" title="${description}">${description}</div>
      </div>
    `;
  }).join('');
}

// Get weather icon emoji
function getWeatherIcon(weatherMain) {
  const icons = {
    'Clear': '☀️',
    'Clouds': '⛅',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  return icons[weatherMain] || '🌤️';
}

// Show autocomplete suggestions
function showAutocompleteSuggestions(suggestions) {
  if (suggestions.length === 0) {
    autocompleteDropdown.classList.add('hidden');
    return;
  }
  
  autocompleteDropdown.innerHTML = suggestions.map(suggestion => `
    <div class="suggestion-item px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
         data-lat="${suggestion.lat}" 
         data-lon="${suggestion.lon}" 
         data-name="${suggestion.name}, ${suggestion.country}">
      <div class="font-medium">${suggestion.name}</div>
      <div class="text-sm text-gray-500">${suggestion.state || ''} ${suggestion.country}</div>
    </div>
  `).join('');
  
  autocompleteDropdown.classList.remove('hidden');
}

// Handle suggestion selection
function handleSuggestionSelection(lat, lon, locationName) {
  autocompleteDropdown.classList.add('hidden');
  searchInput.value = locationName;
  updateWeatherForLocation(lat, lon, locationName);
}

// Show loading state
function showLoading() {
  document.getElementById('weather-loading').classList.remove('hidden');
  searchButton.disabled = true;
  searchButton.textContent = 'Loading...';
  searchButton.classList.add('opacity-50');
}

// Hide loading state
function hideLoading() {
  document.getElementById('weather-loading').classList.add('hidden');
  searchButton.disabled = false;
  searchButton.textContent = 'Search';
  searchButton.classList.remove('opacity-50');
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
  errorDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
  
  const leftColumn = document.querySelector('.lg\\:col-span-1');
  const existingError = leftColumn.querySelector('.bg-red-100');
  if (existingError) {
    existingError.remove();
  }
  
  leftColumn.insertBefore(errorDiv, leftColumn.firstChild);
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

// Update weather for selected location
async function updateWeatherForLocation(lat, lon, locationName) {
  try {
    showLoading();
    
    const [weatherData, forecastData] = await Promise.all([
      getCurrentWeather(lat, lon),
      getWeeklyForecast(lat, lon)
    ]);
    
    if (!weatherData || weatherData.cod === '404') {
      throw new Error('Unable to fetch weather for this location. Please try another city.');
    }
    
    updateDashboard(weatherData, forecastData, locationName);
    hideLoading();
  } catch (error) {
    console.error('Error updating weather:', error);
    hideLoading();
    showError(error.message || 'Unable to fetch weather. Please try again.');
  }
}

// Initialize autocomplete functionality
function initializeAutocomplete() {
  // Debounced search function
  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) {
      autocompleteDropdown.classList.add('hidden');
      return;
    }
    
    const suggestions = await getCityCoordinates(query);
    showAutocompleteSuggestions(suggestions);
  }, 300);
  
  // Input event listener
  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
  
  // Suggestion click event listener
  autocompleteDropdown.addEventListener('click', (e) => {
    const suggestionItem = e.target.closest('.suggestion-item');
    if (suggestionItem) {
      const lat = parseFloat(suggestionItem.dataset.lat);
      const lon = parseFloat(suggestionItem.dataset.lon);
      const name = suggestionItem.dataset.name;
      handleSuggestionSelection(lat, lon, name);
    }
  });
  
  // Search button click event
  searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
      const suggestions = await getCityCoordinates(query);
      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        handleSuggestionSelection(
          firstSuggestion.lat,
          firstSuggestion.lon,
          `${firstSuggestion.name}, ${firstSuggestion.country}`
        );
      } else {
        showError('City not found. Please check the city name and try again.');
      }
    } else {
      showError('Please enter a city name.');
    }
  });
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box') && !e.target.closest('#autocomplete-dropdown')) {
      autocompleteDropdown.classList.add('hidden');
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeAutocomplete();
  
  // Unit toggle event listener
  document.getElementById('unit-toggle').addEventListener('change', (e) => {
    currentUnit = e.target.checked ? 'F' : 'C';
    if (lastWeatherData) {
      const locationName = document.getElementById('location').textContent;
      updateDashboard(lastWeatherData, lastForecastData, locationName);
    }
  });
  
  // Set default location (New York)
  updateWeatherForLocation(40.7128, -74.0060, 'New York, NY, USA');
});


async function updateWeatherForLocation(lat, lon, locationName) {
  try {
    showLoading();
    
    const [weatherData, forecastData] = await Promise.all([
      getCurrentWeather(lat, lon),
      getWeeklyForecast(lat, lon)
    ]);
    
    console.log("Weather data:", weatherData);
    console.log("Forecast data:", forecastData);
    
    if (!weatherData || weatherData.cod === '404') {
      throw new Error('Unable to fetch weather for this location. Please try another city.');
    }
    
    updateDashboard(weatherData, forecastData, locationName);
    hideLoading();
  } catch (error) {
    console.error('Error updating weather:', error);
    hideLoading();
    showError(error.message || 'Unable to fetch weather. Please try again.');
  }
};