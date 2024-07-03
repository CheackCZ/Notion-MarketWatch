document.addEventListener('DOMContentLoaded', () => {
    const stockData = [
        { name: 'S&P 500', symbol: 'SPY' },
        { name: 'Dow Jones', symbol: 'DIA' },
        { name: 'Nasdaq 100', symbol: 'QQQ' },
        { name: 'FTSE All-World', symbol: 'VEU' },
        { name: 'Bitcoin', symbol: 'bitcoin', isCrypto: true },
        { name: 'Ethereum', symbol: 'ethereum', isCrypto: true }
    ];

    const stockContainer = document.querySelector('.stock-rebalancer');

    const apiKey = 'eN6mYVjj52OfGPPCcFznmUOrF7PMsdOqqelxvKs0'; 
    const apiUrl = 'https://api.stockdata.org/v1/data/quote';
    const cryptoDataApiUrl = 'https://api.coingecko.com/api/v3/simple/price';

    function fetchStockData() {
        stockData.forEach(stock => {
            if (stock.isCrypto) {
                fetchCryptoData(stock);
            } else {
                fetchStockDataFromAPI(stock);
            }
        });
    }

    function fetchStockDataFromAPI(stock) {
        const url = `${apiUrl}?symbols=${stock.symbol}&api_token=${apiKey}`;
        console.log('Fetching stock data from:', url);
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.data && data.data.length > 0) {
                    const stockInfo = data.data[0];
                    const value = parseFloat(stockInfo.price);
                    const openValue = parseFloat(stockInfo.day_open);
                    const changePoints = value - openValue;
                    const changePercent = ((value - openValue) / openValue) * 100;

                    updateStockItem(stock.name, value, changePercent, changePoints);
                } else {
                    console.error('Invalid data:', data);
                }
            })
            .catch(error => console.error('Error fetching stock data:', error));
    }

    function fetchCryptoData(stock) {
        const url = `${cryptoDataApiUrl}?ids=${stock.symbol}&vs_currencies=usd`;
        console.log('Fetching crypto data from:', url);
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data[stock.symbol]) {
                    const value = parseFloat(data[stock.symbol].usd);
                    const openValue = value * 0.95; 
                    const changePoints = value - openValue;
                    const changePercent = ((value - openValue) / openValue) * 100;

                    updateStockItem(stock.name, value, changePercent, changePoints);
                } else {
                    console.error('Invalid data:', data);
                }
            })
            .catch(error => console.error('Error fetching crypto data:', error));
    }

    function updateStockItem(name, value, changePercent, changePoints) {
        const stockItem = document.querySelector(`.stock-item[data-name="${name}"]`);
        if (stockItem) {
            stockItem.querySelector('.stock-value').textContent = value.toFixed(2);
            const changeElement = stockItem.querySelector('.stock-change');
            changeElement.className = `stock-change ${changePercent < 0 ? 'down' : 'up'}`;
            changeElement.innerHTML = `
                <span>${changePercent < 0 ? '▼' : '▲'} ${Math.abs(changePercent).toFixed(2)}%</span>
                <span class="point-change">${changePoints.toFixed(2)}</span>
            `;
        }
    }

    stockData.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.classList.add('stock-item');
        stockItem.setAttribute('data-name', stock.name);

        stockItem.innerHTML = `
            <div class="stock-name">${stock.name}</div>
            <div class="stock-value">--</div>
            <div class="stock-change">
                <span>--</span>
                <span class="point-change">--</span>
            </div>
        `;

        stockContainer.appendChild(stockItem);
    });

    fetchStockData();
    setInterval(fetchStockData, 840000); 
});
