const stockList = document.getElementById('stock-list');
const addBtn = document.getElementById('add-btn');

// 1. 앱을 켜면 스마트폰에 저장된 메모를 자동으로 불러옵니다.
function loadData() {
  const savedData = JSON.parse(localStorage.getItem('stockMemo')) || [];
  if (savedData.length === 0) {
    addStockRow(); // 저장된 게 없으면 빈 칸 하나 만들기
  } else {
    // 저장된 데이터가 있으면 그만큼 칸을 만들고 자동으로 가격을 조회합니다.
    savedData.forEach(data => addStockRow(data.ticker, data.price));
  }
}

// 2. 현재 화면의 상태를 스마트폰에 자동 저장합니다.
function saveData() {
  const rows = document.querySelectorAll('.stock-row');
  const dataToSave = [];
  rows.forEach(row => {
    const ticker = row.querySelector('.ticker-input').value.replace(/[^0-9a-zA-Z.]/g, '');
    const basePrice = row.querySelector('.price-input').value;
    if (ticker && basePrice) {
      dataToSave.push({ ticker: ticker, price: basePrice });
    }
  });
  localStorage.setItem('stockMemo', JSON.stringify(dataToSave));
}

// 3. 메모장 한 줄을 만드는 기능 (삭제 버튼 추가됨)
function addStockRow(savedTicker = '', savedPrice = '') {
  const row = document.createElement('div');
  row.className = 'stock-row';

  row.innerHTML = `
    <div class="box">
      <span class="stock-name"></span>
      <input type="text" class="ticker-input" placeholder="코드(005930)" value="${savedTicker}">
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

  // 조회 버튼을 누르면 검색 및 자동 저장
  const refreshBtn = row.querySelector('.refresh-btn');
  refreshBtn.addEventListener('click', () => fetchStockData(row));

  // 삭제 버튼을 누르면 화면에서 지우고 저장
  const deleteBtn = row.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    row.remove();
    saveData();
  });

  stockList.appendChild(row);

  // 저장된 데이터를 불러온 경우 자동으로 '조회'까지 실행
  if (savedTicker && savedPrice) {
    fetchStockData(row);
  }
}

// 4. 야후 통신 및 수익률 계산
async function fetchStockData(row) {
  const tickerInput = row.querySelector('.ticker-input').value.replace(/[^0-9a-zA-Z.]/g, '');
  const basePrice = parseFloat(row.querySelector('.price-input').value);
  const currentPriceBox = row.querySelector('.current-price');
  const diffResultBox = row.querySelector('.diff-result');
  const nameLabel = row.querySelector('.stock-name');

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
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`서버응답 ${response.status} - ${errorData.error || '오류'}`);
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

    // ★ 조회가 성공하면 스마트폰에 무조건 자동 저장!
    saveData();

  } catch (error) {
    console.error(error);
    currentPriceBox.innerText = '오류';
  }
}

addBtn.addEventListener('click', () => addStockRow());

// 맨 처음 앱을 켤 때 저장된 데이터 불러오기 실행
loadData();