import express from "express";
import { getStations } from "../controller/gig";
const router = express.Router();

router.get("/stations", getStations);

export default router;
