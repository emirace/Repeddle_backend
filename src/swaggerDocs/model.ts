import m2s from 'mongoose-to-swagger';
import User from '../model/user';
import Product from '../model/product';
import Category from '../model/category';
import Article from '../model/article';

const options = {};

const swaggerSchema = {
  User: m2s(User, options),
  Product: m2s(Product, options),
  Category: m2s(Category, options),
  Article: m2s(Article, options),
};

export default swaggerSchema;
