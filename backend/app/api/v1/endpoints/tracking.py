from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from supabase import Client

from app.core import deps
from app.schemas.shipment import ShipmentPublic
from app.services.shipment_service import ShipmentService

router = APIRouter()

@router.get("/track/{tracking_id}", response_model=ShipmentPublic)
def track_shipment(
    tracking_id: str,
    supabase: Annotated[Client, Depends(deps.get_supabase)]
):
    """
    Public Endpoint: Get basic shipment status by Tracking ID.
    No authentication required.
    """
    # NOTE: In production with RLS on 'shipments' strictly private, 
    # we would need the Service Role Key here to bypass RLS for this specific query.
    # For now, using the injected client (likely Anon Key).
    # If RLS blocks this, we assume configuration update is needed or Service Role Injection.
    # To respect "Do not expose user_id", the Service ensures data sanitization.
    
    service = ShipmentService(supabase)
    shipment_data = service.get_public_tracking(tracking_id)
    
    if not shipment_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
        
    return shipment_data
