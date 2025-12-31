"""Database models for AILocalFileManager."""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class FileAnalysis(Base):
    __tablename__ = "file_analyses"
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, unique=True, index=True)
    file_name = Column(String, index=True)
    file_size = Column(Integer)
    file_type = Column(String)
    mime_type = Column(String)
    category = Column(String, index=True)
    confidence = Column(Float, default=0.0)
    summary = Column(Text)
    suggested_folder = Column(String)
    related_files = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_duplicate = Column(Boolean, default=False)
    file_hash = Column(String, unique=True, nullable=True)
    class Config:
        from_attributes = True

class OrganizationRule(Base):
    __tablename__ = "organization_rules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    condition_type = Column(String)
    condition_value = Column(String)
    action = Column(String)
    action_target = Column(String)
    is_active = Column(Boolean, default=True, index=True)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    class Config:
        from_attributes = True

class OperationHistory(Base):
    __tablename__ = "operation_history"
    id = Column(Integer, primary_key=True, index=True)
    operation_type = Column(String, index=True)
    source_path = Column(String)
    destination_path = Column(String, nullable=True)
    status = Column(String)
    error_message = Column(Text, nullable=True)
    is_reversible = Column(Boolean, default=True)
    reverse_operation_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    executed_at = Column(DateTime, nullable=True)
    class Config:
        from_attributes = True

class FileInsight(Base):
    __tablename__ = "file_insights"
    id = Column(Integer, primary_key=True, index=True)
    insight_type = Column(String, index=True)
    description = Column(Text)
    affected_files = Column(Text)
    recommendation = Column(Text)
    severity = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    class Config:
        from_attributes = True
