# 🛒 Tech & Electronics E-Commerce Platform

A modern full-stack e-commerce platform for browsing, purchasing, and managing technology and electronic products.

The platform is built with the **MERN stack** and provides separate experiences for customers and administrators.

---

## 🚀 Features

### 👤 Customer Features

- User registration and login
- JWT-based authentication
- User profile management
- Profile image upload
- Browse electronic products
- Product search
- Product categories
- Product details
- Product image gallery
- Shopping cart
- Wishlist
- Quantity management
- Order placement
- Order history
- Payment integration
- Responsive design

### 🛠️ Admin Features

- Admin authentication
- Admin dashboard
- Product management
- Add, edit, and delete products
- Product image upload
- Category management
- Inventory management
- Order management
- Customer management
- Sales information
- Admin profile settings

---

## 🛍️ Product Categories

The platform currently supports:

- 💻 Laptops
- 📱 Smartphones
- 🎧 Smart Accessories
- 🎮 Gaming
- 🌐 Network
- ⌚ Smart Watch

---

## 🛠️ Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- Context API
- Framer Motion
- React Icons
- Chart.js

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Cloudinary
- Chapa Payment API

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- MongoDB
- GitHub Desktop

---

## 📁 Project Structure

```text
E-commerce web/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── postman/
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Shelema-bot/tech-electronics-ecommerce.git
cd tech-electronics-ecommerce
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Open another terminal and run:

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create the required `.env` files for the backend and frontend according to the project configuration.

Do not commit `.env` files to GitHub.

### 5. Start the frontend

Inside the `frontend` directory:

```bash
npm run dev
```

### 6. Start the backend

Inside the `backend` directory:

```bash
npm run dev
```

---

## 🔐 Authentication

The application uses **JWT-based authentication**.

There are two main user roles:

- **Customer**
- **Admin**

Protected routes require a valid authentication token.

---

## 💳 Payment

The platform includes payment integration using the **Chapa Payment API**.

Customers can proceed through the order and payment workflow from the e-commerce interface.

---

## 📦 API Testing

The project includes Postman collections/files for testing backend API endpoints.

The `postman/` directory contains the API testing resources used during development.

---

## 📱 Responsive Design

The frontend is designed to work across:

- Desktop
- Tablet
- Mobile devices

---

## 👨‍💻 Development

This project was developed as a full-stack web application using modern JavaScript technologies and follows a separated frontend/backend architecture.

---

## 📄 License

This project is developed for educational and portfolio purposes.

```

```
