// js/contextMenu.js

const contextMenu = document.getElementById('contextMenu');
const contextEditBtn = document.getElementById('contextEditBtn');
const contextDeleteBtn = document.getElementById('contextDeleteBtn');

// Global state for context menu action
let currentContextItem = null;

// Opens context menu at x,y
function showContextMenu(e, itemData, onEdit, onDelete) {
    e.preventDefault();
    e.stopPropagation();
    
    currentContextItem = { itemData, onEdit, onDelete };
    
    contextMenu.style.display = 'flex';
    contextMenu.style.opacity = '1';
    contextMenu.style.visibility = 'visible';
    contextMenu.classList.add('active');
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust if it goes out of screen
    const rect = contextMenu.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
        x = window.innerWidth - rect.width - 8;
    }
    if (y + rect.height > window.innerHeight) {
        y = window.innerHeight - rect.height - 8;
    }
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
}

// Close context menu
function hideContextMenu() {
    contextMenu.style.display = 'none';
    contextMenu.classList.remove('active');
}

// Use mousedown instead of click to prevent race conditions with right-clicks
document.addEventListener('mousedown', (e) => {
    // Ignore right clicks for closing
    if (e.button === 2) return;
    // Ignore clicks inside the menu itself
    if (contextMenu.contains(e.target)) return;
    // Ignore clicks on the 3-dots button (they handle their own logic)
    if (e.target.closest('.more-options-btn')) return;
    
    hideContextMenu();
});

contextEditBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentContextItem && currentContextItem.onEdit) {
        currentContextItem.onEdit(currentContextItem.itemData);
    }
    hideContextMenu();
});

contextDeleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentContextItem && currentContextItem.onDelete) {
        currentContextItem.onDelete(currentContextItem.itemData);
    }
    hideContextMenu();
});

// Render helper to inject the HTML into site-item and bind events
function bindSiteItemEvents(anchorElement, itemData, onEdit, onDelete) {
    // Add 3-dots button
    const moreBtn = document.createElement('button');
    moreBtn.className = 'more-options-btn';
    moreBtn.title = 'Más opciones';
    moreBtn.innerHTML = '<img src="assets/more_vert.svg" width="16" height="16" class="svg-icon">';
    
    moreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e, itemData, onEdit, onDelete);
    });
    
    anchorElement.appendChild(moreBtn);
    
    // Right click
    anchorElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e, itemData, onEdit, onDelete);
    });
}

// --- SHARED SITE MODAL LOGIC ---
const siteModal = document.getElementById('siteModal');
const siteModalTitle = document.getElementById('siteModalTitle');
const siteNameInput = document.getElementById('siteNameInput');
const siteUrlInput = document.getElementById('siteUrlInput');
const saveSiteBtn = document.getElementById('saveSiteBtn');
const cancelSiteBtn = document.getElementById('cancelSiteBtn');

function openSiteModal(title, defaultName, defaultUrl, onSave) {
    siteModalTitle.textContent = title;
    siteNameInput.value = defaultName || '';
    siteUrlInput.value = defaultUrl || '';
    
    saveSiteBtn.onclick = () => {
        const name = siteNameInput.value.trim();
        let url = siteUrlInput.value.trim();
        if (name && url) {
            if (!url.startsWith('http')) url = 'https://' + url;
            onSave(name, url);
            closeSiteModal();
        }
    };
    siteModal.classList.add('active');
}

function closeSiteModal() {
    siteModal.classList.remove('active');
}

function handleEnterPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveSiteBtn.click();
    }
}

siteNameInput.addEventListener('keydown', handleEnterPress);
siteUrlInput.addEventListener('keydown', handleEnterPress);

cancelSiteBtn.onclick = closeSiteModal;
window.addEventListener('click', (e) => {
    if (e.target === siteModal) closeSiteModal();
});
