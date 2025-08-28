# 🔐 Ghost Drive Frontend

A secure end-to-end encrypted file storage frontend built with **React**, **TypeScript**, and **Vite**. Ghost Drive Frontend provides a modern, user-friendly interface for the Ghost Drive secure file storage system, ensuring that only users can decrypt their files - even the development team cannot access user data.

## 🚀 Features

- **True End-to-End Encryption**: Files are encrypted on the client side using AES-256
- **Client-Side Key Generation**: AES keys generated on frontend, preventing backend backdoors
- **PIN-Based Security**: User-defined PINs protect encryption keys (PIN never leaves client)
- **Zero-Knowledge Architecture**: Server cannot decrypt user files even if compromised
- **Modern React Interface**: Built with React 19, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **File Management**: Upload, download, organize, and manage encrypted files
- **Virtual Folder Organization**: Create and manage virtual folders for file organization
- **Real-time Updates**: Instant feedback for file operations
- **Secure Authentication**: JWT-based authentication with secure token management

## 🛠️ Technology Stack

- **Framework**: [React](https://react.dev/) 19 - Modern React with concurrent features
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool and dev server
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **Cryptography**: Web Crypto API - Native browser cryptography
- **Package Manager**: [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager

## 📁 Project Structure

```
ghost-drive-fe/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   └── PinModal.tsx    # PIN input modal component
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx   # User login page
│   │   └── RegisterPage.tsx # User registration page
│   ├── utils/              # Utility functions
│   │   ├── crypto.ts       # Cryptography utilities
│   │   └── README.md       # Crypto module documentation
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## 🔒 How Encryption Works

Ghost Drive Frontend implements a sophisticated encryption system that ensures complete privacy:

### Encryption Architecture

1. **PIN-Based Key Derivation**: Users provide a secret 6-digit PIN
2. **Client-Side AES Key Generation**: Frontend generates a random AES-256 key for file encryption
3. **Key Encryption**: The AES key is encrypted using the user's PIN on the client side
4. **Secure Storage**: Only the encrypted AES key is sent to and stored in the database
5. **Zero-Knowledge**: Backend never sees the plain PIN or plain AES key
6. **Client-Side Processing**: All file encryption/decryption happens on the client

### Step-by-Step Process

#### File Upload (Encryption)

```
┌─────────────┐
│    User     │
│  Selects    │
│    File     │
└─────────────┘
        │
        ▼
┌─────────────┐
│ Generate    │
│ Random AES  │
│ Key         │
└─────────────┘
        │
        ▼
┌─────────────┐
│ Encrypt     │
│ File with   │
│ AES Key     │
└─────────────┘
        │
        ▼
┌─────────────┐    Encrypted    ┌─────────────┐
│    User     │ ───────────────►│   Backend   │
│             │      File       │             │
└─────────────┘                 └─────────────┘
                                    │
                                    ▼
┌─────────────┐    Encrypted    ┌─────────────┐
│   MinIO     │ ◄────────────── │   Backend   │
│  Storage    │      File       │             │
└─────────────┘                 └─────────────┘
```

#### File Download (Decryption)

```
┌─────────────┐    Request     ┌─────────────┐
│    User     │ ──────────────►│   Backend   │
│             │   File ID      │             │
└─────────────┘                └─────────────┘
                                    │
                                    ▼
┌─────────────┐    Encrypted    ┌─────────────┐
│    User     │ ◄────────────── │   MinIO     │
│             │      File       │  Storage    │
└─────────────┘                 └─────────────┘
        │
        ▼
┌─────────────┐
│ Decrypt     │
│ File with   │
│ AES Key     │
└─────────────┘
        │
        ▼
┌─────────────┐
│ Original    │
│ File        │
│ Restored    │
└─────────────┘
```

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/) (v1.0.0 or higher)
- Modern web browser with Web Crypto API support
- Ghost Drive Backend server running (see backend documentation)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ghost-drive-fe
```

### 2. Install Dependencies

Using Bun (recommended):

```bash
bun install
```

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=Ghost Drive
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false
```

### 4. Start Development Server

Using Bun:

```bash
bun dev
```

Using npm:

```bash
npm run dev
```

Using yarn:

```bash
yarn dev
```

The application will be available at: <http://localhost:5173>

### 5. Build for Production

Using Bun:

```bash
bun run build
```

Using npm:

```bash
npm run build
```

Using yarn:

```bash
yarn build
```

## 🔧 Development

### Available Scripts

```bash
# Development with hot reload
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run linting
bun run lint
```

### Adding New Features

1. **Create Components**: Add new components in `src/components/`
2. **Create Pages**: Add new pages in `src/pages/`
3. **Add Utilities**: Add utility functions in `src/utils/`
4. **Update Styles**: Modify Tailwind classes or add custom CSS
5. **Test Features**: Test in development mode before deployment

### Code Structure Guidelines

- **Components**: Use functional components with hooks
- **TypeScript**: Use strict TypeScript for type safety
- **Styling**: Use Tailwind CSS utility classes
- **State Management**: Use React hooks for local state
- **API Calls**: Use Axios for HTTP requests
- **Error Handling**: Implement proper error boundaries and error handling

## 🔐 Security Considerations

### Frontend Security

- **PIN Security**: Users should use strong, unique 6-digit PINs
- **Client-Side Key Generation**: AES keys are generated on the frontend
- **PIN Never Transmitted**: User PINs never leave the client
- **Zero-Knowledge Architecture**: Backend cannot decrypt files
- **HTTPS Required**: Always use HTTPS in production
- **Secure Storage**: Use secure storage for sensitive data
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user inputs and outputs

### Browser Compatibility

- **Web Crypto API**: Requires modern browsers with Web Crypto API support
- **HTTPS Requirement**: Web Crypto API only works in secure contexts
- **Fallback Support**: Consider fallback mechanisms for older browsers

### Development Security

- **Environment Variables**: Never commit sensitive data to version control
- **API Keys**: Store API keys in environment variables
- **Debug Mode**: Disable debug mode in production
- **Error Messages**: Don't expose sensitive information in error messages

## 📱 User Interface Features

### Authentication

- **User Registration**: Secure user registration with PIN setup
- **User Login**: JWT-based authentication with PIN verification
- **PIN Management**: Secure PIN change functionality
- **Session Management**: Automatic token refresh and session handling

### File Management

- **File Upload**: Drag-and-drop file upload with encryption
- **File Download**: Secure file download with automatic decryption
- **File Organization**: Virtual folder creation and management
- **File Preview**: Preview supported file types
- **File Search**: Search files by name and content
- **File Sharing**: Secure file sharing capabilities

### User Experience

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: User preference-based theme switching
- **Progress Indicators**: Real-time upload/download progress
- **Error Handling**: User-friendly error messages and recovery
- **Loading States**: Smooth loading animations and states

## 🔄 API Integration

### Authentication Endpoints

```typescript
// User registration
POST /api/users/register
{
  "username": "user@example.com",
  "password": "securepassword",
  "aesKeyEncrypted": "encrypted-aes-key-string"
}

// User login
POST /api/users/login
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

### File Management Endpoints

```typescript
// Get upload presigned URL
GET /api/files/upload-url?filename=document.pdf&path=/Documents/

// Get download presigned URL
GET /api/files/download-url/:fileId

// List user files
GET /api/files?path=/Documents/

// Delete file
DELETE /api/files/:fileId
```

### User Management Endpoints

```typescript
// Get user profile
GET /api/users/me

// Update encrypted AES key
POST /api/users/update-aes-key-encrypted
{
  "aesKeyEncrypted": "new-encrypted-aes-key-string"
}

// Update user avatar
POST /api/users/update-avatar
{
  "avatar": "base64-encoded-avatar-image"
}
```

## 🧪 Testing

### Manual Testing

1. **User Registration**: Test user registration with PIN setup
2. **User Login**: Test login with correct and incorrect credentials
3. **File Upload**: Test file upload with encryption
4. **File Download**: Test file download with decryption
5. **PIN Change**: Test PIN change functionality
6. **Error Handling**: Test various error scenarios

### Automated Testing

```bash
# Run unit tests
bun test

# Run integration tests
bun test:integration

# Run end-to-end tests
bun test:e2e
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Deployment Options

1. **Static Hosting**: Deploy to Vercel, Netlify, or similar
2. **CDN**: Use CDN for global distribution
3. **Docker**: Containerize the application
4. **Cloud Platforms**: Deploy to AWS, Google Cloud, or Azure

### Environment Configuration

```env
# Production environment variables
VITE_API_BASE_URL=https://api.ghostdrive.com
VITE_APP_NAME=Ghost Drive
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for maximum security and performance
- Special thanks to the React, TypeScript, and Vite communities
- Inspired by the need for truly secure file storage solutions

## 📞 Support

- **Documentation**: Check the [docs](docs/) folder for detailed guides
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community discussions on GitHub
- **Security**: Report security vulnerabilities privately

---

**⚠️ Important**: This is a security-critical application. Always review the encryption implementation and conduct security audits before deploying to production.

**🔐 Remember**: The strength of your encryption depends on the strength of your PIN. Choose wisely!

**🌐 Browser Support**: This application requires modern browsers with Web Crypto API support and HTTPS.
