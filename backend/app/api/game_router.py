"""Game setup REST API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.lobby import AiDifficulty, AiMatchCreate, AiMatchResponse

router = APIRouter(prefix="/api/games", tags=["games"])

_game_service = None


def init_game_router(game_service) -> None:
    """Wire the game service into the router."""
    global _game_service
    _game_service = game_service


@router.post("/ai-match", response_model=AiMatchResponse)
async def create_ai_match(body: AiMatchCreate) -> AiMatchResponse:
    try:
        state, human_player_id = await _game_service.create_ai_match(
            player_name=body.player_name,
            bot_count=body.bot_count,
            difficulty=AiDifficulty(body.difficulty),
            profile_id=body.profile_id,
            lobby_config=body.config,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return AiMatchResponse(game_id=state.id, player_id=human_player_id)