# Deployment Guide for Surgical Case Scribe

This document provides instructions for deploying the Surgical Case Scribe application to various platforms.

## Prerequisites

Before deploying, ensure you have:

1. An OpenAI API key for the AI-powered features
2. Node.js and Python installed on your development machine
3. Access to the GitHub repository

## Option 1: Deploy to Vercel (Recommended)

Vercel is the simplest deployment option for Next.js applications.

### Steps:

1. **Fork or clone the repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "New Project" and import your GitHub repository
   - Select the repository and configure as follows:
     - Framework Preset: Next.js
     - Build Command: Keep default
     - Output Directory: Keep default
     - Install Command: `npm install && pip install -r requirements.txt`

3. **Configure environment variables**:
   - Add the following environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `DEFAULT_YEAR`: The current year (e.g., "2023")

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application

5. **Verify deployment**:
   - Once deployment is complete, visit your Vercel URL to verify the application is running correctly
   - Test the file upload and processing functionality

### Notes for Vercel Deployment:

- Python integration may require additional configuration with Vercel
- Consider using Vercel's serverless functions for the Python script execution

## Option 2: Deploy to Heroku

Heroku is another good option that supports both Node.js and Python.

### Steps:

1. **Install the Heroku CLI** and login:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create a Heroku app**:
   ```bash
   heroku create surg-case-scribe
   ```

3. **Add buildpacks** for both Node.js and Python:
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add heroku/python
   ```

4. **Configure environment variables**:
   ```bash
   heroku config:set OPENAI_API_KEY=your_api_key
   heroku config:set DEFAULT_YEAR=2023
   ```

5. **Deploy to Heroku**:
   ```bash
   git push heroku main
   ```

## Option 3: Deploy to AWS

For more control and scalability, AWS offers several deployment options.

### Using AWS Elastic Beanstalk:

1. **Install the EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize your EB environment**:
   ```bash
   eb init
   ```

3. **Create an environment**:
   ```bash
   eb create surg-case-scribe
   ```

4. **Configure environment variables**:
   - Go to the AWS Console > Elastic Beanstalk > Your Application > Configuration
   - Add the required environment variables

5. **Deploy**:
   ```bash
   eb deploy
   ```

## Continuous Integration/Continuous Deployment (CI/CD)

For automated deployments, consider setting up CI/CD:

### With GitHub Actions:

1. Create a `.github/workflows/deploy.yml` file in your repository
2. Configure the workflow to deploy on pushes to the main branch
3. Use secrets for storing sensitive information like API keys

### With CircleCI:

1. Create a `.circleci/config.yml` file in your repository
2. Configure the CircleCI pipeline to build and deploy your application
3. Set up environment variables in the CircleCI project settings

## Troubleshooting

If you encounter issues during deployment:

1. **Vercel Python Integration**:
   - If Python scripts are not executing, check Vercel logs
   - Consider refactoring to use Vercel Functions for Python script execution

2. **Missing dependencies**:
   - Ensure all dependencies are properly listed in `package.json` and `requirements.txt`
   - Check for version compatibility issues

3. **Environment variables**:
   - Verify that all required environment variables are correctly set
   - Check for typos or case sensitivity issues

4. **Build errors**:
   - Review build logs for specific error messages
   - Test the build process locally before deploying

## Monitoring and Maintenance

After deployment:

1. Set up monitoring for your application
2. Regularly update dependencies
3. Monitor OpenAI API usage to avoid unexpected costs

## Need Help?

If you need assistance with deployment, contact the development team or open an issue on GitHub. 