const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const shopController = require('../controllers/shopController');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Storage
const storage = multer.diskStorage({
    destination: './public/images/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
});

// Shop Routes
router.get('/', shopController.getIndex);
router.get('/menu', shopController.getMenu);
router.get('/cart', shopController.getCart);
router.post('/cart/add', shopController.addToCart);
router.get('/cart/data', shopController.getCartData);
router.post('/cart/remove', shopController.removeFromCart);
router.post('/order', shopController.postOrder);
router.post('/order/cancel', ensureAuthenticated, shopController.cancelOrder); // Cancel Order
router.get('/orders', ensureAuthenticated, shopController.getOrders); // New User Orders Route
router.get('/profile', ensureAuthenticated, shopController.getProfile); // User Profile
router.post('/booking', shopController.postBooking);
router.post('/cart/update', shopController.updateCartItem); // Update Qty
router.post('/cart/clear', shopController.clearCart); // Clear Cart

// Admin Routes
// Admin Routes
router.get('/admin/login', authController.getAdminLogin);
// Admin Routes
router.get('/admin/login', authController.getAdminLogin);
router.post('/admin/login', authController.postAdminLogin);
router.get('/admin/logout', authController.adminLogout); // New Admin Logout

// Admin Middleware handles auth check now
router.get('/admin', ensureAdmin, adminController.getDashboard);

// Admin Orders
router.get('/admin/orders', ensureAdmin, adminController.getOrders);
router.post('/admin/order/status', ensureAdmin, adminController.updateOrderStatus);

// Admin Bookings
router.get('/admin/bookings', ensureAdmin, adminController.getBookings);
router.post('/admin/booking/status', ensureAdmin, adminController.updateBookingStatus);

// Admin Users
router.get('/admin/users', ensureAdmin, adminController.getUsers);

// Admin Menu
router.get('/admin/menu', ensureAdmin, adminController.getMenu);
router.post('/admin/menu/reorder', ensureAdmin, adminController.reorderMenu);
router.post('/admin/menu/add', ensureAdmin, upload.single('image'), adminController.addMenuItem);
router.post('/admin/menu/edit', ensureAdmin, upload.single('image'), adminController.editMenuItem);
router.post('/admin/menu/delete', ensureAdmin, adminController.deleteMenuItem);

// Auth Routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

module.exports = router;
