import { Request, Response } from 'express';
import Article from '../model/article';
import { body, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

export const createArticle = async (req: Request, res: Response) => {
  try {
    await Promise.all([
      body('topic').notEmpty().withMessage('Topic is required'),
      body('category').notEmpty().withMessage('Category is required'),
      body('content').notEmpty().withMessage('Content is required'),
    ]);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    // Extract data from the request body
    const { topic, category, content } = req.body;

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Allow <img> tags
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src'], // Allow only 'src' attribute for <img> tags
      },
    });

    // Create a new article instance
    const article = new Article({
      topic,
      category,
      content: sanitizedContent, // Save the sanitized content
    });

    // Save the article to the database
    const savedArticle = await article.save();

    // Respond with status message
    res.status(201).json({ status: true, article: savedArticle });
  } catch (error) {
    // Handle errors
    console.error('Error creating article:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error creating article', error });
  }
};

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    // Extract search query parameters from the request query
    const { search } = req.query;

    // Construct a filter object based on the search query
    const filter: any = {};
    if (search) {
      // Use a regular expression to perform case-insensitive search
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { topic: searchRegex },
        { category: searchRegex },
        { content: searchRegex },
      ];
    }

    // Find articles that match the filter
    const articles = await Article.find(filter);

    // Respond with the filtered articles
    res.status(200).json({ status: true, articles });
  } catch (error) {
    // Handle errors
    console.error('Error fetching articles:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error fetching articles', error });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ status: false, message: 'Article not found' });
    }
    res.status(200).json({ status: true, article });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error fetching article by id', error });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    await Promise.all([
      body('topic').notEmpty().withMessage('Topic is required'),
      body('category').notEmpty().withMessage('Category is required'),
      body('content').notEmpty().withMessage('Content is required'),
    ]);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    // Extract article ID from the request parameters
    const articleId = req.params.id;

    // Find the article by ID
    let article = await Article.findById(articleId);

    // If the article does not exist, return a 404 error
    if (!article) {
      return res
        .status(404)
        .json({ status: false, message: 'Article not found' });
    }

    // Extract data from the request body
    const { topic, category, content } = req.body;

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Allow <img> tags
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src'], // Allow only 'src' attribute for <img> tags
      },
    });

    // Update the article with the sanitized content
    article.topic = topic;
    article.category = category;
    article.content = sanitizedContent;

    // Save the updated article to the database
    const updatedArticle = await article.save();

    // Respond with status message
    res.status(200).json({ status: true, article: updatedArticle });
  } catch (error) {
    // Handle errors
    console.error('Error updating article:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error updating article', error });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ status: false, message: 'Article not found' });
    }
    res
      .status(200)
      .json({ status: true, message: 'Article deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: 'Error deleting article', error });
  }
};

export const getAllDistinctCategories = async (
  _req: Request,
  res: Response
) => {
  try {
    // Use Mongoose to retrieve distinct categories
    const distinctCategories = await Article.distinct('category');

    // Respond with the distinct categories
    res.status(200).json({ status: true, categories: distinctCategories });
  } catch (error) {
    // Handle errors
    console.error('Error fetching distinct categories:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error fetching categories', error });
  }
};

export const getArticlesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    // Use Mongoose to query articles with the same category
    const articles = await Article.find({ category });

    // Respond with the articles
    res.status(200).json({ status: true, articles });
  } catch (error) {
    // Handle errors
    console.error('Error fetching articles by category:', error);
    res
      .status(500)
      .json({ status: false, message: 'Error fetching articles', error });
  }
};
