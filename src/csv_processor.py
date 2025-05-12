#!/usr/bin/env python3
"""
CSV Processor for surgical case logs.
"""
import os
import logging
from typing import List, Dict, Any, Optional, Union
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

class CSVProcessor:
    """Class for processing CSV files containing surgical case logs."""
    
    def __init__(self):
        """Initialize CSV processor."""
        self.standardized_columns = [
            'procedure_type',
            'procedure_date',
            'patient_id',
            'hospital',
            'attending',
            'cpt_code',
            'predicted_cpt_code',
            'cpt_description',
            'confidence'
        ]
    
    def read_csv(self, file_path: str) -> pd.DataFrame:
        """
        Read a CSV file and standardize the format.
        
        Args:
            file_path (str): Path to the CSV file
            
        Returns:
            pd.DataFrame: Standardized DataFrame
        """
        try:
            # Read the CSV file
            df = pd.read_csv(file_path)
            
            # Log the original columns
            logger.info(f"Original columns: {df.columns.tolist()}")
            
            # Standardize the column names (lowercase, replace spaces with underscores)
            df.columns = [col.lower().replace(' ', '_') for col in df.columns]
            
            # Map common column names to our standardized format
            column_mapping = {
                # Procedure type variations
                'procedure': 'procedure_type',
                'procedure_name': 'procedure_type',
                'description': 'procedure_type',
                'case_description': 'procedure_type',
                'operation': 'procedure_type',
                'surgery': 'procedure_type',
                
                # Date variations
                'date': 'procedure_date',
                'case_date': 'procedure_date',
                'surgery_date': 'procedure_date',
                'dos': 'procedure_date',
                
                # Patient ID variations
                'patient': 'patient_id',
                'pt_id': 'patient_id',
                'mrn': 'patient_id',
                'patient_mrn': 'patient_id',
                
                # Hospital variations
                'facility': 'hospital',
                'location': 'hospital',
                'site': 'hospital',
                
                # Attending variations
                'attending_physician': 'attending',
                'surgeon': 'attending',
                'provider': 'attending',
                'attending_surgeon': 'attending',
                
                # CPT code variations
                'cpt': 'cpt_code',
                'cpt_codes': 'cpt_code',
                'code': 'cpt_code'
            }
            
            # Apply the mapping
            for old_col, new_col in column_mapping.items():
                if old_col in df.columns and new_col not in df.columns:
                    df[new_col] = df[old_col]
            
            # Create empty columns for any missing standardized columns
            for col in self.standardized_columns:
                if col not in df.columns:
                    df[col] = np.nan
            
            # Generate a random patient identifier if none exists
            if df['patient_id'].isna().all():
                import uuid
                df['patient_id'] = [f"PT{uuid.uuid4().hex[:8]}" for _ in range(len(df))]
            elif not df['patient_id'].isna().all():
                # Anonymize existing patient IDs by hashing them
                import hashlib
                df['patient_id'] = df['patient_id'].apply(
                    lambda x: f"PT{hashlib.md5(str(x).encode()).hexdigest()[:8]}" if pd.notna(x) else f"PT{uuid.uuid4().hex[:8]}"
                )
            
            # Convert date format if present
            if not df['procedure_date'].isna().all():
                try:
                    df['procedure_date'] = pd.to_datetime(df['procedure_date']).dt.strftime('%Y-%m-%d')
                except:
                    logger.warning("Could not convert procedure_date to datetime format")
            
            # Return the DataFrame with only our standardized columns
            return df[self.standardized_columns]
            
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            raise
    
    def write_csv(self, df: pd.DataFrame, output_path: str) -> str:
        """
        Write the processed DataFrame to a CSV file.
        
        Args:
            df (pd.DataFrame): DataFrame to write
            output_path (str): Path to write the CSV file
            
        Returns:
            str: Path to the written CSV file
        """
        try:
            # Make sure the output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Write the DataFrame to CSV
            df.to_csv(output_path, index=False)
            
            return output_path
        except Exception as e:
            logger.error(f"Error writing CSV file: {str(e)}")
            raise
    
    def extract_data_for_cpt_prediction(self, row: pd.Series) -> Dict[str, Any]:
        """
        Extract relevant data from a row for CPT code prediction.
        
        Args:
            row (pd.Series): A row from the DataFrame
            
        Returns:
            Dict[str, Any]: Data for CPT code prediction
        """
        data = {
            'procedure_type': row.get('procedure_type', ''),
            'hospital': row.get('hospital', ''),
            'attending': row.get('attending', '')
        }
        return {k: v for k, v in data.items() if pd.notna(v) and v != ''} 