/**
 * @swagger
 * tags:
 *   name: User
 *   description: APIs to manage users
 */

/**
 * @swagger
 * /users/send-verification-email:
 *   post:
 *     summary: Send verification email
 *     description: Send a verification email to the provided email address
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address to send the verification email to
 *                 example: user@example.com
 *     responses:
 *       '200':
 *         description: Successfully sent verification email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Verification email sent successfully"
 *       '400':
 *         description: Bad request. Email address is missing in request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Email address is required"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error sending verification email"
 */

/**
 * @swagger
 * /users/verify-email/{token}:
 *   get:
 *     summary: Verify email with token
 *     description: Verify the user's email address using the provided token
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The verification token received via email
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Email verified successfully"
 *                 email:
 *                   type: string
 *                   description: The verified email address
 *                   example: user@example.com
 *       '400':
 *         description: Bad request. Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid or expired token"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error verifying email"
 */

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Sends a reset password email to the user's email address.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: Reset password email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 */

/**
 * @swagger
 * /users/reset-password/{token}:
 *   post:
 *     summary: Reset Password
 *     description: Resets the user's password using the provided reset token.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         description: The reset token received via email.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password.
 *             required:
 *               - password
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *       '400':
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided information
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Successfully registered user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '400':
 *         description: Bad request. Validation errors in request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 errors:
 *                   type: array
 *                   description: Array of validation errors
 *                   items:
 *                     type: object
 *                     properties:
 *                       param:
 *                         type: string
 *                         description: Name of the parameter that failed validation
 *                         example: username
 *                       msg:
 *                         type: string
 *                         description: Error message
 *                         example: "Username is required"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error registering user"
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: password123
 *     responses:
 *       '200':
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '401':
 *         description: Unauthorized. Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid email or password"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error logging in"
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile information of the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: true
 *                 user:
 *                   type: object
 *                   description: The user's profile information
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique identifier of the user
 *                       example: 60996eac0e70cf001f19d3e2
 *                     username:
 *                       type: string
 *                       description: The username of the user
 *                       example: john_doe
 *                     email:
 *                       type: string
 *                       description: The email address of the user
 *                       example: john@example.com
 *                     firstName:
 *                       type: string
 *                       description: The first name of the user
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       description: The last name of the user
 *                       example: Doe
 *       '401':
 *         description: Unauthorized. User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching user profile"
 */

/**
 * @swagger
 * /users/top-sellers:
 *   get:
 *     summary: Get top sellers.
 *     description: Retrieve the top sellers based on the number of products sold.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of top sellers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 topSellers:
 *                   type: array
 *                   description: List of top sellers.
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                         description: The username of the seller.
 *                       firstName:
 *                         type: string
 *                         description: The first name of the seller.
 *                       lastName:
 *                         type: string
 *                         description: The last name of the seller.
 *                       image:
 *                         type: string
 *                         description: The image URL of the seller.
 *                       sold:
 *                         type: number
 *                         description: The number of products sold by the seller.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 */

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user by username
 *     description: Retrieve user details based on the provided username
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
 *                 user:
 *                   type: object
 *                   description: User details
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique identifier of the user
 *                     username:
 *                       type: string
 *                       description: The username of the user
 *                     image:
 *                       type: string
 *                       description: The URL of the user's profile image
 *                     about:
 *                       type: string
 *                       description: A brief description about the user
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: An array of user IDs who follow this user
 *                     following:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: An array of user IDs whom this user follows
 *                     numReviews:
 *                       type: number
 *                       description: The number of reviews the user has received
 *                     rebundle:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: boolean
 *                           description: Indicates if the user's rebundle status is active
 *                         count:
 *                           type: number
 *                           description: The count of rebundles
 *                     sold:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: An array of product IDs sold by the user
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time when the user account was created
 *                     region:
 *                       type: string
 *                       enum: [NGN, ZAR]
 *                       description: The user's region
 *       400:
 *         description: Bad request. Username parameter is missing.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error. Failed to retrieve user details.
 */

/**
 * @swagger
 * /users/suggested-username:
 *   post:
 *     summary: Get suggested unique usernames based on first name, last name, or other text.
 *     tags: [User]
 *     description: |
 *       This endpoint generates suggested unique usernames based on the provided first name, last name,
 *       or other text. If other text is provided and it's longer than 3 characters, suggestions will be
 *       generated from it. If both first name and last name are provided, combinations of them will be used.
 *       Random numbers are added to ensure uniqueness.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the user.
 *               lastName:
 *                 type: string
 *                 description: The last name of the user.
 *               otherText:
 *                 type: string
 *                 description: Other text from which to generate suggestions.
 *     responses:
 *       '200':
 *         description: A list of suggested unique usernames.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 suggestedUsernames:
 *                   type: array
 *                   description: An array of suggested unique usernames.
 *                   items:
 *                     type: string
 *       '500':
 *         description: Internal server error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                 error:
 *                   type: object
 *                   description: Error details.
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the profile of the authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               image:
 *                 type: string
 *               about:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   apartment:
 *                     type: string
 *                   street:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipcode:
 *                     type: integer
 *               rebundle:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: boolean
 *                   count:
 *                     type: integer
 *     responses:
 *       '200':
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request. Indicates invalid fields or violation of update constraints.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 */

/**
 * @swagger
 * /users/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     description: Allows a user to follow another user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The ID of the user to follow.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *       '400':
 *         description: User is already being followed or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 */

/**
 * @swagger
 * /users/unfollow/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     description: Allows a user to unfollow another user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The ID of the user to unfollow.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *       '400':
 *         description: User is not being followed or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 */

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete user account
 *     description: Deletes the account of the authenticated user.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Details about the error.
 */
