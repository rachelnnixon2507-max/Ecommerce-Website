# 🛒 E-Commerce Website

A full-stack e-commerce application with a **React** frontend and an **ASP.NET Core** backend, featuring product browsing, user authentication, a shopping cart, and an admin dashboard.

---

## 📁 Project Structure

```
/
├── frontend/       # React + Vite client application
└── Backend/        # ASP.NET Core Web API
```

---

## ✨ Features

- 🏠 **Home Page** – Landing page showcasing featured products
- 🛍️ **Product Listing** – Browse all products or filter by category
- 📄 **Product Details** – View detailed info for a single product
- 🔐 **Authentication** – Register and login with JWT-based auth
- 🛒 **Shopping Cart** – Add items and manage your cart (requires login)
- 👤 **User Profile** – View and manage your account
- 🛠️ **Admin Dashboard** – Manage products and categories (admin only)

---

## 🖥️ Frontend

**Stack:** React 19 · React Router v7 · Axios · Tailwind CSS v4 · Vite

### Getting Started

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint source files |

### Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page |
| `/products` | Public | All products |
| `/product/:id` | Public | Product detail |
| `/category/:id` | Public | Products by category |
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/cart` | Auth required | Shopping cart |
| `/user` | Auth required | User profile |
| `/admin` | Admin only | Admin dashboard |

---

## ⚙️ Backend

**Stack:** ASP.NET Core (.NET 10) · Entity Framework Core · SQL Server · JWT Bearer Auth · AutoMapper · FluentValidation · Swagger

### Getting Started

```bash
cd Backend
dotnet restore
dotnet ef database update   # apply migrations
dotnet run
```

Swagger UI will be available at `http://localhost:<port>/swagger`.

### API Controllers

| Controller | Endpoint Prefix | Description |
|---|---|---|
| `AuthController` | `/api/auth` | Register, login, JWT issuance |
| `ProductController` | `/api/products` | CRUD for products |
| `CategoriesController` | `/api/categories` | CRUD for categories |

### Configuration

Update `appsettings.json` (or `appsettings.Development.json`) with your:

- **Connection string** – SQL Server database
- **JWT settings** – Secret key, issuer, audience

---

## 🚀 Running the Full Stack

1. **Start the backend:**
   ```bash
   cd Backend && dotnet run
   ```

2. **Start the frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

> Make sure the API base URL in the frontend (`src/api/`) points to your running backend.

---

## 📦 Key Dependencies

### Frontend
- [React](https://react.dev/) – UI library
- [React Router DOM](https://reactrouter.com/) – Client-side routing
- [Axios](https://axios-http.com/) – HTTP client
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Vite](https://vitejs.dev/) – Build tool

### Backend
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/) – ORM
- [JWT Bearer](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/) – Authentication
- [AutoMapper](https://automapper.org/) – Object mapping
- [FluentValidation](https://docs.fluentvalidation.net/) – Input validation
- [Swashbuckle / Swagger](https://swagger.io/) – API documentation
- [BCrypt.Net](https://github.com/BcryptNet/bcrypt.net) – Password hashing
