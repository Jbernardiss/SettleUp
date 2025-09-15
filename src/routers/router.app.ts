
import express, { Express, Router } from "express";
import path from "path";

const appRouter = Router();

appRouter.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory