# E-Commerce Website

A full-stack e-commerce application built with a React frontend and an ASP.NET Core Web API backend. The app supports product browsing, category filtering, account registration and login, cart management, checkout orders, user order history, and an admin dashboard.

## Tech Stack

**Frontend**
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS

**Backend**
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Swagger
- BCrypt password hashing

## Project Structure

```text
.
├── Backend/          # ASP.NET Core Web API
│   ├── Controllers/  # Auth, products, categories, orders
│   ├── Data/         # EF Core database context
│   ├── DTOs/         # Request/response DTOs
│   ├── Migrations/   # EF Core migrations
│   └── Models/       # Database entities
└── frontend/         # React + Vite frontend
    ├── public/       # Static assets
    └── src/          # Pages, layouts, components, context, API client
```

## Features

- Product listing and product details
- Product filtering by category
- User registration and login
- Role-based admin access
- Shopping cart
- Order creation and user order history
- Admin product and category management
- Admin order status management
- Swagger API documentation in development

## Prerequisites

- Node.js and npm
- .NET 10 SDK
- SQL Server
- EF Core CLI tools

Install the EF Core CLI if needed:

```bash
dotnet tool install --global dotnet-ef
```

## Backend Setup

From the repository root:

```bash
cd Backend
dotnet restore
dotnet ef database update
dotnet run
```

The backend runs on:

```text
http://localhost:5289
https://localhost:7277
```

Swagger is available in development at:

```text
http://localhost:5289/swagger
```

### Backend Configuration

Update the SQL Server connection string in:

```text
Backend/appsettings.json
```

The app uses the `DefaultConnection` connection string for Entity Framework Core.

## Frontend Setup

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

The Axios client is configured in:

```text
frontend/src/api/api.js
```

By default it points to:

```text
http://localhost:5289
```

## Available Frontend Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Build the frontend for production
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## Main Frontend Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Home page |
| `/products` | Public | Product listing |
| `/product/:id` | Public | Product details |
| `/category/:id` | Public | Products filtered by category |
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/cart` | Logged-in users | Shopping cart |
| `/user` | Logged-in users | User account and orders |
| `/admin` | Admin users | Admin dashboard |

## Main API Endpoints

| Endpoint | Description |
| --- | --- |
| `POST /api/auth/register` | Register a user |
| `POST /api/auth/login` | Login a user |
| `GET /api/auth/users` | List users |
| `PUT /api/auth/change-role/{email}` | Change a user's role |
| `GET /api/products` | List products |
| `GET /api/products/{id}` | Get one product |
| `POST /api/products` | Create a product |
| `PUT /api/products/{id}` | Update a product |
| `DELETE /api/products/{id}` | Delete a product |
| `GET /api/categories` | List categories |
| `GET /api/categories/{id}` | Get one category |
| `POST /api/categories` | Create a category |
| `GET /api/orders` | List all orders |
| `GET /api/orders/user/{userId}` | List orders for one user |
| `POST /api/orders` | Create an order |
| `PUT /api/orders/{id}/status` | Update order status |

## Running the Full Stack

1. Start SQL Server.
2. Apply backend migrations with `dotnet ef database update`.
3. Start the backend from `Backend` with `dotnet run`.
4. Start the frontend from `frontend` with `npm run dev`.
5. Open `http://localhost:5173`.

## Notes

- The first registered account is assigned the `Admin` role.
- Later accounts are assigned the `User` role by default.
- The frontend stores authentication and cart state through React context.
- Build outputs in `Backend/bin`, `Backend/obj`, and `frontend/dist` should not be committed.
