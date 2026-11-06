from fastapi import (
  APIRouter,
  Depends,
  HTTPException,
  Query,
  Response,
  status
)
from sqlalchemy import select
from sqlalchemy.orm import Session
from battery import calculate_battery_impact
from pvgis import get_pvgis_hourly_production
from database import get_db
from models import Site, User
from auth import get_current_user, verify_csrf
from schemas import SiteCreate, SiteRead
from pvgis import get_pvgis_production

router = APIRouter(prefix="/api/sites", tags=["sites"])


def get_owned_site(
  site_id: int,
  user_id: int,
  db: Session
) -> Site:
  site = db.scalar(
    select(Site).where(
      Site.id == site_id,
      Site.owner_id == user_id
    )
  )

  if site is None:
    raise HTTPException(
      status_code=404,
      detail="Site not found"
  )

  return site


# GET all sites belonging to the logged-in advisor
@router.get("", response_model=list[SiteRead])
def get_sites(
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  return db.scalars(
    select(Site).where(
      Site.owner_id == current_user.id
    )
  ).all()


# CREATE a new site
@router.post(
  "",
  response_model=SiteRead,
  status_code=status.HTTP_201_CREATED
)
def create_site(
  site_data: SiteCreate,
  current_user: User = Depends(get_current_user),
  _: None = Depends(verify_csrf),
  db: Session = Depends(get_db),
):
  site = Site(
    **site_data.model_dump(),
    owner_id=current_user.id
  )

  db.add(site)
  db.commit()
  db.refresh(site)

  return site


# GET one site
@router.get("/{site_id}", response_model=SiteRead)
def get_site(
  site_id: int,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  return get_owned_site(site_id, current_user.id, db)


# UPDATE a site
@router.put("/{site_id}", response_model=SiteRead)
def update_site(
  site_id: int,
  site_data: SiteCreate,
  current_user: User = Depends(get_current_user),
  _: None = Depends(verify_csrf),
  db: Session = Depends(get_db),
):
  site = get_owned_site(site_id, current_user.id, db)

  for field, value in site_data.model_dump().items():
    setattr(site, field, value)

  db.commit()
  db.refresh(site)

  return site


# DELETE a site
@router.delete(
  "/{site_id}",
  status_code=status.HTTP_204_NO_CONTENT
)
def delete_site(
  site_id: int,
  current_user: User = Depends(get_current_user),
  _: None = Depends(verify_csrf),
  db: Session = Depends(get_db),
):
  site = get_owned_site(site_id, current_user.id, db)

  db.delete(site)
  db.commit()

  return Response(status_code=status.HTTP_204_NO_CONTENT)


# GET yearly and monthly solar production
@router.get("/{site_id}/production")
def get_site_production(
  site_id: int,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  site = get_owned_site(site_id, current_user.id, db)

  return get_pvgis_production(
    latitude=site.latitude,
    longitude=site.longitude,
    peak_kwp=site.peak_kwp
  )
  
# Calculate and compare household solar self-consumption with and without a home battery
@router.get("/{site_id}/battery")
def get_site_battery(
  site_id: int,
  capacityKwh: float = Query(gt=0),
  annualUseKwh: float = Query(gt=0),
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  site = get_owned_site(site_id, current_user.id, db)

  hourly_production = get_pvgis_hourly_production(
    latitude=site.latitude,
    longitude=site.longitude,
    peak_kwp=site.peak_kwp
  )

  return calculate_battery_impact(
    hourly_production=hourly_production,
    capacity_kwh=capacityKwh,
    annual_use_kwh=annualUseKwh
  )