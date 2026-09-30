export default async function handler(req, res) {
  // CORS 허용 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const ticker = req.query.ticker;
  if (!ticker) {
    return res.status(400).json({ error: '종목 코드가 없습니다.' });
  }

  try {
    // 🚨 까다로운 패키지를 버리고, 차단이 없는 야후 오픈 API 차트 주소로 '직접' 연결합니다!
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}`;
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error('야후 서버 통신 실패');
    }
    
    const data = await response.json();
    
    // 복잡한 과정 없이 야후 데이터에서 현재 가격만 바로 쏙 빼옵니다.
    const currentPrice = data.chart.result[0].meta.regularMarketPrice;
    
    return res.status(200).json({
      ticker: ticker,
      name: ticker, // 차트 API는 이름을 주지 않으므로 코드를 그대로 띄웁니다.
      price: currentPrice
    });

  } catch (error) {
    console.error('야후 직접 연결 에러:', error);
    return res.status(500).json({ error: '데이터를 불러올 수 없습니다.' });
  }
}