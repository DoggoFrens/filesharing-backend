import express, { Router } from "express";

export const downloadRouter: Router = express.Router();

downloadRouter.get("/:sessionId", (req, res) => {
  console.log(req.params);
  res.sendStatus(200);
});
