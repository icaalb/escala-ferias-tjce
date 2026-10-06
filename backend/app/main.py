from datetime import date, datetime, timedelta
from typing import Optional
import json
from fastapi import FastAPI, Depends, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session as DBSession
from .db import Base, engine, SessionLocal, get_db
from .config import settings
from .models import User, Organ, Office, OrganOffice, Vacation, Substitution, Session, CalendarExclusion, AuditLog
from .auth import hash_password, verify_password, create_access_token, current_user, require_roles

app=FastAPI(title="Escala TJCE – Férias e Rodízio",version="8.0")
app.add_middleware(CORSMiddleware,allow_origins=[x.strip() for x in settings.cors_origins.split(",")],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

PUBLIC={
"cam-pub-1":("1ª Câmara de Direito Público","Direito Público","Câmara",["13ª","20ª","26ª"]),
"cam-pub-2":("2ª Câmara de Direito Público","Direito Público","Câmara",["8ª","14ª","52ª"]),
"cam-pub-3":("3ª Câmara de Direito Público","Direito Público","Câmara",["17ª","43ª","21ª"]),
"sec-pub":("Seção de Direito Público","Direito Público","Seção",["13ª","20ª","26ª","8ª","14ª","52ª","17ª","43ª","21ª"]),
"cam-priv-1":("1ª Câmara de Direito Privado","Direito Privado","Câmara",["36ª","40ª","53ª"]),
"cam-priv-2":("2ª Câmara de Direito Privado","Direito Privado","Câmara",["39ª","30ª","4ª"]),
"cam-priv-3":("3ª Câmara de Direito Privado","Direito Privado","Câmara",["1ª","38ª","51ª"]),
"cam-priv-4":("4ª Câmara de Direito Privado","Direito Privado","Câmara",["46ª","57ª","56ª"]),
"cam-priv-5":("5ª Câmara de Direito Privado","Direito Privado","Câmara",["25ª","34ª","45ª"]),
"cam-priv-6":("6ª Câmara de Direito Privado","Direito Privado","Câmara",["22ª","27ª","32ª"]),
"sec-priv":("Seção de Direito Privado","Direito Privado","Seção",["36ª","40ª","53ª","39ª","30ª","4ª","1ª","38ª","51ª","46ª","57ª","56ª","25ª","34ª","45ª","22ª","27ª","32ª"]),
"nucleo-4-priv":("Núcleo de Justiça 4.0 — 1ª e 2ª Turmas de Direito Privado","Direito Privado","Núcleo / Turmas",["36ª","40ª","53ª","39ª","30ª","4ª","1ª","38ª","51ª","46ª","57ª","56ª","25ª","34ª","45ª","22ª","27ª","32ª"])
}

def audit(db,user,action,entity,entity_id=None,details=None):
    db.add(AuditLog(user_id=getattr(user,"id",None),action=action,entity=entity,entity_id=str(entity_id) if entity_id is not None else None,details=json.dumps(details,ensure_ascii=False,default=str) if details else None))

def seed():
    db=SessionLocal()
    try:
        if not db.scalar(select(func.count(User.id))):
            db.add(User(username=settings.admin_username,password_hash=hash_password(settings.admin_password),role="admin",active=True))
        offices={}
        all_numbers=sorted({n for _,_,_,nums in PUBLIC.values() for n in nums},key=lambda x:int(x[:-1]))
        for n in all_numbers:
            o=db.scalar(select(Office).where(Office.number==n))
            if not o:
                area="Direito Público" if n in {x for k,v in PUBLIC.items() if "pub" in k and "priv" not in k for x in v[3]} else "Direito Privado"
                o=Office(number=n,area=area,status="Convocado — a ser preenchido" if n=="21ª" else None);db.add(o);db.flush()
            offices[n]=o
        for code,(name,area,typ,nums) in PUBLIC.items():
            organ=db.scalar(select(Organ).where(Organ.code==code))
            if not organ:
                organ=Organ(code=code,name=name,area=area,type=typ,active=True);db.add(organ);db.flush()
            existing={x.office_id for x in db.scalars(select(OrganOffice).where(OrganOffice.organ_id==organ.id)).all()}
            for pos,n in enumerate(nums):
                if offices[n].id not in existing:
                    db.add(OrganOffice(organ_id=organ.id,office_id=offices[n].id,position=pos))
        db.commit()
    finally: db.close()

@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)
    seed()

@app.get("/api/health")
def health(): return {"status":"ok","version":"8.0"}

@app.post("/api/auth/login")
def login(username:str=Form(...),password:str=Form(...),db:DBSession=Depends(get_db)):
    user=db.scalar(select(User).where(User.username==username))
    if not user or not verify_password(password,user.password_hash) or not user.active:
        raise HTTPException(401,"Usuário ou senha inválidos")
    return {"access_token":create_access_token(user),"token_type":"bearer","role":user.role,"username":user.username}

@app.get("/api/me")
def me(user:User=Depends(current_user)): return {"id":user.id,"username":user.username,"role":user.role}

@app.get("/api/users")
def list_users(db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin"))):
    rows=list(db.scalars(select(User).order_by(User.username)).all())
    return [{"id":x.id,"username":x.username,"role":x.role,"active":x.active,"created_at":x.created_at} for x in rows]

@app.post("/api/users")
def create_user(username:str,password:str,role:str="viewer",db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin"))):
    if role not in {"admin","operator","viewer"}: raise HTTPException(400,"Perfil inválido")
    if db.scalar(select(User).where(User.username==username)): raise HTTPException(409,"Usuário já existe")
    row=User(username=username,password_hash=hash_password(password),role=role,active=True);db.add(row);db.flush()
    audit(db,user,"CREATE","user",row.id,{"username":username,"role":role});db.commit();db.refresh(row)
    return {"id":row.id,"username":row.username,"role":row.role}

@app.patch("/api/users/{user_id}/status")
def set_user_status(user_id:int,active:bool,db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin"))):
    row=db.get(User,user_id)
    if not row: raise HTTPException(404,"Usuário não encontrado")
    row.active=active;audit(db,user,"UPDATE","user",row.id,{"active":active});db.commit()
    return {"ok":True}

@app.get("/api/organs")
def organs(db:DBSession=Depends(get_db),user:User=Depends(current_user)):
    rows=db.execute(select(Organ,Office,OrganOffice).join(OrganOffice,OrganOffice.organ_id==Organ.id).join(Office,Office.id==OrganOffice.office_id).where(Organ.active==True).order_by(Organ.id,OrganOffice.position)).all()
    out={}
    for organ,office,link in rows:
        out.setdefault(organ.id,{"id":organ.id,"code":organ.code,"name":organ.name,"area":organ.area,"type":organ.type,"offices":[]})["offices"].append({"id":office.id,"number":office.number,"status":office.status})
    return list(out.values())

def vacation_conflicts(db,office,start,end,ignore_id=None):
    if end<start: return ["Data final anterior à inicial."]
    duration=(end-start).days+1
    issues=[]
    if duration<10 or duration>30: issues.append("O período deve ter entre 10 e 30 dias.")
    q=select(Vacation).where(Vacation.office_id==office.id,Vacation.year==start.year)
    existing=list(db.scalars(q).all())
    if ignore_id: existing=[v for v in existing if v.id!=ignore_id]
    if len(existing)>=6: issues.append("Limite de 6 períodos anuais atingido.")
    if sum((v.end_date-v.start_date).days+1 for v in existing)+duration>60: issues.append("O total anual ultrapassa 60 dias.")
    if any(v.start_date<=end and start<=v.end_date for v in existing): issues.append("Há sobreposição com outro período da mesma Procuradoria.")
    primary=db.execute(select(Organ).join(OrganOffice).where(OrganOffice.office_id==office.id,Organ.type=="Câmara")).scalars().first()
    if primary:
        member_ids=list(db.scalars(select(OrganOffice.office_id).where(OrganOffice.organ_id==primary.id)).all())
        concurrent=set(db.scalars(select(Vacation.office_id).where(Vacation.office_id.in_(member_ids),Vacation.office_id!=office.id,Vacation.year==start.year,Vacation.start_date<=end,Vacation.end_date>=start)).all())
        if (1+len(concurrent))/len(member_ids)>0.5: issues.append("Conflito: mais de 50% das Procuradorias da Câmara ficariam simultaneamente em férias.")
    return issues

@app.get("/api/vacations")
def list_vacations(year:int=Query(...),db:DBSession=Depends(get_db),user:User=Depends(current_user)):
    rows=db.execute(select(Vacation,Office).join(Office,Office.id==Vacation.office_id).where(Vacation.year==year).order_by(Vacation.start_date)).all()
    return [{"id":v.id,"office_id":o.id,"office":o.number,"start":v.start_date,"end":v.end_date,"status":v.status} for v,o in rows]

@app.post("/api/vacations")
def create_vacation(office_id:int,start:date,end:date,status:str="approved",db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin","operator"))):
    office=db.get(Office,office_id)
    if not office: raise HTTPException(404,"Procuradoria não encontrada")
    issues=vacation_conflicts(db,office,start,end)
    if issues: raise HTTPException(409,detail={"conflicts":issues})
    row=Vacation(office_id=office_id,start_date=start,end_date=end,year=start.year,status=status,created_by=user.id);db.add(row);db.flush()
    audit(db,user,"CREATE","vacation",row.id,{"office":office.number,"start":start,"end":end});db.commit();db.refresh(row)
    return {"id":row.id}

@app.delete("/api/vacations/{vacation_id}")
def delete_vacation(vacation_id:int,db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin","operator"))):
    row=db.get(Vacation,vacation_id)
    if not row: raise HTTPException(404,"Férias não encontradas")
    audit(db,user,"DELETE","vacation",row.id,{"start":row.start_date,"end":row.end_date});db.delete(row);db.commit()
    return {"ok":True}

@app.get("/api/substitutions")
def list_substitutions(db:DBSession=Depends(get_db),user:User=Depends(current_user)):
    rows=db.execute(select(Substitution,Office).join(Office,Office.id==Substitution.office_id).where(Substitution.active==True)).all()
    return [{"id":s.id,"office_id":s.office_id,"office":o.number,"substitute_office_id":s.substitute_office_id} for s,o in rows]

@app.post("/api/substitutions")
def set_substitution(office_id:int,substitute_office_id:int,db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin","operator"))):
    if office_id==substitute_office_id: raise HTTPException(400,"Titular e substituta devem ser diferentes")
    row=db.scalar(select(Substitution).where(Substitution.office_id==office_id))
    if row: row.substitute_office_id=substitute_office_id;row.active=True
    else: row=Substitution(office_id=office_id,substitute_office_id=substitute_office_id,active=True);db.add(row)
    db.flush();audit(db,user,"UPSERT","substitution",row.id,{"office_id":office_id,"substitute_office_id":substitute_office_id});db.commit()
    return {"id":row.id}

def resolve_effective(db,office_id,session_date):
    vac=db.scalar(select(Vacation).where(Vacation.office_id==office_id,Vacation.start_date<=session_date,Vacation.end_date>=session_date))
    if not vac: return office_id,"regular"
    sub=db.scalar(select(Substitution).where(Substitution.office_id==office_id,Substitution.active==True))
    if not sub: return None,"pending_no_substitute"
    sub_vac=db.scalar(select(Vacation).where(Vacation.office_id==sub.substitute_office_id,Vacation.start_date<=session_date,Vacation.end_date>=session_date))
    return (None,"pending_substitute_unavailable") if sub_vac else (sub.substitute_office_id,"substitution")

@app.get("/api/sessions")
def list_sessions(year:int=Query(...),db:DBSession=Depends(get_db),user:User=Depends(current_user)):
    rows=list(db.scalars(select(Session).where(func.extract("year",Session.session_date)==year).order_by(Session.session_date)).all())
    return [{"id":x.id,"organ_id":x.organ_id,"date":x.session_date,"nominal_office_id":x.nominal_office_id,"effective_office_id":x.effective_office_id,"status":x.status,"origin":x.origin,"note":x.note} for x in rows]

@app.post("/api/sessions")
def create_session(organ_id:int,session_date:date,nominal_office_id:int,note:Optional[str]=None,db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin","operator"))):
    effective,status=resolve_effective(db,nominal_office_id,session_date)
    row=Session(organ_id=organ_id,session_date=session_date,nominal_office_id=nominal_office_id,effective_office_id=effective,status=status,origin="manual",note=note,created_by=user.id)
    db.add(row);db.flush();audit(db,user,"CREATE","session",row.id,{"date":session_date,"status":status});db.commit();db.refresh(row)
    return {"id":row.id,"status":row.status,"effective_office_id":row.effective_office_id}

@app.get("/api/public/dashboard")
def public_dashboard(year:int=Query(...),db:DBSession=Depends(get_db)):
    rows=db.execute(select(Session,Organ,Office).join(Organ,Organ.id==Session.organ_id).join(Office,Office.id==Session.nominal_office_id).where(func.extract("year",Session.session_date)==year).order_by(Session.session_date)).all()
    out=[]
    for s,o,off in rows:
        effective=db.get(Office,s.effective_office_id) if s.effective_office_id else None
        out.append({"date":s.session_date,"organ":o.name,"area":o.area,"nominal_office":off.number,"effective_office":effective.number if effective else None,"status":s.status,"note":s.note})
    return out

@app.get("/api/audit")
def audit_list(limit:int=100,db:DBSession=Depends(get_db),user:User=Depends(require_roles("admin"))):
    rows=list(db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(min(limit,500))).all())
    return [{"id":x.id,"user_id":x.user_id,"action":x.action,"entity":x.entity,"entity_id":x.entity_id,"details":x.details,"created_at":x.created_at} for x in rows]
