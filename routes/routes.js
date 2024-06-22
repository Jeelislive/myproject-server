import express from "express"
import { Router } from "express"

import { login, register, dashboard, logout } from '../controllers/controller.js';
import  authenticationMiddleware  from '../middlewares/middleware.js' 

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/dashboard").get(authenticationMiddleware, dashboard);


export default router;