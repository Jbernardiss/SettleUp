
import express, { type Express, type Request, type Response } from "express";
import app from "./app";
import appRouter from "./routers/router.app";

const server: Express = express();

// Parse JSON and URL-encoded bodies
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Lightweight CORS without dependency
server.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Support both / and /api prefixes for API routes used by frontend
server.use('/api', app);
server.use('/', app);

export default server;
