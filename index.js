import express from 'express';
import doSomeHeavyTask from './util.js';
import client from 'prom-client';
import responseTime from 'response-time';

const app = express();
const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const reqResponseTime = new client.Histogram({
  name: 'http_request_response_time_seconds',
  help: 'Histogram of HTTP request response time',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1,50,100,200,400,500,800,1000,2000,5000]
});

app.use(responseTime((req, res, time) => {
  reqResponseTime.labels({ method: req.method, route: req.url, status_code: res.statusCode }).observe(time);
}));

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is up and running!' });
});

app.get('/slow', async (req, res) => {
    try {
        const timeTaken = await doSomeHeavyTask();
        res.status(200).json({ success: true, message: `Task completed in ${timeTaken} ms` });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
})

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});