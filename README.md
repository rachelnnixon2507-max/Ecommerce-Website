# E-Commerce Website

A full-stack e-commerce application built with a React frontend and an ASP.NET Core Web API backend. The application supports product browsing, category filtering, authentication, shopping cart management, order processing, user order history, and a complete admin dashboard.

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Context API
- Local Storage (theme persistence)

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Swagger
- BCrypt Password Hashing

## Project Structure

```text
.
├── Backend/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Migrations/
│   └── Models/
└── frontend/
    ├── public/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── layouts/
        ├── pages/
        └── routes/
```

## Features

### Customer Features

- Browse products and categories
- View detailed product information
- User registration and login
- Shopping cart management
- Secure checkout process
- Order history tracking
- Responsive design for desktop, tablet, and mobile devices
- Dark Mode / Light Mode support with persistent theme settings

### Authentication Features

- JWT-based authentication
- Role-based authorization
- Login-required protection for cart and checkout actions
- Automatic redirection to login when required

### Shopping Cart Features

- Add products to cart
- Update quantities
- Remove products from cart
- Cart persistence
- Login validation before cart operations

### Order Features

- Create orders
- View user orders
- Admin order management
- Changeable order statuses:
  - Pending
  - Shipped
  - Delivered
  - Cancelled
- Color-coded status badges

### Admin Features

- Admin dashboard
- Product management (Create, Read, Update, Delete)
- Category management
- Order management
- Order status updates
- User role management
- Cart hidden for admin users

### UI / UX Enhancements

- Dark Mode / Light Mode toggle in navbar
- Theme persistence using localStorage
- Responsive navigation
- Pagination for products and orders
- Previous / Next page navigation
- Optimized page loading performance
- Clean and modern user interface

## Newly Added Features

### 1. Dark Mode / Light Mode

Users can switch between dark and light themes using the navbar theme toggle.

**Features**
- Theme switch button in navbar
- Stored in localStorage
- Automatically applied across all pages
- Persistent across browser sessions

### 2. Changeable Order Status

Admins can update order status directly from the order management page.

**Supported Statuses**
- Pending
- Shipped
- Delivered
- Cancelled

**Status Badge Colors**
| Status | Color |
|----------|----------|
| Pending | Yellow |
| Shipped | Blue |
| Delivered | Green |
| Cancelled | Red |

### 3. Pagination

Pagination is implemented for large datasets.

**Applies To**
- Product listings
- Admin orders page

**Features**
- Previous button
- Next button
- Page number navigation
- Limited records per page

### 4. Admin Cart Restrictions

Admin users do not have access to shopping cart functionality.

**Behavior**
- Cart icon hidden
- Cart page hidden
- Existing user functionality remains unchanged

### 5. Login Required for Add to Cart

Unauthenticated users attempting to add products to the cart will see:

```text
Please login to add products to your cart.
```

The action is blocked until login.

### 6. Login Required for Checkout

Unauthenticated users attempting to checkout will see:

```text
Please login before proceeding to checkout.
```

After confirmation, users are redirected to the login page.

## Prerequisites

- Node.js
- npm
- .NET SDK
- SQL Server
- EF Core CLI

Install EF Core CLI if needed:

```bash
dotnet tool install --global dotnet-ef
```

## Backend Setup

```bash
cd Backend
dotnet restore
dotnet ef database update
dotnet run
```

Backend URLs:

```text
http://localhost:5289
https://localhost:7277
```

Swagger:

```text
http://localhost:5289/swagger
```

### Configuration

Update the connection string in:

```text
Backend/appsettings.json
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

API configuration file:

```text
frontend/src/api/api.js
```

## Frontend Routes

| Route | Access |
|---------|---------|
| / | Public |
| /products | Public |
| /product/:id | Public |
| /category/:id | Public |
| /login | Public |
| /register | Public |
| /cart | User Only |
| /user | Authenticated User |
| /admin | Admin Only |

## Main API Endpoints

| Method | Endpoint |
|----------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/users |
| PUT | /api/auth/change-role/{email} |
| GET | /api/products |
| GET | /api/products/{id} |
| POST | /api/products |
| PUT | /api/products/{id} |
| DELETE | /api/products/{id} |
| GET | /api/categories |
| POST | /api/categories |
| GET | /api/orders |
| GET | /api/orders/user/{userId} |
| POST | /api/orders |
| PUT | /api/orders/{id}/status |

## Running the Application

1. Start SQL Server.
2. Run database migrations.

```bash
dotnet ef database update
```

3. Start backend.

```bash
cd Backend
dotnet run
```

4. Start frontend.

```bash
cd frontend
npm run dev
```

5. Open:

```text
http://localhost:5173
```

## Security Notes

- Passwords are hashed using BCrypt.
- Role-based route protection is enforced.
- Admin-only management screens are secured.
- Login validation is required before cart and checkout actions.

## Future Improvements

- Payment gateway integration
- Product reviews and ratings
- Wishlist functionality
- Email notifications
- Advanced search and filtering
- Sales analytics dashboard

## License

This project is intended for educational and portfolio purposes.
