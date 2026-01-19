import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', CategoryController.getAllCategories);

 
router.get('/:id', CategoryController.getCategoryById);


router.post('/', authenticate, requireAdmin, CategoryController.createCategory);


 
router.put('/:id', authenticate, requireAdmin, CategoryController.updateCategory);


router.delete('/:id', authenticate, requireAdmin, CategoryController.deleteCategory);

export default router;
