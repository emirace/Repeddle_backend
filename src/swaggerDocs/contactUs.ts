/**
 * @swagger
 * tags:
 *   name: Contact Us
 *   description: APIs to manage Contact Us
 */

/**
 * @swagger
 * /contactus:
 *   get:
 *     summary: Get all contact us requests
 *     tags: [Contact Us]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns all contact us requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 contactUsRequests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContactUs'
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /contactus:
 *   post:
 *     summary: Add a new contact us request
 *     tags: [Contact Us]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               category:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '201':
 *         description: Contact us request added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 contactUs:
 *                   $ref: '#/components/schemas/ContactUs'
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /contacts/assign/{contactId}:
 *   put:
 *     summary: Assign a contact to a user
 *     tags: [Contact Us]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the contact to be assigned
 *     responses:
 *       '200':
 *         description: Contact assigned to user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '404':
 *         description: Contact us request not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /contactus/{id}:
 *   delete:
 *     summary: Delete a contact us request
 *     tags: [Contact Us]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the contact to be deleted
 *     responses:
 *       '200':
 *         description: Contact us request deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '404':
 *         description: Contact us request not found
 *       '500':
 *         description: Internal server error
 */
