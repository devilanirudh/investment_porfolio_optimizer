document.addEventListener('DOMContentLoaded', function() {
    // Initialize the market ticker with real data
    initLiveMarketTicker();
    
    // Initialize form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Handle the analyze button click
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            // Validate the form
            const riskProfileForm = document.getElementById('risk-profile-form');
            const portfolioCsv = document.getElementById('portfolio-csv');
            
        let isValid = true;
        
            if (riskProfileForm) {
                if (!riskProfileForm.checkValidity()) {
                    riskProfileForm.classList.add('was-validated');
                    isValid = false;
                }
            }
            
            if (portfolioCsv && !portfolioCsv.files.length) {
                portfolioCsv.classList.add('is-invalid');
                isValid = false;
            } else if (portfolioCsv) {
                portfolioCsv.classList.remove('is-invalid');
            }
            
            if (isValid) {
                // Show loading spinner
                const resultsSection = document.getElementById('results-section');
                const loadingSpinner = document.getElementById('loading');
                const resultsContent = document.getElementById('results-content');
                const errorMessage = document.getElementById('error-message');
                
                if (resultsSection) resultsSection.classList.remove('d-none');
                if (loadingSpinner) loadingSpinner.classList.remove('d-none');
                if (resultsContent) resultsContent.classList.add('d-none');
                if (errorMessage) errorMessage.classList.add('d-none');
                
                // Smooth scroll to results
                window.scrollTo({
                    top: resultsSection.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Create form data for API call
                const formData = new FormData();
                
                // Add form fields
                formData.append('total_assets', document.getElementById('total-assets').value);
                formData.append('total_liabilities', document.getElementById('total-liabilities').value);
                formData.append('monthly_income', document.getElementById('monthly-income').value);
                formData.append('monthly_expenses', document.getElementById('monthly-expenses').value);
                formData.append('emergency_fund_months', document.getElementById('emergency-fund').value);
                formData.append('investment_experience', document.getElementById('investment-experience').value);
                formData.append('age', document.getElementById('age').value);
                formData.append('retirement_goals', document.getElementById('retirement-goals').value);
                formData.append('investment_horizon', document.getElementById('investment-horizon').value);
                formData.append('risk_appetite', document.getElementById('risk-appetite').value);
                
                // Add CSV file
                formData.append('portfolio_csv', portfolioCsv.files[0]);
                
                // Make API call
                fetch('/analyze', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Hide loading spinner
                    if (loadingSpinner) loadingSpinner.classList.add('d-none');
                    
                    // Show results
                    if (resultsContent) {
                        resultsContent.classList.remove('d-none');
                        
                        // Clear existing tables
                        const holdingsTable = document.getElementById('holdings-table').querySelector('tbody');
                        const keepTable = document.getElementById('keep-table').querySelector('tbody');
                        const exitTable = document.getElementById('exit-table').querySelector('tbody');
                        
                        if (holdingsTable) holdingsTable.innerHTML = '';
                        if (keepTable) keepTable.innerHTML = '';
                        if (exitTable) exitTable.innerHTML = '';
                        
                        // Populate Holdings Table
                        if (data.portfolio_analysis && data.portfolio_analysis.current_holdings) {
                            data.portfolio_analysis.current_holdings.forEach((stock, index) => {
                                const row = document.createElement('tr');
                                row.style.opacity = '0';
                                row.style.animation = `fadeIn 0.3s ease-out ${index * 0.1}s forwards`;
                                
                                const priceChange = ((stock.current_market_rate - stock.average_purchase_price) / stock.average_purchase_price * 100).toFixed(2);
                                const priceChangeClass = priceChange >= 0 ? 'text-success' : 'text-danger';
                                const priceChangeIcon = priceChange >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                                
                                row.innerHTML = `
                                    <td>${stock.security_name}</td>
                                    <td>${stock.quantity_held}</td>
                                    <td>₹${stock.average_purchase_price.toLocaleString()}</td>
                                    <td>
                                        ₹${stock.current_market_rate.toLocaleString()} 
                                        <span class="${priceChangeClass}">
                                            <i class="fas ${priceChangeIcon}"></i> ${Math.abs(priceChange)}%
                                        </span>
                                    </td>
                                    <td>${stock.market_cap}</td>
                                    <td>${stock.sector}</td>
                                    <td>
                                        <span class="badge rounded-pill ${getVolatilityClass(stock.volatility)}">${stock.volatility}</span>
                                    </td>
                                `;
                                holdingsTable.appendChild(row);
                            });
                        }
                        
                        // Populate Keep Table
                        if (data.portfolio_analysis && data.portfolio_analysis.keep) {
                            data.portfolio_analysis.keep.forEach((stock, index) => {
                                const row = document.createElement('tr');
                                row.style.opacity = '0';
                                row.style.animation = `fadeIn 0.3s ease-out ${index * 0.1}s forwards`;
                                
                                const priceChange = ((stock.current_market_rate - stock.average_purchase_price) / stock.average_purchase_price * 100).toFixed(2);
                                const priceChangeClass = priceChange >= 0 ? 'text-success' : 'text-danger';
                                const priceChangeIcon = priceChange >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                                
                                row.innerHTML = `
                                    <td>${stock.security_name}</td>
                                    <td>${stock.quantity_held}</td>
                                    <td>₹${stock.average_purchase_price.toLocaleString()}</td>
                                    <td>
                                        ₹${stock.current_market_rate.toLocaleString()} 
                                        <span class="${priceChangeClass}">
                                            <i class="fas ${priceChangeIcon}"></i> ${Math.abs(priceChange)}%
                                        </span>
                                    </td>
                                    <td>${stock.market_cap}</td>
                                    <td>${stock.reason}</td>
                                `;
                                keepTable.appendChild(row);
                            });
                        }
                        
                        // Populate Exit Table
                        if (data.portfolio_analysis && data.portfolio_analysis.exit) {
                            data.portfolio_analysis.exit.forEach((stock, index) => {
                                const row = document.createElement('tr');
                                row.style.opacity = '0';
                                row.style.animation = `fadeIn 0.3s ease-out ${index * 0.1}s forwards`;
                                
                                const priceChange = ((stock.current_market_rate - stock.average_purchase_price) / stock.average_purchase_price * 100).toFixed(2);
                                const priceChangeClass = priceChange >= 0 ? 'text-success' : 'text-danger';
                                const priceChangeIcon = priceChange >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                                
                                row.innerHTML = `
                                    <td>${stock.security_name}</td>
                                    <td>${stock.quantity_held}</td>
                                    <td>₹${stock.average_purchase_price.toLocaleString()}</td>
                                    <td>
                                        ₹${stock.current_market_rate.toLocaleString()} 
                                        <span class="${priceChangeClass}">
                                            <i class="fas ${priceChangeIcon}"></i> ${Math.abs(priceChange)}%
                                        </span>
                                    </td>
                                    <td>${stock.market_cap}</td>
                                    <td>${stock.reason}</td>
                                `;
                                exitTable.appendChild(row);
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    
                    // Hide loading spinner
                    if (loadingSpinner) loadingSpinner.classList.add('d-none');
                    
                    // Show error message
                    if (errorMessage) {
                        errorMessage.classList.remove('d-none');
                        document.getElementById('error-text').textContent = 
                            'There was an error analyzing your portfolio. Please try again.';
                    }
                });
            }
        });
    }
    
    // Function to initialize and populate the market ticker with live data
    function initLiveMarketTicker() {
        // Nifty 50 stock symbols
        const nifty50Symbols = [
            'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 
            'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
            'BAJFINANCE.NS', 'ASIANPAINT.NS', 'HCLTECH.NS', 'WIPRO.NS', 'AXISBANK.NS',
            'MARUTI.NS', 'TATASTEEL.NS', 'NTPC.NS', 'ADANIPORTS.NS', 'ULTRACEMCO.NS',
            'SUNPHARMA.NS', 'BAJAJFINSV.NS', 'LT.NS', 'TITAN.NS', 'TATAMOTORS.NS',
            'NESTLEIND.NS', 'POWERGRID.NS', 'GRASIM.NS', 'ONGC.NS', 'JSWSTEEL.NS'
        ];
        
        // Prepare the ticker container
        const tickerContainer = document.getElementById('stock-ticker');
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'ticker-loading';
        loadingIndicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Loading market data...';
        tickerContainer.appendChild(loadingIndicator);
        
        // Also update the index values
        updateMarketIndices();
        
        // Fetch data for all symbols
        fetchLiveStockData(nifty50Symbols)
            .then(stocksData => {
                // Remove loading indicator
                tickerContainer.innerHTML = '';
                
                // Create and append ticker items
                stocksData.forEach(stock => {
                    if (!stock || !stock.price) return; // Skip invalid data
                    
                    const tickerItem = document.createElement('div');
                    tickerItem.className = 'ticker-item';
                    
                    const changeClass = stock.change >= 0 ? 'text-success' : 'text-danger';
                    const changeIcon = stock.change >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                    
                    tickerItem.innerHTML = `
                        <span class="stock-name">${stock.symbol.replace('.NS', '')}</span>
                        <span class="stock-price">₹${parseFloat(stock.price).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                        <span class="stock-change ${changeClass}">
                            <i class="fas ${changeIcon}"></i> ${Math.abs(stock.change).toFixed(2)}%
                        </span>
                    `;
                    
                    tickerContainer.appendChild(tickerItem);
                });
                
                // Create duplicate items for seamless scrolling
                const tickerItems = tickerContainer.innerHTML;
                tickerContainer.innerHTML += tickerItems;
                
                // Set up refresh interval
                setInterval(() => {
                    fetchLiveStockData(nifty50Symbols)
                        .then(updatedData => updateTickerItems(updatedData))
                        .catch(error => console.error('Error updating stock data:', error));
                        
                    // Also update the indices
                    updateMarketIndices();
                }, 60000); // Update every minute
            })
            .catch(error => {
                console.error('Error fetching stock data:', error);
                tickerContainer.innerHTML = `
                    <div class="ticker-error">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Unable to load live market data. Using demo data instead.
                    </div>
                `;
                // Fallback to demo data
                initDemoMarketTicker();
            });
    }
    
    // Function to fetch live stock data using Yahoo Finance API
    async function fetchLiveStockData(symbols) {
        try {
            // Use the Yahoo Finance API via proxy to avoid CORS issues
            const apiUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;
            
            // For the purpose of this demo, we'll use a CORS proxy
            // In production, you would handle this server-side
            const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
            
            const response = await fetch(corsProxyUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const data = await response.json();
            
            if (!data.quoteResponse || !data.quoteResponse.result) {
                throw new Error('Invalid response format');
            }
            
            return data.quoteResponse.result.map(quote => ({
                symbol: quote.symbol,
                name: quote.longName || quote.shortName,
                price: quote.regularMarketPrice,
                change: quote.regularMarketChangePercent,
                volume: quote.regularMarketVolume
            }));
        } catch (error) {
            console.error('Error fetching stock data:', error);
            throw error;
        }
    }
    
    // Function to update market indices (NIFTY 50 and SENSEX)
    async function updateMarketIndices() {
        try {
            const indices = ['^NSEI', '^BSESN']; // NIFTY 50 and SENSEX symbols
            const apiUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${indices.join(',')}`;
            const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
            
            const response = await fetch(corsProxyUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch indices data');
            }
            
            const data = await response.json();
            
            if (!data.quoteResponse || !data.quoteResponse.result) {
                throw new Error('Invalid response format for indices');
            }
            
            const indexData = data.quoteResponse.result;
            
            // Update NIFTY 50
            if (indexData[0]) {
                const niftyValue = document.querySelector('.market-indices:nth-child(1) .index-value');
                const niftyChange = document.querySelector('.market-indices:nth-child(1) .index-change');
                
                if (niftyValue && niftyChange) {
                    niftyValue.textContent = indexData[0].regularMarketPrice.toLocaleString('en-IN', { 
                        maximumFractionDigits: 2 
                    });
                    
                    const changePercent = indexData[0].regularMarketChangePercent;
                    const changeClass = changePercent >= 0 ? 'text-success' : 'text-danger';
                    const changeIcon = changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                    
                    niftyChange.className = `index-change ${changeClass}`;
                    niftyChange.innerHTML = `<i class="fas ${changeIcon}"></i> ${Math.abs(changePercent).toFixed(2)}%`;
                }
            }
            
            // Update SENSEX
            if (indexData[1]) {
                const sensexValue = document.querySelector('.market-indices:nth-child(2) .index-value');
                const sensexChange = document.querySelector('.market-indices:nth-child(2) .index-change');
                
                if (sensexValue && sensexChange) {
                    sensexValue.textContent = indexData[1].regularMarketPrice.toLocaleString('en-IN', { 
                        maximumFractionDigits: 2 
                    });
                    
                    const changePercent = indexData[1].regularMarketChangePercent;
                    const changeClass = changePercent >= 0 ? 'text-success' : 'text-danger';
                    const changeIcon = changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                    
                    sensexChange.className = `index-change ${changeClass}`;
                    sensexChange.innerHTML = `<i class="fas ${changeIcon}"></i> ${Math.abs(changePercent).toFixed(2)}%`;
                }
            }
            
            // Update market status based on market hours (IST: 9:15 AM - 3:30 PM, Mon-Fri)
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
            const istTime = new Date(now.getTime() + istOffset);
            
            const marketStatus = document.querySelector('.market-status');
            const statusIndicator = document.querySelector('.status-indicator');
            
            if (marketStatus && statusIndicator) {
                const day = istTime.getUTCDay();
                const hours = istTime.getUTCHours();
                const minutes = istTime.getUTCMinutes();
                const currentTimeInMinutes = hours * 60 + minutes;
                
                const marketOpenInMinutes = 9 * 60 + 15; // 9:15 AM
                const marketCloseInMinutes = 15 * 60 + 30; // 3:30 PM
                
                const isMarketOpen = day >= 1 && day <= 5 && // Monday to Friday
                                    currentTimeInMinutes >= marketOpenInMinutes &&
                                    currentTimeInMinutes < marketCloseInMinutes;
                
                if (isMarketOpen) {
                    statusIndicator.className = 'status-indicator active';
                    marketStatus.innerHTML = '<span class="status-indicator active"></span> Market Open';
                } else {
                    statusIndicator.className = 'status-indicator';
                    marketStatus.innerHTML = '<span class="status-indicator"></span> Market Closed';
                }
            }
            
        } catch (error) {
            console.error('Error updating market indices:', error);
        }
    }
    
    // Function to update existing ticker items with new data
    function updateTickerItems(stocksData) {
        const tickerItems = document.querySelectorAll('.ticker-item');
        if (!tickerItems.length) return;
        
        stocksData.forEach(stock => {
            if (!stock || !stock.price) return;
            
            const symbol = stock.symbol.replace('.NS', '');
            const matchingItems = Array.from(tickerItems).filter(item => 
                item.querySelector('.stock-name').textContent === symbol
            );
            
            matchingItems.forEach(item => {
                const priceElement = item.querySelector('.stock-price');
                const changeElement = item.querySelector('.stock-change');
                
                if (priceElement && changeElement) {
                    // Update with new data
                    priceElement.textContent = `₹${parseFloat(stock.price).toLocaleString('en-IN', { 
                        maximumFractionDigits: 2, 
                        minimumFractionDigits: 2 
                    })}`;
                    
                    const changeClass = stock.change >= 0 ? 'text-success' : 'text-danger';
                    const changeIcon = stock.change >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                    
                    changeElement.className = `stock-change ${changeClass}`;
                    changeElement.innerHTML = `<i class="fas ${changeIcon}"></i> ${Math.abs(stock.change).toFixed(2)}%`;
                    
                    // Add a subtle highlight effect for changed values
                    item.classList.add('value-changed');
                    setTimeout(() => item.classList.remove('value-changed'), 1000);
                }
            });
        });
    }
    
    // Fallback function with demo data if API fails
    function initDemoMarketTicker() {
        const nifty50Stocks = [
            { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2935.40, change: 1.24 },
            { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3580.65, change: 0.78 },
            { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1475.20, change: -0.42 },
            { symbol: 'INFY', name: 'Infosys', price: 1420.80, change: 1.05 },
            { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1027.90, change: 0.54 },
            { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2345.75, change: -0.61 },
            { symbol: 'ITC', name: 'ITC Ltd', price: 434.25, change: 0.92 },
            { symbol: 'SBIN', name: 'State Bank of India', price: 748.60, change: 1.37 },
            { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1287.45, change: 0.28 },
            { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1755.30, change: -0.19 },
            { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6870.50, change: -1.12 },
            { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2789.15, change: 0.37 },
            { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1342.90, change: 1.68 },
            { symbol: 'WIPRO', name: 'Wipro Ltd', price: 445.75, change: 0.85 },
            { symbol: 'AXISBANK', name: 'Axis Bank', price: 1128.40, change: 0.63 },
            { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 10425.80, change: -0.24 },
            { symbol: 'TATASTEEL', name: 'Tata Steel', price: 178.55, change: 2.16 },
            { symbol: 'NTPC', name: 'NTPC Ltd', price: 345.20, change: 0.48 },
            { symbol: 'ADANIPORTS', name: 'Adani Ports', price: 1245.60, change: -0.73 },
            { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 9870.25, change: 0.53 },
            { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1430.80, change: 1.14 },
            { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', price: 1645.30, change: -0.86 },
            { symbol: 'LT', name: 'Larsen & Toubro', price: 3420.75, change: 1.03 },
            { symbol: 'TITAN', name: 'Titan Company', price: 3285.60, change: 0.42 },
            { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 887.45, change: 1.78 },
            { symbol: 'NESTLEIND', name: 'Nestle India', price: 2486.90, change: -0.28 },
            { symbol: 'POWERGRID', name: 'Power Grid Corp', price: 328.65, change: 0.36 },
            { symbol: 'GRASIM', name: 'Grasim Industries', price: 2175.40, change: 0.59 },
            { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', price: 274.85, change: 1.47 },
            { symbol: 'JSWSTEEL', name: 'JSW Steel', price: 892.30, change: 1.96 }
        ];
        
        const tickerContainer = document.getElementById('stock-ticker');
        if (!tickerContainer) return;
        
        // Clear existing content
        tickerContainer.innerHTML = '';
        
        // Create and append ticker items
        nifty50Stocks.forEach(stock => {
            const tickerItem = document.createElement('div');
            tickerItem.className = 'ticker-item';
            
            const changeClass = stock.change >= 0 ? 'text-success' : 'text-danger';
            const changeIcon = stock.change >= 0 ? 'fa-caret-up' : 'fa-caret-down';
            
            tickerItem.innerHTML = `
                <span class="stock-name">${stock.symbol}</span>
                <span class="stock-price">₹${stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
                <span class="stock-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i> ${Math.abs(stock.change).toFixed(2)}%
                </span>
            `;
            
            tickerContainer.appendChild(tickerItem);
        });
        
        // Create duplicate items for seamless scrolling
        const tickerItems = tickerContainer.innerHTML;
        tickerContainer.innerHTML += tickerItems;
        
        // Simulate updates
        setInterval(() => {
            const tickerItems = document.querySelectorAll('.ticker-item');
            tickerItems.forEach(item => {
                const priceElement = item.querySelector('.stock-price');
                const changeElement = item.querySelector('.stock-change');
                
                if (priceElement && changeElement) {
                    // Get current price
                    let currentPrice = parseFloat(priceElement.textContent.replace('₹', '').replace(',', ''));
                    
                    // Generate a random change (-0.5% to +0.5%)
                    const randomChange = (Math.random() - 0.45) * 1;
                    const newPrice = currentPrice * (1 + randomChange/100);
                    
                    // Update price
                    priceElement.textContent = `₹${newPrice.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
                    
                    // Update change indicator
                    const changeClass = randomChange >= 0 ? 'text-success' : 'text-danger';
                    const changeIcon = randomChange >= 0 ? 'fa-caret-up' : 'fa-caret-down';
                    
                    changeElement.className = `stock-change ${changeClass}`;
                    changeElement.innerHTML = `<i class="fas ${changeIcon}"></i> ${Math.abs(randomChange).toFixed(2)}%`;
                    
                    // Add highlight effect
                    item.classList.add('value-changed');
                    setTimeout(() => item.classList.remove('value-changed'), 1000);
                }
            });
        }, 60000); // Update every minute
    }
    
    // Helper to get class for volatility badge
    function getVolatilityClass(volatility) {
        switch(volatility) {
            case 'Low':
                return 'bg-success';
            case 'Medium':
                return 'bg-warning text-dark';
            case 'High':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }
    
    // Add subtle parallax effect to hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            if (scrollPosition <= heroSection.offsetHeight) {
                heroSection.style.backgroundPositionY = scrollPosition * 0.4 + 'px';
            }
        });
    }
    
    // Add scroll animations for cards
    const animateOnScroll = function() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (cardPosition < screenPosition) {
                card.classList.add('fadeIn');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
}); 