const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });

        // Aggregate total revenue (sum of total_amount for non-cancelled orders)
        const revenueAgg = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: "$total_amount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        const deliveryOrders = await Order.countDocuments({ order_type: 'delivery' });

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email role');

        res.render('pages/admin/dashboard', {
            pageTitle: 'Admin Dashboard',
            path: '/admin',
            admin: req.session.admin, // Pass admin info
            stats: {
                totalOrders,
                pendingOrders,
                totalRevenue,
                deliveryOrders
            },
            recentOrders
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

// --- Orders Management ---
exports.getOrders = async (req, res) => {
    try {
        const filter = req.query.filter || 'all'; // 'all', 'student', 'teacher'
        let query = {};

        if (filter === 'student') {
            // We need to filter based on user role.
            // Mongoose doesn't support direct filtering on populated fields easily in find().
            // We can do it via aggregate or fetch all and filter JS (if small data), or use 
            // a slightly more complex query if we had user info denormalized.
            // For now, let's fetch all orders populated and filter in memory, or advanced aggregate.
            // Given typical small scale, memory filter is fine.
            // Better: aggregate lookup.
        }

        // Implementation with Populate & Filter
        let orders = await Order.find()
            .populate('user', 'name email role contact')
            .populate('items.menu_item', 'item_name price')
            .sort({ createdAt: -1 });

        if (filter === 'student') {
            orders = orders.filter(o => o.user && o.user.role === 'student');
        } else if (filter === 'teacher') {
            orders = orders.filter(o => o.user && o.user.role === 'teacher');
        }

        res.render('pages/admin/orders', {
            pageTitle: 'Manage Orders',
            path: '/admin/orders',
            orders: orders,
            filter: filter,
            admin: req.session.admin
        });

    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await Order.findByIdAndUpdate(orderId, { status: status });

        // If ajax, return json, else redirect
        // Assuming form submit for now as per PHP style
        res.redirect('back');
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// --- Menu Management ---
exports.getMenu = async (req, res) => {
    try {
        const menuItems = await Menu.find().sort({ sequence: 1, category: 1, item_name: 1 });
        res.render('pages/admin/menu', {
            pageTitle: 'Manage Menu',
            path: '/admin/menu',
            menuItems: menuItems,
            admin: req.session.admin
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

exports.addMenuItem = async (req, res) => {
    try {
        const { item_name, price, category, description, is_available } = req.body;
        const image = req.file ? req.file.filename : null;

        const newItem = new Menu({
            item_name,
            price,
            category,
            description,
            is_available: is_available === 'on',
            image
        });

        await newItem.save();
        res.redirect('/admin/menu');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/menu');
    }
};

exports.editMenuItem = async (req, res) => {
    try {
        const { id, item_name, price, category, description, is_available } = req.body;
        const updateData = {
            item_name,
            price,
            category,
            description,
            is_available: is_available === 'on'
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        await Menu.findByIdAndUpdate(id, updateData);
        res.redirect('/admin/menu');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/menu');
    }
};

exports.reorderMenu = async (req, res) => {
    try {
        const { order } = req.body;
        if (!order || !Array.isArray(order)) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const bulkOps = order.map((id, index) => {
            return {
                updateOne: {
                    filter: { _id: id },
                    update: { sequence: index }
                }
            };
        });

        await Menu.bulkWrite(bulkOps);
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.body;
        await Menu.findByIdAndDelete(id);
        res.redirect('/admin/menu');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/menu');
    }
};

// --- Booking Management ---
const Booking = require('../models/Booking'); // Ensure this is required

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: 1, time: 1 });
        res.render('pages/admin/bookings', {
            pageTitle: 'Manage Bookings',
            path: '/admin/bookings',
            bookings: bookings,
            admin: req.session.admin
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body;
        await Booking.findByIdAndUpdate(bookingId, { status: status });
        res.redirect('back');
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// --- User Management ---
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.render('pages/admin/users', {
            pageTitle: 'Manage Users',
            path: '/admin/users',
            users: users,
            admin: req.session.admin
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin');
    }
};
