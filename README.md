# Backend for Single Vendor Clothing E-commerce Site Limo Store

Welcome to the backend of Single Vendor Clothing E-commerce site. This backend provides robust APIs for managing products, categories, addresses, orders, and authentication. Built with Node.js and Express.js, along with MongoDB using Mongoose, it offers powerful functionality to support the seamless operation of your online store.

## Features

The backend APIs offer comprehensive functionality to support the e-commerce site:

- **Product CRUD:** Create, Read, Update, and Delete operations for managing products.
- **Category CRUD:** Manage product categories with CRUD operations.
- **Address Management:** CRUD operations for managing user addresses.
- **Order CRUD:** Create, Read, Update, and Delete operations for managing orders.
- **Order Status:** Update order status and view all orders.
- **Authentication:** Secure user authentication using JSON Web Tokens (JWT).
- **Image Compression:** Utilize multer and sharp for compressing image sizes before storage.
- **File Uploads to AWS S3:** Store product images on AWS S3 for scalable and reliable storage.
- **Payment Integration:** Integrate with Razorpay for secure payments.

## Technologies Used

- **Node.js:** For building the backend server.
- **Express.js:** For creating RESTful APIs.
- **MongoDB with Mongoose:** For database management and interaction.
- **AWS SDK:** For integrating with AWS S3 for storing product images.
- **bcrypt:** For hashing passwords for secure authentication.
- **Cors:** For enabling Cross-Origin Resource Sharing.
- **Body-parser:** For parsing incoming request bodies.
- **jsonwebtoken:** For generating and verifying JWT tokens.
- **multer and sharp:** For handling file uploads and image compression.
- **Razorpay:** For handling secure payments.

## Getting Started

To get the backend up and running locally, follow these simple steps:

### Prerequisites

- Node.js and npm (Node Package Manager) installed on your system.

### Installation

1. Clone the repository:

```sh
git clone https://github.com/iamsuryasonar/Apparel-store-limo-backend.git
```
1. Navigate to the project directory:
```sh
cd Apparel-store-limo-backend
```
2. Install NPM packages:

```sh
npm install
```
1. Set up environment variables in a .env file at the root of your project:

```makefile
PORT=3001

DB_CONNECT=mongodb+srv://username:password@cluster0.tt7tvoa.mongodb.net/?retryWrites=true&w=majority

JWT_EXPIRES_IN=3d
TOKEN_SECRET=secret

ENDPOINT="https://s3.filebase.com"
SIGNATUREVERSION="v4"
AWS_ACCESS_ID="aws id"
AWS_ACCESS_SECRET="aws secret"
AWS_BUCKET_NAME="aws bucket"
REGION_NAME="us-east-1"

RZR_KEY="razorpay key"
RZR_SECRET="rezorpay secret"

RESEND_KEY="resend key"
```
4. Start the server:

```sh
npm start
```
The backend server should now be running on port 3000.