"""Abstract base repository — interface segregation."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

T = TypeVar("T")


class ReadRepository(ABC, Generic[T]):
    """Read-only repository interface."""

    @abstractmethod
    async def get_by_id(self, id: str) -> T | None: ...

    @abstractmethod
    async def get_all(self) -> list[T]: ...


class WriteRepository(ABC, Generic[T]):
    """Write repository interface."""

    @abstractmethod
    async def create(self, entity: T) -> T: ...

    @abstractmethod
    async def update(self, entity: T) -> T: ...

    @abstractmethod
    async def delete(self, id: str) -> bool: ...


class Repository(ReadRepository[T], WriteRepository[T], ABC):
    """Full repository interface (read + write)."""

    pass
