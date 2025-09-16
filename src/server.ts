
import express, { type Express, type Request, type Response } from "express";
import app from "./app";
import appRouter from "./routers/router.app";

const server: Express = express();

server.use('/', app);


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
