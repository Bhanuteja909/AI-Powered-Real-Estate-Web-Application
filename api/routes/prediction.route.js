import express from 'express';
import { predictPrice } from '../controllers/prediction.controller.js';

const router = express.Router();

router.post('/predict', predictPrice);

export default router;
