from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, calls, contacts, settings, webhooks
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.schema_bootstrap import ensure_user_owned_schema
from app.core.seed import seed_demo_data
from app.ws.observer import router as observer_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_user_owned_schema(engine)
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


settings_obj = get_settings()
app = FastAPI(title=settings_obj.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings_obj.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Sagent backend is running"}


app.include_router(auth.router, prefix=settings_obj.api_prefix)
app.include_router(settings.router, prefix=settings_obj.api_prefix)
app.include_router(contacts.router, prefix=settings_obj.api_prefix)
app.include_router(calls.router, prefix=settings_obj.api_prefix)
app.include_router(webhooks.router, prefix=settings_obj.api_prefix)
app.include_router(observer_router)
