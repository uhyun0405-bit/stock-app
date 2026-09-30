const yahooFinance = require('yahoo-finance2').default;

export default async function handler(req, res) {
    // 인터넷 주소에서 종목 코드(ticker)를 빼오는 부분
    const ticker = req.query.ticker;
    
    if (!ticker) {
        return res.status(400).json({ error: '종목 코드가 없습니다.' });
    }

    try {
        // 야후 파이낸스에서 주가 검색
        const result = await yahooFinance.quote(ticker.toUpperCase());
        res.status(200).json({
            ticker: ticker,
            name: result.shortName || ticker,
            price: result.regularMarketPrice,
            currency: result.currency
        });
    } catch (error) {
        console.error('야후 데이터 에러:', error);
        res.status(500).json({ error: '데이터를 불러올 수 없습니다.' });
    }
}