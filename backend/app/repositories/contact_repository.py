from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.entities import Contact


def list_contacts(db: Session, user_id: UUID) -> list[Contact]:
    stmt = select(Contact).where(Contact.user_id == user_id).order_by(desc(Contact.created_at))
    return list(db.scalars(stmt).all())


def create_contact(db: Session, user_id: UUID, name: str, phone_number: str) -> Contact:
    contact = Contact(user_id=user_id, name=name, phone_number=phone_number)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(db: Session, user_id: UUID, contact_id: UUID) -> bool:
    contact = db.get(Contact, contact_id)
    if contact is None or contact.user_id != user_id:
        return False
    db.delete(contact)
    db.commit()
    return True
