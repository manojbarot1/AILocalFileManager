"""Database configuration and initialization"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings

# Database setup
Base = declarative_base()

async def init_db():
    """Initialize database"""
    # Create engine
    if settings.DATABASE_URL.startswith("sqlite"):
        # SQLite async setup
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
        )
    else:
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
        )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    return engine


async def get_db():
    """Get database session"""
    from app.db.database import engine
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
