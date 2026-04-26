const foldersGrid = document.getElementById('foldersGrid');
const addFolderBtn = document.getElementById('addFolderBtn');
const addFolderModal = document.getElementById('addFolderModal');
const folderNameInput = document.getElementById('folderNameInput');
const saveFolderBtn = document.getElementById('saveFolderBtn');
const cancelAddFolderBtn = document.getElementById('cancelAddFolderBtn');

const folderModal = document.getElementById('folderModal');
const folderModalTitle = document.getElementById('folderModalTitle');
const folderContentsGrid = document.getElementById('folderContentsGrid');
const closeFolderBtn = document.getElementById('closeFolderBtn');
const addSiteToFolderBtn = document.getElementById('addSiteToFolderBtn');
const deleteFolderBtn = document.getElementById('deleteFolderBtn');

let currentFolderId = null;

function loadCollections() {
    const cols = JSON.parse(localStorage.getItem('m3_collections')) || [];
    renderCollections(cols);
}

function renderCollections(cols) {
    foldersGrid.innerHTML = '';
    cols.forEach(col => {
        const btn = document.createElement('button');
        btn.className = 'site-item folder-item';
        
        // Generar preview dinámico
        let previewHtml = '';
        const previewItems = col.items.slice(0, 4);
        previewItems.forEach((item, index) => {
            let domain = '';
            try { domain = new URL(item.url).hostname; } catch(e) { domain = item.url; }
            previewHtml += `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" style="width:100%; height:100%; border-radius:50%; object-fit: cover;" onerror="this.outerHTML='<div class=\\'mini-icon\\'></div>'">`;
        });
        for(let i=previewItems.length; i<4; i++) {
            previewHtml += `<div class="mini-icon"></div>`;
        }

        btn.innerHTML = `
            <div class="folder-icon">
                <div class="folder-preview">
                    ${previewHtml}
                </div>
            </div>
            <span>${col.name}</span>
        `;
        btn.onclick = () => openFolder(col.id);
        foldersGrid.appendChild(btn);
    });
}

function saveCollection() {
    const name = folderNameInput.value.trim();
    if(name) {
        const cols = JSON.parse(localStorage.getItem('m3_collections')) || [];
        cols.push({ id: Date.now().toString(), name, items: [] });
        localStorage.setItem('m3_collections', JSON.stringify(cols));
        loadCollections();
        closeFolderCreateModal();
    }
}

function closeFolderCreateModal() {
    addFolderModal.classList.remove('active');
    folderNameInput.value = '';
}

function openFolder(id) {
    const cols = JSON.parse(localStorage.getItem('m3_collections')) || [];
    const col = cols.find(c => c.id === id);
    if(!col) return;
    
    currentFolderId = id;
    folderModalTitle.textContent = col.name;
    
    // Asegurarse de que los botones estén visibles (favoritos los oculta)
    document.getElementById('addSiteToFolderBtn').style.display = '';
    document.getElementById('deleteFolderBtn').style.display = '';
    
    renderFolderContents(col.items);
    folderModal.classList.add('active');
}

function renderFolderContents(items) {
    folderContentsGrid.innerHTML = '';
    items.forEach((item, index) => {
        const a = document.createElement('a');
        a.href = item.url;
        a.className = 'site-item';
        
        let domain = '';
        try { domain = new URL(item.url).hostname; } catch(e) { domain = item.url; }
        const initial = item.name.charAt(0).toUpperCase();
        const originUrl = (() => { try { return new URL(item.url).origin; } catch(e) { return item.url; }})();
        
        a.innerHTML = `
            <div class="site-icon">
                <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" 
                     alt="${item.name}" 
                     style="width: 24px; height: 24px; border-radius: 4px;"
                     onerror="if(!this.dataset.retried){this.dataset.retried=true; this.src='${originUrl}/favicon.ico';}else{this.outerHTML='<span>${initial}</span>';}">
            </div>
            <span>${item.name}</span>
        `;
        folderContentsGrid.appendChild(a);

        // Lógica de Opciones Contextuales
        bindSiteItemEvents(a, { index, item }, 
            // On Edit
            (data) => {
                openSiteModal('Editar Sitio', data.item.name, data.item.url, (newName, newUrl) => {
                    const cols = JSON.parse(localStorage.getItem('m3_collections')) || [];
                    const colIndex = cols.findIndex(c => c.id === currentFolderId);
                    if(colIndex > -1) {
                        cols[colIndex].items[data.index] = { name: newName, url: newUrl };
                        localStorage.setItem('m3_collections', JSON.stringify(cols));
                        renderFolderContents(cols[colIndex].items);
                        loadCollections(); 
                    }
                });
            },
            // On Delete
            (data) => {
                if(confirm(`¿Eliminar ${data.item.name}?`)) {
                    const cols = JSON.parse(localStorage.getItem('m3_collections')) || [];
                    const colIndex = cols.findIndex(c => c.id === currentFolderId);
                    if(colIndex > -1) {
                        cols[colIndex].items.splice(data.index, 1);
                        localStorage.setItem('m3_collections', JSON.stringify(cols));
                        renderFolderContents(cols[colIndex].items);
                        loadCollections(); 
                    }
                }
            }
        );
    });
}

addSiteToFolderBtn.onclick = () => {
    openSiteModal('Añadir a Carpeta', '', '', (name, url) => {
        const cols = JSON.parse(localStorage.getItem('m3_collections')) || [];
        const colIndex = cols.findIndex(c => c.id === currentFolderId);
        if(colIndex > -1) {
            cols[colIndex].items.push({name, url});
            localStorage.setItem('m3_collections', JSON.stringify(cols));
            renderFolderContents(cols[colIndex].items);
            loadCollections(); 
        }
    });
};

addFolderBtn.onclick = () => addFolderModal.classList.add('active');
cancelAddFolderBtn.onclick = closeFolderCreateModal;
saveFolderBtn.onclick = saveCollection;
closeFolderBtn.onclick = () => folderModal.classList.remove('active');

deleteFolderBtn.onclick = () => {
    if(confirm('¿Estás seguro de que deseas eliminar esta colección por completo?')) {
        let cols = JSON.parse(localStorage.getItem('m3_collections')) || [];
        cols = cols.filter(c => c.id !== currentFolderId);
        localStorage.setItem('m3_collections', JSON.stringify(cols));
        loadCollections();
        folderModal.classList.remove('active');
    }
};

window.addEventListener('click', (e) => {
    if (e.target === addFolderModal) closeFolderCreateModal();
    if (e.target === folderModal) folderModal.classList.remove('active');
});

if(!localStorage.getItem('m3_collections')) {
    localStorage.setItem('m3_collections', JSON.stringify([
        { id: 'demo1', name: 'Trabajo Demo', items: [
            {name: 'GitHub', url: 'https://github.com'},
            {name: 'StackOverflow', url: 'https://stackoverflow.com'}
        ]}
    ]));
}

loadCollections();
