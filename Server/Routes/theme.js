import express from "express";
import { getThemeSuggestion } from "../Controllers/theme.js";

const router = express.Router();
router.get("/suggest", getThemeSuggestion);
export default router;
