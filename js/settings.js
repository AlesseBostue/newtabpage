// js/settings.js

const configBtn = document.getElementById('configBtn');
const settingsPanel = document.getElementById('settingsPanel');
const lightModeBtn = document.getElementById('lightModeBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const wallpaperGrid = document.getElementById('wallpaperGrid');
const addWallpaperBtn = document.getElementById('addWallpaperBtn');
const noWallpaperBtn = document.getElementById('noWallpaperBtn');
const wallpaperUploadInput = document.getElementById('wallpaperUploadInput');

// --- PANEL TOGGLE ---
configBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('open');
});

// Click outside to close
document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && !configBtn.contains(e.target)) {
        settingsPanel.classList.remove('open');
    }
});

// --- SETTINGS MANAGEMENT (JSON) ---
function getSettings() {
    const defaults = { 
        theme: null, 
        cardStyle: 'solid', 
        favLayout: 'multi', 
        folderStyle: 'icons',
        header: { text: 'Firefox', iconType: 'icon', iconValue: 'language' },
        weather: { apiKey: '', city: 'Madrid, ES' }
    };

    try {
        const saved = JSON.parse(localStorage.getItem('m3_settings')) || {};
        // Mezclamos recursivamente o al menos el primer nivel para asegurar que existan los objetos hijos
        return {
            ...defaults,
            ...saved,
            header: { ...defaults.header, ...(saved.header || {}) },
            weather: { ...defaults.weather, ...(saved.weather || {}) }
        };
    } catch(e) {
        return defaults;
    }
}
function saveSettings(settings) {
    localStorage.setItem('m3_settings', JSON.stringify(settings));
}

// Migración temporal: si existe 'm3_theme' antiguo, moverlo a settings.json
if(localStorage.getItem('m3_theme')) {
    let s = getSettings();
    s.theme = localStorage.getItem('m3_theme');
    saveSettings(s);
    localStorage.removeItem('m3_theme');
}

// --- THEME MANAGEMENT ---
function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        lightModeBtn.classList.add('active');
        darkModeBtn.classList.remove('active');
    } else if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeBtn.classList.add('active');
        lightModeBtn.classList.remove('active');
    } else {
        document.documentElement.removeAttribute('data-theme');
        lightModeBtn.classList.remove('active');
        darkModeBtn.classList.remove('active');
    }
    
    let settings = getSettings();
    if(settings.theme !== theme) {
        settings.theme = theme;
        saveSettings(settings);
    }
}

lightModeBtn.addEventListener('click', () => applyTheme('light'));
darkModeBtn.addEventListener('click', () => applyTheme('dark'));

// --- CARD STYLE MANAGEMENT ---
const styleSolidBtn = document.getElementById('styleSolidBtn');
const styleBlurBtn = document.getElementById('styleBlurBtn');
const styleTransparentBtn = document.getElementById('styleTransparentBtn');

function applyCardStyle(style) {
    if (style === 'solid') {
        document.documentElement.removeAttribute('data-card-style');
    } else {
        document.documentElement.setAttribute('data-card-style', style);
    }
    
    styleSolidBtn.classList.toggle('active', style === 'solid');
    styleBlurBtn.classList.toggle('active', style === 'blur');
    styleTransparentBtn.classList.toggle('active', style === 'transparent');
    
    let settings = getSettings();
    if(settings.cardStyle !== style) {
        settings.cardStyle = style;
        saveSettings(settings);
    }
}

styleSolidBtn.addEventListener('click', () => applyCardStyle('solid'));
styleBlurBtn.addEventListener('click', () => applyCardStyle('blur'));
styleTransparentBtn.addEventListener('click', () => applyCardStyle('transparent'));

// --- FAV LAYOUT MANAGEMENT ---
const layoutMultiBtn = document.getElementById('layoutMultiBtn');
const layoutSingleBtn = document.getElementById('layoutSingleBtn');

function applyFavLayout(layout) {
    layoutMultiBtn.classList.toggle('active', layout === 'multi');
    layoutSingleBtn.classList.toggle('active', layout === 'single');
    
    let settings = getSettings();
    if(settings.favLayout !== layout) {
        settings.favLayout = layout;
        saveSettings(settings);
        window.dispatchEvent(new Event('favLayoutChanged'));
    }
}

layoutMultiBtn.addEventListener('click', () => applyFavLayout('multi'));
layoutSingleBtn.addEventListener('click', () => applyFavLayout('single'));

// Init settings on load
const currentSettings = getSettings();
if (currentSettings.theme) applyTheme(currentSettings.theme);
if (currentSettings.cardStyle) applyCardStyle(currentSettings.cardStyle);
if (currentSettings.favLayout) applyFavLayout(currentSettings.favLayout);

// --- FOLDER STYLE MANAGEMENT ---
const folderStyleIconsBtn = document.getElementById('folderStyleIconsBtn');
const folderStyleCirclesBtn = document.getElementById('folderStyleCirclesBtn');

function applyFolderStyle(style) {
    folderStyleIconsBtn.classList.toggle('active', style === 'icons');
    folderStyleCirclesBtn.classList.toggle('active', style === 'circles');
    
    let settings = getSettings();
    if(settings.folderStyle !== style) {
        settings.folderStyle = style;
        saveSettings(settings);
        // Notificar a collections.js que debe renderizar de nuevo
        window.dispatchEvent(new Event('folderStyleChanged'));
    }
}

folderStyleIconsBtn.addEventListener('click', () => applyFolderStyle('icons'));
folderStyleCirclesBtn.addEventListener('click', () => applyFolderStyle('circles'));

if (currentSettings.folderStyle) applyFolderStyle(currentSettings.folderStyle);

// --- HEADER MANAGEMENT ---
const headerText = document.getElementById('headerText');
const headerIcon = document.getElementById('headerIcon');
const headerIconContainer = document.getElementById('headerIconContainer');
const headerTextInput = document.getElementById('headerTextInput');
const headerIconInput = document.getElementById('headerIconInput');
const uploadHeaderIconBtn = document.getElementById('uploadHeaderIconBtn');
const headerIconUpload = document.getElementById('headerIconUpload');
const resetHeaderBtn = document.getElementById('resetHeaderBtn');

function applyHeaderSettings(h) {
    if(!h) return;
    
    // Aplicar al DOM
    headerText.textContent = h.text || 'Firefox';
    headerTextInput.value = h.text || 'Firefox';
    
    if(h.iconType === 'image') {
        headerIconContainer.innerHTML = `<img src="${h.iconValue}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: contain;">`;
    } else {
        headerIconContainer.innerHTML = `<span class="material-symbols-rounded" id="headerIcon" style="font-size: 40px;">${h.iconValue || 'language'}</span>`;
    }
    
    headerIconInput.value = h.iconType === 'icon' ? h.iconValue : '';
}

function updateHeader(updates) {
    let s = getSettings();
    s.header = { ...s.header, ...updates };
    saveSettings(s);
    applyHeaderSettings(s.header);
}

headerTextInput.addEventListener('input', (e) => {
    updateHeader({ text: e.target.value });
});

headerIconInput.addEventListener('input', (e) => {
    updateHeader({ iconType: 'icon', iconValue: e.target.value });
});

uploadHeaderIconBtn.addEventListener('click', () => headerIconUpload.click());

headerIconUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            // Iconos pequeños: 128x128
            const compressedData = await compressImage(file, { maxWidth: 128, maxHeight: 128, quality: 0.8 });
            updateHeader({ iconType: 'image', iconValue: compressedData });
        } catch (err) {
            console.error("Error al procesar icono:", err);
        }
    }
});

resetHeaderBtn.addEventListener('click', () => {
    updateHeader({ text: 'Firefox', iconType: 'icon', iconValue: 'language' });
});

if (currentSettings.header) applyHeaderSettings(currentSettings.header);

// --- WEATHER SETTINGS MANAGEMENT ---
const weatherApiKeyInput = document.getElementById('weatherApiKeyInput');
const weatherCityInput = document.getElementById('weatherCityInput');

function applyWeatherSettings(w) {
    if(!w) return;
    weatherApiKeyInput.value = w.apiKey || '';
    weatherCityInput.value = w.city || 'Madrid, ES';
}

weatherApiKeyInput.addEventListener('change', (e) => {
    let s = getSettings();
    s.weather.apiKey = e.target.value;
    saveSettings(s);
    window.dispatchEvent(new Event('weatherSettingsChanged'));
});

weatherCityInput.addEventListener('change', (e) => {
    let s = getSettings();
    s.weather.city = e.target.value;
    saveSettings(s);
    window.dispatchEvent(new Event('weatherSettingsChanged'));
});

if (currentSettings.weather) applyWeatherSettings(currentSettings.weather);


// --- WALLPAPER MANAGEMENT (INDEXEDDB) ---
let db;
const request = indexedDB.open('M3NewTabDB', 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains('wallpapers')) {
        db.createObjectStore('wallpapers', { keyPath: 'id' });
    }
};

request.onsuccess = (e) => {
    db = e.target.result;
    loadWallpapers();
    applyActiveWallpaper();
};

request.onerror = (e) => {
    console.error("Error al abrir IndexedDB", e);
};

function loadWallpapers() {
    const transaction = db.transaction(['wallpapers'], 'readonly');
    const store = transaction.objectStore('wallpapers');
    const getReq = store.getAll();
    
    getReq.onsuccess = () => {
        // Borrar todos excepto los estáticos
        const items = wallpaperGrid.querySelectorAll('.wallpaper-item:not(.add-wallpaper-btn):not(.no-wallpaper-btn)');
        items.forEach(item => item.remove());
        
        // Estado inicial del botón sin fondo
        if (!localStorage.getItem('m3_active_wallpaper')) {
            noWallpaperBtn.classList.add('active');
        } else {
            noWallpaperBtn.classList.remove('active');
        }
        
        getReq.result.forEach(wp => {
            const btn = document.createElement('div');
            btn.className = 'wallpaper-item';
            btn.innerHTML = `
                <img src="${wp.data}" alt="Fondo">
                <button class="delete-wallpaper-btn" title="Eliminar fondo">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            `;
            
            // Marcar activo
            if(localStorage.getItem('m3_active_wallpaper') === wp.id) {
                btn.classList.add('active');
            }

            // Seleccionar
            btn.querySelector('img').onclick = () => {
                // Toggle active (quitar si es el mismo, o poner nuevo)
                if(localStorage.getItem('m3_active_wallpaper') === wp.id) {
                    localStorage.removeItem('m3_active_wallpaper');
                } else {
                    localStorage.setItem('m3_active_wallpaper', wp.id);
                }
                loadWallpapers();
                applyActiveWallpaper();
            };

            // Eliminar
            btn.querySelector('.delete-wallpaper-btn').onclick = (e) => {
                e.stopPropagation();
                deleteWallpaper(wp.id);
            };

            // Insertar antes del botón de añadir
            wallpaperGrid.insertBefore(btn, addWallpaperBtn);
        });
    };
}

async function saveWallpaper(file) {
    try {
        // Fondos: Full HD max, calidad 0.7 para buen balance peso/calidad
        const compressedData = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.7 });
        const id = 'wp_' + Date.now();
        
        const transaction = db.transaction(['wallpapers'], 'readwrite');
        const store = transaction.objectStore('wallpapers');
        store.add({ id, data: compressedData });
        
        transaction.oncomplete = () => {
            localStorage.setItem('m3_active_wallpaper', id);
            loadWallpapers();
            applyActiveWallpaper();
        };
    } catch (err) {
        console.error("Error al comprimir wallpaper:", err);
    }
}

function deleteWallpaper(id) {
    const transaction = db.transaction(['wallpapers'], 'readwrite');
    const store = transaction.objectStore('wallpapers');
    store.delete(id);
    
    transaction.oncomplete = () => {
        if(localStorage.getItem('m3_active_wallpaper') === id) {
            localStorage.removeItem('m3_active_wallpaper');
            applyActiveWallpaper();
        }
        loadWallpapers();
    };
}

function applyActiveWallpaper() {
    const activeId = localStorage.getItem('m3_active_wallpaper');
    if (!activeId) {
        document.body.style.backgroundImage = 'none';
        document.body.classList.remove('has-wallpaper');
        return;
    }
    
    if(db) {
        const transaction = db.transaction(['wallpapers'], 'readonly');
        const store = transaction.objectStore('wallpapers');
        const req = store.get(activeId);
        req.onsuccess = () => {
            if (req.result) {
                document.body.style.backgroundImage = `url('${req.result.data}')`;
                document.body.classList.add('has-wallpaper');
            } else {
                localStorage.removeItem('m3_active_wallpaper');
                document.body.style.backgroundImage = 'none';
                document.body.classList.remove('has-wallpaper');
            }
        };
    }
}

addWallpaperBtn.addEventListener('click', () => {
    wallpaperUploadInput.click();
});

wallpaperUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        saveWallpaper(file);
    }
    // reset input para poder volver a subir el mismo archivo si se elimina
    e.target.value = '';
});

noWallpaperBtn.addEventListener('click', () => {
    localStorage.removeItem('m3_active_wallpaper');
    loadWallpapers();
    applyActiveWallpaper();
});
