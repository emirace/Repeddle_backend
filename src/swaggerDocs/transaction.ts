/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: APIs to manage Transaction
 */

/**
 * @swagger
 * /transactions/user:
 *   get:
 *     summary: Get user transactions
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transactionId
 *         schema:
 *           type: string
 *         description: Optional. ID of the transaction.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Optional. Page number for pagination. Default is 1.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Optional. Number of transactions per page. Default is 10.
 *     responses:
 *       '200':
 *         description: A list of user transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalDocs:
 *                       type: integer
 *                       description: Total number of transactions
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     pageSize:
 *                       type: integer
 *                       description: Number of transactions on the current page
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transactionId
 *         schema:
 *           type: string
 *         description: Optional. ID of the transaction.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Optional. Page number for pagination. Default is 1.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Optional. Number of transactions per page. Default is 10.
 *     responses:
 *       '200':
 *         description: A list of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalDocs:
 *                       type: integer
 *                       description: Total number of transactions
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     pageSize:
 *                       type: integer
 *                       description: Number of transactions on the current page
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a transaction by its ID.
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the transaction to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation. Returns the requested transaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found.
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
 *                   description: Error message indicating that the transaction was not found.
 *       500:
 *         description: Internal server error.
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
 *                   description: Error message indicating internal server error.
 */
