"""Card and Character models — single source of truth for game characters."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict


class Character(str, Enum):
    """The five characters in Coup."""

    DUKE = "duke"
    ASSASSIN = "assassin"
    CAPTAIN = "captain"
    AMBASSADOR = "ambassador"
    CONTESSA = "contessa"


class Card(BaseModel):
    """A single influence card."""

    model_config = ConfigDict(strict=True)

    character: Character
    revealed: bool = False
