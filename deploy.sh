#!/bin/bash

# 🚀 Portfolio Deployment Script
# Usage: ./deploy.sh "Your commit message"

echo "🎯 Deploying Portfolio Updates..."

# Check if commit message is provided
if [ -z "$1" ]; then
    echo "❌ Please provide a commit message"
    echo "Usage: ./deploy.sh \"Your commit message\""
    exit 1
fi

# Add all changes
echo "📝 Adding changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "$1"
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin public-main:main

# Build and deploy to Netlify
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESS! Your portfolio has been updated!"
        echo "🌐 Live URL: https://munir-dev-portfolio-2024.netlify.app"
        echo "📱 GitHub: https://github.com/black12-ag/portfolio"
        echo ""
    else
        echo "❌ Netlify deployment failed"
        exit 1
    fi
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi
