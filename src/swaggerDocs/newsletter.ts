/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: APIs to manage Newsletter
 */

/**
 * @swagger
 * /newsletters:
 *   get:
 *     summary: Get all newsletters with search feature
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email
 *     responses:
 *       '200':
 *         description: A list of newsletters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 newsletters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Newsletter'
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /newsletters:
 *   post:
 *     summary: Create a new newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 newsletter:
 *                   $ref: '#/components/schemas/Newsletter'
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /newsletters/{id}:
 *   delete:
 *     summary: Delete a newsletter by ID
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Newsletter deleted successfully
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
 *         description: Newsletter not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /newsletters/unsubscribe:
 *   delete:
 *     summary: Delete user newsletter
 *     description: Deletes all newsletters for the authenticated user, keeping only one marked as deleted.
 *     tags:
 *       - Newsletters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Newsletter deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Newsletter deleted successfully
 *       404:
 *         description: User or newsletter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
