/**
 * @swagger
 * tags:
 *   name: Return
 *   description: APIs to manage Returns
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeliveryOption:
 *       type: object
 *       required:
 *         - method
 *         - fee
 *       properties:
 *         method:
 *           type: string
 *           description: The delivery method
 *         fee:
 *           type: number
 *           description: The delivery fee
 *       example:
 *         method: "Standard"
 *         fee: 10
 *     ReturnRequest:
 *       type: object
 *       required:
 *         - orderId
 *         - productId
 *         - refund
 *         - reason
 *         - deliveryOption
 *       properties:
 *         orderId:
 *           type: string
 *           description: The ID of the order
 *         productId:
 *           type: string
 *           description: The ID of the product
 *         reason:
 *           type: string
 *           description: The reason for the return
 *         refund:
 *           type: string
 *           description: The refund details
 *         image:
 *           type: string
 *           description: The image of the product
 *         others:
 *           type: string
 *           description: Other details
 *         deliveryOption:
 *           $ref: '#/components/schemas/DeliveryOption'
 */

/**
 * @swagger
 * /returns/user:
 *   get:
 *     summary: Get user returns
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user returns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 return:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Return'
 *       404:
 *         description: User has no returns
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /returns/{id}:
 *   get:
 *     summary: Get a return by ID
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The return ID
 *     responses:
 *       200:
 *         description: The return details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 return:
 *                   $ref: '#/components/schemas/Return'
 *       404:
 *         description: Return not found
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /returns:
 *   post:
 *     summary: Create a return
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReturnRequest'
 *     responses:
 *       201:
 *         description: The return was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 return:
 *                   $ref: '#/components/schemas/Return'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /returns/{id}/status:
 *   put:
 *     summary: Update return status by admin
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The return ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["Approved", "Decline", "Pending"]
 *                 description: The status of the return
 *               adminReason:
 *                 type: string
 *                 description: Reason for declining the return
 *     responses:
 *       200:
 *         description: The return status was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 return:
 *                   $ref: '#/components/schemas/Return'
 *       404:
 *         description: Return not found
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /returns/{id}/delivery-tracking:
 *   put:
 *     summary: Update delivery tracking of a return
 *     tags: [Return]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The return ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new delivery tracking status
 *     responses:
 *       200:
 *         description: The delivery tracking status was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 return:
 *                   $ref: '#/components/schemas/Return'
 *       404:
 *         description: Return not found
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
