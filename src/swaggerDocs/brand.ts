/**
 * @swagger
 * tags:
 *   name: Brand
 *   description: APIs to manage Brand
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Get all published brands with pagination and search feature.
 *     description: Retrieve a paginated list of published brands with optional search filter.
 *     tags: [Brand]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default is 1)
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of items per page (default is 20)
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         description: Search term to filter brands by name (optional)
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A paginated list of published brands.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 data:
 *                   type: array
 *                   description: List of published brands.
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 *       '500':
 *         description: Internal server error.
 */

/**
 * @swagger
 * /brands/admin:
 *   get:
 *     summary: Get all brands for admin with pagination, filtering, and sorting.
 *     description: Retrieve a paginated list of all brands for admin with filtering by type and sorting by published status.
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         description: Type of brands to filter (optional)
 *         schema:
 *           type: string
 *           enum: [SYSTEM, USER]
 *       - in: query
 *         name: sort
 *         description: Sort brands by published status (published in ascending) (optional)
 *         schema:
 *           type: string
 *           enum: [published]
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default is 1)
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of items per page (default is 20)
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       '200':
 *         description: A paginated list of brands for admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 data:
 *                   type: array
 *                   description: List of brands for admin.
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 *       '400':
 *         description: Invalid type parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Add a new brand.
 *     description: Add a new brand with the specified name. If the user is an admin, the brand will be of type 'SYSTEM' and published by default; otherwise, it will be of type 'USER' and unpublished.
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the brand.
 *               published:
 *                 type: boolean
 *                 description: Whether the brand is published or not (optional, default is false).
 *     responses:
 *       '201':
 *         description: Brand created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
 *       '400':
 *         description: Bad request. Brand with the same name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the bad request.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Update an existing brand.
 *     description: Update the specified brand with the provided details. The 'name' property is required; 'published' is optional.
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the brand to update.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the brand.
 *               published:
 *                 type: boolean
 *                 description: Whether the brand is published or not (optional).
 *     responses:
 *       '200':
 *         description: Brand updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
 *       '404':
 *         description: Brand not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the brand was not found.
 *       '500':
 *         description: Internal server error.
 *
 *   delete:
 *     summary: Delete a brand.
 *     description: Delete the specified brand by its ID.
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the brand to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Brand deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 message:
 *                   type: string
 *                   description: Success message indicating that the brand was deleted successfully.
 *       '404':
 *         description: Brand not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the brand was not found.
 *       '500':
 *         description: Internal server error.
 */
