import m2s from "mongoose-to-swagger";
import User from "../model/user";
import Product from "../model/product";
import Category from "../model/category";
import Article from "../model/article";
import Order from "../model/order";
import Brand from "../model/brand";
import ContactUs from "../model/contactUs";
import Newsletter from "../model/newsletter";
import Transaction from "../model/transaction";
import Message from "../model/message";

const options = {};

const swaggerSchema = {
  User: m2s(User, options),
  Product: m2s(Product, options),
  Category: m2s(Category, options),
  Article: m2s(Article, options),
  Order: m2s(Order, options),
  Brand: m2s(Brand, options),
  ContactUs: m2s(ContactUs, options),
  Newsletter: m2s(Newsletter, options),
  Message: m2s(Message, options),
  Transaction: m2s(Transaction, options),
};

export default swaggerSchema;
