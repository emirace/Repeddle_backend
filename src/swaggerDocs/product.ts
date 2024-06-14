/**
 * @swagger
 * tags:
 *   name: Product
 *   description: APIs to manage Products
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ISize:
 *       type: object
 *       properties:
 *         size:
 *           type: string
 *           description: The size of the product.
 *         quantity:
 *           type: number
 *           description: The quantity available for the given size.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The updated name of the product.
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: The updated images of the product.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: The updated tags of the product.
 *         video:
 *           type: string
 *           description: The updated video of the product.
 *         brand:
 *           type: string
 *           description: The updated brand of the product.
 *         color:
 *           type: string
 *           description: The updated color of the product.
 *         mainCategory:
 *           type: string
 *           description: The updated main category of the product.
 *         category:
 *           type: string
 *           description: The updated category of the product.
 *         subCategory:
 *           type: string
 *           description: The updated subcategory of the product.
 *         material:
 *           type: string
 *           description: The updated material of the product.
 *         description:
 *           type: string
 *           description: The updated description of the product.
 *         sizes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ISize'
 *           description: The updated sizes of the product.
 *         condition:
 *           type: string
 *           description: The updated condition of the product.
 *         keyFeatures:
 *           type: string
 *           description: The updated key features of the product.
 *         specification:
 *           type: string
 *           description: The updated specification of the product.
 *         overview:
 *           type: string
 *           description: The updated overview of the product.
 *         sellingPrice:
 *           type: number
 *           description: The updated selling price of the product.
 *         costPrice:
 *           type: number
 *           description: The updated cost price of the product.
 *         meta:
 *           type: object
 *           description: The updated metadata of the product.
 *         vintage:
 *           type: boolean
 *           description: The updated vintage status of the product.
 *         luxury:
 *           type: boolean
 *           description: The updated luxury status of the product.
 *         luxuryImage:
 *           type: string
 *           description: The updated luxury image of the product.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         comment:
 *           type: string
 *         userId:
 *           type: string
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reply'
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Reply:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         comment:
 *           type: string
 *         userId:
 *           type: string
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get products available in the user's region with pagination, search, filter, and sorting options.
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of products per page (default is 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter products by name, tags, mainCategory, category, or description
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter products by specific fields (e.g., mainCategory:Electronics,category:Smartphones)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort products by specific field and order (e.g., name:asc)
 *     responses:
 *       '200':
 *         description: A list of products available in the user's region with pagination information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 data:
 *                   type: object
 *                   description: Product data.
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       description: Total number of products matching the query.
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages based on the page limit.
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Error response if there was a server error while fetching products.
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
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: object
 *                   description: Additional information about the error (optional).
 */

/**
 * @swagger
 * /products/user:
 *   get:
 *     summary: Get all products of the logged-in user
 *     description: Retrieve all products listed by the logged-in user, filtered by region and optional search query.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of products per page (default is 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword to filter products by name or tags (optional)
 *     responses:
 *       '200':
 *         description: Success, returns a list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the request
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       description: Total count of products matching the query
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the request
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Get a product by its slug.
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique slug of the product to retrieve.
 *     responses:
 *       '200':
 *         description: Product details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       '404':
 *         description: Error response if the product with the specified slug is not found.
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
 *                   description: Error message indicating that the product was not found.
 *       '403':
 *         description: Error response if the product is not available in the user's region.
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
 *                   description: Error message indicating that the product is not available in the user's region.
 *       '500':
 *         description: Error response if there was a server error while fetching the product.
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
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: object
 *                   description: Additional information about the error (optional).
 */

/**
 * @swagger
 * /products/product/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a product by its ID. Only accessible by the seller of the product or an admin.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       403:
 *         description: Forbidden. You are not authorized to access this resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to access this resource."
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Product not found."
 *       500:
 *         description: Error fetching product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error fetching product."
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       '201':
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Error response if there was a server error while creating the product.
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
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: object
 *                   description: Additional information about the error (optional).
 */

/**
 * @swagger
 * /products/{productId}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product. Only the seller of the product or an admin can update it.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       '201':
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Error response if there was a server error while creating the product.
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
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: object
 *                   description: Additional information about the error (optional).
 */

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete an existing product. Only the seller of the product or an admin can delete it.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 message:
 *                   type: string
 *                   description: A message indicating the deletion was successful
 *       403:
 *         description: Unauthorized - User is not the seller of the product or not an admin
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /products/summary:
 *   get:
 *     summary: Get summary of products sold by the user within a specified time frame.
 *     description: |
 *       Returns the daily summary of products sold by the user, including the total number of products sold.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         description: Start date for the summary (optional, default is start of the current day).
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         description: End date for the summary (optional, default is current date and time).
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       '200':
 *         description: OK. Returns the summary of products sold by the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     dailyProducts:
 *                       type: array
 *                       description: List of daily product sales summary.
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             format: date
 *                             description: Date of the summary.
 *                           products:
 *                             type: integer
 *                             description: Number of products sold on that date.
 *                     totalProduct:
 *                       type: integer
 *                       description: Total number of products sold within the specified time frame.
 *       '400':
 *         description: Bad Request. Indicates that the provided start or end date is invalid.
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
 *         description: Internal Server Error. Indicates that an unexpected error occurred while processing the request.
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
 *                   description: Error message indicating the reason for the internal server error.
 */

/**
 * @swagger
 * /products/{productId}/comments:
 *   post:
 *     summary: Add a comment to a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The content of the comment
 *     responses:
 *       '201':
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment is required
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
