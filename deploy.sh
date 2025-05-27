#!/bin/bash

set -e  # stop if any command fails

cd /root/andrews-portfolio || exit

echo "[DEPLOY] Resetting local changes and pulling latest from main..."
git reset --hard HEAD
git clean -fd
git pull origin main

echo "[DEPLOY] Installing dependencies..."
npm ci

echo "[DEPLOY] Building the app..."
npm run build

echo "[DEPLOY] Restarting pm2 process..."
pm2 reload portfolio-site 

echo "[DEPLOY] Done at $(date)"
