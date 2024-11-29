/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: APIs to manage payments
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Retrieve all payments
 *     description: Fetches a paginated list of all payments.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of records per page (default is 10).
 *     responses:
 *       200:
 *         description: A paginated list of payments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the request.
 *                 payments:
 *                   type: array
 *                   description: List of payments.
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
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
 *                       description: Total number of payments available.
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
 * /payments/{id}:
 *   get:
 *     summary: Retrieve a specific payment by ID
 *     description: Fetches a payment's details by its ID.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to retrieve.
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The payment ID.
 *                 userId:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The user ID.
 *                     username:
 *                       type: string
 *                       description: The username of the user.
 *                     image:
 *                       type: string
 *                       description: URL to the user's image.
 *                 amount:
 *                   type: number
 *                   description: Payment amount.
 *                 status:
 *                   type: string
 *                   description: Payment status.
 *                 reason:
 *                   type: string
 *                   description: Reason for the payment.
 *                 to:
 *                   type: string
 *                   enum: [Wallet, Account]
 *                   description: Payment destination.
 *                 orderId:
 *                   type: string
 *                   description: The associated order ID.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /payments/pay-seller/{orderId}/{itemId}:
 *   post:
 *     summary: Pay the seller for a completed order item
 *     description: Verifies the completion of an order item and processes a payment to the seller after deducting a commission.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
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
 *         description: The ID of the specific item in the order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user requesting the payment (must match the seller's ID).
 *     responses:
 *       201:
 *         description: Payment created successfully for the seller.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     to:
 *                       type: string
 *                       enum: [Wallet, Account]
 *                     orderId:
 *                       type: string
 *       400:
 *         description: Item is not completed.
 *       403:
 *         description: Unauthorized seller.
 *       404:
 *         description: Order or order item not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /payments/refund-buyer/{orderId}/{itemId}:
 *   post:
 *     summary: Refund the buyer for a failed order item
 *     description: Verifies the status of an order item and processes a refund to the buyer if the item has been returned.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order containing the item to be refunded.
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the specific item in the order to be refunded.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user requesting the refund (must match the buyer's ID).
 *     responses:
 *       201:
 *         description: Refund processed successfully for the buyer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 refund:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     to:
 *                       type: string
 *                       enum: [Wallet, Account]
 *                     orderId:
 *                       type: string
 *       400:
 *         description: Item has not returned.
 *       403:
 *         description: Unauthorized user.
 *       404:
 *         description: Order or order item not found.
 *       500:
 *         description: Server error while processing the refund.
 */

/**
 * @swagger
 * /products/approve/{paymentId}:
 *   post:
 *     summary: Approve a payment
 *     description: Approves a payment and credits the user's wallet if the payment is designated for wallet credit.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to be approved.
 *     responses:
 *       200:
 *         description: Payment approved successfully and wallet credited (if applicable).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     to:
 *                       type: string
 *                       enum: [Wallet, Account]
 *                     orderId:
 *                       type: string
 *       404:
 *         description: Payment or wallet not found.
 *       500:
 *         description: Server error while processing the approval of the payment.
 */

/**
 * @swagger
 * /products/decline/{paymentId}:
 *   post:
 *     summary: Decline a payment
 *     description: Declines a payment and updates its status to "Declined".
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to be declined.
 *     responses:
 *       200:
 *         description: Payment declined successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [Pending, Approved, Declined]
 *                     reason:
 *                       type: string
 *                     to:
 *                       type: string
 *                       enum: [Wallet, Account]
 *                     orderId:
 *                       type: string
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Server error while processing the decline of the payment.
 */
