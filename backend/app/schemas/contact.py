from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ContactCreate(BaseModel):
    name: str
    phone_number: str


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    phone_number: str
    created_at: datetime
