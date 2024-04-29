import { Request, Response } from 'express';
import Category, { ICategory } from '../model/category';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category: ICategory = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json({ status: true, category: savedCategory });
  } catch (error) {
    res
      .status(400)
      .json({ status: false, message: 'Error creating category', error });
  }
};

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ status: true, categories });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error fetching categories', error });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: 'Category not found' });
    }
    res.status(200).json({ status: true, category });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching category by id',
      error,
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: 'Category not found' });
    }
    res.status(200).json({ status: true, category });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error editing category ', error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: 'Category not found' });
    }
    res
      .status(200)
      .json({ status: true, message: 'Category deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error deleting product', error });
  }
};
