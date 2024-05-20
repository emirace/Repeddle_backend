/**
 * @swagger
 * tags:
 *   name: Image
 *   description: APIs to manage Image
 */

/**
 * @swagger
 * /images:
 *   post:
 *     summary: Upload an image
 *     description: Uploads an image to S3 and returns the image URL. Optionally deletes a previous image if `deleteImage` is provided.
 *     tags: [Image]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: The image file to upload.
 *       - in: formData
 *         name: deleteImage
 *         type: string
 *         required: false
 *         description: The URL of the image to delete.
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 imageUrl:
 *                   type: string
 *                   example: "/api/images/image1234567890.jpg"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /images/{key}:
 *   get:
 *     summary: Download an image
 *     description: Retrieves an image from S3 using its key.
 *     tags: [Image]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The key of the image to download.
 *     responses:
 *       200:
 *         description: Image retrieved successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /images/{image}:
 *   delete:
 *     summary: Delete an image
 *     description: Deletes an image from S3 using its URL.
 *     tags: [Image]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: image
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL of the image to delete.
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *       404:
 *         description: Image URL is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image URL is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
