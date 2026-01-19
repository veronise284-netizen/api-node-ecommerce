import { Router, Request, Response } from "express";
import * as UsersController from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get("/", authenticate, requireAdmin, UsersController.getAllUsers);


router.get("/:id", authenticate, requireAdmin, UsersController.getUserById);


router.post("/", authenticate, requireAdmin, UsersController.createUser);


router.put("/:id", authenticate, requireAdmin, UsersController.updateUserById);

router.delete("/:id", authenticate, requireAdmin, UsersController.deleteUserById);

export default router;
