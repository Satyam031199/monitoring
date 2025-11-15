import express from "express";
import doSomeHeavyTask from "./util.js";
import client from "prom-client";
import responseTime from "response-time";
import { Logger } from "winston";
import LokiTransport from "winston-loki";

const options = {
  transports: [
    new LokiTransport({
      host: "http://15.206.163.194:3100",
    }),
  ],
};

const app = express();
const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const reqResponseTime = new client.Histogram({
  name: "http_request_response_time_seconds",
  help: "Histogram of HTTP request response time",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000, 5000],
});

const totalRequestCounter = new client.Counter({
  name: "total_requests",
  help: "Total number of requests received",
});

app.use(
  responseTime((req, res, time) => {
    totalRequestCounter.inc();
    reqResponseTime
      .labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode,
      })
      .observe(time);
  })
);

app.get("/", (req, res) => {
  Logger.info("Request received at / endpoint");
  res.status(200).json({ success: true, message: "Server is up and running!" });
});

app.get("/slow", async (req, res) => {
  Logger.info("Request received at /slow endpoint");
  try {
    const timeTaken = await doSomeHeavyTask();
    res
      .status(200)
      .json({ success: true, message: `Task completed in ${timeTaken} ms` });
  } catch (error) {
    Logger.error("Error occurred in /slow endpoint", { error: error.message });
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred",
        error: error.message,
      });
  }
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
