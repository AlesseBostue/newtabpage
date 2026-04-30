// js/weather.js

const weatherCard = document.getElementById('weatherCard');
const weatherIcon = document.getElementById('weatherIcon');
const weatherTemp = document.getElementById('weatherTemp');
const weatherDesc = document.getElementById('weatherDesc');
const weatherLoc = document.getElementById('weatherLoc');
const weatherForecast = document.getElementById('weatherForecast');

async function fetchWeather() {
    const settings = getSettings();
    if (!settings.weather) return;
    
    const { apiKey, city } = settings.weather;

    if (!apiKey) {
        showWeatherPlaceholder("Configura tu API Key en ajustes", "OpenWeatherMap");
        return;
    }

    try {
        // Fetch actual y pronóstico en paralelo (5 días / 3 horas incluido en Free Tier)
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`)
        ]);
        
        if (!weatherRes.ok || !forecastRes.ok) {
            if (weatherRes.status === 401) {
                showWeatherPlaceholder("API Key inválida o expirada", "Error de Auth");
                return;
            }
            throw new Error('Error al obtener datos del clima');
        }
        
        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();
        
        updateWeatherUI(weatherData, forecastData);
    } catch (err) {
        console.error("Error clima:", err);
        showWeatherPlaceholder("Error al cargar clima", "Sin conexión");
    }
}

function showWeatherPlaceholder(msg, loc) {
    weatherCard.style.display = 'flex';
    weatherTemp.textContent = "--°C";
    weatherDesc.textContent = msg;
    weatherLoc.textContent = loc;
    weatherIcon.textContent = "cloud_off";
    weatherForecast.innerHTML = '';
    
    const divider = document.querySelector('.weather-divider');
    if(divider) divider.style.display = 'none';
}

function updateWeatherUI(current, forecast) {
    weatherCard.style.display = 'flex';
    const divider = document.querySelector('.weather-divider');
    if(divider) divider.style.display = 'block';

    // --- Clima Actual ---
    weatherTemp.textContent = `${Math.round(current.main.temp)}°C`;
    
    // Mejorar descripción: capitalizar y usar términos más precisos
    let desc = current.weather[0].description;
    weatherDesc.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    
    weatherLoc.textContent = current.name;
    weatherIcon.textContent = mapWeatherIcon(current.weather[0].icon);

    // --- Pronóstico por horas (Carrusel derecho) ---
    weatherForecast.innerHTML = '';
    // Tomamos los siguientes 5 bloques (cada bloque es de 3 horas)
    const hourlyItems = forecast.list.slice(1, 6); 
    
    hourlyItems.forEach(item => {
        const date = new Date(item.dt * 1000);
        const hours = date.getHours().toString().padStart(2, '0');
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <span class="forecast-time">${hours}:00</span>
            <span class="material-symbols-rounded forecast-icon">${mapWeatherIcon(item.weather[0].icon)}</span>
            <span class="forecast-temp">${Math.round(item.main.temp)}°</span>
        `;
        weatherForecast.appendChild(forecastItem);
    });
}

function mapWeatherIcon(code) {
    // Mapeo refinado de códigos de OpenWeatherMap a Material Symbols Rounded
    const map = {
        '01d': 'wb_sunny',           // Cielo despejado día
        '01n': 'bedtime',            // Cielo despejado noche
        '02d': 'partly_cloudy_day',  // Nubes dispersas día
        '02n': 'night_shelter',      // Nubes dispersas noche
        '03d': 'cloud',              // Nubes
        '03n': 'cloud',
        '04d': 'cloudy',             // Nubes rotas / muy nuboso (Más preciso que 'cloud')
        '04n': 'cloudy',
        '09d': 'rainy_light',        // Lluvia ligera
        '09n': 'rainy_light',
        '10d': 'rainy',              // Lluvia
        '10n': 'rainy',
        '11d': 'thunderstorm',       // Tormenta
        '11n': 'thunderstorm',
        '13d': 'ac_unit',            // Nieve
        '13n': 'ac_unit',
        '50d': 'foggy',              // Niebla / Bruma
        '50n': 'foggy'
    };
    // Fallback a nube si no existe el código
    return map[code] || 'filter_drama';
}

// Escuchar cambios en la configuración
window.addEventListener('weatherSettingsChanged', fetchWeather);

// Cargar al inicio
fetchWeather();

// Actualizar cada 30 minutos
setInterval(fetchWeather, 30 * 60 * 1000);
