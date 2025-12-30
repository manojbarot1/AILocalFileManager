"""
Core file analysis service using AI
"""

import os
import hashlib
from pathlib import Path
from typing import Optional, Dict, List
from dataclasses import dataclass
from datetime import datetime
import asyncio
import logging

import magic
from PIL import Image

from app.config import settings
from app.services.ai_engine import AIEngine
from app.utils.file_utils import (
    get_file_size,
    extract_file_metadata,
    get_file_hash,
    extract_text_from_pdf,
)

logger = logging.getLogger(__name__)


@dataclass
class FileAnalysis:
    """Result of analyzing a single file"""
    path: str
    filename: str
    file_type: str
    size: int
    created_at: datetime
    modified_at: datetime
    mime_type: str
    hash: str
    
    # Content analysis
    content_summary: str
    content_type: str  # "text", "image", "document", "media", "archive", "unknown"
    
    # AI suggestions
    suggested_name: str
    suggested_category: str
    suggested_tags: List[str]
    confidence_score: float
    reasoning: str


class FileAnalyzer:
    """
    Main file analyzer - combines traditional file analysis with AI understanding
    
    Unlike LlamaFS which only summarizes content, AILocalFileManager:
    1. Extracts comprehensive metadata
    2. Analyzes content type and patterns
    3. Detects relationships between files
    4. Provides confidence scores
    5. Offers multiple naming suggestions
    """
    
    def __init__(self):
        self.ai_engine = AIEngine()
        self.logger = logger
    
    async def analyze_file(self, file_path: str) -> Optional[FileAnalysis]:
        """
        Analyze a single file
        
        Args:
            file_path: Full path to the file
        
        Returns:
            FileAnalysis object or None if analysis fails
        """
        try:
            path = Path(file_path)
            
            if not path.exists():
                self.logger.error(f"File not found: {file_path}")
                return None
            
            if path.is_dir():
                self.logger.warning(f"Skipping directory: {file_path}")
                return None
            
            # Get basic file information
            filename = path.name
            file_size = get_file_size(file_path)
            
            # Check file size limit
            if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                self.logger.warning(f"File too large, skipping: {filename}")
                return None
            
            # Get file metadata
            stat_info = path.stat()
            created_at = datetime.fromtimestamp(stat_info.st_ctime)
            modified_at = datetime.fromtimestamp(stat_info.st_mtime)
            
            # Detect file type
            mime_type = magic.from_file(file_path, mime=True)
            content_type = self._classify_content_type(path.suffix, mime_type)
            
            # Calculate file hash
            file_hash = get_file_hash(file_path) if settings.ENABLE_HASH_CHECKING else ""
            
            # Extract content based on type
            content_summary = await self._extract_content(file_path, content_type)
            
            # Get AI suggestions
            ai_suggestion = await self.ai_engine.suggest_organization(
                filename=filename,
                content_summary=content_summary,
                file_type=content_type,
                size=file_size,
                mime_type=mime_type,
                modified_date=modified_at,
            )
            
            return FileAnalysis(
                path=str(path),
                filename=filename,
                file_type=path.suffix.lower(),
                size=file_size,
                created_at=created_at,
                modified_at=modified_at,
                mime_type=mime_type,
                hash=file_hash,
                content_summary=content_summary,
                content_type=content_type,
                suggested_name=ai_suggestion.get("suggested_name", filename),
                suggested_category=ai_suggestion.get("suggested_category", "misc"),
                suggested_tags=ai_suggestion.get("suggested_tags", []),
                confidence_score=ai_suggestion.get("confidence", 0.5),
                reasoning=ai_suggestion.get("reasoning", ""),
            )
        
        except Exception as e:
            self.logger.error(f"Error analyzing file {file_path}: {str(e)}", exc_info=True)
            return None
    
    async def analyze_directory(
        self,
        directory_path: str,
        recursive: bool = True,
        include_patterns: Optional[List[str]] = None,
    ) -> List[FileAnalysis]:
        """
        Analyze all files in a directory
        
        Args:
            directory_path: Path to directory
            recursive: Whether to scan subdirectories
            include_patterns: File patterns to include (if None, include all supported)
        
        Returns:
            List of FileAnalysis objects
        """
        try:
            dir_path = Path(directory_path)
            
            if not dir_path.exists() or not dir_path.is_dir():
                self.logger.error(f"Invalid directory: {directory_path}")
                return []
            
            # Get all files
            if recursive:
                files = list(dir_path.rglob("*"))
            else:
                files = list(dir_path.glob("*"))
            
            # Filter files
            files = [f for f in files if f.is_file()]
            
            if include_patterns:
                supported_exts = include_patterns
            else:
                supported_exts = settings.get_supported_extensions()
            
            files = [f for f in files if f.suffix.lower() in supported_exts]
            
            self.logger.info(f"Analyzing {len(files)} files from {directory_path}")
            
            # Analyze files in batches with progress
            analyses = []
            for i, file_path in enumerate(files, 1):
                if i % 10 == 0:
                    self.logger.info(f"Progress: {i}/{len(files)}")
                
                analysis = await self.analyze_file(str(file_path))
                if analysis:
                    analyses.append(analysis)
            
            self.logger.info(f"Successfully analyzed {len(analyses)} files")
            return analyses
        
        except Exception as e:
            self.logger.error(f"Error analyzing directory {directory_path}: {str(e)}", exc_info=True)
            return []
    
    async def _extract_content(self, file_path: str, content_type: str) -> str:
        """
        Extract content from file based on type
        
        Different from LlamaFS: we analyze actual content type intelligently
        """
        try:
            path = Path(file_path)
            
            if content_type == "text":
                # Read text file
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read(1000)  # First 1000 chars
                return f"Text file: {content[:200]}"
            
            elif content_type == "document":
                # Extract from PDF
                if path.suffix.lower() == ".pdf":
                    return extract_text_from_pdf(file_path, max_pages=2)
                return "Document file"
            
            elif content_type == "image":
                # Analyze image
                try:
                    img = Image.open(file_path)
                    return f"Image: {img.width}x{img.height}, {img.format}"
                except:
                    return "Image file"
            
            elif content_type == "media":
                # Media file info
                return f"Media file: {path.suffix.lower()}"
            
            elif content_type == "archive":
                return f"Archive: {path.suffix.lower()}"
            
            else:
                return f"File type: {path.suffix.lower()}"
        
        except Exception as e:
            self.logger.warning(f"Could not extract content from {file_path}: {str(e)}")
            return f"File: {path.name}"
    
    @staticmethod
    def _classify_content_type(file_ext: str, mime_type: str) -> str:
        """
        Classify file content type
        
        More granular than LlamaFS
        """
        file_ext = file_ext.lower()
        
        # Text documents
        if file_ext in [".txt", ".md", ".csv", ".json", ".xml", ".yaml"]:
            return "text"
        
        # Documents
        if file_ext in [".pdf", ".docx", ".doc", ".xlsx", ".pptx"]:
            return "document"
        
        # Images
        if file_ext in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"]:
            return "image"
        
        # Video/Audio
        if file_ext in [".mp4", ".avi", ".mkv", ".mov", ".webm"]:
            return "media"
        if file_ext in [".mp3", ".wav", ".flac", ".aac", ".m4a"]:
            return "media"
        
        # Archives
        if file_ext in [".zip", ".rar", ".7z", ".tar", ".gz"]:
            return "archive"
        
        # Code
        if file_ext in [".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs"]:
            return "code"
        
        # Check MIME type
        if "text" in mime_type:
            return "text"
        if "image" in mime_type:
            return "image"
        if "video" in mime_type or "audio" in mime_type:
            return "media"
        
        return "unknown"
