const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1';

let allCoins = [];
let favorites = JSON.parse(localStorage.getItem('crypto_favorites')) || [];

// 1. Fetching Data
async function getCryptoData() {
    try {
        const response = await fetch(API_URL);
        if(!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();
        allCoins = data;
        renderMarket(data);
        renderFavorites(); // Load stored favorites on startup
    } 
    catch (error) {
        document.getElementById('market-list').innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// 2. Storage & Favorites Logic
function saveToLocalStorage(){
    localStorage.setItem('crypto_favorites', JSON.stringify(favorites));
}

function toggleFavorite(coin){
    const index = favorites.findIndex(fav => fav.id === coin.id);
    if(index === -1){
        favorites.push(coin);
    } else {
        favorites.splice(index, 1);
    }
    saveToLocalStorage();
    renderFavorites();
}

// 3. Rendering Functions
function renderMarket(coins){
    const marketContainer = document.getElementById('market-list');
    
    marketContainer.innerHTML = coins.map(coin => {
        // Handle undefined price_change_24h in case API is wonky
        const change = coin.price_change_percentage_24h || 0;
        const changeClass = change >= 0 ? 'up' : 'down';
        const changePrefix = change >= 0 ? '▲' : '▼';

        return `
        <div class="coin-card">
            <img src="${coin.image}" alt="${coin.name}" width="60">
            <h3>${coin.name}</h3>
            
            <p class="price-tag">$${coin.current_price.toLocaleString()}</p>
            
            <div class="change-badge ${changeClass}">
                ${changePrefix} ${Math.abs(change).toFixed(2)}%
            </div>
            
            <button class="add-fav-btn watch-btn" 
                data-id="${coin.id}" 
                data-name="${coin.name}" 
                data-price="${coin.current_price}"
                data-image="${coin.image}">
                Add to Watchlist
            </button>
        </div>
        `;
    }).join('');
}

function renderFavorites(){
    const favContainer = document.getElementById('favorite-list');
    if(favorites.length === 0) {
        favContainer.innerHTML = '<p style="opacity:0.5">Watchlist is empty</p>';
        return;
    }
    
    favContainer.innerHTML = favorites.map(coin => `
        <div class="fav-item">
            <div style="display:flex; align-items:center; gap:10px">
                <img src="${coin.image}" width="20">
                <span>${coin.name}</span>
            </div>
            <span>$${Number(coin.price).toLocaleString()}</span>
        </div>
    `).join('');
}

// 4. Event Delegation
document.getElementById('market-list').addEventListener('click', (event) => {
    const favBtn = event.target.closest('.add-fav-btn');
    if(favBtn){
        const coinData = {
            id: favBtn.dataset.id,
            name: favBtn.dataset.name,
            price: favBtn.dataset.price,
            image: favBtn.dataset.image
        };
        toggleFavorite(coinData);
    }
});

// 5. Search & Debounce
const searchInput = document.getElementById('coin-search');
let debounceTimer;

searchInput.addEventListener('input', (e) =>{
    const value = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(()=> {
        const query = value.toLowerCase();
        const filtered = allCoins.filter(coin => 
            coin.name.toLowerCase().includes(query) || 
            coin.symbol.toLowerCase().includes(query)
        );
        renderMarket(filtered);
    }, 300);
});

// START THE APP
getCryptoData();