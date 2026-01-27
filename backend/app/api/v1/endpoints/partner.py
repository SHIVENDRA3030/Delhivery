from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from supabase import Client

from app.core import deps
from app.schemas.shipment import ShipmentScanRequest
from app.services.shipment_service import ShipmentService

router = APIRouter()

@router.post("/shipments/{id}/scan")
def scan_shipment_status(
    id: str,
    scan_in: ShipmentScanRequest,
    current_user: Annotated[dict, Depends(deps.get_current_user)],
    supabase: Annotated[Client, Depends(deps.get_supabase)]
):
    """
    PARTNER ONLY: Update shipment status (Scan).
    Requires assignment.
    """
    user_id = current_user['id']
    
    # 1. Verify Partner Role
    # Similar to admin, we check if they are a 'partner'.
    # Assuming 'partner' role exists in roles table.
    try:
        res = supabase.table("user_profiles").select("roles(name)").eq("id", user_id).single().execute()
        role_name = res.data.get('roles', {}).get('name')
        if role_name != 'partner' and role_name != 'admin': # Admins can mimic partners? Prompt says "Only assigned partner".
            # Strict mode: Only partner.
            # But what if Admin is the one scanning? "Admin override allowed" (Rule 5).
            if role_name != 'admin' and role_name != 'partner':
                 raise HTTPException(status_code=403, detail="Partner privileges required")
    except Exception:
        raise HTTPException(status_code=403, detail="Access verification failed")

    service = ShipmentService(supabase)
    try:
        service.scan_shipment(user_id, id, scan_in)
        return {"message": "Scan recorded successfully", "status": scan_in.status}
    except ValueError as e:
        if "Access Denied" in str(e):
             raise HTTPException(status_code=403, detail=str(e))
        if "Invalid Status" in str(e):
             raise HTTPException(status_code=409, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
