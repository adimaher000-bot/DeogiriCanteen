# Deogiri Canteen Management System

A Node.js web application for the Deogiri Canteen, conversion of the original website into a modern, functional stack. This system helps manage canteen operations, including food menus, user orders, and administrative tasks.

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose integrations)
- **Templating Engine:** EJS
- **Authentication & Security:** bcrypt (for password hashing), express-session, connect-mongo

## 📂 Project Structure

- `config/` - Database configuration and setup files.
- `controllers/` - Logic for handling incoming requests (auth, admin, generic routes).
- `middleware/` - Custom middleware functions (e.g., authentication checks).
- `models/` - Mongoose schemas (User, Item, Order models).
- `public/` - Static assets (CSS, client-side JS, Images).
- `routes/` - Route definitions for mapping URLs to controllers.
- `views/` - EJS templates for rendering pages (including specific admin portals).
- `server.js` - Application entry point.

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adimaher000-bot/DeogiriCanteen.git
   cd DeogiriCanteen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory mapping the following fields:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secret_session_key
   ```

4. **Run the Application:**
   For development (with auto-restart via nodemon):
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

   The application will be accessible at [http://localhost:3000](http://localhost:3000).

## 🛡️ User Roles & Admin Information

The system distinguishes between general users (students/teachers) and **administrators**. 

### 🌐 Live Application & Demo

You can view and test the live application here:
- **Main Website URL:** `https://deogiricanteen.onrender.com`

**Demo Student Account**
You can log in and view the student/ordering side of the application with the following credentials:
- **Email:** `demo@canteen.com`
- **Password:** `Demo123!`

### Accessing the Admin Panel

The admin dashboard is located at a separate dedicated route.

**Local Environment:**
- **URL:** `http://localhost:3000/admin/login`

**Live Environment:**
- **URL:** `https://deogiricanteen.onrender.com/admin/login`

### Live System Admin Login 

For the deployed version, you can log in to the admin panel using the following default credentials:
- **Email:** `admin@canteen.com`
- **Password:** `admin123`

### Setting up a New Admin (Local/Database)
To log into the Admin portal, your account role MUST be set to `admin` in the MongoDB database. 

1. General user registration defaults users to the `student` or `teacher` role.
2. If this is a fresh setup and you need an admin account, register a user normally at `/register`, then go into your MongoDB database (e.g., via MongoDB Compass) and manually change the document's `role` field from `"student"` to `"admin"`.
3. Use those credentials at `/admin/login` to access the dashboard where you can manage orders, system settings, menus, and users.

---

> _Note: Ensure your MongoDB server is running and your `MONGO_URI` is correctly set before starting the app. Always keep your `.env` secrets safe._
