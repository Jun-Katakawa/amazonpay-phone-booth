import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { handler } from "./index";
import type { LambdaEvent } from 'shared-types/@types/lambda';

const app = express();
const port = 3900;

// CORS設定の詳細化
const corsOptions = {
    origin: ['http://localhost:3851', 'file://*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    // credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// プリフライトリクエストのハンドリング
app.options('*', cors(corsOptions));

// リクエストのログ出力ミドルウェア
app.use((_req: any, _res: any, next: any) => {
    // console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    // console.log('Headers:', req.headers);
    // console.log('Body:', req.body);
    next();
});

const execute_main = async (req: any, res: any) => {
    try {
        console.log('Received request:', {
            method: req.method,
            path: req.url,
            body: req.body,
            headers: req.headers
        });

        const request_parameters = {
            body: JSON.stringify(req.body),
            headers: req.headers,
            requestContext: {
                http: {
                    method: req.method,
                    path: req.url,
                    protocol: 'HTTP/1.1',
                    sourceIp: req.ip,
                    userAgent: req.headers['user-agent']
                }
            },
            queryStringParameters: req.query
        };
        
        const result = await handler(request_parameters as LambdaEvent);
        
        console.log('Sending response:', result);
        const responseBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
        res.json(responseBody);
    } catch (error: any) {
        console.error('Error in execute_main:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// エンドポイントの設定
app.post('/api/ipc', execute_main);  // 特定のエンドポイントを追加
app.post('/:method/:id', execute_main);
app.patch('/:method/:id', execute_main);
app.put('/:method/:id', execute_main);
app.delete('/:method/:id', execute_main);
app.get('/:method/:id', execute_main);

// エラーハンドリングミドルウェア
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// サーバーを起動
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Environment:', process.env.NODE_ENV);
});