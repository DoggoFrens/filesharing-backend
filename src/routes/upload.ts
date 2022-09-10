import express, { Router } from "express";
import crypto from "crypto";

export const uploadRouter: Router = express.Router();

uploadRouter.get("/", (req, res) => {
  res.send(crypto.randomUUID());
});