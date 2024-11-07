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
 * /returns/purchase:
 *   get:
 *     summary: Get user purchase returns
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user purchase returns
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
 * /returns/sold:
 *   get:
 *     summary: Get user sold returns
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user sold returns
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
 * /returns/admin:
 *   get:
 *     summary: Retrieve a paginated list of returns with filtering and search
 *     description: Returns a list of user returns, supporting filtering by status and searching returns by MongoDB _id.
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, all]
 *         description: Filter by status to fetch either all returns or only active returns.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: The number of returns per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword to find specific returns by their _id.
 *     responses:
 *       200:
 *         description: A list of returns with pagination details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 returns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: object
 *                         properties:
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           name:
 *                             type: string
 *                             example: "Product Name"
 *                           seller:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: "seller123"
 *                       orderId:
 *                         type: object
 *                         properties:
 *                           buyer:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: "buyer123"
 *                       status:
 *                         type: string
 *                         example: "Delivered"
 *       500:
 *         description: Internal server error
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
 *               trackingNumber:
 *                 type: string
 *                 description: The new delivery tracking number
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

/**
 * @swagger
 * /returns/{id}/address:
 *   put:
 *     summary: Seller to add prefer deliveryr option
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
 *               deliveryOption:
 *                 $ref: '#/components/schemas/DeliveryOption'
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
