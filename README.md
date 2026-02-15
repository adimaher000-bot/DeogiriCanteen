# College Canteen System

A full-stack web application for managing college canteen orders, table bookings, and menu items. Built with Node.js, Express, and MongoDB.

## Features

- **User Portal**:
  - Full Menu browsing with categories
  - Add to Cart & Checkout
  - **Table Booking System**
  - Order Tracking (Real-time status updates)
  - User Booking History
- **Admin Portal**:
  - **Separate Login** `/admin/login` (Concurrent sessions supported)
  - Dashboard with sales overview
  - Order Management (Update status: Pending -> Cooking -> Deliver -> Completed)
  - Booking Management (Confirm/Reject reservations)
  - Menu Management (Add/Edit/Delete/Reorder items)
  - User Management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Frontend**: EJS Templating, CSS, Vanilla JS
- **Authentication**: Session-based (Express-Session)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally OR a MongoDB Atlas connection string.

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configuration**
    Create a `.env` file in the root directory with the following variables:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/canteen_db  # Or your Atlas URI
    SESSION_SECRET=your_secret_key_here
    ```

4.  **Run the Application**
    ```bash
    # Development mode (with auto-reload)
    npm run dev
    
    # Production start
    npm start
    ```

5.  **Access the App**
    - user: http://localhost:3000
    - Admin: http://localhost:3000/admin/login

## Project Structure

- `server.js`: Entry point.
- `models/`: Mongoose schemas (User, Order, Menu, Booking).
- `controllers/`: Logic for handling requests.
- `routes/`: API endpoints and page routes.
- `views/`: EJS templates for the UI.
- `public/`: Static assets (CSS, JS, Images).
