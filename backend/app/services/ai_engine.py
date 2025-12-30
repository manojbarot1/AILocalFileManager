"""
AI Engine Service
Handles all AI operations using local Ollama
"""

import json
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = logging.getLogger(__name__)


class AIEngine:
    """
    AI Engine using Ollama for local, private inference
    
    Key differences from LlamaFS:
    1. Structured outputs with confidence scoring
    2. Multi-dimensional analysis (not just content summary)
    3. Relationship detection between files
    4. Customizable prompts based on file type
    5. Local processing guarantee (no cloud fallback)
    """
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
        self.max_tokens = settings.MAX_TOKENS
        self.temperature = settings.TEMPERATURE
    
    async def health_check(self) -> bool:
        """Check if Ollama is running and model is available"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    models = [m["name"] for m in data.get("models", [])]
                    logger.info(f"Available Ollama models: {models}")
                    
                    if self.model not in models:
                        logger.warning(f"Model {self.model} not found. Pulling...")
                        await self._pull_model()
                    
                    return True
        except Exception as e:
            logger.error(f"Ollama health check failed: {str(e)}")
            return False
        
        return False
    
    async def _pull_model(self):
        """Pull model from Ollama registry if not available"""
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/pull",
                    json={"name": self.model},
                ) as response:
                    async for line in response.aiter_lines():
                        if line:
                            logger.debug(f"Pull progress: {line}")
        except Exception as e:
            logger.error(f"Failed to pull model {self.model}: {str(e)}")
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _query_ollama(self, prompt: str, system_prompt: str = "") -> str:
        """
        Query Ollama with retry logic
        
        Different from LlamaFS: uses structured prompts for consistent JSON output
        """
        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "system": system_prompt,
                        "stream": False,
                        "temperature": self.temperature,
                        "num_predict": self.max_tokens,
                        "top_k": 40,
                        "top_p": 0.9,
                    },
                    timeout=self.timeout,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", "").strip()
                else:
                    raise Exception(f"Ollama returned {response.status_code}")
        
        except asyncio.TimeoutError:
            logger.error("Ollama request timed out")
            raise
        except Exception as e:
            logger.error(f"Ollama query failed: {str(e)}")
            raise
    
    async def suggest_organization(
        self,
        filename: str,
        content_summary: str,
        file_type: str,
        size: int,
        mime_type: str,
        modified_date: datetime,
    ) -> Dict:
        """
        Get AI suggestion for file organization
        
        Returns structured suggestion with confidence score
        """
        
        # Build context-aware system prompt
        system_prompt = self._build_system_prompt(file_type)
        
        # Build detailed prompt
        prompt = f"""Analyze this file and suggest how to organize it.

FILE DETAILS:
- Filename: {filename}
- Type: {file_type}
- MIME Type: {mime_type}
- Size: {size} bytes
- Last Modified: {modified_date.isoformat()}
- Content: {content_summary}

Respond in JSON format with:
{{
  "suggested_name": "descriptive_filename.ext",
  "suggested_category": "category_name",
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.95,
  "reasoning": "brief explanation"
}}

Ensure the suggested name is:
- Descriptive but concise
- Following naming conventions for the file type
- Including relevant metadata (date, version, etc. if applicable)
"""
        
        try:
            response = await self._query_ollama(prompt, system_prompt)
            
            # Parse JSON response
            suggestion = self._parse_json_response(response)
            
            if suggestion:
                return suggestion
            else:
                logger.warning(f"Could not parse AI response for {filename}")
                return self._default_suggestion(filename, file_type)
        
        except Exception as e:
            logger.error(f"AI suggestion failed for {filename}: {str(e)}")
            return self._default_suggestion(filename, file_type)
    
    async def batch_analyze(
        self,
        files: List[Dict],
        group_related: bool = True,
    ) -> Dict:
        """
        Analyze multiple files for relationship detection
        
        Key feature not in LlamaFS: detects relationships between files
        """
        
        if not files:
            return {"groups": [], "relationships": []}
        
        # Build batch prompt
        file_list = "\n".join([
            f"- {f['filename']} ({f['content_type']}): {f['content_summary'][:100]}"
            for f in files[:20]  # Limit for performance
        ])
        
        prompt = f"""Analyze these files and group related ones together:

FILES:
{file_list}

Respond in JSON format:
{{
  "groups": [
    {{
      "name": "group_name",
      "files": ["filename1", "filename2"],
      "suggested_folder": "folder_name",
      "reasoning": "why grouped"
    }}
  ],
  "relationships": [
    {{
      "file1": "filename1",
      "file2": "filename2",
      "relationship": "related_type",
      "confidence": 0.8
    }}
  ]
}}
"""
        
        try:
            response = await self._query_ollama(prompt)
            groups_data = self._parse_json_response(response)
            return groups_data or {"groups": [], "relationships": []}
        except Exception as e:
            logger.error(f"Batch analysis failed: {str(e)}")
            return {"groups": [], "relationships": []}
    
    @staticmethod
    def _build_system_prompt(file_type: str) -> str:
        """Build context-aware system prompt based on file type"""
        
        base_prompt = """You are an expert file organization assistant. 
Your job is to suggest optimal file naming and organization strategies.
Focus on clarity, discoverability, and following industry conventions.
Always respond with valid JSON."""
        
        type_specific = {
            "image": "For images, include relevant metadata like date, subject, resolution in the name.",
            "document": "For documents, include version, date, and document type.",
            "media": "For media files, include format, duration, and content type when relevant.",
            "archive": "For archives, include version and content type indicators.",
            "code": "For code files, include language and module/purpose.",
            "text": "For text files, include topic and date if relevant.",
        }
        
        system_prompt = base_prompt
        if file_type in type_specific:
            system_prompt += f"\n{type_specific[file_type]}"
        
        return system_prompt
    
    @staticmethod
    def _parse_json_response(response: str) -> Optional[Dict]:
        """Safely parse JSON from AI response"""
        try:
            # Try to find JSON in response
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse error: {str(e)}")
            return None
        
        return None
    
    @staticmethod
    def _default_suggestion(filename: str, file_type: str) -> Dict:
        """
        Provide default suggestion when AI fails
        
        Ensures graceful degradation
        """
        category_map = {
            "image": "Images",
            "document": "Documents",
            "media": "Media",
            "archive": "Archives",
            "code": "Code",
            "text": "Documents",
        }
        
        return {
            "suggested_name": filename,
            "suggested_category": category_map.get(file_type, "Misc"),
            "suggested_tags": [file_type],
            "confidence": 0.3,
            "reasoning": "Default suggestion (AI unavailable)",
        }
