/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: APIs to manage Wallets
 */

/**
 * @swagger
 * /wallets/fund:
 *   post:
 *     summary: Fund wallet with Flutterwave
 *     description: Fund the user's wallet with a specified amount using Flutterwave payment gateway
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to be deposited into the wallet
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID received from the payment provider
 *               paymentProvider:
 *                 type: string
 *                 description: The payment provider used for the transaction (e.g., Flutterwave)
 *     responses:
 *       '200':
 *         description: Wallet funded successfully
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
 *                   description: Message indicating the success of wallet funding
 *       '400':
 *         description: Bad request due to validation errors or duplicate transaction
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
 *                   description: Error message indicating the reason for the failure
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
 * /wallets/balance:
 *   get:
 *     summary: Get user wallet balance
 *     description: Retrieve the balance of the user's wallet
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Wallet
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
 *                 balance:
 *                   type: number
 *                   description: Current balance in the user's wallet
 *                 currency:
 *                   type: string
 *                   description: Currency of the user's wallet balance
 *       '404':
 *         description: Wallet not found
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
 *                   description: Error message indicating the reason for the failure
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
