#!/usr/bin/env python3
"""
Standalone script for standardizing CSV columns using the OpenAI API.
This script takes a sample CSV file and uses AI to map columns to a standardized format.
"""
import os
import sys
import json
import argparse
import pandas as pd
import numpy as np
import re
import datetime
from dateutil import parser
from dotenv import load_dotenv
from openai import OpenAI

def setup_logging():
    """Set up basic logging for the script."""
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

logger = setup_logging()

class ColumnStandardizer:
    """Class for standardizing CSV columns using OpenAI."""
    
    def __init__(self):
        """Initialize the column standardizer."""
        # Define the standard columns we want to map to
        self.standardized_columns = [
            'procedure_type',
            'procedure_date',
            'patient_id',
            'hospital',
            'attending',
            'cpt_code'
        ]
        
        # Define descriptions for each column to help the AI understand
        self.column_descriptions = {
            'procedure_type': 'Description of the surgical procedure performed',
            'procedure_date': 'Date when the procedure was performed',
            'patient_id': 'Patient identifier or medical record number',
            'hospital': 'Hospital or facility where the procedure was performed',
            'attending': 'Attending physician or surgeon name',
            'cpt_code': 'CPT code for the procedure (if already known)'
        }
        
        # Get the current year for date processing
        self.current_year = datetime.datetime.now().year
        
        # Set a default year for all dates in the dataset if not specified
        self.default_year = 2023  # Adjust as needed
        
    def standardize_csv(self, input_file, output_file=None, use_ai=True):
        """
        Standardize a CSV file using OpenAI for column mapping.
        
        Args:
            input_file (str): Path to the input CSV file
            output_file (str, optional): Path to save the standardized CSV
            use_ai (bool): Whether to use AI for mapping or use basic rules
            
        Returns:
            pd.DataFrame: Standardized DataFrame
        """
        # Read the CSV file
        try:
            df = pd.read_csv(input_file)
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            raise
            
        logger.info(f"Original columns: {df.columns.tolist()}")
        print(f"Original columns: {df.columns.tolist()}")
        print(f"First row sample: \n{df.iloc[0]}")
        
        # Map columns using AI or basic rules
        if use_ai:
            try:
                # Initialize OpenAI client
                api_key = os.environ.get("OPENAI_API_KEY")
                if not api_key:
                    raise ValueError("OPENAI_API_KEY environment variable not set")
                    
                openai_client = OpenAI(api_key=api_key)
                column_mapping = self._ai_map_columns(df.columns.tolist(), openai_client)
                print("Using AI-based column mapping")
            except Exception as e:
                logger.error(f"AI mapping failed: {str(e)}")
                print(f"AI mapping failed: {str(e)}")
                print("Falling back to basic mapping")
                column_mapping = self._basic_map_columns(df.columns.tolist())
        else:
            column_mapping = self._basic_map_columns(df.columns.tolist())
            print("Using basic column mapping")
            
        # Apply the mapping to create a standardized DataFrame
        standardized_df = self._apply_column_mapping(df, column_mapping)
        
        # Add empty columns for any missing standardized columns
        for col in self.standardized_columns:
            if col not in standardized_df.columns:
                standardized_df[col] = np.nan
                
        # Generate a random patient identifier if none exists
        if standardized_df['patient_id'].isna().all():
            import uuid
            standardized_df['patient_id'] = [f"PT{uuid.uuid4().hex[:8]}" for _ in range(len(standardized_df))]
            
        # Standardize patient IDs by removing non-alphanumeric characters
        if not standardized_df['patient_id'].isna().all():
            standardized_df['patient_id'] = standardized_df['patient_id'].apply(
                lambda x: self._standardize_patient_id(x) if pd.notna(x) else None
            )
        
        # Convert date format if present - with enhanced date parsing
        if not standardized_df['procedure_date'].isna().all():
            standardized_df['procedure_date'] = standardized_df['procedure_date'].apply(
                lambda x: self._standardize_date(x) if pd.notna(x) else None
            )
                
        # Standardize procedure descriptions
        if not standardized_df['procedure_type'].isna().all():
            standardized_df['procedure_type'] = standardized_df['procedure_type'].apply(
                lambda x: self._standardize_procedure(x) if pd.notna(x) else None
            )
            
        # Standardize hospital names
        if not standardized_df['hospital'].isna().all():
            standardized_df['hospital'] = standardized_df['hospital'].apply(
                lambda x: self._standardize_hospital(x) if pd.notna(x) else None
            )
            
        # Standardize attending names
        if not standardized_df['attending'].isna().all():
            standardized_df['attending'] = standardized_df['attending'].apply(
                lambda x: self._standardize_attending(x) if pd.notna(x) else None
            )
                
        # Save the standardized DataFrame if output_file is provided
        if output_file:
            try:
                standardized_df.to_csv(output_file, index=False)
                print(f"Standardized CSV saved to {output_file}")
            except Exception as e:
                logger.error(f"Error saving CSV file: {str(e)}")
                
        return standardized_df
        
    def _standardize_date(self, date_str):
        """
        Standardize date to YYYY-MM-DD format using flexible date parsing.
        
        Args:
            date_str: Date string in any format
            
        Returns:
            str: Standardized date in YYYY-MM-DD format
        """
        try:
            date_str = str(date_str).strip()
            
            # Check if we only have a month/day pattern without year
            if re.match(r'^(\d{1,2})[/\-\.](\d{1,2})$', date_str):
                # Add the default year
                date_str = f"{date_str}/{self.default_year}"
            
            # Check for patterns like "May 30" without year
            if re.match(r'^[A-Za-z]{3,9}\s+\d{1,2}$', date_str):
                # Add the default year
                date_str = f"{date_str}, {self.default_year}"
                
            # Handle formats like "5/12/23" with two-digit year
            if re.match(r'^\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2}$', date_str):
                # Extract parts based on the separator used
                separator = '/' if '/' in date_str else ('-' if '-' in date_str else '.')
                parts = date_str.split(separator)
                
                if len(parts) == 3 and len(parts[2]) == 2:
                    # Add century to two-digit year
                    century = '20' if int(parts[2]) < 50 else '19'
                    date_str = f"{parts[0]}{separator}{parts[1]}{separator}{century}{parts[2]}"
            
            # Use dateutil parser for flexible parsing
            parsed_date = parser.parse(date_str, dayfirst=False, yearfirst=False)
            
            # Validate the year is reasonable
            if parsed_date.year > self.current_year:
                # Likely a two-digit year that was parsed as future
                parsed_date = parsed_date.replace(year=self.default_year)
            
            return parsed_date.strftime('%Y-%m-%d')
        except Exception as e:
            logger.warning(f"Could not parse date '{date_str}': {str(e)}")
            return f"{self.default_year}-01-01"  # Return default date if parsing fails
            
    def _standardize_patient_id(self, patient_id):
        """
        Standardize patient ID format.
        
        Args:
            patient_id: Original patient ID
            
        Returns:
            str: Standardized patient ID
        """
        # Convert to string if not already
        patient_id = str(patient_id).strip()
        
        # If ID contains non-alphanumeric characters, clean it up
        if re.search(r'[^a-zA-Z0-9]', patient_id):
            # Extract alphanumeric parts
            alphanumeric = re.sub(r'[^a-zA-Z0-9]', '', patient_id)
            
            # Ensure ID starts with PT
            if not alphanumeric.upper().startswith('PT') and not alphanumeric.upper().startswith('RHC'):
                return f"PT{alphanumeric}"
            return alphanumeric
        
        # Ensure ID starts with PT if it doesn't already
        if not patient_id.upper().startswith('PT') and not patient_id.upper().startswith('RHC'):
            return f"PT{patient_id}"
            
        return patient_id
        
    def _standardize_procedure(self, procedure):
        """
        Standardize procedure description.
        
        Args:
            procedure: Original procedure description
            
        Returns:
            str: Standardized procedure description
        """
        # Convert common abbreviations
        procedure = str(procedure).strip()
        
        # Dictionary of common surgical abbreviations to expanded forms
        abbr_dict = {
            'LAP APPY': 'Laparoscopic appendectomy',
            'LAP CHOLE': 'Laparoscopic cholecystectomy',
            'TKA': 'Total knee arthroplasty',
            'TKA - LT': 'Total knee arthroplasty, left',
            'TKA - RT': 'Total knee arthroplasty, right',
            'THA': 'Total hip arthroplasty',
            'CABG': 'Coronary artery bypass graft',
            'ESS': 'Endoscopic sinus surgery',
            'EXP LAP': 'Exploratory laparotomy',
            'SB RESECTION': 'Small bowel resection',
            'TURP': 'Transurethral resection of prostate',
            'ARTHRO RTC REP': 'Arthroscopic rotator cuff repair',
            'CRANIO': 'Craniotomy',
            'BT': 'Brain tumor',
            'C-SECTION': 'Cesarean section'
        }
        
        # Try exact match first
        if procedure in abbr_dict:
            return abbr_dict[procedure]
            
        # Check for partial matches
        for abbr, expanded in abbr_dict.items():
            if abbr in procedure:
                # Replace the abbreviation with expanded form
                return procedure.replace(abbr, expanded)
                
        return procedure
        
    def _standardize_hospital(self, hospital):
        """
        Standardize hospital name.
        
        Args:
            hospital: Original hospital name
            
        Returns:
            str: Standardized hospital name
        """
        hospital = str(hospital).strip()
        
        # Dictionary of common hospital abbreviations
        hosp_dict = {
            'UNIV-HOSP': 'University Hospital',
            'UNIV': 'University',
            'MEM': 'Memorial',
            'CTR': 'Center',
            'NEURO': 'Neuroscience Center',
            'URO INST': 'Urology Institute',
            'WOMENS': "Women's Hospital",
            'SPORTS MED': 'Sports Medicine Center',
            'GENERAL': 'General Hospital',
            'ENT SPECIALISTS': 'ENT Specialists'
        }
        
        # Check for exact matches first (case-insensitive)
        hospital_upper = hospital.upper()
        if hospital_upper in hosp_dict:
            return hosp_dict[hospital_upper]
            
        # Check for partial matches
        result = hospital
        for abbr, expanded in hosp_dict.items():
            if abbr in hospital_upper:
                # Replace the abbreviation with expanded form
                result = result.upper().replace(abbr, expanded)
                
        # Clean up any repeated words (like "Specialists Specialists")
        words = result.split()
        cleaned_words = []
        for i, word in enumerate(words):
            if i == 0 or word.lower() != words[i-1].lower():
                cleaned_words.append(word)
                
        result = ' '.join(cleaned_words)
        
        # Title case the result
        return result.title()
        
    def _standardize_attending(self, attending):
        """
        Standardize attending physician name.
        
        Args:
            attending: Original attending name
            
        Returns:
            str: Standardized attending name
        """
        attending = str(attending).strip()
        
        # Handle format like "SMITH.J" or "JOHNSON.M"
        if re.match(r'^[A-Z]+\.[A-Z]$', attending):
            last_name, first_initial = attending.split('.')
            return f"Dr. {last_name.title()}"
            
        # If already contains "Dr." prefix, leave as is
        if attending.lower().startswith('dr.'):
            # Just ensure proper capitalization
            return attending[0].upper() + attending[1:].lower()
            
        # Add "Dr." prefix if missing
        if not attending.startswith('Dr.'):
            # Check if the format is "LastName.FirstName"
            if '.' in attending:
                parts = attending.split('.')
                if len(parts) == 2:
                    last_name = parts[0].title()
                    return f"Dr. {last_name}"
            
            # Just add "Dr." prefix
            return f"Dr. {attending.title()}"
            
        return attending
        
    def _ai_map_columns(self, original_columns, openai_client):
        """
        Use OpenAI to map original columns to standardized columns.
        
        Args:
            original_columns (list): List of original column names
            openai_client: OpenAI client instance
            
        Returns:
            dict: Mapping from original column names to standardized names
        """
        # Create a description of our standardized columns for the AI
        column_descriptions = ""
        for col, desc in self.column_descriptions.items():
            column_descriptions += f"- {col}: {desc}\n"
            
        # Example data for some common column variations to help the AI
        examples = """
        Examples of common variations:
        - "Procedure", "Surgery", "Operation", "Case Description", "SurgDesc", "Op" → "procedure_type"
        - "Date", "Surgery Date", "DOS", "Case Date", "DtProc", "Dt" → "procedure_date"
        - "Patient", "MRN", "Pt ID", "Patient MRN", "PatientNumber", "PatID" → "patient_id"
        - "Facility", "Location", "Site", "Hospital", "LocOfService", "Hosp" → "hospital"
        - "Surgeon", "Provider", "Attending Surgeon", "Attending", "SurgAttnd", "Phys" → "attending"
        - "CPT", "Code", "CPT Codes", "Billing Code" → "cpt_code"
        """
        
        # Prepare the message for OpenAI
        prompt = f"""
        I have a CSV file with surgical case data that I need to standardize. The original columns are:
        {original_columns}
        
        I need to map these columns to my standardized format with these columns:
        {column_descriptions}
        
        {examples}
        
        Please map each original column to the most appropriate standardized column based on what the column likely contains.
        If a column doesn't match any of our standardized columns, map it to null.
        Return your mapping as a JSON object where keys are the original column names and values are the standardized column names or null.
        """
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using a less expensive model for this task
            temperature=0.0,
            messages=[
                {"role": "system", "content": "You are an expert data scientist specializing in healthcare data standardization."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse the response
        content = response.choices[0].message.content
        column_mapping = json.loads(content)
        
        # Filter out null mappings
        column_mapping = {k: v for k, v in column_mapping.items() if v is not None}
        
        logger.info(f"AI-generated column mapping: {column_mapping}")
        print("AI-generated mapping:")
        for orig, std in column_mapping.items():
            print(f"  {orig} → {std}")
            
        return column_mapping
        
    def _basic_map_columns(self, original_columns):
        """
        Use basic rules to map original columns to standardized columns.
        
        Args:
            original_columns (list): List of original column names
            
        Returns:
            dict: Mapping from original column names to standardized names
        """
        # Create a mapping dictionary
        column_mapping = {}
        
        # Define common variations of column names
        basic_mapping = {
            # Procedure type variations
            'procedure': 'procedure_type',
            'procedure name': 'procedure_type',
            'description': 'procedure_type',
            'case description': 'procedure_type',
            'operation': 'procedure_type',
            'operation description': 'procedure_type',
            'surgery': 'procedure_type',
            'surgdesc': 'procedure_type',
            'op': 'procedure_type',
            
            # Date variations
            'date': 'procedure_date',
            'case date': 'procedure_date',
            'surgery date': 'procedure_date',
            'dos': 'procedure_date',
            'dtproc': 'procedure_date',
            'dt': 'procedure_date',
            
            # Patient ID variations
            'patient': 'patient_id',
            'patient id': 'patient_id',
            'pt id': 'patient_id',
            'mrn': 'patient_id',
            'patient mrn': 'patient_id',
            'patientnumber': 'patient_id',
            'patid': 'patient_id',
            
            # Hospital variations
            'hospital': 'hospital',
            'facility': 'hospital',
            'location': 'hospital',
            'site': 'hospital',
            'locofservice': 'hospital',
            'hosp': 'hospital',
            
            # Attending variations
            'attending': 'attending',
            'attending physician': 'attending',
            'surgeon': 'attending',
            'provider': 'attending',
            'attending surgeon': 'attending',
            'surgattnd': 'attending',
            'operating surgeon': 'attending',
            'phys': 'attending',
            
            # CPT code variations
            'cpt': 'cpt_code',
            'cpt code': 'cpt_code',
            'cpt codes': 'cpt_code',
            'code': 'cpt_code',
            'billing code': 'cpt_code'
        }
        
        # Apply the mapping (case insensitive)
        for col in original_columns:
            # Try exact match
            if col.lower() in basic_mapping:
                column_mapping[col] = basic_mapping[col.lower()]
                continue
                
            # Try with spaces replaced by underscores
            col_with_underscores = col.lower().replace(' ', '_')
            if col_with_underscores in basic_mapping:
                column_mapping[col] = basic_mapping[col_with_underscores]
                continue
                
            # Try with underscores replaced by spaces
            col_with_spaces = col.lower().replace('_', ' ')
            if col_with_spaces in basic_mapping:
                column_mapping[col] = basic_mapping[col_with_spaces]
        
        logger.info(f"Basic column mapping: {column_mapping}")
        print("Basic mapping:")
        for orig, std in column_mapping.items():
            print(f"  {orig} → {std}")
            
        return column_mapping
        
    def _apply_column_mapping(self, df, column_mapping):
        """
        Apply the column mapping to create a standardized DataFrame.
        
        Args:
            df (pd.DataFrame): Original DataFrame
            column_mapping (dict): Mapping from original to standardized columns
            
        Returns:
            pd.DataFrame: Standardized DataFrame
        """
        # Create a new DataFrame for standardized data
        standardized_df = pd.DataFrame(index=df.index)
        
        # Apply the mapping
        for original_col, std_col in column_mapping.items():
            if original_col in df.columns and std_col not in standardized_df.columns:
                standardized_df[std_col] = df[original_col]
        
        return standardized_df

def main():
    """Main function to run the script."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Standardize CSV columns using OpenAI')
    parser.add_argument('input_file', help='Path to the input CSV file')
    parser.add_argument('--output', '-o', help='Path to save the standardized CSV (optional)')
    parser.add_argument('--no-ai', action='store_true', help='Disable AI-based mapping')
    parser.add_argument('--year', '-y', type=int, help='Default year to use for dates without year (default: 2023)')
    args = parser.parse_args()
    
    # Load environment variables from .env.local if it exists
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
    if os.path.exists(env_file):
        print(f"Loading environment variables from {env_file}")
        load_dotenv(env_file)
    else:
        print("Warning: .env.local file not found, using environment variables")
    
    # Check if OpenAI API key is set when using AI
    if not args.no_ai and not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable not set")
        print("Please set the environment variable or use --no-ai to disable AI-based mapping")
        sys.exit(1)
    
    # Set default output file if not provided
    output_file = args.output
    if not output_file:
        basename = os.path.splitext(os.path.basename(args.input_file))[0]
        output_file = f"{basename}_standardized.csv"
    
    # Standardize the CSV
    try:
        standardizer = ColumnStandardizer()
        
        # Set default year if provided
        if args.year:
            standardizer.default_year = args.year
            
        df = standardizer.standardize_csv(args.input_file, output_file, not args.no_ai)
        
        # Print the results
        print("\nStandardized DataFrame:")
        print(f"Columns: {df.columns.tolist()}")
        print(f"First row: \n{df.iloc[0]}")
        print(f"\nStandardized data saved to: {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 