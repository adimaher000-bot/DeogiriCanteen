const Menu = require('../models/Menu');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getIndex = async (req, res) => {
    try {
        const featuredItems = await Menu.find({ is_available: true }).sort({ sequence: 1 }).limit(6);
        res.render('index', {
            pageTitle: 'Home',
            path: '/',
            featuredItems: featuredItems
        });
    } catch (err) {
        console.log(err);
        res.render('index', {
            pageTitle: 'Home',
            path: '/',
            featuredItems: []
        });
    }
};

exports.getMenu = async (req, res) => {
    try {
        const menuItems = await Menu.find().sort({ sequence: 1, category: 1, item_name: 1 });
        res.render('pages/menu', {
            pageTitle: 'Menu',
            path: '/menu',
            menuItems: menuItems
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

exports.postBooking = async (req, res) => {
    const { name, phone, email, booking_date, booking_time, guests, special_request } = req.body;
    try {
        const bookingData = {
            name, phone, email,
            date: booking_date,
            time: booking_time,
            guests,
            special_request
        };

        if (req.session.user) {
            bookingData.user = req.session.user._id;
        }

        const booking = new Booking(bookingData);
        await booking.save();
        res.json({ status: 'success', message: 'Booking confirmed!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Booking failed.' });
    }
};

// Cart Logic
exports.getCart = (req, res) => {
    const cart = req.session.cart || { items: [], totalQty: 0, totalPrice: 0 };
    res.render('pages/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        cart: cart
    });
};

exports.addToCart = (req, res) => {
    const { menu_id, item_name, price, image } = req.body;
    let cart = req.session.cart || { items: [], totalQty: 0, totalPrice: 0 };

    const existingItemIndex = cart.items.findIndex(item => item.menu_id === menu_id);

    if (existingItemIndex > -1) {
        if (cart.items[existingItemIndex].quantity < 10) {
            cart.items[existingItemIndex].quantity++;
        } else {
            return res.status(400).json({ status: 'error', message: 'Maximum 10 items allowed per product' });
        }
    } else {
        cart.items.push({
            menu_id, item_name, price, image, quantity: 1
        });
    }

    cart.totalQty++;
    cart.totalPrice += parseFloat(price);

    req.session.cart = cart;
    res.json({ status: 'success', cart: cart });
};

exports.getCartData = (req, res) => {
    const cart = req.session.cart || { items: [], totalQty: 0, totalPrice: 0 };
    res.json({ status: 'success', cart: cart });
};

exports.postOrder = async (req, res) => {
    try {
        console.log('Received Order Request:', req.body);
        if (!req.session.user) {
            return res.status(401).json({ status: 'error', message: 'Please login to place an order' });
        }

        const { order_type, address } = req.body;

        const cart = req.session.cart;

        // Filter out items with invalid specific IDs (fixes BSONError)
        const validItems = cart ? cart.items.filter(i => mongoose.Types.ObjectId.isValid(i.menu_id)) : [];

        if (!cart || validItems.length === 0) {
            req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
            return res.status(400).json({ status: 'error', message: 'Cart execution error. Cart has been reset. Please add items again.' });
        }

        if (cart.totalPrice <= 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid order amount.' });
        }

        // Role-based Order Validation
        const userSession = req.session.user;
        const user = await User.findById(userSession._id);

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'User not found. Please login again.' });
        }

        // 1. Student Restriction: Pickup Only (Strict Enforcement)
        if (user.role === 'student') {
            // Force pickup for students server-side
            if (order_type === 'delivery') {
                return res.status(403).json({ status: 'error', message: 'Students can only place Pickup orders.' });
            }
        }

        // 2. Teacher Restriction: Delivery requires address
        if (user.role === 'teacher' && order_type === 'delivery') {
            if (!address || address.trim() === '') {
                return res.status(400).json({ status: 'error', message: 'Please provide a valid delivery address.' });
            }

            // Update User Address for future convenience
            user.address = address;
            await user.save();

            // Update session user to reflect changes immediately
            if (req.session.user) {
                req.session.user.address = address;
            }
        }

        // 3. Prevent duplicate rapid submissions (Debounce)
        const existingOrder = await Order.findOne({
            user: user._id,
            total_amount: cart.totalPrice,
            createdAt: { $gt: new Date(Date.now() - 30000) }
        });

        if (existingOrder) {
            return res.status(429).json({ status: 'error', message: 'Duplicate order detected. Please wait a moment.' });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = new Order({
                user: user._id,
                items: validItems.map(i => ({
                    menu_item: i.menu_id,
                    quantity: i.quantity,
                    price: i.price
                })),
                total_amount: cart.totalPrice,
                status: 'Pending',
                order_type: order_type || 'pickup',
                delivery_address: (order_type === 'delivery') ? address : null
            });

            await order.save({ session });

            await session.commitTransaction();
            session.endSession();

            req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
            res.json({ status: 'success', message: 'Order placed successfully!' });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err; // Re-throw to be caught by outer catch
        }
    } catch (err) {
        console.error('Order Logic Error:', err);
        res.status(500).json({ status: 'error', message: 'Order failed due to system error.' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const orders = await Order.find({ user: req.session.user._id })
            .populate('items.menu_item')
            .sort({ createdAt: -1 });

        const bookings = await Booking.find({ user: req.session.user._id })
            .sort({ date: -1, time: -1 });

        res.render('pages/orders', {
            pageTitle: 'My Orders & Bookings',
            path: '/orders',
            orders: orders,
            bookings: bookings
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

exports.removeFromCart = (req, res) => {
    const { menu_id } = req.body;
    let cart = req.session.cart;
    if (!cart) return res.json({ status: 'success', cart: { items: [], totalQty: 0, totalPrice: 0 } });

    const itemIndex = cart.items.findIndex(item => item.menu_id === menu_id);
    if (itemIndex > -1) {
        const item = cart.items[itemIndex];
        cart.totalQty -= item.quantity;
        cart.totalPrice -= item.price * item.quantity;
        cart.items.splice(itemIndex, 1);
    }

    req.session.cart = cart;
    res.json({ status: 'success', cart: cart });
};

exports.updateCartItem = (req, res) => {
    const { menu_id, quantity } = req.body;
    let cart = req.session.cart;
    if (!cart) return res.status(400).json({ status: 'error', message: 'Cart is empty' });

    const itemIndex = cart.items.findIndex(item => item.menu_id === menu_id);
    if (itemIndex > -1) {
        let newQty = parseInt(quantity);
        if (newQty < 1) newQty = 1;
        if (newQty > 10) newQty = 10; // Max limit per item

        cart.items[itemIndex].quantity = newQty;

        // Recalculate totals
        cart.totalQty = 0;
        cart.totalPrice = 0;
        cart.items.forEach(item => {
            cart.totalQty += item.quantity;
            cart.totalPrice += item.price * item.quantity;
        });
    }

    req.session.cart = cart;
    res.json({ status: 'success', cart: cart });
};

exports.clearCart = (req, res) => {
    req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
    res.json({ status: 'success', message: 'Cart cleared' });
};

exports.cancelOrder = async (req, res) => {
    const { order_id } = req.body;
    try {
        if (!req.session.user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const order = await Order.findOne({ _id: order_id, user: req.session.user._id });

        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ status: 'error', message: 'Cannot cancel order that is already ' + order.status });
        }

        order.status = 'Cancelled';
        await order.save();

        res.json({ status: 'success', message: 'Order cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Failed to cancel order' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Fetch fresh user data just in case session is stale
        const user = await User.findById(req.session.user._id);

        res.render('pages/profile', {
            pageTitle: 'My Profile',
            path: '/profile',
            user: user
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};
