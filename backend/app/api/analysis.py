"""
Analysis API routes
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import logging

from app.services.analyzer import FileAnalyzer, FileAnalysis

router = APIRouter()
logger = logging.getLogger(__name__)

analyzer = FileAnalyzer()


# ===== Pydantic Schemas =====
class FileAnalysisResponse(BaseModel):
    """File analysis result"""
    path: str
    filename: str
    file_type: str
    size: int
    mime_type: str
    content_type: str
    suggested_name: str
    suggested_category: str
    suggested_tags: List[str]
    confidence_score: float
    reasoning: str


class AnalyzeRequest(BaseModel):
    """Analyze request"""
    path: str = Field(..., description="File or directory path")
    recursive: bool = Field(default=True, description="Scan subdirectories")
    include_patterns: Optional[List[str]] = Field(default=None, description="File patterns to include")


class AnalyzeResponse(BaseModel):
    """Analyze response"""
    success: bool
    analysis_id: str
    total_files: int
    analyzed_files: int
    files: List[FileAnalysisResponse]
    timestamp: datetime


# ===== Endpoints =====

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_directory(request: AnalyzeRequest):
    """
    Analyze a directory for file organization suggestions
    
    This endpoint:
    1. Scans the directory
    2. Analyzes each file's content and metadata
    3. Gets AI suggestions for organization
    4. Returns analysis with confidence scores
    """
    try:
        logger.info(f"Starting analysis of {request.path}")
        
        # Analyze directory
        analyses = await analyzer.analyze_directory(
            request.path,
            recursive=request.recursive,
            include_patterns=request.include_patterns,
        )
        
        if not analyses:
            raise HTTPException(
                status_code=400,
                detail="No files found or all files failed analysis"
            )
        
        # Convert to response format
        files_response = [
            FileAnalysisResponse(
                path=a.path,
                filename=a.filename,
                file_type=a.file_type,
                size=a.size,
                mime_type=a.mime_type,
                content_type=a.content_type,
                suggested_name=a.suggested_name,
                suggested_category=a.suggested_category,
                suggested_tags=a.suggested_tags,
                confidence_score=a.confidence_score,
                reasoning=a.reasoning,
            )
            for a in analyses
        ]
        
        return AnalyzeResponse(
            success=True,
            analysis_id=f"analysis_{datetime.now().timestamp()}",
            total_files=len(analyses),
            analyzed_files=len(analyses),
            files=files_response,
            timestamp=datetime.now(),
        )
    
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/file", response_model=FileAnalysisResponse)
async def analyze_file(request: AnalyzeRequest):
    """Analyze a single file"""
    try:
        analysis = await analyzer.analyze_file(request.path)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="File not found or unsupported")
        
        return FileAnalysisResponse(
            path=analysis.path,
            filename=analysis.filename,
            file_type=analysis.file_type,
            size=analysis.size,
            mime_type=analysis.mime_type,
            content_type=analysis.content_type,
            suggested_name=analysis.suggested_name,
            suggested_category=analysis.suggested_category,
            suggested_tags=analysis.suggested_tags,
            confidence_score=analysis.confidence_score,
            reasoning=analysis.reasoning,
        )
    
    except Exception as e:
        logger.error(f"File analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/health")
async def analysis_health():
    """Check if AI engine is ready"""
    health = await analyzer.ai_engine.health_check()
    
    return {
        "status": "ready" if health else "unavailable",
        "model": analyzer.ai_engine.model,
        "ready": health,
    }
