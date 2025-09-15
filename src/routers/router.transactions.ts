
import express, { Express, Router } from "express";

const transactionsRouter = Router();

transactionsRouter.post('/transfer', () => console.log('transferFunds')); // Transfer funds between users



