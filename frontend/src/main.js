const stockList = document.getElementById('stock-list');
const addBtn = document.getElementById('add-btn');

function addStockRow() {
  const row = document.createElement('div');
  row.className = 'stock-row';

  row.innerHTML = `
    <div class="box">
      <span class="stock-name"></span>
      <input type="text" class="ticker-input" placeholder="코드 (예: 005930)">
    </div>
    <div class="box">
      <input type="number" class="price-input" placeholder="금액 입력">
    </div>
    <div class="box current-price">-</div>
    <div class="box diff-result">-</div>
    <button class="btn refresh-btn">조회</button>
  `;

  const refreshBtn = row.querySelector('.refresh-btn');
  refreshBtn.addEventListener('click', () => fetchStockData(row));

  stockList.appendChild(row);
}

async function fetchStockData(row) {
  const tickerInput = row.querySelector('.ticker-input').value.trim();
  const basePrice = parseFloat(row.querySelector('.price-input').value);
  const currentPriceBox = row.querySelector('.current-price');
  const diffResultBox = row.querySelector('.diff-result');
  const nameLabel = row.querySelector('.stock-name');

  if (!tickerInput || isNaN(basePrice)) {
    alert('종목 코드와 내 금액을 모두 입력해주세요.');
    return;
  }

  let fetchTicker = tickerInput;
  if (/^\d{6}$/.test(tickerInput)) {
    fetchTicker = `${tickerInput}.KS`;
  }

  currentPriceBox.innerText = '검색중...';

  try {
    // CORS 우회 공공 프록시를 통해 야후 파이낸스 데이터를 직접 안전하게 가져옵니다.
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${fetchTicker}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('통신 오류');
    
    const wrapper = await response.json();
    const data = JSON.parse(wrapper.contents);
    
    const meta = data.chart.result[0].meta;
    const currentPrice = meta.regularMarketPrice;

    const diffPrice = currentPrice - basePrice;
    const percent = ((diffPrice / basePrice) * 100).toFixed(2);

    nameLabel.innerText = fetchTicker;
    currentPriceBox.innerText = currentPrice.toLocaleString();
    
    const sign = diffPrice > 0 ? '+' : '';
    diffResultBox.innerHTML = `${sign}${diffPrice.toLocaleString()}<br>(${sign}${percent}%)`;
    diffResultBox.className = `box diff-result ${diffPrice >= 0 ? 'profit' : 'loss'}`;

  } catch (error) {
    console.error(error);
    currentPriceBox.innerText = '오류';
    alert('데이터를 불러오지 못했습니다. 종목 코드를 다시 확인해주세요.');
  }
}

addStockRow();
addBtn.addEventListener('click', addStockRow);