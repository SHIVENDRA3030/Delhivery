from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List, Any
from supabase import Client

from app.core import deps
from app.schemas.shipment import ShipmentDetail, ShipmentEventBase
from app.services.shipment_service import ShipmentService

router = APIRouter()

@router.get("/{shipment_id}/events", response_model=List[ShipmentEventBase])
def get_shipment_events(
    shipment_id: str,
    current_user: Annotated[dict, Depends(deps.get_current_user)],
    supabase: Annotated[Client, Depends(deps.get_supabase)]
):
    """
    Private Endpoint: Get full event timeline for a shipment.
    Requires Authentication.
    User must own the shipment.
    """
    user_id = current_user.get("id")
    if not user_id:
         raise HTTPException(status_code=401, detail="User ID not found in token")

    service = ShipmentService(supabase)
    
    # Reusing logic that gets full data to ensure ownership validation
    shipment = service.get_private_shipment_data(shipment_id, user_id)
    
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found or access denied"
        )
        
    return shipment.get("events", [])

from app.schemas.shipment import ShipmentCreate, PickupScheduleRequest, ShipmentPublic
from typing import Dict

@router.post("", response_model=ShipmentPublic)
def create_shipment_booking(
    shipment_in: ShipmentCreate,
    current_user: Annotated[dict, Depends(deps.get_current_user)],
    supabase: Annotated[Client, Depends(deps.get_supabase)]
):
    """
    Create a new Shipment Booking.
    Inputs: Pickup/Delivery addresses, Items.
    Output: Created Shipment with Tracking ID.
    User: Must be authenticated.
    """
    user_id = current_user.get("id")
    service = ShipmentService(supabase)
    
    try:
        # Service handles rollback internally
        shipment = service.create_shipment(user_id, shipment_in)
        # Re-fetch minimal data to match schema if needed, or construct manually 
        # (Assuming create_shipment returns DB record usually)
        return {
            "tracking_id": shipment['tracking_id'],
            "status": shipment['status'],
            "events": [] # Empty initially
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{shipment_id}/pickup")
def schedule_shipment_pickup(
    shipment_id: str,
    pickup_in: PickupScheduleRequest,
    current_user: Annotated[dict, Depends(deps.get_current_user)],
    supabase: Annotated[Client, Depends(deps.get_supabase)]
):
    """
    Schedule a pickup for a PENDING shipment.
    """
    user_id = current_user.get("id")
    service = ShipmentService(supabase)
    
    try:
        service.schedule_pickup(user_id, shipment_id, pickup_in)
        return {"message": "Pickup scheduled successfully"}
    except ValueError as e:
        # Differentiate 403 vs 404/400 theoretically, for now simplified
        if "Access Denied" in str(e):
             raise HTTPException(status_code=403, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))#

