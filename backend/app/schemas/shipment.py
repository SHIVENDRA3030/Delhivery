from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Shared Enums (Mirroring DB)
class ShipmentStatus(str, Enum):
    PENDING = "PENDING"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    RETURNED = "RETURNED"

class AddressType(str, Enum):
    PICKUP = "PICKUP"
    DELIVERY = "DELIVERY"

# Base Models
class ShipmentEventBase(BaseModel):
    status: ShipmentStatus
    description: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime

class ShipmentAddressPublic(BaseModel):
    type: AddressType
    city: str
    state: str
    country: str = "India"
    # Hiding full address/phone for public tracking

class ShipmentDetailAddress(ShipmentAddressPublic):
    # Full details for authorized users
    contact_name: str
    contact_phone: str
    address_line_1: str
    address_line_2: Optional[str] = None
    pincode: str

# Public Tracking Response (Sanitized)
class ShipmentPublic(BaseModel):
    tracking_id: str
    status: ShipmentStatus
    events: List[ShipmentEventBase]
    # Do NOT include user_id or internal UUIDs
    estimated_delivery: Optional[datetime] = None # Placeholder

# Private Full Detail
class ShipmentDetail(BaseModel):
    id: str # Internal UUID (Visible to owner)
    tracking_id: str
    status: ShipmentStatus
    user_id: str
    total_weight_kg: Optional[float] = None
    
    addresses: List[ShipmentDetailAddress]
    events: List[ShipmentEventBase]
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Creation Models
class AddressCreate(BaseModel):
    contact_name: str
    contact_phone: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str = "India"

class ShipmentItemCreate(BaseModel):
    description: str
    quantity: int = 1
    weight_kg: Optional[float] = None
    length_cm: Optional[float] = None
    width_cm: Optional[float] = None
    height_cm: Optional[float] = None

class ShipmentCreate(BaseModel):
    pickup_address: AddressCreate
    delivery_address: AddressCreate
    items: List[ShipmentItemCreate] = []
    total_weight_kg: Optional[float] = None

# Pickup Schedule Request
class PickupScheduleRequest(BaseModel):
    pickup_date: str # YYYY-MM-DD
    pickup_time_slot: str # e.g. "10:00-12:00"

# Partner Operations
class ShipmentAssignRequest(BaseModel):
    partner_id: str # UUID of the delivery partner

class ShipmentScanRequest(BaseModel):
    status: ShipmentStatus
    description: Optional[str] = None
    location: Optional[str] = None

# Admin Operations
class ShipmentForceStatusRequest(BaseModel):
    status: ShipmentStatus
    reason: str

class ShipmentAdminListResponse(ShipmentDetail):
    assigned_partner_id: Optional[str] = None
