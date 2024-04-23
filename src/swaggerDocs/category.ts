/**
 * @swagger
 * tags:
 *   name: Category
 *   description: APIs to manage Categories
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the category.
 *         image:
 *           type: string
 *           description: The URL of the category image.
 *         isCategory:
 *           type: boolean
 *           description: Indicates whether the item is a category or not.
 *         path:
 *           type: string
 *           description: The path of the item.
 *         subCategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubCategoryInput'
 *       required:
 *         - name
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SubCategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the subcategory.
 *         isCategory:
 *           type: boolean
 *           description: Indicates whether the item is a category or not.
 *         path:
 *           type: string
 *           description: The path of the item.
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemInput'
 *       required:
 *         - name
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ItemInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the item.
 *         isCategory:
 *           type: boolean
 *           description: Indicates whether the item is a category or not.
 *         path:
 *           type: string
 *           description: The path of the item.
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
 *           description: Indicates whether the operation was successful.
 *         message:
 *           type: string
 *           description: A message describing the error.
 *         error:
 *           type: object
 *           description: Additional error details.
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category.
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       '201':
 *         description: Category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '400':
 *         description: Error creating category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories.
 *     tags: [Category]
 *     responses:
 *       '200':
 *         description: Categories fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       '500':
 *         description: Error fetching categories.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID.
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Category fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '404':
 *         description: Category not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error fetching category by id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category by ID.
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       '200':
 *         description: Category updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '404':
 *         description: Category not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error editing category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category by ID.
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Category deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '404':
 *         description: Category not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error deleting category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
