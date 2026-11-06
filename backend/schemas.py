from pydantic import BaseModel, ConfigDict, Field, field_validator


class SiteBase(BaseModel):
  model_config = ConfigDict(
    populate_by_name=True,
    str_strip_whitespace=True
  )

  client_name: str = Field(
    alias="clientName",
    min_length=1,
    max_length=150
  )
  address: str = Field(min_length=1, max_length=500)

  latitude: float = Field(ge=-90, le=90)
  longitude: float = Field(ge=-180, le=180)

  roof_area_m2: float | None = Field(
    default=None,
    alias="roofAreaM2",
    gt=0
  )

  peak_kwp: float = Field(alias="peakKwp", gt=0)

  @field_validator("client_name", "address")
  @classmethod
  def validate_not_empty(cls, value: str) -> str:
    if not value.strip():
      raise ValueError("This field cannot be empty")
    return value


class SiteCreate(SiteBase):
  pass


class SiteRead(SiteBase):
  id: int

  model_config = ConfigDict(
    from_attributes=True,
    populate_by_name=True
  )