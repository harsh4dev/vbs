const express = require('express');
const router = express.Router();
const userController = require('../controllers/Admin/userController');


// Display all users
router.get('/user/', userController.getAllUsers);


// Store the new user
router.post('/user/create', userController.createUser);

// Update the user details
router.put('/user/update/:id', userController.updateUser);

// Delete a user
router.delete('/user/delete/:id', userController.deleteUser);

module.exports = router;
