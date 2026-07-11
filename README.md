# LenderPro — Backend

Express.js REST API for loan & interest management.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI & JWT_SECRET
npm run dev
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/register | Register lender |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/logout | Logout |
| GET  | /api/v1/auth/me | Get profile |

### Borrowers
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/borrowers | List borrowers |
| POST | /api/v1/borrowers | Create borrower |
| GET | /api/v1/borrowers/:id | Get borrower |
| PUT | /api/v1/borrowers/:id | Update borrower |
| DELETE | /api/v1/borrowers/:id | Delete borrower |

### Loans
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/loans | List loans |
| POST | /api/v1/loans | Create loan |
| GET | /api/v1/loans/:id | Get loan + repayments |
| PUT | /api/v1/loans/:id | Update loan |
| PATCH | /api/v1/loans/:id/close | Close loan |
| DELETE | /api/v1/loans/:id | Delete loan |

### Repayments
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/repayments | List repayments |
| POST | /api/v1/repayments | Record repayment |
| DELETE | /api/v1/repayments/:id | Delete repayment |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/dashboard | Stats + monthly data |

## Folder Structure
```
src/
├── app.js              # Express setup
├── server.js           # Entry point
├── config/
│   ├── db.js           # MongoDB connection
│   └── jwt.js          # JWT constants
├── controllers/
│   ├── authController.js
│   ├── borrowerController.js
│   ├── loanController.js
│   ├── repaymentController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js         # JWT protect middleware
│   ├── errorHandler.js
│   ├── notFound.js
│   ├── validate.js
│   └── validators/
│       ├── borrowerValidator.js
│       ├── loanValidator.js
│       └── repaymentValidator.js
├── models/
│   ├── User.js
│   ├── Borrower.js
│   ├── Loan.js
│   └── Repayment.js
├── routes/
│   ├── index.js
│   ├── authRoutes.js
│   ├── borrowerRoutes.js
│   ├── loanRoutes.js
│   ├── repaymentRoutes.js
│   └── dashboardRoutes.js
└── utils/
    ├── AppError.js
    └── apiResponse.js
```
