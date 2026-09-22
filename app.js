
const chambers = [
  {name:"1ª Câmara de Direito Público", area:"Direito Público", offices:["13ª","20ª","26ª"]},
  {name:"2ª Câmara de Direito Público", area:"Direito Público", offices:["8ª","14ª","52ª"]},
  {name:"3ª Câmara de Direito Público", area:"Direito Público", offices:["17ª","43ª","21ª"], officeStatus:{"21ª":"Convocado — a ser preenchido"}},
  {name:"1ª Câmara de Direito Privado", area:"Direito Privado", offices:["36ª","40ª","53ª"]},
  {name:"2ª Câmara de Direito Privado", area:"Direito Privado", offices:["39ª","30ª","4ª"]},
  {name:"3ª Câmara de Direito Privado", area:"Direito Privado", offices:["1ª","38ª","51ª"]},
  {name:"4ª Câmara de Direito Privado", area:"Direito Privado", offices:["46ª","57ª","56ª"]},
  {name:"5ª Câmara de Direito Privado", area:"Direito Privado", offices:["25ª","34ª","45ª"]},
  {name:"6ª Câmara de Direito Privado", area:"Direito Privado", offices:["22ª","27ª","32ª"]}
];

const offices = chambers.flatMap(c=>c.offices.map(o=>({
  office:o, chamber:c.name, area:c.area, status:(c.officeStatus&&c.officeStatus[o])||""
})));

let vacations = JSON.parse(localStorage.getItem("escala_tjce_v3")||"[]");
let tjceScale = JSON.parse(localStorage.getItem("escala_tjce_v4_tjce")||"[]");
let substitutions = JSON.parse(localStorage.getItem("escala_tjce_v4_subs")||"[]");
let sessionConfig = JSON.parse(localStorage.getItem("escala_tjce_v5_sessions")||"{}");
let exclusions = JSON.parse(localStorage.getItem("escala_tjce_v5_exclusions")||"[]");

const $=s=>document.querySelector(s);
const year=()=>Number($("#year").value);
const parseDate=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(Date.UTC(y,m-1,d))};
const fmt=s=>s?parseDate(s).toLocaleDateString("pt-BR",{timeZone:"UTC"}):"—";
const daysInclusive=(a,b)=>Math.floor((parseDate(b)-parseDate(a))/86400000)+1;
const overlaps=(a1,a2,b1,b2)=>parseDate(a1)<=parseDate(b2)&&parseDate(b1)<=parseDate(a2);
const byOffice=o=>offices.find(x=>x.office===o);
const current=()=>vacations.filter(v=>parseDate(v.start).getUTCFullYear()===year());

function save(){
  localStorage.setItem("escala_tjce_v3",JSON.stringify(vacations));
  localStorage.setItem("escala_tjce_v4_tjce",JSON.stringify(tjceScale));
  localStorage.setItem("escala_tjce_v4_subs",JSON.stringify(substitutions));
  localStorage.setItem("escala_tjce_v5_sessions",JSON.stringify(sessionConfig));
  localStorage.setItem("escala_tjce_v5_exclusions",JSON.stringify(exclusions));
}

function officeDays(o){
  return current().filter(v=>v.office===o).reduce((s,v)=>s+daysInclusive(v.start,v.end),0);
}
function officePeriods(o){return current().filter(v=>v.office===o)}

function validate(office,start,end,ignore=null){
  const issues=[],warnings=[];
  const d=daysInclusive(start,end);
  if(parseDate(start).getUTCFullYear()!==year()) issues.push(`O início deve ocorrer em ${year()}.`);
  if(d<10) issues.push("Período inferior a 10 dias.");
  if(d>30) issues.push("Período superior a 30 dias.");
  const own=current().filter(v=>v.office===office&&v.id!==ignore);
  if(own.length>=6) issues.push("A Procuradoria já possui 6 períodos cadastrados.");
  if(own.some(v=>overlaps(start,end,v.start,v.end))) issues.push("Há sobreposição com outro período da mesma Procuradoria.");
  const total=own.reduce((s,v)=>s+daysInclusive(v.start,v.end),0)+d;
  if(total>60) issues.push("O total anual ultrapassa 60 dias.");

  const info=byOffice(office);
  const chamberOffices=chambers.find(c=>c.name===info.chamber).offices;
  const concurrent=new Set(current()
    .filter(v=>v.id!==ignore&&v.office!==office&&chamberOffices.includes(v.office)&&overlaps(start,end,v.start,v.end))
    .map(v=>v.office));
  const count=1+concurrent.size;
  if(count/chamberOffices.length>0.5){
    issues.push(`Conflito: ${count} de ${chamberOffices.length} Procuradorias da Câmara ficariam simultaneamente em férias.`);
  }

  let specialDays=0;
  [...own,{start,end}].forEach(v=>{
    let d0=parseDate(v.start),de=parseDate(v.end);
    while(d0<=de){
      if([0,6,11].includes(d0.getUTCMonth())) specialDays++;
      d0=new Date(d0.getTime()+86400000);
    }
  });
  if(specialDays>30) warnings.push("Mais de 30 dias recaem em janeiro, julho e dezembro.");
  return {issues,warnings,total,d};
}

function badge(text,cls){return `<span class="badge ${cls}">${text}</span>`}

function populate(){
  const officeOpts=offices.slice().sort((a,b)=>parseInt(a.office)-parseInt(b.office))
    .map(o=>`<option value="${o.office}">${o.office} Procuradoria${o.status?" ("+o.status+")":""} — ${o.chamber}</option>`).join("");
  ["#vacOffice","#tjceOffice","#subOffice","#substituteOffice"].forEach(id=>$(id).innerHTML=officeOpts);

  const filters='<option value="all">Todas as Câmaras</option>'+
    chambers.map(c=>`<option value="${c.name}">${c.name}</option>`).join("");
  ["#dashFilter","#calendarFilter","#tjceFilter","#conflictFilter","#consolidatedFilter","#publicChamberFilter"]
    .forEach(id=>$(id).innerHTML=filters);

  $("#chamberPanelFilter").innerHTML=chambers.map(c=>`<option value="${c.name}">${c.name}</option>`).join("");
  $("#exclusionChamber").innerHTML=chambers.map(c=>`<option value="${c.name}">${c.name}</option>`).join("");
}

function conflictCount(){
  return current().filter(v=>validate(v.office,v.start,v.end,v.id).issues.length).length;
}

function renderDashboard(){
  const f=$("#dashFilter").value;
  const data=f==="all"?offices:offices.filter(o=>o.chamber===f);
  $("#kpiOffices").textContent=offices.length;
  $("#kpiPeriods").textContent=current().length;
  $("#kpiWithVac").textContent=new Set(current().map(v=>v.office)).size;
  $("#kpiConflicts").textContent=conflictCount();

  const rows=data.map(o=>{
    const ps=officePeriods(o.office),total=officeDays(o.office);
    const st=total===60?badge("60 dias","ok"):total<60?badge(`${60-total} dias pendentes`,"warn"):badge("Acima de 60","danger");
    return `<tr><td><strong>${o.office} Procuradoria</strong>${o.status?`<br><small>${o.status}</small>`:""}</td>
      <td>${o.chamber}</td><td>${ps.map(v=>`${fmt(v.start)} a ${fmt(v.end)}`).join("<br>")||"—"}</td>
      <td>${total}</td><td>${st}</td></tr>`;
  }).join("");
  $("#dashboardTable").innerHTML=`<table><thead><tr><th>Procuradoria</th><th>Câmara</th><th>Períodos</th><th>Total</th><th>Situação</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderVacations(){
  const rows=current().slice().sort((a,b)=>parseDate(a.start)-parseDate(b.start)).map(v=>{
    const info=byOffice(v.office),val=validate(v.office,v.start,v.end,v.id);
    const st=val.issues.length?badge("Conflito","danger"):val.warnings.length?badge("Atenção","warn"):badge("Regular","ok");
    return `<tr><td>${v.office} Procuradoria</td><td>${info.chamber}</td><td>${fmt(v.start)}</td><td>${fmt(v.end)}</td>
      <td>${daysInclusive(v.start,v.end)}</td><td>${st}<br><small>${[...val.issues,...val.warnings].join(" ")}</small></td>
      <td><button class="danger-btn" data-del="${v.id}" type="button">Excluir</button></td></tr>`;
  }).join("");
  $("#vacationTable").innerHTML=`<table><thead><tr><th>Procuradoria</th><th>Câmara</th><th>Início</th><th>Fim</th><th>Dias</th><th>Validação</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  document.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{
    vacations=vacations.filter(v=>v.id!==Number(b.dataset.del));save();renderAll();
  }));
}

function uniqueCoverageRows(){
  const rows=[];
  current().forEach(v=>{
    const info=byOffice(v.office),chamber=chambers.find(c=>c.name===info.chamber);
    const overlapping=current().filter(x=>x.office!==v.office&&chamber.offices.includes(x.office)&&overlaps(v.start,v.end,x.start,x.end));
    const unavailable=new Set([v.office,...overlapping.map(x=>x.office)]);
    const available=chamber.offices.filter(o=>!unavailable.has(o));
    const val=validate(v.office,v.start,v.end,v.id);
    rows.push({
      office:v.office,chamber:info.chamber,start:v.start,end:v.end,available,
      status:val.issues.length?"danger":available.length>=2?"ok":"warn",
      note:val.issues.length?val.issues.join(" "):available.length>=2?"Cobertura preservada na própria Câmara.":"Somente uma Procuradoria permanece disponível na Câmara."
    });
  });
  return rows.sort((a,b)=>parseDate(a.start)-parseDate(b.start));
}

function renderScale(){
  const rows=uniqueCoverageRows().map(r=>{
    const st=r.status==="danger"?badge("Conflito","danger"):r.status==="warn"?badge("Atenção","warn"):badge("Cobertura regular","ok");
    return `<tr><td>${fmt(r.start)} a ${fmt(r.end)}</td><td>${r.chamber}</td><td><strong>${r.office} Procuradoria</strong></td>
      <td>${r.available.length?r.available.map(o=>o+" Procuradoria").join(", "):"Nenhuma"}</td><td>${st}<br><small>${r.note}</small></td></tr>`;
  }).join("");
  $("#scaleTable").innerHTML=current().length?`<table><thead><tr><th>Período</th><th>Câmara</th><th>Em férias</th><th>Disponíveis para cobertura</th><th>Situação</th></tr></thead><tbody>${rows}</tbody></table>`:`<p>Nenhum período de férias foi lançado para ${year()}.</p>`;
}

function renderCalendar(){
  const f=$("#calendarFilter").value,data=f==="all"?offices:offices.filter(o=>o.chamber===f);
  const months=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  let html=`<table><thead><tr><th>Procuradoria</th>${months.map(m=>`<th>${m}</th>`).join("")}</tr></thead><tbody>`;
  data.forEach(o=>{
    html+=`<tr><td><strong>${o.office}</strong><br><small>${o.chamber.replace(" Câmara de "," C. ")}</small></td>`;
    months.forEach((_,i)=>{
      const ps=current().filter(v=>v.office===o.office&&parseDate(v.start).getUTCMonth()<=i&&parseDate(v.end).getUTCMonth()>=i);
      html+=`<td class="month">${ps.map(v=>`<span class="chip">${fmt(v.start)}–${fmt(v.end)}</span>`).join("")}</td>`;
    });
    html+="</tr>";
  });
  $("#calendarTable").innerHTML=html+"</tbody></table>";
}

function renderChambers(){
  $("#chambersTable").innerHTML=`<table><thead><tr><th>Área</th><th>Câmara</th><th>Procuradorias</th></tr></thead><tbody>${
    chambers.map(c=>`<tr><td>${c.area}</td><td>${c.name}</td><td>${c.offices.map(o=>o+" Procuradoria"+(c.officeStatus&&c.officeStatus[o]?" ("+c.officeStatus[o]+")":"")).join(" • ")}</td></tr>`).join("")
  }</tbody></table>`;
}

function vacationOnDate(office,date){
  return current().find(v=>v.office===office&&parseDate(v.start)<=parseDate(date)&&parseDate(date)<=parseDate(v.end))||null;
}
function substituteFor(office){
  const s=substitutions.find(x=>x.office===office);
  return s?s.substitute:"";
}
function substituteAvailable(sub,date){return !!sub&&!vacationOnDate(sub,date)}

const weekdays=[
  {value:"",label:"Não gerar"},{value:"1",label:"Segunda-feira"},{value:"2",label:"Terça-feira"},
  {value:"3",label:"Quarta-feira"},{value:"4",label:"Quinta-feira"},{value:"5",label:"Sexta-feira"}
];
function isoDateUTC(d){return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`}
function excluded(chamber,date){return exclusions.some(x=>x.chamber===chamber&&x.date===date)}

function renderSessionConfig(){
  const rows=chambers.map(c=>{
    const selected=String(sessionConfig[c.name]??"");
    return `<tr><td>${c.area}</td><td>${c.name}</td><td><select class="session-select" data-session-chamber="${c.name}">
      ${weekdays.map(w=>`<option value="${w.value}" ${w.value===selected?"selected":""}>${w.label}</option>`).join("")}
    </select></td></tr>`;
  }).join("");
  $("#sessionConfigTable").innerHTML=`<table><thead><tr><th>Área</th><th>Câmara</th><th>Dia semanal da sessão</th></tr></thead><tbody>${rows}</tbody></table>`;
  document.querySelectorAll("[data-session-chamber]").forEach(sel=>sel.addEventListener("change",()=>{
    sessionConfig[sel.dataset.sessionChamber]=sel.value;save();
  }));
}

function renderExclusions(){
  const rows=exclusions.filter(x=>parseDate(x.date).getUTCFullYear()===year()).sort((a,b)=>parseDate(a.date)-parseDate(b.date))
    .map(x=>`<tr><td>${fmt(x.date)}</td><td>${x.chamber}</td><td>${x.reason||"—"}</td><td><button class="danger-btn" type="button" data-ex-del="${x.id}">Excluir</button></td></tr>`).join("");
  $("#exclusionTable").innerHTML=`<table><thead><tr><th>Data</th><th>Câmara</th><th>Motivo</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  document.querySelectorAll("[data-ex-del]").forEach(b=>b.addEventListener("click",()=>{
    exclusions=exclusions.filter(x=>x.id!==Number(b.dataset.exDel));save();renderAll();
  }));
}

function renderRotation(){
  $("#rotationTable").innerHTML=`<table><thead><tr><th>Câmara</th><th>Sequência nominal do rodízio</th></tr></thead><tbody>${
    chambers.map(c=>`<tr><td>${c.name}</td><td class="rotation-seq">${c.offices.join(" → ")}</td></tr>`).join("")
  }</tbody></table>`;
}

function generateAnnualScale(){
  const configured=chambers.filter(c=>String(sessionConfig[c.name]??"")!=="");
  const msg=$("#generatorMessage");
  if(!configured.length){
    msg.className="message show warn";msg.textContent="Defina ao menos um dia semanal de sessão antes de gerar a escala.";return;
  }
  tjceScale=tjceScale.filter(x=>!(x.generated&&parseDate(x.date).getUTCFullYear()===year()));
  let generatedCount=0,skippedCount=0;
  configured.forEach(c=>{
    const weekday=Number(sessionConfig[c.name]);
    let rotationIndex=0,d=new Date(Date.UTC(year(),0,1)),last=new Date(Date.UTC(year(),11,31));
    while(d<=last){
      if(d.getUTCDay()===weekday){
        const date=isoDateUTC(d);
        if(excluded(c.name,date)){skippedCount++}
        else{
          tjceScale.push({id:Date.now()+generatedCount,office:c.offices[rotationIndex%c.offices.length],date,note:"Rodízio automático",generated:true});
          generatedCount++;rotationIndex++;
        }
      }
      d=new Date(d.getTime()+86400000);
    }
  });
  save();renderAll();
  msg.className="message show ok";
  msg.textContent=`Escala anual gerada: ${generatedCount} sessões incluídas e ${skippedCount} datas excluídas.`;
}

function renderTJCE(){
  const f=$("#tjceFilter").value;
  const rows=tjceScale.filter(x=>parseDate(x.date).getUTCFullYear()===year())
    .filter(x=>f==="all"||byOffice(x.office).chamber===f)
    .sort((a,b)=>parseDate(a.date)-parseDate(b.date))
    .map(x=>{
      const info=byOffice(x.office),vac=vacationOnDate(x.office,x.date);
      let situation=badge("Titular disponível","ok"),effective=x.office+" Procuradoria";
      if(vac){
        const sub=substituteFor(x.office);
        if(sub&&substituteAvailable(sub,x.date)){situation=badge("Substituição aplicada","warn");effective=sub+" Procuradoria"}
        else if(sub){situation=badge("Conflito: substituto indisponível","danger");effective=sub+" Procuradoria (indisponível)"}
        else{situation=badge("Conflito: sem substituto definido","danger");effective="Pendente"}
      }
      return `<tr><td>${fmt(x.date)}</td><td>${info.chamber}</td><td><strong>${x.office} Procuradoria</strong></td>
        <td>${x.generated?"Automática":"Manual"}</td><td>${x.note||"—"}</td><td>${situation}</td><td>${effective}</td>
        <td><button class="danger-btn" type="button" data-tjce-del="${x.id}">Excluir</button></td></tr>`;
    }).join("");
  $("#tjceTable").innerHTML=`<table><thead><tr><th>Data</th><th>Câmara</th><th>Procuradoria nominal</th><th>Origem</th><th>Observação</th><th>Situação</th><th>Atuação efetiva</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  document.querySelectorAll("[data-tjce-del]").forEach(b=>b.addEventListener("click",()=>{
    tjceScale=tjceScale.filter(x=>x.id!==Number(b.dataset.tjceDel));save();renderAll();
  }));
}

function renderSubstitutions(){
  const rows=offices.map(o=>{
    const s=substitutions.find(x=>x.office===o.office);
    return `<tr><td>${o.office} Procuradoria</td><td>${o.chamber}</td><td>${s?s.substitute+" Procuradoria":"—"}</td>
      <td>${s?`<button class="danger-btn" type="button" data-sub-del="${o.office}">Excluir</button>`:""}</td></tr>`;
  }).join("");
  $("#subTable").innerHTML=`<table><thead><tr><th>Titular</th><th>Câmara</th><th>Substituta</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  document.querySelectorAll("[data-sub-del]").forEach(b=>b.addEventListener("click",()=>{
    substitutions=substitutions.filter(x=>x.office!==b.dataset.subDel);save();renderAll();
  }));
}

function chamberConflictPairs(chamberName){
  const offs=chambers.find(c=>c.name===chamberName)?.offices||[];
  const list=current().filter(v=>offs.includes(v.office)),pairs=[];
  for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++){
    if(list[i].office!==list[j].office&&overlaps(list[i].start,list[i].end,list[j].start,list[j].end)) pairs.push([list[i],list[j]]);
  }
  return pairs;
}

function renderChamberPanel(){
  const chamberName=$("#chamberPanelFilter").value,c=chambers.find(x=>x.name===chamberName);
  if(!c)return;
  const vacs=current().filter(v=>c.offices.includes(v.office));
  const sessions=tjceScale.filter(x=>parseDate(x.date).getUTCFullYear()===year()&&c.offices.includes(x.office));
  const conflicts=chamberConflictPairs(chamberName);

  const summary=`<div class="chamber-summary">
    <div class="mini-card"><span>Procuradorias</span><strong>${c.offices.length}</strong></div>
    <div class="mini-card"><span>Períodos de férias</span><strong>${vacs.length}</strong></div>
    <div class="mini-card"><span>Sessões TJCE</span><strong>${sessions.length}</strong></div>
    <div class="mini-card"><span>Conflitos</span><strong>${conflicts.length}</strong></div></div>`;

  const vacTable=`<h3 class="section-title">Férias</h3><table><thead><tr><th>Procuradoria</th><th>Períodos</th><th>Total</th><th>Situação</th></tr></thead><tbody>${
    c.offices.map(o=>{const ps=officePeriods(o),total=officeDays(o);return `<tr><td>${o} Procuradoria</td><td>${ps.map(v=>fmt(v.start)+" a "+fmt(v.end)).join("<br>")||"—"}</td><td>${total}</td><td>${total===60?badge("60 dias","ok"):badge((60-total)+" dias pendentes","warn")}</td></tr>`}).join("")
  }</tbody></table>`;

  const subTable=`<h3 class="section-title">Substituições</h3><table><thead><tr><th>Titular</th><th>Substituta</th></tr></thead><tbody>${
    c.offices.map(o=>`<tr><td>${o} Procuradoria</td><td>${substituteFor(o)?substituteFor(o)+" Procuradoria":"—"}</td></tr>`).join("")
  }</tbody></table>`;

  $("#chamberPanelContent").innerHTML=summary+vacTable+subTable;
}

function renderConflicts(){
  const f=$("#conflictFilter").value,target=f==="all"?chambers:chambers.filter(c=>c.name===f),groups=[];
  target.forEach(c=>chamberConflictPairs(c.name).forEach(pair=>groups.push({chamber:c.name,a:pair[0],b:pair[1]})));
  if(!groups.length){$("#conflictTable").innerHTML="<p>Nenhuma sobreposição de férias foi identificada.</p>";return}
  $("#conflictTable").innerHTML=groups.map((g,i)=>`<div class="conflict-group"><h3>${g.chamber} — conflito ${i+1}</h3>
    <div class="compare-grid"><div class="compare-card"><strong>${g.a.office} Procuradoria</strong><div>${fmt(g.a.start)} a ${fmt(g.a.end)}</div></div>
    <div class="compare-card"><strong>${g.b.office} Procuradoria</strong><div>${fmt(g.b.start)} a ${fmt(g.b.end)}</div></div></div>
    <p>${badge("Conflito de simultaneidade","danger")} A preferência não é decidida automaticamente sem dados funcionais de antiguidade.</p></div>`).join("");
}

function consolidatedRows(){
  return tjceScale.filter(x=>parseDate(x.date).getUTCFullYear()===year()).sort((a,b)=>parseDate(a.date)-parseDate(b.date)).map(x=>{
    const info=byOffice(x.office),vac=vacationOnDate(x.office,x.date);
    let effective=x.office,situation="Titular disponível",severity="ok";
    if(vac){
      const sub=substituteFor(x.office);
      if(sub&&substituteAvailable(sub,x.date)){effective=sub;situation="Substituição aplicada";severity="warn"}
      else if(sub){effective=sub;situation="Conflito: substituto indisponível";severity="danger"}
      else{effective="";situation="Conflito: sem substituto definido";severity="danger"}
    }
    return {date:x.date,chamber:info.chamber,nominal:x.office,effective,situation,severity,origin:x.generated?"Automática":"Manual",note:x.note||""};
  });
}

function renderConsolidated(){
  const f=$("#consolidatedFilter").value;
  const rows=consolidatedRows().filter(r=>f==="all"||r.chamber===f).map(r=>`<tr><td>${fmt(r.date)}</td><td>${r.chamber}</td>
    <td>${r.nominal} Procuradoria</td><td>${r.origin}</td><td>${r.note||"—"}</td><td>${badge(r.situation,r.severity)}</td>
    <td>${r.effective?r.effective+" Procuradoria":"Pendente"}</td></tr>`).join("");
  $("#consolidatedTable").innerHTML=`<table><thead><tr><th>Data</th><th>Câmara</th><th>Procuradoria nominal</th><th>Origem</th><th>Observação</th><th>Situação</th><th>Atuação efetiva</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function publicFilteredRows(){
  const area=$("#publicAreaFilter").value,chamber=$("#publicChamberFilter").value,month=$("#publicMonthFilter").value;
  return consolidatedRows().filter(r=>{
    const info=chambers.find(c=>c.name===r.chamber);
    return (area==="all"||info?.area===area)&&(chamber==="all"||r.chamber===chamber)&&(month==="all"||parseDate(r.date).getUTCMonth()===Number(month));
  });
}

function renderPublicDashboard(){
  const rows=publicFilteredRows();
  $("#publicYearLabel").textContent=year();
  $("#publicKpiSessions").textContent=rows.length;
  $("#publicKpiChambers").textContent=new Set(rows.map(r=>r.chamber)).size;
  $("#publicKpiSubs").textContent=rows.filter(r=>r.situation==="Substituição aplicada").length;
  $("#publicKpiPending").textContent=rows.filter(r=>r.severity==="danger").length;

  $("#publicAgenda").innerHTML=rows.length?`<table><thead><tr><th>Data</th><th>Câmara</th><th>Procuradoria nominal</th><th>Situação</th><th>Atuação efetiva</th></tr></thead><tbody>${
    rows.map(r=>`<tr><td>${fmt(r.date)}</td><td>${r.chamber}</td><td>${r.nominal} Procuradoria</td><td>${r.situation==="Substituição aplicada"?badge("Substituição","warn"):r.severity==="danger"?badge("Pendente","danger"):badge("Regular","ok")}</td><td>${r.effective?r.effective+" Procuradoria":"Pendente"}</td></tr>`).join("")
  }</tbody></table>`:"<p>Nenhuma atuação cadastrada para os filtros selecionados.</p>";

  const names=[...new Set(rows.map(r=>r.chamber))].sort();
  $("#publicChamberSummary").innerHTML=names.length?`<table><thead><tr><th>Câmara</th><th>Sessões</th><th>Substituições</th><th>Pendências</th></tr></thead><tbody>${
    names.map(n=>{const s=rows.filter(r=>r.chamber===n);return `<tr><td>${n}</td><td>${s.length}</td><td>${s.filter(r=>r.situation==="Substituição aplicada").length}</td><td>${s.filter(r=>r.severity==="danger").length}</td></tr>`}).join("")
  }</tbody></table>`:"<p>Nenhum dado disponível.</p>";

  const grouped=[...Array(12).keys()].map(m=>{
    const rs=rows.filter(r=>parseDate(r.date).getUTCMonth()===m);
    return `<tr><td>${["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][m]}</td><td>${rs.length}</td><td>${new Set(rs.map(r=>r.chamber)).size}</td><td>${rs.filter(r=>r.situation==="Substituição aplicada").length}</td></tr>`;
  }).join("");
  $("#publicCalendar").innerHTML=`<table><thead><tr><th>Mês</th><th>Atuações</th><th>Câmaras</th><th>Substituições</th></tr></thead><tbody>${grouped}</tbody></table>`;

  const area=$("#publicAreaFilter").value,chamber=$("#publicChamberFilter").value,month=$("#publicMonthFilter").value;
  const vacRows=offices.filter(o=>(area==="all"||o.area===area)&&(chamber==="all"||o.chamber===chamber)).map(o=>{
    let ps=officePeriods(o.office);
    if(month!=="all") ps=ps.filter(v=>parseDate(v.start).getUTCMonth()<=Number(month)&&parseDate(v.end).getUTCMonth()>=Number(month));
    return {o,ps};
  }).filter(x=>x.ps.length);
  $("#publicVacations").innerHTML=vacRows.length?`<table><thead><tr><th>Procuradoria</th><th>Câmara</th><th>Períodos</th></tr></thead><tbody>${
    vacRows.map(x=>`<tr><td>${x.o.office} Procuradoria</td><td>${x.o.chamber}</td><td>${x.ps.map(v=>fmt(v.start)+" a "+fmt(v.end)).join("<br>")}</td></tr>`).join("")
  }</tbody></table>`:"<p>Nenhum período de férias cadastrado para os filtros selecionados.</p>";
}

function syncPublicChamberOptions(){
  const area=$("#publicAreaFilter").value,currentVal=$("#publicChamberFilter").value||"all";
  const filtered=area==="all"?chambers:chambers.filter(c=>c.area===area);
  $("#publicChamberFilter").innerHTML='<option value="all">Todas as Câmaras</option>'+filtered.map(c=>`<option value="${c.name}">${c.name}</option>`).join("");
  if([...$("#publicChamberFilter").options].some(o=>o.value===currentVal)) $("#publicChamberFilter").value=currentVal;
}

function renderAll(){
  syncPublicChamberOptions();
  renderPublicDashboard();
  renderDashboard();
  renderChamberPanel();
  renderConflicts();
  renderConsolidated();
  renderVacations();
  renderScale();
  renderSessionConfig();
  renderExclusions();
  renderRotation();
  renderTJCE();
  renderSubstitutions();
  renderCalendar();
  renderChambers();
}

$("#vacationForm").addEventListener("submit",e=>{
  e.preventDefault();
  const office=$("#vacOffice").value,start=$("#vacStart").value,end=$("#vacEnd").value,msg=$("#message");
  if(!start||!end||parseDate(end)<parseDate(start)){msg.className="message show danger";msg.textContent="Informe um intervalo de datas válido.";return}
  const val=validate(office,start,end);
  vacations.push({id:Date.now(),office,start,end});save();renderAll();
  msg.className="message show "+(val.issues.length?"danger":val.warnings.length?"warn":"ok");
  msg.textContent=val.issues.length?[...val.issues,...val.warnings].join(" "):val.warnings.length?val.warnings.join(" "):"Período incluído.";
});

$("#tjceForm").addEventListener("submit",e=>{
  e.preventDefault();
  const office=$("#tjceOffice").value,date=$("#tjceDate").value,note=$("#tjceNote").value.trim(),msg=$("#tjceMessage");
  if(!date||parseDate(date).getUTCFullYear()!==year()){msg.className="message show danger";msg.textContent=`Informe uma data válida de ${year()}.`;return}
  if(tjceScale.some(x=>x.office===office&&x.date===date)){msg.className="message show danger";msg.textContent="Essa Procuradoria já está cadastrada nessa data.";return}
  tjceScale.push({id:Date.now(),office,date,note,generated:false});save();renderAll();
  msg.className="message show ok";msg.textContent="Atuação adicionada à escala.";
});

$("#subForm").addEventListener("submit",e=>{
  e.preventDefault();
  const office=$("#subOffice").value,sub=$("#substituteOffice").value,msg=$("#subMessage");
  if(office===sub){msg.className="message show danger";msg.textContent="A substituta deve ser diferente da titular.";return}
  substitutions=substitutions.filter(x=>x.office!==office);
  substitutions.push({office,substitute:sub});save();renderAll();
  msg.className="message show ok";msg.textContent="Substituição cadastrada.";
});

$("#exclusionForm").addEventListener("submit",e=>{
  e.preventDefault();
  const chamber=$("#exclusionChamber").value,date=$("#exclusionDate").value,reason=$("#exclusionReason").value.trim();
  if(!date||parseDate(date).getUTCFullYear()!==year())return;
  if(!exclusions.some(x=>x.chamber===chamber&&x.date===date)){
    exclusions.push({id:Date.now(),chamber,date,reason});save();renderAll();
  }
});

$("#generateAnnualBtn").addEventListener("click",generateAnnualScale);
$("#generateBtn").addEventListener("click",renderScale);
$("#dashFilter").addEventListener("change",renderDashboard);
$("#calendarFilter").addEventListener("change",renderCalendar);
$("#tjceFilter").addEventListener("change",renderTJCE);
$("#chamberPanelFilter").addEventListener("change",renderChamberPanel);
$("#conflictFilter").addEventListener("change",renderConflicts);
$("#consolidatedFilter").addEventListener("change",renderConsolidated);
$("#year").addEventListener("change",renderAll);
$("#printBtn").addEventListener("click",()=>window.print());

$("#publicAreaFilter").addEventListener("change",()=>{syncPublicChamberOptions();renderPublicDashboard()});
$("#publicChamberFilter").addEventListener("change",renderPublicDashboard);
$("#publicMonthFilter").addEventListener("change",renderPublicDashboard);
$("#publicResetFilters").addEventListener("click",()=>{
  $("#publicAreaFilter").value="all";syncPublicChamberOptions();$("#publicChamberFilter").value="all";$("#publicMonthFilter").value="all";renderPublicDashboard();
});

$("#exportConsolidated").addEventListener("click",()=>{
  const f=$("#consolidatedFilter").value;
  const rows=[["DATA","CÂMARA","PROCURADORIA NOMINAL","ORIGEM","OBSERVAÇÃO","SITUAÇÃO","ATUAÇÃO EFETIVA"]];
  consolidatedRows().filter(r=>f==="all"||r.chamber===f).forEach(r=>rows.push([
    fmt(r.date),r.chamber,r.nominal+" Procuradoria",r.origin,r.note,r.situation,r.effective?r.effective+" Procuradoria":"Pendente"
  ]));
  const csv=rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`escala_consolidada_tjce_${year()}.csv`;a.click();URL.revokeObjectURL(a.href);
});

$("#exportBtn").addEventListener("click",()=>{
  const rows=[["TIPO","DATA/PERÍODO","CÂMARA","PROCURADORIA","SITUAÇÃO"]];
  uniqueCoverageRows().forEach(r=>rows.push(["FÉRIAS",fmt(r.start)+" a "+fmt(r.end),r.chamber,r.office+" Procuradoria",r.note]));
  consolidatedRows().forEach(r=>rows.push(["ESCALA TJCE",fmt(r.date),r.chamber,r.nominal+" Procuradoria",r.situation]));
  const csv=rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`escala_tjce_completa_${year()}.csv`;a.click();URL.revokeObjectURL(a.href);
});

document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  $("#"+btn.dataset.view).classList.add("active");
}));

populate();
renderAll();
