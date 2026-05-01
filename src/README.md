# Ice Earring Backend

## Setup
1. Install dependencies:
   ```bash
   cd "d:\e commerce - Copy (3)"
   npm install
   ```
2. Create a `.env` file in the `src/` directory from `.env.example` and set your MongoDB connection string and JWT secret.

## Run locally
- Development mode with auto-reload:
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

## Render deployment
- Set your Render environment variables:
  - `MONGO_URI` = your MongoDB connection string
  - `JWT_SECRET` = your JWT secret
- Do not deploy with `mongodb://127.0.0.1:27017/iceearring` on Render.
- The backend needs a real Atlas/Mongo URI in production.


> Important: The frontend must be accessed through the backend at `http://localhost:5000` for signup/login and product loading to work. Static hosting alone (like GitHub Pages) will not support the server API unless the backend is separately deployed.

## API endpoints
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/products` - Load product list
- `GET /api/products/:id` - Load a single product
- `GET /api/cart` - Get current user's cart
- `POST /api/cart/add` - Add a product to cart
- `PUT /api/cart/update/:productId` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart

## Notes
- The server seeds default products on first run.
- The frontend is served from the project root and fetches `/api` endpoints from the same origin.
