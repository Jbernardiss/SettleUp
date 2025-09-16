
import express, { type Express, type Request, type Response } from "express";
import app from "./app";
import appRouter from "./routers/router.app";

const server: Express = express();

// Parse JSON and URL-encoded bodies
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Support both / and /api prefixes for API routes used by frontend
server.use('/api', app);
server.use('/', app);


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
