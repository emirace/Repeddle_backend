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
 *     description: Creates and sends a message between users.
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
 *               content:
 *                 type: string
 *                 description: The content of the message.
 *               conversationId:
 *                 type: string
 *                 description: The ID of the conversation. If not provided, a new conversation will be created.
 *               referencedUser:
 *                 type: string
 *                 description: The ID of the referenced user, if any.
 *               referencedProduct:
 *                 type: string
 *                 description: The ID of the referenced product, if any.
 *               participantId:
 *                 type: string
 *                 description: The ID of the participant in case of creating a new conversation.
 *               type:
 *                 type: string
 *                 enum: [Chat, Support, Report]
 *                 description: The type of conversation. Required if creating a new conversation.
 *     responses:
 *       '201':
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the message was sent successfully.
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       '400':
 *         description: Bad request. The request body is missing required fields or contains invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the message sending failed.
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *       '500':
 *         description: Internal server error. Something went wrong on the server side.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the message sending failed.
 *                 message:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */

/**
 * @swagger
 * /messages/{conversationId}:
 *   get:
 *     summary: Retrieve messages between two users
 *     description: Retrieve messages exchanged between the authenticated user and another user.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
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
 * /messages/conversations/{type}:
 *   get:
 *     summary: Retrieve user conversations with additional details.
 *     description: Fetches conversations where the user is a participant along with the last message, unread message count, and details of the other participant.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: The type of conversation (e.g., "Chat", "Support", "Report").
 *     responses:
 *       '200':
 *         description: Successful response. Returns an array of conversations with additional details.
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
 *                       _id:
 *                         type: string
 *                         description: Conversation ID.
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of participant IDs.
 *                       type:
 *                         type: string
 *                         description: Conversation type.
 *                       lastMessage:
 *                         type: object
 *                         description: Last message of the conversation.
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Message ID.
 *                           sender:
 *                             type: string
 *                             description: Sender ID of the last message.
 *                           content:
 *                             type: string
 *                             description: Content of the last message.
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp of the last message creation.
 *                       unreadCount:
 *                         type: number
 *                         description: Number of unread messages in the conversation.
 *                       otherParticipantUsername:
 *                         type: string
 *                         description: Username of the other participant in the conversation.
 *                       otherParticipantImage:
 *                         type: string
 *                         description: Image URL of the other participant in the conversation.
 *       '500':
 *         description: Internal server error. Indicates an error occurred while fetching conversations.
 */
