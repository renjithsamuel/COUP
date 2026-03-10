"""SQLAlchemy declarative base and async engine setup."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    settings.database_url,
    echo=settings.app_debug,
    connect_args={"check_same_thread": False},  # SQLite specific
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_async_session():
    """Yield an async DB session."""
    async with async_session_factory() as session:
        yield session


async def init_db() -> None:
    """Create all tables (for development; use Alembic in production)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
