from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
  __tablename__ = "users"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
  email: Mapped[str] = mapped_column(
    String(255), unique=True, index=True, nullable=False
  )
  hashed_password: Mapped[str] = mapped_column(
    String(255), nullable=False
  )

  sites: Mapped[list["Site"]] = relationship(
    back_populates="owner",
    cascade="all, delete-orphan"
  )


class Site(Base):
  __tablename__ = "sites"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

  client_name: Mapped[str] = mapped_column(String(150), nullable=False)
  address: Mapped[str] = mapped_column(String(500), nullable=False)

  latitude: Mapped[float] = mapped_column(Float, nullable=False)
  longitude: Mapped[float] = mapped_column(Float, nullable=False)

  roof_area_m2: Mapped[float | None] = mapped_column(
    Float, nullable=True
  )
  peak_kwp: Mapped[float] = mapped_column(Float, nullable=False)

  owner_id: Mapped[int] = mapped_column(
    ForeignKey("users.id"),
    nullable=False,
    index=True
  )

  owner: Mapped["User"] = relationship(back_populates="sites")