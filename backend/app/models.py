from datetime import datetime, date
from sqlalchemy import String, Integer, Boolean, Date, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

class User(Base):
    __tablename__="users"
    id: Mapped[int]=mapped_column(primary_key=True)
    username: Mapped[str]=mapped_column(String(80), unique=True, index=True)
    password_hash: Mapped[str]=mapped_column(String(255))
    role: Mapped[str]=mapped_column(String(20), default="viewer")
    active: Mapped[bool]=mapped_column(Boolean, default=True)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class Organ(Base):
    __tablename__="organs"
    id: Mapped[int]=mapped_column(primary_key=True)
    code: Mapped[str]=mapped_column(String(60), unique=True)
    name: Mapped[str]=mapped_column(String(180), unique=True)
    area: Mapped[str]=mapped_column(String(60))
    type: Mapped[str]=mapped_column(String(60))
    active: Mapped[bool]=mapped_column(Boolean, default=True)

class Office(Base):
    __tablename__="offices"
    id: Mapped[int]=mapped_column(primary_key=True)
    number: Mapped[str]=mapped_column(String(20), unique=True)
    area: Mapped[str]=mapped_column(String(60))
    status: Mapped[str|None]=mapped_column(String(160), nullable=True)

class OrganOffice(Base):
    __tablename__="organ_offices"
    __table_args__=(UniqueConstraint("organ_id","office_id"),)
    id: Mapped[int]=mapped_column(primary_key=True)
    organ_id: Mapped[int]=mapped_column(ForeignKey("organs.id", ondelete="CASCADE"))
    office_id: Mapped[int]=mapped_column(ForeignKey("offices.id", ondelete="CASCADE"))
    position: Mapped[int]=mapped_column(Integer, default=0)

class Vacation(Base):
    __tablename__="vacations"
    id: Mapped[int]=mapped_column(primary_key=True)
    office_id: Mapped[int]=mapped_column(ForeignKey("offices.id"))
    start_date: Mapped[date]=mapped_column(Date)
    end_date: Mapped[date]=mapped_column(Date)
    year: Mapped[int]=mapped_column(Integer, index=True)
    status: Mapped[str]=mapped_column(String(20), default="approved")
    created_by: Mapped[int|None]=mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class Substitution(Base):
    __tablename__="substitutions"
    id: Mapped[int]=mapped_column(primary_key=True)
    office_id: Mapped[int]=mapped_column(ForeignKey("offices.id"), unique=True)
    substitute_office_id: Mapped[int]=mapped_column(ForeignKey("offices.id"))
    active: Mapped[bool]=mapped_column(Boolean, default=True)

class Session(Base):
    __tablename__="sessions"
    __table_args__=(UniqueConstraint("organ_id","session_date","nominal_office_id"),)
    id: Mapped[int]=mapped_column(primary_key=True)
    organ_id: Mapped[int]=mapped_column(ForeignKey("organs.id"))
    session_date: Mapped[date]=mapped_column(Date, index=True)
    nominal_office_id: Mapped[int]=mapped_column(ForeignKey("offices.id"))
    effective_office_id: Mapped[int|None]=mapped_column(ForeignKey("offices.id"), nullable=True)
    status: Mapped[str]=mapped_column(String(40), default="regular")
    origin: Mapped[str]=mapped_column(String(20), default="manual")
    note: Mapped[str|None]=mapped_column(Text, nullable=True)
    created_by: Mapped[int|None]=mapped_column(ForeignKey("users.id"), nullable=True)

class CalendarExclusion(Base):
    __tablename__="calendar_exclusions"
    __table_args__=(UniqueConstraint("organ_id","excluded_date"),)
    id: Mapped[int]=mapped_column(primary_key=True)
    organ_id: Mapped[int]=mapped_column(ForeignKey("organs.id"))
    excluded_date: Mapped[date]=mapped_column(Date)
    reason: Mapped[str|None]=mapped_column(String(200), nullable=True)

class AuditLog(Base):
    __tablename__="audit_logs"
    id: Mapped[int]=mapped_column(primary_key=True)
    user_id: Mapped[int|None]=mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str]=mapped_column(String(60))
    entity: Mapped[str]=mapped_column(String(60))
    entity_id: Mapped[str|None]=mapped_column(String(60), nullable=True)
    details: Mapped[str|None]=mapped_column(Text, nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow, index=True)
