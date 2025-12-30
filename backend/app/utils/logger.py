"""
Logging configuration
"""

import logging
from app.config import settings


def setup_logger(name: str) -> logging.Logger:
    """Configure and return logger"""
    logger = logging.getLogger(name)
    
    # Set level
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(level)
    
    # Create console handler
    ch = logging.StreamHandler()
    ch.setLevel(level)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    ch.setFormatter(formatter)
    
    # Add handler if not already present
    if not logger.handlers:
        logger.addHandler(ch)
    
    return logger
