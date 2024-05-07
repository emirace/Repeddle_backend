/**
 * @swagger
 * tags:
 *   name: Order
 *   description: APIs to manage Orders
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: The HTTP status code indicating the error (401).
 *           example: 401
 *         message:
 *           type: string
 *           description: A brief description of the error.
 *           example: Unauthorized access. Please login to proceed.
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order based on the provided details
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID of the product to be ordered
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product to be ordered
 *                     selectedSize:
 *                       type: string
 *                       description: Selected size of the product (optional)
 *                     selectedColor:
 *                       type: string
 *                       description: Selected color of the product (optional)
 *                     deliveryOption:
 *                       type: string
 *                       description: Delivery option for the product
 *               totalAmount:
 *                 type: number
 *                 description: Total amount of the order
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method for the order
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID (optional, required for certain payment methods)
 *     responses:
 *       '201':
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation
 *                 message:
 *                   type: string
 *                   description: Message indicating the success of order creation
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Bad request due to validation errors or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Error message
 *                       param:
 *                         type: string
 *                         description: Parameter causing the error
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation
 *                 message:
 *                   type: string
 *                   description: Error message indicating internal server error
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's purchase orders
 *     description: Retrieve the purchase orders associated with the authenticated user
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation
 *                 orders:
 *                   type: array
 *                   description: List of purchase orders
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       '401':
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation
 *                 message:
 *                   type: string
 *                   description: Error message indicating internal server error
 */

/**
 * @swagger
 * /orders/sold:
 *   get:
 *     summary: Get seller's sold orders
 *     description: Retrieve a list of orders containing products sold by the seller.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of sold orders belonging to the seller.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the request.
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal server error.
 */
