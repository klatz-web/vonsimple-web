# Ice Earring Storefront

A modern ecommerce storefront with a Node.js + Express backend and MongoDB data store.

## Secure publishing to GitHub

This repository is configured so sensitive files are not committed:
- `src/.env` is ignored.
- `src/node_modules/` is ignored.
- All `.env*` files and `.vscode/` are ignored at the root.

## Publish to GitHub

1. Make sure Git is installed locally.
2. Create a GitHub repository in your GitHub account.
3. In the project root run:
   ```powershell
   cd "d:\e commerce - Copy (3)"
   git init
   git add 
   git commit -m "Initial project commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
4. Do not commit any `.env` or secret files.

## Run locally

- Backend:
  ```powershell
  cd "d:\e commerce - Copy (3)"
  npm install
  npm start
  ```
- Frontend:
  Open `http://localhost:5000` in your browser after the backend starts. The full app requires the backend service to be available.

> Note: GitHub Pages can only host the frontend files. This project requires the Node.js backend to be running locally or deployed to a live server, because account creation, login, and product data come from the API.

## Notes

- The `src/.env.example` file shows required environment variables.
- Confirm your MongoDB instance is running before starting the backend.
