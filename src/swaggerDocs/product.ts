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
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 totalCount:
 *                   type: integer
 *                   description: Total number of products matching the query.
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number.
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages based on the page limit.
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Error response if there was a server error while fetching products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
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
 *                 success:
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
 *                 success:
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
 *                 success:
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
 *                 success:
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
 *                 success:
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
 *                 success:
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
 *                 success:
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
 *                 success:
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
 *                 success:
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
