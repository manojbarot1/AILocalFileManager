"""
Application configuration management
"""

from pydantic_settings import BaseSettings
from pydantic import Field
import os


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Backend
    BACKEND_HOST: str = Field(default="0.0.0.0", env="BACKEND_HOST")
    BACKEND_PORT: int = Field(default=8000, env="BACKEND_PORT")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./ail_manager.db", env="DATABASE_URL")
    
    # Ollama AI
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field(default="llama3:latest", env="OLLAMA_MODEL")
    OLLAMA_TIMEOUT: int = Field(default=120, env="OLLAMA_TIMEOUT")
    
    # AI Settings
    CONFIDENCE_THRESHOLD: float = Field(default=0.7, env="CONFIDENCE_THRESHOLD")
    MIN_SIMILARITY_SCORE: float = Field(default=0.6, env="MIN_SIMILARITY_SCORE")
    BATCH_SIZE: int = Field(default=10, env="BATCH_SIZE")
    MAX_WORKERS: int = Field(default=4, env="MAX_WORKERS")
    MAX_TOKENS: int = Field(default=512, env="MAX_TOKENS")
    TEMPERATURE: float = Field(default=0.3, env="TEMPERATURE")
    
    # File Operations
    MAX_FILE_SIZE_MB: int = Field(default=500, env="MAX_FILE_SIZE_MB")
    SUPPORTED_EXTENSIONS: str = Field(
        default=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar,.7z",
        env="SUPPORTED_EXTENSIONS"
    )
    ENABLE_OCR: bool = Field(default=True, env="ENABLE_OCR")
    ENABLE_HASH_CHECKING: bool = Field(default=True, env="ENABLE_HASH_CHECKING")
    
    # Frontend
    FRONTEND_HOST: str = Field(default="localhost", env="FRONTEND_HOST")
    FRONTEND_PORT: int = Field(default=3000, env="FRONTEND_PORT")
    REACT_APP_API_URL: str = Field(default="http://localhost:8000", env="REACT_APP_API_URL")
    
    # Security
    ENABLE_CORS: bool = Field(default=True, env="ENABLE_CORS")
    ALLOWED_ORIGINS: str = Field(default="*", env="ALLOWED_ORIGINS")
    SECRET_KEY: str = Field(default="change-me-in-production", env="SECRET_KEY")
    ENCRYPTION_ENABLED: bool = Field(default=False, env="ENCRYPTION_ENABLED")
    
    # Performance
    CACHE_ENABLED: bool = Field(default=True, env="CACHE_ENABLED")
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")
    ENABLE_PROFILING: bool = Field(default=False, env="ENABLE_PROFILING")
    
    # Features
    ENABLE_DUPLICATE_DETECTION: bool = Field(default=True, env="ENABLE_DUPLICATE_DETECTION")
    ENABLE_ORPHAN_DETECTION: bool = Field(default=True, env="ENABLE_ORPHAN_DETECTION")
    ENABLE_SCHEDULING: bool = Field(default=True, env="ENABLE_SCHEDULING")
    ENABLE_CLOUD_SYNC: bool = Field(default=False, env="ENABLE_CLOUD_SYNC")
    
    # Notifications
    ENABLE_NOTIFICATIONS: bool = Field(default=True, env="ENABLE_NOTIFICATIONS")
    NOTIFICATION_LEVEL: str = Field(default="info", env="NOTIFICATION_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def get_supported_extensions(self) -> list[str]:
        """Get list of supported file extensions"""
        return [ext.strip() for ext in self.SUPPORTED_EXTENSIONS.split(",")]


# Create settings instance
settings = Settings()
