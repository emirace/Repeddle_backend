/**
 * @swagger
 * tags:
 *   name: Message
 *   description: APIs to manage messages
 */

/**
 * @swagger
 * /messages/send:
 *   post:
 *     summary: Send a message
 *     description: Endpoint to send a message to a user
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: ID of the message receiver
 *               content:
 *                 type: string
 *                 description: Content of the message
 *               referencedUser:
 *                 type: string
 *                 description: ID of the referenced user (optional)
 *               referencedProduct:
 *                 type: string
 *                 description: ID of the referenced product (optional)
 *     responses:
 *       '201':
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *                   type: objectx
 *                   description: The saved message object
 *       '500':
 *         description: Failed to send message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /messages/{receiver}:
 *   get:
 *     summary: Retrieve messages between two users
 *     description: Retrieve messages exchanged between the authenticated user and another user.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiver
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the other user to retrieve messages with
 *     responses:
 *       '200':
 *         description: Successfully retrieved messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: boolean
 *                         description: Indicates the success of the operation
 *                       order:
 *                         $ref: '#/components/schemas/Order'
 *       '500':
 *         description: Failed to retrieve messages
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
 * /messages/forward:
 *   post:
 *     summary: Forward a message
 *     description: Forward a message to another user
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: ID of the message receiver
 *               messageId:
 *                 type: string
 *                 description: ID of the message to forward
 *               referencedUser:
 *                 type: string
 *                 description: ID of the referenced user (optional)
 *               referencedProduct:
 *                 type: string
 *                 description: ID of the referenced product (optional)
 *     responses:
 *       '201':
 *         description: Message forwarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 message:
 *                   type: object
 *                   description: The saved message object
 *       '404':
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Error forwarding message
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
 * /messages/reply:
 *   post:
 *     summary: Reply to a message
 *     description: Reply to a message with a new message
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: ID of the message receiver
 *               content:
 *                 type: string
 *                 description: Content of the reply message
 *               replyTo:
 *                 type: string
 *                 description: ID of the message being replied to
 *               referencedUser:
 *                 type: string
 *                 description: ID of the referenced user (optional)
 *               referencedProduct:
 *                 type: string
 *                 description: ID of the referenced product (optional)
 *     responses:
 *       '201':
 *         description: Message replied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 message:
 *                   type: object
 *                   description: The saved message object
 *       '404':
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Error replying to message
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
 * /messages/conversations:
 *   get:
 *     summary: Get list of conversations for a user
 *     description: Retrieve a list of conversations for the authenticated user, along with the last message and unread message count for each conversation.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         description: ID of the conversation partner
 *                       userName:
 *                         type: string
 *                         description: Name of the conversation partner
 *                       lastMessage:
 *                         type: object
 *                         description: Last message in the conversation
 *                         properties:
 *                           content:
 *                             type: string
 *                             description: Content of the last message
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp of the last message
 *                           sender:
 *                             type: string
 *                             description: ID of the sender of the last message
 *                           receiver:
 *                             type: string
 *                             description: ID of the receiver of the last message
 *                       unreadCount:
 *                         type: number
 *                         description: Number of unread messages in the conversation
 *       '500':
 *         description: Error fetching conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
