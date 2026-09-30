import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  // CORS 허용 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const ticker = req.query.ticker;
  if (!ticker) {
    return res.status(400).json({ error: '종목 코드가 없습니다.' });
  }

  try {
    const result = await yahooFinance.quote(ticker.toUpperCase());
    return res.status(200).json({
      ticker: ticker,
      name: result.shortName || ticker,
      price: result.regularMarketPrice,
      currency: result.currency
    });
  } catch (error) {
    console.error('야후 에러:', error);
    return res.status(500).json({ error: '데이터를 불러올 수 없습니다.' });
  }
}