"""Aggregated API router."""

from fastapi import APIRouter

from app.api.health_router import router as health_router
from app.api.lobby_router import router as lobby_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(lobby_router)
