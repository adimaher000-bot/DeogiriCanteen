const User = require('../models/User');

exports.getLogin = (req, res) => {
    res.render('pages/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: null
    });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('pages/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid email or password'
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.render('pages/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid email or password'
            });
        }

        // Regenerate session to prevent hijacking
        req.session.regenerate(err => {
            if (err) console.log(err);
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save(err => {
                if (err) console.log(err);
                if (user.role === 'admin') {
                    res.redirect('/admin');
                } else {
                    res.redirect('/');
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.redirect('/login');
    }
};

exports.getAdminLogin = (req, res) => {
    res.render('pages/admin/login', {
        pageTitle: 'Admin Login',
        path: '/admin/login',
        errorMessage: null
    });
};

exports.postAdminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        // Check if user exists AND is an admin
        if (!user || user.role !== 'admin') {
            return res.render('pages/admin/login', {
                pageTitle: 'Admin Login',
                path: '/admin/login',
                errorMessage: 'Invalid credentials or access denied'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.render('pages/admin/login', {
                pageTitle: 'Admin Login',
                path: '/admin/login',
                errorMessage: 'Invalid credentials'
            });
        }

        // Regenerate session
        req.session.regenerate(err => {
            if (err) console.log(err);
            req.session.admin = user; // Store as admin
            req.session.isLoggedIn = true; // Optional: can keep generic or use isAdminLoggedIn
            req.session.save(err => {
                if (err) console.log(err);
                res.redirect('/admin');
            });
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/login');
    }
};

exports.getRegister = (req, res) => {
    res.render('pages/register', {
        pageTitle: 'Register',
        path: '/register',
        errorMessage: null
    });
};

exports.postRegister = async (req, res) => {
    let { name, username, email, password, phone, role } = req.body;

    // Sanitize
    name = name.trim();
    username = username ? username.trim() : '';
    email = email.trim();
    phone = phone.trim();

    try {
        // Validation: Username
        if (!username.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error('Username must be alphanumeric');
        }
        if (username.length < 3 || username.length > 20) {
            throw new Error('Username must be 3-20 characters');
        }

        // Validation: Password
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            throw new Error('Password must contain uppercase, lowercase, and a number');
        }

        // Validation: Phone
        if (!/^[0-9]{10}$/.test(phone)) {
            throw new Error('Phone must be 10 digits');
        }

        // Check Existing (Email, Username, Phone)
        const exists = await User.findOne({
            $or: [{ email }, { username }, { phone }]
        });

        if (exists) {
            let msg = 'User already exists';
            if (exists.email === email) msg = 'Email already registered';
            if (exists.username === username) msg = 'Username already taken';
            if (exists.phone === phone) msg = 'Phone number already registered';

            return res.render('pages/register', {
                pageTitle: 'Register',
                path: '/register',
                errorMessage: msg
            });
        }

        // Enforce Roles
        if (!['student', 'teacher'].includes(role)) {
            role = 'student'; // Default fallback
        }

        const user = new User({
            name,
            username,
            email,
            password,
            phone,
            role
        });

        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        return res.render('pages/register', {
            pageTitle: 'Register',
            path: '/register',
            errorMessage: err.message || 'Registration failed'
        });
    }
};

exports.logout = (req, res) => {
    // Only remove user session
    if (req.session.user) {
        delete req.session.user;
    }
    // If no admin session exists, we can destroy the whole session or just set isLoggedIn false
    // But since we use isLoggedIn flag potentially for other things, let's just rely on object existence

    // For now, let's keep it simple: just remove the user property.
    // If we want to fully clean up:
    if (!req.session.admin) {
        req.session.isLoggedIn = false;
        // req.session.destroy(); // Optional: destroy if fully empty
    }

    res.redirect('/');
};

exports.adminLogout = (req, res) => {
    // Only remove admin session
    if (req.session.admin) {
        delete req.session.admin;
    }

    if (!req.session.user) {
        req.session.isLoggedIn = false;
    }

    res.redirect('/admin/login');
};
