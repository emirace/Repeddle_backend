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
 *     summary: Get transactions for a specific user
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of transactions for the specified user
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
 *       '500':
 *         description: Internal server error
 */
