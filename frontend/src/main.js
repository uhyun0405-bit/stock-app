const stockList = document.getElementById('stock-list');
const addBtn = document.getElementById('add-btn');

// 새로운 행(박스들)을 화면에 그리는 함수
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

  // 조회 버튼을 누르면 데이터를 가져오는 기능 연결
  const refreshBtn = row.querySelector('.refresh-btn');
  refreshBtn.addEventListener('click', () => fetchStockData(row));

  stockList.appendChild(row);
}

// 실시간 데이터를 백엔드에서 가져오고 퍼센트를 계산하는 함수
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

  // 숫자 6자리(국내주식)만 입력하면 자동으로 '.KS'를 붙여줌
  let fetchTicker = tickerInput;
  if (/^\d{6}$/.test(tickerInput)) {
    fetchTicker = `${tickerInput}.KS`;
  }

  currentPriceBox.innerText = '검색중...';

  try {
    const response = await fetch(`http://localhost:3000/api/price/${fetchTicker}`);
    if (!response.ok) throw new Error('API 오류');
    const data = await response.json();

    const currentPrice = data.price;
    const diffPrice = currentPrice - basePrice;
    
    // 수익률(퍼센트) 계산 공식
    const percent = ((diffPrice / basePrice) * 100).toFixed(2);

    // 화면에 결과 보여주기
    nameLabel.innerText = data.name || tickerInput; // 회사 이름 표시
    currentPriceBox.innerText = currentPrice.toLocaleString();
    
    // 비고란에 기호(+/-)와 퍼센트 표시
    const sign = diffPrice > 0 ? '+' : '';
    diffResultBox.innerHTML = `${sign}${diffPrice.toLocaleString()}<br>(${sign}${percent}%)`;
    
    // 플러스면 빨간색, 마이너스면 파란색
    diffResultBox.className = `box diff-result ${diffPrice >= 0 ? 'profit' : 'loss'}`;

  } catch (error) {
    currentPriceBox.innerText = '오류';
    alert('데이터를 불러오지 못했습니다. 종목 코드를 다시 확인해주세요.');
  }
}

// 처음 화면을 켰을 때 기본으로 1줄(삼성전자용) 만들어두기
addStockRow();

// '+ 종목 추가하기' 버튼을 누르면 새로운 줄 추가
addBtn.addEventListener('click', addStockRow);