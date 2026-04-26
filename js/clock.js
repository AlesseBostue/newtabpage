function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    document.getElementById('time').textContent = now.toLocaleTimeString('es-ES', timeOptions);
    
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('es-ES', dateOptions);
    document.getElementById('date').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}
setInterval(updateClock, 1000);
updateClock();
