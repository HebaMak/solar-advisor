import math
import httpx
from fastapi import HTTPException


PVGIS_URL = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc"
PVGIS_HOURLY_URL = "https://re.jrc.ec.europa.eu/api/v5_3/seriescalc"


def get_pvgis_production(
  latitude: float,
  longitude: float,
  peak_kwp: float
) -> dict:
  params = {
    "lat": latitude,
    "lon": longitude,
    "peakpower": peak_kwp,
    "loss": 14,
    "optimalangles": 1,
    "outputformat": "json",
  }

  try:
    response = httpx.get(
      PVGIS_URL,
      params=params,
      timeout=30.0
    )

  except httpx.TimeoutException:
    raise HTTPException(
      status_code=504,
      detail="PVGIS request timed out. Please try again."
    )

  except httpx.RequestError:
    raise HTTPException(
      status_code=503,
      detail="Unable to connect to the PVGIS service."
    )

  try:
    data = response.json()
  except ValueError:
    raise HTTPException(
      status_code=502,
      detail="PVGIS returned an invalid response."
    )

  if not response.is_success:
    message = (
      data.get("message", "No additional information.")
      if isinstance(data, dict)
      else "No additional information."
    )

    if response.status_code in (400, 404, 422):
      raise HTTPException(
        status_code=422,
        detail=(
          "PVGIS has no available production data "
          f"for this location: {message}"
        )
      )

    raise HTTPException(
      status_code=502,
      detail=f"PVGIS service error: {message}"
    )

  try:
    monthly_data = data["outputs"]["monthly"]["fixed"]
    yearly_data = data["outputs"]["totals"]["fixed"]

    monthly_kwh = [
      {
        "month": int(item["month"]),
        "kwh": round(float(item["E_m"]), 2)
      }
      for item in monthly_data
    ]

    if len(monthly_kwh) != 12 or {
      item["month"] for item in monthly_kwh
    } != set(range(1, 13)):
      raise ValueError("PVGIS did not return all 12 months.")

    yearly_kwh = round(float(yearly_data["E_y"]), 2)

  except (KeyError, TypeError, ValueError):
    raise HTTPException(
      status_code=502,
      detail="PVGIS returned incomplete or unexpected production data."
    )

  return {
    "yearlyKwh": yearly_kwh,
    "monthlyKwh": monthly_kwh
  }


def get_pvgis_hourly_production(
  latitude: float,
  longitude: float,
  peak_kwp: float
) -> list[float]:
  params = {
    "lat": latitude,
    "lon": longitude,
    "peakpower": peak_kwp,
    "loss": 14,
    "pvcalculation": 1,
    "optimalangles": 1,
    "startyear": 2023,
    "endyear": 2023,
    "outputformat": "json",
  }

  try:
    response = httpx.get(
      PVGIS_HOURLY_URL,
      params=params,
      timeout=60.0
    )
    response.raise_for_status()

  except httpx.TimeoutException:
    raise HTTPException(
      status_code=504,
      detail="PVGIS hourly calculation timed out."
    )

  except httpx.HTTPStatusError as exc:
    raise HTTPException(
      status_code=502,
      detail=f"PVGIS returned HTTP {exc.response.status_code}."
    )

  except httpx.RequestError:
    raise HTTPException(
      status_code=503,
      detail="Unable to connect to PVGIS."
    )

  try:
    data = response.json()
    hourly_data = data["outputs"]["hourly"]

    if not hourly_data:
      raise ValueError("Empty hourly data")

    hourly_data = sorted(
      hourly_data,
      key=lambda item: item["time"]
    )

    production = []

    for item in hourly_data:
      power_watts = item.get(
        "P",
        item.get("photovoltaic_power")
      )

      if power_watts is None:
        raise ValueError("Missing hourly PV power")

      power_watts = float(power_watts)

      if not math.isfinite(power_watts) or power_watts < 0:
        raise ValueError("Invalid hourly PV power")

      # Convert watts to kWh for one-hour intervals
      production.append(power_watts / 1000)

    if len(production) != 8760:
      raise ValueError(
        f"Expected 8760 hourly values, received {len(production)}"
      )

    return production

  except (KeyError, TypeError, ValueError) as exc:
    raise HTTPException(
      status_code=502,
      detail=f"Invalid hourly data returned by PVGIS: {exc}"
    )
