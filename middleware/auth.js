exports.ensureAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.redirect('/login');
};

exports.ensureAdmin = (req, res, next) => {
    if (req.session.admin && req.session.admin.role === 'admin') {
        return next();
    }
    // If user is logged in but tries to access admin, show 403 or redirect
    if (req.session.user) {
        return res.status(403).send(`
            <body style="font-family: sans-serif; background: #f8d7da; color: #721c24; padding: 50px; text-align: center;">
                <h1>Access Denied</h1>
                <p>You do not have permission to view this page with your current account.</p>
                <p>You are currently logged in as <strong>${req.session.user.name}</strong> (User).</p>
                <p>To access the Admin Portal, please log in with an Admin account.</p>
                <a href="/admin/login" style="display:inline-block; margin-top:15px; background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login as Admin</a>
                <br><br>
                <a href="/" style="color: #721c24;">Return to Home</a>
            </body>
        `);
    }

    res.redirect('/admin/login');
};
