const stockList = document.getElementById('stock-list');
const addBtn = document.getElementById('add-btn');

function loadData() {
  const savedData = JSON.parse(localStorage.getItem('stockMemo')) || [];
  if (savedData.length === 0) {
    addStockRow(); 
  } else {
    // 저장된 종목명(name)도 함께 불러옵니다.
    savedData.forEach(data => addStockRow(data.name || '', data.ticker, data.price));
  }
}

function saveData() {
  const rows = document.querySelectorAll('.stock-row');
  const dataToSave = [];
  rows.forEach(row => {
    const name = row.querySelector('.name-input').value; // 사용자가 적은 종목명
    const ticker = row.querySelector('.ticker-input').value.replace(/[^0-9a-zA-Z.]/g, '');
    const basePrice = row.querySelector('.price-input').value;
    if (ticker && basePrice) {
      dataToSave.push({ name: name, ticker: ticker, price: basePrice });
    }
  });
  localStorage.setItem('stockMemo', JSON.stringify(dataToSave));
}

// 종목명 입력칸(name-input)을 추가했습니다.
function addStockRow(savedName = '', savedTicker = '', savedPrice = '') {
  const row = document.createElement('div');
  row.className = 'stock-row';

  row.innerHTML = `
    <div class="box">
      <input type="text" class="name-input" placeholder="종목명 (예: 삼성전자)" value="${savedName}">
      <input type="text" class="ticker-input" placeholder="코드 (예: 005930)" value="${savedTicker}">
    </div>
    <div class="box">
      <input type="number" class="price-input" placeholder="내 금액" value="${savedPrice}">
    </div>
    <div class="box current-price">-</div>
    <div class="box diff-result">-</div>
    <div class="btn-group">
      <button class="btn refresh-btn">조회</button>
      <button class="btn delete-btn">삭제</button>
    </div>
  `;

  const refreshBtn = row.querySelector('.refresh-btn');
  refreshBtn.addEventListener('click', () => fetchStockData(row));

  const deleteBtn = row.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    row.remove();
    saveData();
  });

  // 타이핑할 때마다 바로바로 스마트폰에 자동 저장되게 안전장치 추가!
  row.querySelector('.name-input').addEventListener('input', saveData);
  row.querySelector('.ticker-input').addEventListener('input', saveData);
  row.querySelector('.price-input').addEventListener('input', saveData);

  stockList.appendChild(row);

  if (savedTicker && savedPrice) {
    fetchStockData(row);
  }
}

async function fetchStockData(row) {
  const tickerInput = row.querySelector('.ticker-input').value.replace(/[^0-9a-zA-Z.]/g, '');
  const basePrice = parseFloat(row.querySelector('.price-input').value);
  const currentPriceBox = row.querySelector('.current-price');
  const diffResultBox = row.querySelector('.diff-result');

  if (!tickerInput || isNaN(basePrice)) {
    alert('종목 코드와 금액을 모두 입력해주세요.');
    return;
  }

  let fetchTicker = tickerInput;
  if (/^\d{6}$/.test(tickerInput)) {
    fetchTicker = `${tickerInput}.KS`;
  }

  currentPriceBox.innerText = '검색중...';

  try {
    const response = await fetch(`/api/price?ticker=${fetchTicker}`);
    if (!response.ok) throw new Error('API 오류');
    
    const data = await response.json();
    const currentPrice = data.price;
    const diffPrice = currentPrice - basePrice;
    const percent = ((diffPrice / basePrice) * 100).toFixed(2);

    currentPriceBox.innerText = currentPrice.toLocaleString();
    
    const sign = diffPrice > 0 ? '+' : '';
    diffResultBox.innerHTML = `${sign}${diffPrice.toLocaleString()}<br>(${sign}${percent}%)`;
    diffResultBox.className = `box diff-result ${diffPrice >= 0 ? 'profit' : 'loss'}`;

    saveData();

  } catch (error) {
    console.error(error);
    currentPriceBox.innerText = '오류';
  }
}

addBtn.addEventListener('click', () => addStockRow());
loadData();