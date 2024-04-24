/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: APIs to manage Articles
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleInput:
 *       type: object
 *       properties:
 *         topic:
 *           type: string
 *           description: The topic of the article.
 *         category:
 *           type: string
 *           description: The category of the article.
 *         content:
 *           type: string
 *           description: The content of the article.
 *       required:
 *         - topic
 *         - category
 *         - content
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               param:
 *                 type: string
 *               location:
 *                 type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *      ErrorResponse2:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates whether the operation was successful.
 *         message:
 *           type: string
 *           description: A message describing the error.
 *         error:
 *           type: object
 *           description: Additional error details.
 *
 */

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article.
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleInput'
 *     responses:
 *       '201':
 *         description: Successfully created the article.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       '400':
 *         description: Invalid request body or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse2'
 */

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all articles or filter articles by search query.
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional. Search query to filter articles by topic, category, or content.
 *     responses:
 *       '200':
 *         description: Successfully retrieved articles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse2'
 *
 */

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Get an article by ID.
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the article to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the article.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       '404':
 *         description: Article not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse2'
 */

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Update an article by ID.
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the article to update.
 *     requestBody:
 *       description: Article data to update.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               category:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully updated the article.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       '404':
 *         description: Article not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article by ID.
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the article to delete.
 *     responses:
 *       '200':
 *         description: Successfully deleted the article.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '404':
 *         description: Article not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse2'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse2'
 */

/**
 * @swagger
 * /articles/categories:
 *   get:
 *     summary: Get all distinct categories from articles.
 *     tags: [Articles]
 *     responses:
 *       '200':
 *         description: Successfully retrieved distinct categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse2'
 */

/**
 * @swagger
 * /articles/{category}:
 *   get:
 *     summary: Get all articles with the same category.
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Category to filter articles by.
 *     responses:
 *       '200':
 *         description: Successfully retrieved articles with the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse2'
 */
