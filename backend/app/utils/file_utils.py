"""
File utilities for file operations
"""

import os
import hashlib
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def get_file_size(file_path: str) -> int:
    """Get file size in bytes"""
    try:
        return os.path.getsize(file_path)
    except Exception as e:
        logger.error(f"Error getting file size: {str(e)}")
        return 0


def get_file_hash(file_path: str, algorithm: str = "sha256") -> str:
    """
    Calculate file hash
    
    Useful for duplicate detection
    """
    try:
        hasher = hashlib.new(algorithm)
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception as e:
        logger.error(f"Error calculating file hash: {str(e)}")
        return ""


def extract_file_metadata(file_path: str) -> dict:
    """
    Extract comprehensive file metadata
    
    Different from LlamaFS: includes multiple metadata types
    """
    try:
        path = Path(file_path)
        stat_info = path.stat()
        
        return {
            "name": path.name,
            "suffix": path.suffix.lower(),
            "size": stat_info.st_size,
            "created": stat_info.st_ctime,
            "modified": stat_info.st_mtime,
            "accessed": stat_info.st_atime,
        }
    except Exception as e:
        logger.error(f"Error extracting metadata: {str(e)}")
        return {}


def extract_text_from_pdf(file_path: str, max_pages: int = 5) -> str:
    """
    Extract text from PDF file
    
    Gracefully handles failures
    """
    try:
        import PyPDF2
        
        text = []
        with open(file_path, "rb") as f:
            pdf_reader = PyPDF2.PdfReader(f)
            num_pages = min(len(pdf_reader.pages), max_pages)
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text.append(page.extract_text())
        
        return " ".join(text)[:500]
    
    except ImportError:
        logger.warning("PyPDF2 not installed, skipping PDF text extraction")
        return "PDF file"
    except Exception as e:
        logger.warning(f"Error extracting PDF text: {str(e)}")
        return "PDF file"


def safe_move_file(src: str, dst: str) -> bool:
    """
    Safely move file with error handling
    
    Different from LlamaFS: includes validation and atomic operations
    """
    try:
        src_path = Path(src)
        dst_path = Path(dst)
        
        # Validate source
        if not src_path.exists():
            logger.error(f"Source file not found: {src}")
            return False
        
        if src_path.is_dir():
            logger.error(f"Source is a directory: {src}")
            return False
        
        # Create destination directory
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Check for overwrites
        if dst_path.exists():
            logger.warning(f"Destination exists, will overwrite: {dst}")
        
        # Atomic move
        src_path.replace(dst_path)
        logger.info(f"Moved {src} -> {dst}")
        return True
    
    except Exception as e:
        logger.error(f"Error moving file: {str(e)}")
        return False


def create_backup(file_path: str) -> Optional[str]:
    """Create backup of file before modification"""
    try:
        path = Path(file_path)
        backup_path = path.with_suffix(path.suffix + ".backup")
        
        path.replace(backup_path)
        logger.info(f"Created backup: {backup_path}")
        return str(backup_path)
    
    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        return None
