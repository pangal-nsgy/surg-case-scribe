#!/usr/bin/env python3
"""
OpenAI client for CPT code prediction.
"""
import os
import logging
import json
from typing import List, Dict, Any, Optional, Union
import pandas as pd
import openai
from openai import OpenAI

logger = logging.getLogger(__name__)

class OpenAIClient:
    """Client for OpenAI API to predict CPT codes for surgical procedures."""
    
    def __init__(self):
        """Initialize OpenAI client."""
        # Check if API key is available
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY environment variable not set")
        
        # Initialize client
        self.client = OpenAI(api_key=api_key)
        
        # Set up model configuration
        self.model = "gpt-4"
        self.temperature = 0.0
        
        # Load CPT code reference
        self.cpt_codes = self._load_cpt_codes()
    
    def _load_cpt_codes(self) -> List[Dict[str, str]]:
        """
        Load CPT codes from reference file.
        
        Returns:
            List[Dict[str, str]]: List of CPT codes
        """
        try:
            cpt_codes_file = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "app", "data", "cpt_codes_reference.csv"
            )
            if not os.path.exists(cpt_codes_file):
                logger.warning(f"CPT codes reference file not found: {cpt_codes_file}")
                return []
            
            df = pd.read_csv(cpt_codes_file)
            return df.to_dict(orient="records")
        except Exception as e:
            logger.error(f"Error loading CPT codes: {str(e)}")
            return []
    
    def predict_cpt_code(self, procedure_description: str, 
                         hospital: Optional[str] = None, 
                         attending: Optional[str] = None) -> Dict[str, Any]:
        """
        Predict CPT code for a surgical procedure.
        
        Args:
            procedure_description (str): Description of the procedure
            hospital (Optional[str]): Hospital where the procedure was performed
            attending (Optional[str]): Attending physician
            
        Returns:
            Dict[str, Any]: Predicted CPT code, description, and confidence
        """
        try:
            # Create the prompt
            prompt = self._create_prompt(procedure_description, hospital, attending)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                messages=[
                    {"role": "system", "content": "You are a medical coding expert specializing in CPT code assignment for surgical procedures."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            content = response.choices[0].message.content
            result = json.loads(content)
            
            return {
                "predicted_cpt_code": result.get("cpt_code", ""),
                "cpt_description": result.get("description", ""),
                "confidence": float(result.get("confidence", 0.0)),
                "explanation": result.get("explanation", "")
            }
            
        except Exception as e:
            logger.error(f"Error predicting CPT code: {str(e)}")
            return {
                "predicted_cpt_code": "",
                "cpt_description": "",
                "confidence": 0.0,
                "explanation": f"Error: {str(e)}"
            }
    
    def _create_prompt(self, procedure_description: str, 
                       hospital: Optional[str] = None, 
                       attending: Optional[str] = None) -> str:
        """
        Create a prompt for the OpenAI API.
        
        Args:
            procedure_description (str): Description of the procedure
            hospital (Optional[str]): Hospital where the procedure was performed
            attending (Optional[str]): Attending physician
            
        Returns:
            str: Prompt for the OpenAI API
        """
        # Create a string representation of available CPT codes
        cpt_codes_str = ""
        for code in self.cpt_codes[:30]:  # Limit to first 30 codes to avoid token limit
            cpt_codes_str += f"Code: {code['code']}, Description: {code['description']}, Category: {code['category']}\n"
        
        # Additional context from hospital and attending
        additional_context = ""
        if hospital:
            additional_context += f"Hospital: {hospital}\n"
        if attending:
            additional_context += f"Attending Physician: {attending}\n"
        
        prompt = f"""
Please determine the most appropriate CPT code for the following surgical procedure:

Procedure Description: {procedure_description}
{additional_context}

Here are some common CPT codes for reference:
{cpt_codes_str}

Based on the procedure description, please determine the most appropriate CPT code. 
If you can't find an exact match in the reference list, identify the closest match or suggest an appropriate code based on your knowledge.

Respond with a JSON object containing:
1. The CPT code (cpt_code)
2. The description of the code (description)
3. Your confidence in this assignment from 0.0 to 1.0 (confidence)
4. A brief explanation of why this code is appropriate (explanation)
"""
        return prompt
    
    def process_cases_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Process a DataFrame of surgical cases to determine CPT codes.
        
        Args:
            df (pd.DataFrame): DataFrame of surgical cases
            
        Returns:
            pd.DataFrame: DataFrame with predicted CPT codes
        """
        # Create a copy of the DataFrame
        result_df = df.copy()
        
        # Process each row
        for idx, row in df.iterrows():
            procedure_type = row.get('procedure_type', '')
            hospital = row.get('hospital', None)
            attending = row.get('attending', None)
            
            # Skip if no procedure description
            if not procedure_type or pd.isna(procedure_type):
                result_df.loc[idx, 'predicted_cpt_code'] = ""
                result_df.loc[idx, 'cpt_description'] = ""
                result_df.loc[idx, 'confidence'] = 0.0
                continue
                
            # Check if CPT code is already present
            existing_cpt = row.get('cpt_code', '')
            if existing_cpt and not pd.isna(existing_cpt):
                # Validate existing CPT code
                result_df.loc[idx, 'predicted_cpt_code'] = existing_cpt
                
                # Try to find the description
                for code in self.cpt_codes:
                    if str(code['code']) == str(existing_cpt):
                        result_df.loc[idx, 'cpt_description'] = code['description']
                        result_df.loc[idx, 'confidence'] = 1.0
                        break
                continue
                
            # Predict CPT code
            prediction = self.predict_cpt_code(procedure_type, hospital, attending)
            
            # Update the DataFrame
            result_df.loc[idx, 'predicted_cpt_code'] = prediction['predicted_cpt_code']
            result_df.loc[idx, 'cpt_description'] = prediction['cpt_description']
            result_df.loc[idx, 'confidence'] = prediction['confidence']
        
        return result_df 