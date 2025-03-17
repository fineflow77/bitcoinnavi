import express, { Express, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

app.use(cors({ origin: ['http://localhost:5173', 'https://btcplan.jp'] }));
app.use(express.json());

app.use(express.static('dist'));

const serveIndex: RequestHandler = (req: Request, res: Response) => {
    res.sendFile('index.html', { root: 'dist' });
};
app.get('*', serveIndex);

app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error('未処理エラー:', err.stack);
    res.status(500).json({ error: 'サーバーエラーが発生しました', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
});