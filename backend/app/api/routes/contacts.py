from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status

from app.api.deps import CurrentUser, DbSession
from app.repositories import contact_repository
from app.schemas.contact import ContactCreate, ContactResponse

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactResponse])
def get_contacts(db: DbSession, current_user: CurrentUser) -> list[ContactResponse]:
    contacts = contact_repository.list_contacts(db, current_user.id)
    return [ContactResponse.model_validate(contact) for contact in contacts]


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactCreate, db: DbSession, current_user: CurrentUser) -> ContactResponse:
    contact = contact_repository.create_contact(db, current_user.id, payload.name, payload.phone_number)
    return ContactResponse.model_validate(contact)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: UUID, db: DbSession, current_user: CurrentUser) -> Response:
    deleted = contact_repository.delete_contact(db, current_user.id, contact_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
