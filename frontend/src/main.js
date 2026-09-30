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
    const response = await fetch(`/api/price?ticker=${fetchTicker}`);
    
    // 만약 서버에서 에러를 보냈다면 그 이유를 상세히 뽑아냅니다.
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`서버응답 ${response.status} - ${errorData.error || '알수없는오류'}`);
    }
    
    const data = await response.json();
    const currentPrice = data.price;

    const diffPrice = currentPrice - basePrice;
    const percent = ((diffPrice / basePrice) * 100).toFixed(2);

    nameLabel.innerText = data.name || fetchTicker;
    currentPriceBox.innerText = currentPrice.toLocaleString();
    
    const sign = diffPrice > 0 ? '+' : '';
    diffResultBox.innerHTML = `${sign}${diffPrice.toLocaleString()}<br>(${sign}${percent}%)`;
    diffResultBox.className = `box diff-result ${diffPrice >= 0 ? 'profit' : 'loss'}`;

  } catch (error) {
    console.error(error);
    currentPriceBox.innerText = '오류';
    // 폰 화면에 진짜 에러 원인을 띄워줍니다!
    alert(`[폰 에러 상세정보]\n입력된 코드: ${fetchTicker}\n에러 원인: ${error.message}`);
  }
}
addStockRow();
addBtn.addEventListener('click', addStockRow);