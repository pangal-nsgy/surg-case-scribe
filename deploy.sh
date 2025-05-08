#!/bin/bash

# Script to deploy to Vercel

# Make sure we have the latest version of Vercel CLI
echo "Updating Vercel CLI..."
npm install -g vercel@latest

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment command completed. Check the output above for any errors."
echo "If successful, your app should be available at the URL provided by Vercel." 