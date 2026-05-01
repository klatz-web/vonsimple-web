# Ice Earring Storefront

A modern ecommerce storefront with a Node.js + Express backend and MongoDB data store.

## Secure publishing to GitHub

This repository is configured so sensitive files are not committed:
- `server/.env` is ignored.
- `server/node_modules/` is ignored.
- All `.env*` files and `.vscode/` are ignored at the root.

## Publish to GitHub

1. Make sure Git is installed locally.
2. Create a GitHub repository in your GitHub account.
3. In the project root run:
   ```powershell
   cd "d:\e commerce - Copy (3)"
   git init
   git add .
   git commit -m "Initial project commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
4. Do not commit any `.env` or secret files.

## Run locally

- Backend:
  ```powershell
  cd "d:\e commerce - Copy (3)\server"
  npm install
  npm start
  ```
- Frontend:
  Open `index.html` in your browser or visit `http://localhost:5000` if backend is serving static files.

## Notes

- The `server/.env.example` file shows required environment variables.
- Confirm your MongoDB instance is running before starting the backend.
