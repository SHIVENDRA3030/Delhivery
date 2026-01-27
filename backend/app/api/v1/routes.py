from fastapi import APIRouter
from app.api.v1.endpoints import health, tracking, shipments, admin, partner

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(tracking.router, tags=["tracking"])
api_router.include_router(shipments.router, prefix="/shipments", tags=["shipments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(partner.router, prefix="/partner", tags=["partner"])
