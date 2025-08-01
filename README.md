# Madar API

A robust NestJS-based REST API service with comprehensive features for authentication, file management, and more.

## 🚀 Features

- **Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control
  - Secure password handling with bcrypt

- **File Management**

  - AWS S3 integration for file storage
  - File upload and download capabilities
  - Presigned URL generation

- **Email Services**

  - Nodemailer integration
  - Email templates and notifications

- **API Documentation**

  - Swagger/OpenAPI integration
  - Comprehensive API documentation

- **Security**
  - CORS configuration
  - Request validation
  - Global exception handling
  - Cookie-based authentication

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **File Storage**: AWS S3
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS S3 account (for file storage)
- SMTP server (for email functionality)

## 🔧 Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd madar-api
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=4500
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_bucket_name
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   CLIENT_URL=your_client_url
   ```

## 🚀 Running the Application

### Development

```bash
npm run start:dev
# or
pnpm start:dev
```

### Production

```bash
npm run build
npm run start:prod
# or
pnpm build
pnpm start:prod
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:4500/api/docs
```

## 📁 Project Structure

```
src/
├── app/           # Main application modules
├── common/        # Shared utilities and middleware
├── core/          # Core functionality and services
└── main.ts        # Application entry point
```

## 🔐 Security Features

- Input validation using class-validator
- Global exception handling
- CORS protection
- Rate limiting
- Secure cookie handling
- Request size limits

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- All contributors who have helped shape this project
