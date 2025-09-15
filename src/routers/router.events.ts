
import express, { Express, Router } from "express";


const eventsRouter = Router();

eventsRouter.post("/create", () => console.log('createGroup')); // Create group
eventsRouter.post("/:groupId/users/add", () => console.log('addUserToGroup')); // Add user to group
eventsRouter.post("/:groupId/expenses/add", () => console.log('addExpenseToGroup')); // Add expense to group

export default eventsRouter;
