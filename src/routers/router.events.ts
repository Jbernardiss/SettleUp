
import express, { Express, Router } from "express";
import { finish } from "../service/service.event";

const eventsRouter = Router();

eventsRouter.post("/create", () => console.log('createGroup')); // Create group
eventsRouter.post("/:eventId/users/add", () => console.log('addUserToGroup')); // Add user to group
eventsRouter.post("/:eventId/expenses/add", () => console.log('addExpenseToGroup')); // Add expense to group
eventsRouter.get('/:eventId/finish', (req, res) => finish(req, res)); // Get group summary

export default eventsRouter;
