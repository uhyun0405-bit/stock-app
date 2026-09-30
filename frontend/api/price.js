import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
    const ticker = req.query.ticker;
    
    if (!ticker) {
        return res.status(400).json({ error: '종목 코드가 없습니다.' });
    }

    try {
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