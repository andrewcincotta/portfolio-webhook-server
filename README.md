# GitHub Webhook Server for Auto-Deploy

This is a lightweight Express.js server that listens for GitHub webhook events and automatically deploys a React/Vite app when changes are pushed to the `main` branch.

## 📦 Features

- Listens for `push` events from GitHub
- Verifies webhook signature with HMAC SHA-256
- Executes a local `deploy.sh` script when the `main` branch is updated
- Designed to run continuously with PM2
- Optional integration with Nginx Proxy Manager for HTTPS support

---

## 🚀 Deployment Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/webhook-server.git
cd webhook-server

