
import express, { Express, Router } from "express";

const groupRouter = Router();

groupRouter.post("/", () => console.log('createGroup')); // Create group
groupRouter.post("/:groupId/users/add", () => console.log('addUserToGroup')); // Add user to group
groupRouter.post("/:groupId/expenses/add", () => console.log('addExpenseToGroup')); // Add expense to group

export default groupRouter;
