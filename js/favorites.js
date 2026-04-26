const favSitesGrid = document.getElementById('favSitesGrid');
const addFavBtn = document.getElementById('addFavBtn');

window.addEventListener('favLayoutChanged', loadFavorites);

function loadFavorites() {
    const favs = JSON.parse(localStorage.getItem('m3_favorites')) || [];
    renderFavorites(favs);
}

function renderFavorites(favs) {
    favSitesGrid.innerHTML = ''; 
    const settings = getSettings();
    const isSingle = settings.favLayout === 'single';
    
    // Cortar en 5 elementos si es single row
    const limit = (isSingle && favs.length > 5) ? 5 : favs.length;
    const itemsToRender = favs.slice(0, limit);
    
    itemsToRender.forEach((fav, i) => {
        const index = i; // En itemsToRender el índice sigue siendo i (slice de 0), así que es seguro.
        const a = document.createElement('a');
        a.href = fav.url;
        a.className = 'site-item';
        
        let domain = '';
        try { domain = new URL(fav.url).hostname; } catch(e) { domain = fav.url; }
        const initial = fav.name.charAt(0).toUpperCase();
        const originUrl = (() => { try { return new URL(fav.url).origin; } catch(e) { return fav.url; }})();
        
        a.innerHTML = `
            <div class="site-icon">
                <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" 
                     alt="${fav.name}" 
                     style="width: 24px; height: 24px; border-radius: 4px;"
                     onerror="if(!this.dataset.retried){this.dataset.retried=true; this.src='${originUrl}/favicon.ico';}else{this.outerHTML='<span>${initial}</span>';}">
            </div>
            <span>${fav.name}</span>
        `;
        favSitesGrid.appendChild(a);

        // Lógica de Opciones Contextuales
        bindSiteItemEvents(a, { index, fav }, 
            // On Edit
            (data) => {
                openSiteModal('Editar Favorito', data.fav.name, data.fav.url, (newName, newUrl) => {
                    const currentFavs = JSON.parse(localStorage.getItem('m3_favorites')) || [];
                    currentFavs[data.index] = { name: newName, url: newUrl };
                    localStorage.setItem('m3_favorites', JSON.stringify(currentFavs));
                    loadFavorites();
                });
            },
            // On Delete
            (data) => {
                if(confirm(`¿Eliminar ${data.fav.name}?`)) {
                    let currentFavs = JSON.parse(localStorage.getItem('m3_favorites')) || [];
                    currentFavs.splice(data.index, 1);
                    localStorage.setItem('m3_favorites', JSON.stringify(currentFavs));
                    loadFavorites();
                }
            }
        );
    });
    
    // Botón Ver Más
    if(isSingle && favs.length > 5) {
        const viewMoreBtn = document.createElement('button');
        viewMoreBtn.className = 'view-more-btn';
        viewMoreBtn.innerHTML = `
            <div class="view-more-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
            </div>
            <span>Ver más</span>
        `;
        viewMoreBtn.onclick = () => {
            const folderModalTitle = document.getElementById('folderModalTitle');
            const folderModal = document.getElementById('folderModal');
            const folderContentsGrid = document.getElementById('folderContentsGrid');
            
            document.getElementById('addSiteToFolderBtn').style.display = 'none';
            document.getElementById('deleteFolderBtn').style.display = 'none';
            
            folderModalTitle.textContent = 'Todos los Favoritos';
            folderContentsGrid.innerHTML = '';
            
            favs.forEach((fav, index) => {
                const a = document.createElement('a');
                a.href = fav.url;
                a.className = 'site-item';
                let domain = '';
                try { domain = new URL(fav.url).hostname; } catch(e) { domain = fav.url; }
                const initial = fav.name.charAt(0).toUpperCase();
                const originUrl = (() => { try { return new URL(fav.url).origin; } catch(e) { return fav.url; }})();
                
                a.innerHTML = `
                    <div class="site-icon">
                        <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" 
                             alt="${fav.name}" 
                             style="width: 24px; height: 24px; border-radius: 4px;"
                             onerror="if(!this.dataset.retried){this.dataset.retried=true; this.src='${originUrl}/favicon.ico';}else{this.outerHTML='<span>${initial}</span>';}">
                    </div>
                    <span>${fav.name}</span>
                `;
                folderContentsGrid.appendChild(a);
                
                bindSiteItemEvents(a, { index, fav }, 
                    (data) => {
                        openSiteModal('Editar Favorito', data.fav.name, data.fav.url, (newName, newUrl) => {
                            const currentFavs = JSON.parse(localStorage.getItem('m3_favorites')) || [];
                            currentFavs[data.index] = { name: newName, url: newUrl };
                            localStorage.setItem('m3_favorites', JSON.stringify(currentFavs));
                            loadFavorites();
                            folderModal.classList.remove('active');
                        });
                    },
                    (data) => {
                        if(confirm(`¿Eliminar ${data.fav.name}?`)) {
                            let currentFavs = JSON.parse(localStorage.getItem('m3_favorites')) || [];
                            currentFavs.splice(data.index, 1);
                            localStorage.setItem('m3_favorites', JSON.stringify(currentFavs));
                            loadFavorites();
                            folderModal.classList.remove('active');
                        }
                    }
                );
            });
            
            folderModal.classList.add('active');
        };
        favSitesGrid.appendChild(viewMoreBtn);
    }
}

addFavBtn.onclick = () => {
    openSiteModal('Añadir Favorito', '', '', (name, url) => {
        const favs = JSON.parse(localStorage.getItem('m3_favorites')) || [];
        favs.push({ name, url });
        localStorage.setItem('m3_favorites', JSON.stringify(favs));
        loadFavorites();
    });
};

loadFavorites();
