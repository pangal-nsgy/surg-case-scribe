# Surgical Case Scribe

A modern web application to help surgeons and medical residents automate CPT code identification for their case logs.

## Features

- **Smart CSV Upload**: Upload your case logs in CSV format with any column structure
- **AI-Powered Column Standardization**: Automatically identifies and maps your custom column names to standardized formats
- **Intelligent Date Parsing**: Handles various date formats and intelligently converts them to a standardized format
- **CPT Code Prediction**: Predicts the most likely CPT codes for surgical procedures based on descriptions
- **Modern User Interface**: Clean, responsive design built with Next.js and Tailwind CSS

## Technologies Used

- **Frontend**: Next.js with TypeScript, React, Tailwind CSS
- **Backend Hybrid**: 
  - Next.js API routes for file handling and integration
  - Python scripts for advanced data processing and AI tasks
- **AI/ML**: OpenAI API for natural language processing and code prediction
- **Data Processing**: Custom CSV parsing and standardization tools

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- pip (for Python dependencies)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/surg-case-scribe.git
   cd surg-case-scribe
   ```

2. Install JavaScript dependencies
   ```bash
   npm install
   ```

3. Set up Python environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Set up environment variables
   - Create a `.env.local` file in the root directory
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000` in your browser

## How It Works

1. **Upload**: User uploads a CSV file with surgical case data
2. **Standardization**: The system analyzes column names and maps them to standard formats
3. **Data Processing**: Dates, procedure names, and other data are cleaned and standardized
4. **CPT Code Prediction**: The system uses AI to determine the most likely CPT codes for each procedure
5. **Results**: The user receives standardized data with predicted CPT codes

## Future Enhancements

- Direct integration with ACGME case log system
- Specialty-specific CPT code prediction
- Historical analytics and reporting
- Bulk processing of multiple files
- User accounts for saving and reviewing past uploads

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their powerful language model APIs
- Medical professionals who provided domain expertise and testing feedback
