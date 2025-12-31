"""
Analysis API routes with real-time streaming and file operations
Improved categorization for better folder organization
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json
import logging
from typing import List
from pathlib import Path
import shutil
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()


class DateTimeEncoder(json.JSONEncoder):
    """JSON encoder for datetime objects"""
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


class RealtimeAnalyzer:
    def __init__(self, ai_engine):
        self.ai_engine = ai_engine
    
    async def analyze_with_ai(self, path: str, recursive: bool = True, model: str = None):
        """Analyze directory and get AI suggestions with real-time progress"""
        try:
            # Get all files first
            files = self._get_files(path, recursive)
            total_files = len(files)
            
            logger.info(f"Found {total_files} files in {path}")
            
            # Send initial progress
            started_data = {
                'type': 'started',
                'total': total_files
            }
            yield f"data: {json.dumps(started_data, cls=DateTimeEncoder)}\n\n"
            
            all_files = []
            
            # Process each file with AI
            for idx, file_path in enumerate(files, 1):
                try:
                    # Get file info
                    file_info = self._get_file_info(file_path)
                    
                    # Get AI suggestion for this file
                    suggestion = await self.ai_engine.suggest_organization(
                        filename=file_info['filename'],
                        content_summary=f"File type: {file_info['file_type']}",
                        file_type=file_info['file_type'],
                        size=file_info['size'],
                        mime_type=file_info['mime_type'],
                        modified_date=file_info['modified_date']
                    )
                    
                    # Get category from AI or use file type based default
                    ai_category = suggestion.get('suggested_category', '')
                    category = self._normalize_category(ai_category or file_info['file_type'])
                    
                    # Build file result with defaults if suggestion fails
                    file_result = {
                        'filename': file_info['filename'],
                        'path': file_info['path'],
                        'size': file_info['size'],
                        'mime_type': file_info['mime_type'],
                        'file_type': file_info['file_type'],
                        'modified_date': file_info['modified_date'].isoformat(),
                        'suggested_category': category,
                        'confidence_score': float(suggestion.get('confidence', 0.5)),
                        'reasoning': suggestion.get('reasoning', 'AI analysis'),
                        'suggested_name': suggestion.get('suggested_name', file_info['filename'])
                    }
                    
                    all_files.append(file_result)
                    
                    # Send progress update
                    progress = (idx / total_files) * 100
                    progress_data = {
                        'type': 'progress',
                        'processed': idx,
                        'total': total_files,
                        'progress': round(progress, 1),
                        'current_file': file_path,
                        'category': category
                    }
                    yield f"data: {json.dumps(progress_data, cls=DateTimeEncoder)}\n\n"
                    
                except Exception as e:
                    logger.error(f"Error analyzing {file_path}: {str(e)}")
                    # Add file with default suggestion on error
                    file_info = self._get_file_info(file_path)
                    category = self._normalize_category(file_info['file_type'])
                    file_result = {
                        'filename': file_info['filename'],
                        'path': file_info['path'],
                        'size': file_info['size'],
                        'mime_type': file_info['mime_type'],
                        'file_type': file_info['file_type'],
                        'modified_date': file_info['modified_date'].isoformat(),
                        'suggested_category': category,
                        'confidence_score': 0.3,
                        'reasoning': f'Default categorization based on file type',
                        'suggested_name': file_info['filename']
                    }
                    all_files.append(file_result)
            
            # Send completion
            completed_data = {
                'type': 'completed',
                'success': True,
                'files': all_files,
                'total_files': total_files
            }
            yield f"data: {json.dumps(completed_data, cls=DateTimeEncoder)}\n\n"
        
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            error_data = {
                'type': 'error',
                'success': False,
                'error': str(e)
            }
            yield f"data: {json.dumps(error_data, cls=DateTimeEncoder)}\n\n"
    
    def _normalize_category(self, category: str) -> str:
        """
        Normalize AI suggested category to standard folder names
        Maps various AI suggestions to clean, consistent folder names
        """
        if not category:
            return 'Other'
        
        category_lower = category.lower().strip()
        
        # Document categories
        if any(word in category_lower for word in ['document', 'text', 'word', 'pdf', 'sheet', 'excel', 'spreadsheet', 'presentation']):
            return 'Documents'
        
        # Image/Media categories
        if any(word in category_lower for word in ['image', 'photo', 'picture', 'photo', 'visual', 'graphic', 'picture']):
            return 'Images'
        
        # Video categories
        if any(word in category_lower for word in ['video', 'movie', 'film', 'mp4', 'avi', 'mkv']):
            return 'Videos'
        
        # Audio categories
        if any(word in category_lower for word in ['audio', 'music', 'sound', 'mp3', 'wav', 'flac']):
            return 'Audio'
        
        # Code/Development categories
        if any(word in category_lower for word in ['code', 'script', 'python', 'javascript', 'java', 'cpp', 'source', 'development', 'programming', 'software']):
            return 'Code'
        
        # Archive categories
        if any(word in category_lower for word in ['archive', 'compressed', 'zip', 'rar', '7z', 'tar', 'backup']):
            return 'Archives'
        
        # Log/System categories
        if any(word in category_lower for word in ['log', 'system', 'config', 'configuration', 'setting', 'admin', 'administration']):
            return 'Logs & Configs'
        
        # Data categories
        if any(word in category_lower for word in ['data', 'dataset', 'database', 'db', 'sql']):
            return 'Data'
        
        # Default: use as-is if it looks clean
        if len(category_lower) < 30 and category_lower.count(' ') < 3:
            return category.strip()
        
        return 'Other'
    
    def _get_files(self, path: str, recursive: bool = True) -> List[str]:
        """Get all files"""
        import os
        files = []
        path_obj = Path(path)
        
        if not path_obj.exists():
            logger.warning(f"Path does not exist: {path}")
            return files
        
        try:
            if recursive:
                for root, dirs, filenames in os.walk(path_obj):
                    dirs[:] = [d for d in dirs if not d.startswith('.')]
                    for filename in filenames:
                        if not filename.startswith('.'):
                            files.append(os.path.join(root, filename))
            else:
                for item in path_obj.iterdir():
                    if item.is_file() and not item.name.startswith('.'):
                        files.append(str(item))
        except Exception as e:
            logger.error(f"Error getting files: {str(e)}")
        
        return sorted(files)
    
    def _get_file_info(self, file_path: str) -> dict:
        """Get file information"""
        path_obj = Path(file_path)
        
        try:
            stat = path_obj.stat()
            size = stat.st_size
            modified_date = datetime.fromtimestamp(stat.st_mtime)
        except Exception as e:
            logger.warning(f"Could not stat file {file_path}: {str(e)}")
            size = 0
            modified_date = datetime.now()
        
        # Get MIME type
        import mimetypes
        mime_type, _ = mimetypes.guess_type(file_path)
        
        return {
            'filename': path_obj.name,
            'path': file_path,
            'size': size,
            'mime_type': mime_type or 'application/octet-stream',
            'file_type': self._get_file_type(file_path),
            'modified_date': modified_date
        }
    
    def _get_file_type(self, file_path: str) -> str:
        """Get file type"""
        ext = Path(file_path).suffix.lower()
        
        type_map = {
            'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
            'document': ['.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.xls', '.pptx', '.csv'],
            'video': ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.wmv'],
            'audio': ['.mp3', '.wav', '.flac', '.m4a', '.aac'],
            'archive': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
            'code': ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.go', '.sh', '.bash'],
        }
        
        for ftype, exts in type_map.items():
            if ext in exts:
                return ftype
        return 'other'


@router.post("/analyze")
async def analyze_directory(request: dict):
    """Analyze directory with real-time streaming"""
    from app.services.ai_engine import AIEngine
    
    try:
        path = request.get('path')
        recursive = request.get('recursive', True)
        model = request.get('model')
        
        if not path:
            raise HTTPException(status_code=400, detail="Path is required")
        
        logger.info(f"Starting analysis of {path} with model {model}")
        
        ai_engine = AIEngine()
        analyzer = RealtimeAnalyzer(ai_engine)
        
        # Return streaming response
        return StreamingResponse(
            analyzer.analyze_with_ai(path, recursive, model),
            media_type="text/event-stream"
        )
    
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/move-files")
async def move_files(request: dict):
    """Move selected files to their suggested categories"""
    try:
        files = request.get('files', [])
        base_path = request.get('base_path')
        
        if not files or not base_path:
            raise HTTPException(status_code=400, detail="Files and base_path required")
        
        logger.info(f"Moving {len(files)} files from {base_path}")
        
        results = []
        
        # Execute move operations
        for file_info in files:
            try:
                source = file_info.get('path')
                category = file_info.get('category') or file_info.get('suggested_category', 'Other')
                
                if not source:
                    results.append({
                        'success': False,
                        'source': source,
                        'error': 'No source path provided'
                    })
                    continue
                
                source_path = Path(source)
                
                if not source_path.exists():
                    results.append({
                        'success': False,
                        'source': source,
                        'error': 'Source file not found'
                    })
                    continue
                
                # Create destination directory
                dest_dir = Path(base_path) / category
                dest_path = dest_dir / source_path.name
                
                # Create directory if it doesn't exist
                dest_dir.mkdir(parents=True, exist_ok=True)
                
                # Handle file name conflicts
                if dest_path.exists():
                    # Add counter to filename
                    stem = dest_path.stem
                    suffix = dest_path.suffix
                    counter = 1
                    while dest_path.exists():
                        dest_path = dest_dir / f"{stem}_{counter}{suffix}"
                        counter += 1
                
                # Move file
                shutil.move(str(source_path), str(dest_path))
                
                results.append({
                    'success': True,
                    'source': source,
                    'destination': str(dest_path),
                    'category': category
                })
                logger.info(f"✅ Moved {source_path.name} to {category}/")
            
            except Exception as e:
                logger.error(f"Failed to move {file_info.get('path')}: {str(e)}")
                results.append({
                    'success': False,
                    'source': file_info.get('path'),
                    'error': str(e)
                })
        
        success_count = len([r for r in results if r.get('success')])
        
        return {
            'success': True,
            'moved': success_count,
            'total': len(files),
            'results': results
        }
    
    except Exception as e:
        logger.error(f"Move files error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
