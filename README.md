# Sobee Backend

## Table of Contents

1. [Project Description](#project-description)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Work Assignment](#work-assignment)
7. [Contributing](#contributing)
8. [License](#license)

## Project Description

The Sobee project aims to build an e-commerce platform with both web and mobile applications. The backend is built using Node.js, Express, and MongoDB, providing APIs for various functionalities such as user authentication, product management, order processing, and more. The backend also includes a recommendation system using the Apriori algorithm to enhance the shopping experience by suggesting products based on user behavior.

## Features

### Authentication

- **User Registration**: Users can create an account using their email and password.
- **User Login**: Users can log in to their account using their email and password.
- **Password Reset**: Users can reset their password if they forget it.
- **JWT Authentication**: Secure authentication using JSON Web Tokens.

### Product Management

- **CRUD Operations for Products**: Administrators can create, read, update, and delete products.
- **Category Management**: Products can be categorized for better organization and searchability.

### Order Management

- **Cart Management**: Users can add, remove, and update items in their shopping cart.
- **Order Creation and Tracking**: Users can place orders and track their status from processing to delivery.

### Wishlist

- Add and manage products in the wishlist.
- View wishlist details.

### Reviews

- Submit reviews and ratings for products.
- Manage and display customer reviews.

### Recommendation System

- **Apriori Algorithm**: Provides product recommendations based on user behavior and purchase history.

### File Storage

- **Image and Video Uploads**: Handles the uploading and storing of product images and videos.
- **File Storage and Retrieval**: Efficiently stores and retrieves files for use in the application.

### Caching

- **Redis Caching**: Uses Redis to cache frequently accessed data for improved performance.

### Chat System

- **Real-time Chat**: Enables real-time communication between customers and sellers.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Sobee-Project/sobee-be.git
   cd sobee-be
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3000
   MONGO_URI=<your_mongodb_uri>
   JWT_SECRET=<your_jwt_secret>
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   REDIS_PASSWORD=<your_redis_password>
   REDIS_HOST=<your_redis_host>
   REDIS_PORT=<your_redis_port>
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Usage

The backend server provides a set of RESTful APIs that can be used by the frontend applications (web and mobile) to perform various operations. The base URL for the APIs is `http://localhost:3000/api`.

### Example Endpoints

- **User Registration:** `POST /api/auth/register`
- **User Login:** `POST /api/auth/login`
- **Get Products:** `GET /api/products`
- **Create Order:** `POST /api/orders`
- **Chat:** `GET /api/chat/:conversationId`

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Log in a user.
- **POST /api/auth/password-reset**: Reset a user's password.

### Products

- **GET /api/products**: Get a list of all products.
- **GET /api/products/:id**: Get details of a specific product.
- **POST /api/products**: Create a new product.
- **PUT /api/products/:id**: Update a specific product.
- **DELETE /api/products/:id**: Delete a specific product.

### Orders

- **POST /api/orders**: Create a new order.
- **GET /api/orders/:id**: Get details of a specific order.
- **PUT /api/orders/:id**: Update a specific order.
- **DELETE /api/orders/:id**: Cancel a specific order.

### Chat

- **GET /api/chat/:conversationId**: Get messages of a specific conversation.
- **POST /api/chat/:conversationId**: Send a message in a specific conversation.

### Recommendations

- **GET /api/recommendations/:userId**: Get product recommendations for a specific user.

## Work Assignment

| Member             | Task                                                                                                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trần Tuấn Kiệt** | Backend API development, MongoDB integration, Order management, Chat system, Product management, Develop admin interfaces for order and user management, Implement shopping cart, Category and tag handling, Redis caching, File storage, Deployment and server configuration, Recommendation system |
| **Lê Văn Duy**     | Backend API development, MongoDB integration, Product management, Authentication system, Redis caching, File storage, Develop review and rating system for products, Implement wishlist functionalities, Recommendation system using Apriori algorithm handling, Deployment and server configuration |

## Contributing

We welcome contributions to the Sobee Project. Please follow these steps to contribute:

1. **Fork the repository.**
2. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes and commit them:**
   ```bash
   git commit -m 'Add some feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a pull request.**

## License

This project is licensed under the MIT License. See the LICENSE file for details.
