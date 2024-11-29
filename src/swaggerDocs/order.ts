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
 *     description: Retrieve the purchase orders associated with the authenticated user, with optional filtering by order ID and support for pagination.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Optional. Filter by order ID (case-insensitive).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders to return per page (default is 10).
 *     responses:
 *       '200':
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation.
 *                 orders:
 *                   type: array
 *                   description: List of purchase orders.
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata.
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of orders available.
 *       '401':
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation.
 *                 message:
 *                   type: string
 *                   description: Error message indicating internal server error.
 */

/**
 * @swagger
 * /orders/admin:
 *   get:
 *     summary: Retrieve all orders
 *     description: Fetches a paginated list of all orders in the system. You can filter by order ID and use pagination with `page` and `limit`.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Filter orders by order ID (case-insensitive).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders to return per page (default is 10).
 *     responses:
 *       200:
 *         description: A paginated list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation.
 *                 orders:
 *                   type: array
 *                   description: List of orders.
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata.
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of orders available.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /orders/sold:
 *   get:
 *     summary: Get seller's sold orders
 *     description: Retrieve a list of orders containing products sold by the authenticated seller, with optional filtering by order ID and pagination support.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Optional. Filter orders by ID (case-insensitive).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders to return per page (default is 10).
 *     responses:
 *       200:
 *         description: A list of sold orders belonging to the seller with pagination metadata.
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
 *                   description: List of sold orders.
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata.
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of orders available.
 *       401:
 *         $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success of the operation.
 *                 message:
 *                   type: string
 *                   description: Error message indicating internal server error.
 */

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get an order by ID
 *     description: Retrieve detailed information about a specific order by its ID.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Successful response with the retrieved order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the request
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized error
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
 *                   description: Error message indicating the user is not authorized to access the order
 *       404:
 *         description: Order not found
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
 *                   description: Error message indicating the order with the provided ID was not found
 *       500:
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
 *                   description: Error message indicating an internal server error occurred
 */

/**
 * @swagger
 * /orders/{orderId}/items/{itemId}/delivery-tracking:
 *   put:
 *     summary: Update delivery tracking of an item in an order
 *     description: Allows the seller to update the delivery tracking information of an item in an order.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: ID of the item in the order
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New delivery tracking status
 *               trackingNumber:
 *                 type: string
 *                 description: New delivery tracking number
 *     responses:
 *       '200':
 *         description: Delivery tracking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Bad request, order or item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '403':
 *         description: Unauthorized, only the seller can update delivery tracking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '404':
 *         description: Not found, order, item, or product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /toggle-hold/{orderId}/{itemId}:
 *   patch:
 *     summary: Toggle hold status for an item in an order
 *     description: Allows an admin to place an item in an order on hold or remove the hold status.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order containing the item.
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item within the order to be held or unheld.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [hold, unhold]
 *                 description: Action to perform - "hold" to place the item on hold, "unhold" to remove the hold.
 *             required:
 *               - action
 *     responses:
 *       200:
 *         description: Successfully toggled the hold status of the item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               hold:
 *                 value:
 *                   message: "Item successfully placed on hold"
 *               unhold:
 *                 value:
 *                   message: "Item successfully unheld"
 *       400:
 *         description: Invalid action specified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid action specified"
 *       404:
 *         description: Order or item not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found or Item not found in the order"
 *       500:
 *         description: Error updating hold status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating hold status"
 *                 error:
 *                   type: string
 *                   example: "Internal server error stack trace or description"
 */

/**
 * @swagger
 * /orders/summary:
 *   get:
 *     summary: Get daily orders summary for a user
 *     description: |
 *       Retrieves daily order summary for a user based on their activities such as purchases and sales within a specified time frame.
 *       If `startDate` and `endDate` are not provided, it queries for today's orders from the start of the day to the current time.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         description: Start date for the time frame (ISO format). Defaults to the start of the current day if not provided.
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         description: End date for the time frame (ISO format). Defaults to the current time if not provided.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with daily orders summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the success status of the request
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchaseOrders:
 *                       type: object
 *                       properties:
 *                         numOrders:
 *                           type: integer
 *                           description: Total number of purchase orders
 *                         numSales:
 *                           type: number
 *                           description: Total sales amount from purchase orders
 *                     soldOrders:
 *                       type: object
 *                       properties:
 *                         numOrders:
 *                           type: integer
 *                           description: Total number of sold orders
 *                         numSales:
 *                           type: number
 *                           description: Total sales amount from sold orders
 *                     dailyPurchasedOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             description: Date in "YYYY-MM-DD" format
 *                           orders:
 *                             type: integer
 *                             description: Number of purchase orders for the day
 *                           sales:
 *                             type: number
 *                             description: Total sales amount for the day
 *                     dailySoldOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             description: Date in "YYYY-MM-DD" format
 *                           orders:
 *                             type: integer
 *                             description: Number of sold orders for the day
 *                           sales:
 *                             type: number
 *                             description: Total sales amount for the day
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the failure status of the request
 *                 message:
 *                   type: string
 *                   description: Error message indicating the cause of the failure
 */
