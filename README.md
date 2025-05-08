# ACGME Case Log Assistant

A tool for surgical residents to automatically determine CPT codes from case logs.

## Project Overview

This application helps surgeons and residents efficiently process and organize case logs, automatically determining CPT codes using AI assistance.

## Features

- Upload case logs in CSV format
- Backend processing with FastAPI
- CPT code inference
- Modern Next.js frontend with Tailwind CSS

## Repository Structure

```
surg-case-scribe/
├── app/                  # Main application directory
│   ├── api/              # Backend FastAPI code
│   ├── data/             # CSV and data files
│   ├── frontend/         # Legacy Next.js files
│   ├── globals.css       # Global CSS styles
│   ├── layout.tsx        # App layout component
│   └── page.tsx          # Main page component
├── public/               # Static public files
├── deploy.sh             # Deployment script
├── run_app.sh            # Script to run the full application
└── run_local.sh          # Script to run locally for development
```

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/pangal-nsgy/surg-case-scribe.git
   cd surg-case-scribe
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Create a Python virtual environment and install backend dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r app/api/requirements.txt
   ```

### Running Locally

Start the development server:

```
npm run dev
```

This will start the Next.js server at http://localhost:3000.

For running the backend API:
```
cd app/api
uvicorn main:app --reload
```

### Deployment

The application is configured for deployment on Vercel.

## Git Workflow

1. Create feature branches from `main`
2. Submit PRs for code review
3. Merge to `main` after approval
4. Tag releases with semantic versioning

## License

MIT
