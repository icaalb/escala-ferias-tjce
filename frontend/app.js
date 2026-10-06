const API="/api";
const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const params=value=>new URLSearchParams(value).toString();
const formatDate=value=>value?new Date(value+"T00:00:00").toLocaleDateString("pt-BR"):"—";
const months=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
let token=sessionStorage.getItem("mpce_token")||"";
let me=null,organs=[],offices=new Map(),vacations=[],sessions=[],substitutions=[],schedule=[],exclusions=[];
const year=()=>Number($("#publicYear").value);
const canWrite=()=>me&&["admin","operator"].includes(me.role);
function notice(selector,message,error=false){const el=$(selector);el.textContent=message;el.className=error?"error":"ok"}
function showLogin(){me=null;$("#login").hidden=false;$("#public").hidden=true;$("#admin").hidden=true;$("#logout").hidden=true}
async function api(path,options={}){
  const response=await fetch(API+path,{...options,headers:{Authorization:"Bearer "+token,...options.headers}});
  if(!response.ok){
    const body=await response.json().catch(()=>({detail:response.statusText}));
    if(response.status===401){token="";sessionStorage.removeItem("mpce_token");showLogin()}
    throw Error(typeof body.detail==="string"?body.detail:body.detail?.conflicts?.join(" ")||JSON.stringify(body.detail));
  }
  return response.json();
}
const officeLabel=id=>offices.get(id)?.number||"—";
const organLabel=id=>organs.find(x=>x.id===id)?.name||"—";
const table=(heads,rows)=>'<div class="scroll"><table><thead><tr>'+heads.map(x=>'<th>'+escapeHtml(x)+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';
const cell=value=>'<td>'+escapeHtml(value)+'</td>';
const officeIds=o=>o.offices.map(x=>x.id);
const chamberOf=id=>organs.find(o=>o.type==="Câmara"&&officeIds(o).includes(id));
const covers=(v,date)=>v.start<=date&&date<=v.end;
function conflicts(){
  const pairs=[];
  for(const chamber of organs.filter(o=>o.type==="Câmara")){
    const list=vacations.filter(v=>officeIds(chamber).includes(v.office_id));
    for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
      if(list[i].office_id!==list[j].office_id&&list[i].start<=list[j].end&&list[j].start<=list[i].end)
        pairs.push({chamber,a:list[i],b:list[j]});
    }
  }
  return pairs;
}
function fillSelects(){
  const sorted=[...offices].sort((a,b)=>parseInt(a[1].number)-parseInt(b[1].number));
  const option=([id,o])=>'<option value="'+id+'">'+escapeHtml(o.number)+' Procuradoria</option>';
  ["#vacOffice","#sessionOffice","#subOffice","#substituteOffice"].forEach(s=>$(s).innerHTML=sorted.map(option).join(""));
  const organOptions=organs.map(o=>'<option value="'+o.id+'">'+escapeHtml(o.name)+'</option>').join("");
  $("#sessionOrgan").innerHTML=organOptions;$("#exclusionOrgan").innerHTML=organOptions;
  fillSessionOffices();
  const oldOrgan=$("#publicOrgan").value;
  $("#publicOrgan").innerHTML='<option value="all">Todos os órgãos</option>'+organs.map(o=>'<option value="'+o.id+'">'+escapeHtml(o.name)+'</option>').join("");
  if([...$("#publicOrgan").options].some(o=>o.value===oldOrgan))$("#publicOrgan").value=oldOrgan;
  const chambers=organs.filter(o=>o.type==="Câmara");
  $("#chamberFilter").innerHTML=chambers.map(o=>'<option value="'+o.id+'">'+escapeHtml(o.name)+'</option>').join("");
}
function fillSessionOffices(){
  const organ=organs.find(o=>o.id===Number($("#sessionOrgan").value));
  $("#sessionOffice").innerHTML=(organ?.offices||[]).map(o=>'<option value="'+o.id+'">'+escapeHtml(o.number)+' Procuradoria</option>').join("");
}
function filteredSessions(){
  return sessions.filter(s=>{
    const organ=organs.find(o=>o.id===s.organ_id);
    return ($("#publicArea").value==="all"||organ?.area===$("#publicArea").value)
      &&($("#publicOrgan").value==="all"||s.organ_id===Number($("#publicOrgan").value))
      &&($("#publicMonth").value==="all"||Number(s.date.slice(5,7))===Number($("#publicMonth").value));
  });
}
function renderPublic(){
  const rows=filteredSessions(),pending=rows.filter(x=>x.status.startsWith("pending"));
  $("#publicStats").innerHTML=[["Sessões",rows.length],["Órgãos",new Set(rows.map(x=>x.organ_id)).size],["Substituições",rows.filter(x=>x.status==="substitution").length],["Pendências",pending.length]].map(([label,count])=>'<div class="card"><span>'+label+'</span><b>'+count+'</b></div>').join("");
  $("#publicTable").innerHTML=table(["Data","Órgão","Procuradoria nominal","Atuação efetiva","Situação"],rows.map(s=>'<tr>'+cell(formatDate(s.date))+cell(organLabel(s.organ_id))+cell(officeLabel(s.nominal_office_id))+cell(officeLabel(s.effective_office_id))+cell(s.status)+'</tr>'));
  const grouped=organs.map(o=>({organ:o,list:rows.filter(s=>s.organ_id===o.id)})).filter(x=>x.list.length);
  $("#organSummary").innerHTML=table(["Órgão","Sessões","Substituições","Pendências"],grouped.map(x=>'<tr>'+cell(x.organ.name)+cell(x.list.length)+cell(x.list.filter(s=>s.status==="substitution").length)+cell(x.list.filter(s=>s.status.startsWith("pending")).length)+'</tr>'));
  $("#monthlySummary").innerHTML=table(["Mês","Sessões","Órgãos"],months.map((month,index)=>{const list=rows.filter(s=>Number(s.date.slice(5,7))===index+1);return '<tr>'+cell(month)+cell(list.length)+cell(new Set(list.map(s=>s.organ_id)).size)+'</tr>'}));
}
function renderDashboard(){
  const vacOffices=new Set(vacations.map(v=>v.office_id));
  $("#dashboardStats").innerHTML=[["Procuradorias",offices.size],["Períodos de férias",vacations.length],["Com férias",vacOffices.size],["Sobreposições",conflicts().length]].map(([label,count])=>'<div class="card"><span>'+label+'</span><b>'+count+'</b></div>').join("");
  $("#dashboardTable").innerHTML=table(["Procuradoria","Câmara","Períodos","Dias","Situação"],[...offices].sort((a,b)=>parseInt(a[1].number)-parseInt(b[1].number)).map(([id,office])=>{
    const list=vacations.filter(v=>v.office_id===id);
    const days=list.reduce((sum,v)=>sum+Math.round((new Date(v.end)-new Date(v.start))/86400000)+1,0);
    return '<tr>'+cell(office.number)+cell(chamberOf(id)?.name||"—")+cell(list.map(v=>formatDate(v.start)+" a "+formatDate(v.end)).join("; ")||"—")+cell(days)+cell(days===60?"60 dias":days<60?(60-days)+" dias pendentes":"Acima de 60 dias")+'</tr>';
  }));
}
function renderChambers(){
  const selected=organs.find(o=>o.id===Number($("#chamberFilter").value));
  if(!selected){$("#chamberTable").textContent="Nenhuma Câmara cadastrada.";return}
  const ids=new Set(officeIds(selected));
  const selectedVac=vacations.filter(v=>ids.has(v.office_id));
  const selectedSessions=sessions.filter(s=>s.organ_id===selected.id);
  $("#chamberTable").innerHTML='<div class="cards">'+[["Procuradorias",ids.size],["Períodos",selectedVac.length],["Sessões",selectedSessions.length],["Conflitos",conflicts().filter(x=>x.chamber.id===selected.id).length]].map(([k,v])=>'<div class="card"><span>'+k+'</span><b>'+v+'</b></div>').join("")+'</div>'+table(["Procuradoria","Férias","Substituta"],selected.offices.map(o=>{
    const sub=substitutions.find(s=>s.office_id===o.id);
    return '<tr>'+cell(o.number)+cell(selectedVac.filter(v=>v.office_id===o.id).map(v=>formatDate(v.start)+" a "+formatDate(v.end)).join("; ")||"—")+cell(sub?officeLabel(sub.substitute_office_id):"—")+'</tr>';
  }));
  $("#organTable").innerHTML=table(["Área","Órgão","Tipo","Procuradorias"],organs.map(o=>'<tr>'+cell(o.area)+cell(o.name)+cell(o.type)+cell(o.offices.map(x=>x.number).join(", "))+'</tr>'));
}
function renderConflicts(){
  $("#conflictTable").innerHTML=table(["Câmara","Procuradoria A","Período A","Procuradoria B","Período B"],conflicts().map(x=>'<tr>'+cell(x.chamber.name)+cell(officeLabel(x.a.office_id))+cell(formatDate(x.a.start)+" a "+formatDate(x.a.end))+cell(officeLabel(x.b.office_id))+cell(formatDate(x.b.start)+" a "+formatDate(x.b.end))+'</tr>'));
}
function renderCoverage(){
  $("#coverageTable").innerHTML=table(["Férias","Câmara","Procuradoria","Disponíveis na Câmara","Aviso"],vacations.map(v=>{
    const chamber=chamberOf(v.office_id);
    const unavailable=new Set(vacations.filter(other=>chamber&&officeIds(chamber).includes(other.office_id)&&other.start<=v.end&&v.start<=other.end).map(x=>x.office_id));
    const available=chamber?.offices.filter(x=>!unavailable.has(x.id)).map(x=>x.number)||[];
    return '<tr>'+cell(formatDate(v.start)+" a "+formatDate(v.end))+cell(chamber?.name||"—")+cell(officeLabel(v.office_id))+cell(available.join(", ")||"Nenhuma")+cell(available.length<2?"Atenção":"Cobertura possível")+'</tr>';
  }));
}
function renderCalendar(){
  $("#calendarTable").innerHTML=table(["Procuradoria",...months],[...offices].sort((a,b)=>parseInt(a[1].number)-parseInt(b[1].number)).map(([id,office])=>'<tr>'+cell(office.number)+months.map((_,index)=>cell(vacations.filter(v=>v.office_id===id&&Number(v.start.slice(5,7))<=index+1&&Number(v.end.slice(5,7))>=index+1).map(v=>formatDate(v.start)+"–"+formatDate(v.end)).join("; "))).join("")+'</tr>'));
}
function renderVacations(){
  $("#vacTable").innerHTML=table(["Procuradoria","Início","Fim","Ação"],vacations.map(v=>'<tr>'+cell(officeLabel(v.office_id))+cell(formatDate(v.start))+cell(formatDate(v.end))+'<td>'+(canWrite()?'<button data-delete-vac="'+v.id+'">Excluir</button>':"")+'</td></tr>'));
}
function renderSessions(){
  $("#sessionTable").innerHTML=table(["Data","Órgão","Nominal","Efetiva","Situação","Origem","Observação","Ação"],sessions.map(s=>'<tr>'+cell(formatDate(s.date))+cell(organLabel(s.organ_id))+cell(officeLabel(s.nominal_office_id))+cell(officeLabel(s.effective_office_id))+cell(s.status)+cell(s.origin)+cell(s.note||"—")+'<td>'+(canWrite()?'<button data-delete-session="'+s.id+'">Excluir</button>':"")+'</td></tr>'));
}
function renderSubs(){
  $("#subTable").innerHTML=table(["Titular","Substituta","Ação"],substitutions.map(s=>'<tr>'+cell(officeLabel(s.office_id))+cell(officeLabel(s.substitute_office_id))+'<td>'+(canWrite()?'<button data-delete-sub="'+s.id+'">Excluir</button>':"")+'</td></tr>'));
}
function renderSchedule(){
  const days=["Não gerar","Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
  $("#scheduleConfig").innerHTML=table(["Órgão","Dia semanal","Ação"],organs.map(o=>{
    const current=schedule.find(s=>s.organ_id===o.id);
    const options=days.map((d,index)=>'<option value="'+(index-1)+'" '+((!current?.active&&index===0)||(current?.active&&current.weekday===index-1)?"selected":"")+'>'+d+'</option>').join("");
    return '<tr>'+cell(o.name)+'<td><select id="weekday-'+o.id+'" '+(!canWrite()?"disabled":"")+'>'+options+'</select></td><td>'+(canWrite()?'<button data-schedule="'+o.id+'">Salvar</button>':"")+'</td></tr>';
  }));
  $("#exclusionTable").innerHTML=table(["Data sem sessão","Órgão","Motivo","Ação"],exclusions.map(x=>'<tr>'+cell(formatDate(x.date))+cell(organLabel(x.organ_id))+cell(x.reason||"—")+'<td>'+(canWrite()?'<button data-delete-exclusion="'+x.id+'">Excluir</button>':"")+'</td></tr>'));
}
function renderAll(){
  renderPublic();renderDashboard();renderChambers();renderConflicts();renderCoverage();renderCalendar();
  renderVacations();renderSessions();renderSubs();renderSchedule();
}
function applyRole(){
  const writer=canWrite();
  ["#vacForm","#sessionForm","#subForm","#exclusionForm","#generateYear"].forEach(id=>$(id).hidden=!writer);
  document.querySelectorAll('[data-tab="users"],[data-tab="audit"]').forEach(el=>el.hidden=me.role!=="admin");
}
async function reload(){
  const y=year();
  const data=await Promise.all([api("/organs"),api("/vacations?year="+y),api("/sessions?year="+y),api("/substitutions"),api("/schedule-config"),api("/exclusions?year="+y)]);
  [organs,vacations,sessions,substitutions,schedule,exclusions]=data;
  offices=new Map(organs.flatMap(o=>o.offices.map(x=>[x.id,x])));
  fillSelects();renderAll();applyRole();
}
async function boot(){
  if(!token){showLogin();return}
  try{
    me=await api("/me");
    $("#login").hidden=true;$("#public").hidden=false;$("#admin").hidden=false;$("#logout").hidden=false;
    $("#identity").textContent="Usuário: "+me.username+" · Perfil: "+me.role;
    await reload();
    if(me.role==="admin")await Promise.all([loadUsers(),loadAudit()]);
  }catch(error){showLogin();notice("#loginMsg",error.message,true)}
}
async function loadUsers(){
  const rows=await api("/users");
  $("#userTable").innerHTML=table(["Usuário","Perfil","Ativo"],rows.map(x=>'<tr>'+cell(x.username)+cell(x.role)+cell(x.active?"Sim":"Não")+'</tr>'));
}
async function loadAudit(){
  const rows=await api("/audit?limit=100");
  $("#auditTable").innerHTML=table(["Data","Ação","Entidade","Detalhes"],rows.map(x=>'<tr>'+cell(new Date(x.created_at).toLocaleString("pt-BR"))+cell(x.action)+cell(x.entity)+cell(x.details||"")+'</tr>'));
}
async function mutate(path,options,messageSelector){
  try{await api(path,options);await reload();if(messageSelector)notice(messageSelector,"Operação concluída.")}
  catch(error){if(messageSelector)notice(messageSelector,error.message,true);else alert(error.message)}
}
$("#loginForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const body=new FormData();body.append("username",$("#username").value);body.append("password",$("#password").value);
  try{
    const response=await fetch(API+"/auth/login",{method:"POST",body});
    if(!response.ok)throw Error("Usuário ou senha inválidos.");
    token=(await response.json()).access_token;sessionStorage.setItem("mpce_token",token);
    $("#password").value="";await boot();
  }catch(error){notice("#loginMsg",error.message,true)}
});
$("#logout").addEventListener("click",()=>{token="";sessionStorage.removeItem("mpce_token");showLogin()});
$("#publicYear").addEventListener("change",()=>reload().catch(error=>alert(error.message)));
["#publicArea","#publicOrgan","#publicMonth"].forEach(id=>$(id).addEventListener("change",renderPublic));
$("#chamberFilter").addEventListener("change",renderChambers);
$("#sessionOrgan").addEventListener("change",fillSessionOffices);
$("#print").addEventListener("click",()=>window.print());
$("#vacForm").addEventListener("submit",event=>{event.preventDefault();mutate("/vacations?"+params({office_id:$("#vacOffice").value,start:$("#vacStart").value,end:$("#vacEnd").value}),{method:"POST"},"#vacMsg")});
$("#sessionForm").addEventListener("submit",event=>{event.preventDefault();mutate("/sessions?"+params({organ_id:$("#sessionOrgan").value,session_date:$("#sessionDate").value,nominal_office_id:$("#sessionOffice").value,note:$("#sessionNote").value}),{method:"POST"},"#generateMsg")});
$("#subForm").addEventListener("submit",event=>{event.preventDefault();mutate("/substitutions?"+params({office_id:$("#subOffice").value,substitute_office_id:$("#substituteOffice").value}),{method:"POST"},"#generateMsg")});
$("#exclusionForm").addEventListener("submit",event=>{event.preventDefault();mutate("/exclusions?"+params({organ_id:$("#exclusionOrgan").value,excluded_date:$("#exclusionDate").value,reason:$("#exclusionReason").value}),{method:"POST"},"#generateMsg")});
$("#generateYear").addEventListener("click",async()=>{
  try{const result=await api("/sessions/generate?year="+year(),{method:"POST"});await reload();notice("#generateMsg","Geradas "+result.generated+" sessões; "+result.skipped+" datas excluídas.")}
  catch(error){notice("#generateMsg",error.message,true)}
});
$("#userForm").addEventListener("submit",async event=>{
  event.preventDefault();
  try{
    await api("/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:$("#newUsername").value,password:$("#newPassword").value,role:$("#newRole").value})});
    event.target.reset();await loadUsers();
  }catch(error){alert(error.message)}
});
document.addEventListener("click",event=>{
  const button=event.target.closest("button[data-delete-vac],button[data-delete-session],button[data-delete-sub],button[data-delete-exclusion],button[data-schedule]");
  if(!button)return;
  if(button.dataset.deleteVac)mutate("/vacations/"+button.dataset.deleteVac,{method:"DELETE"},"#vacMsg");
  if(button.dataset.deleteSession)mutate("/sessions/"+button.dataset.deleteSession,{method:"DELETE"},"#generateMsg");
  if(button.dataset.deleteSub)mutate("/substitutions/"+button.dataset.deleteSub,{method:"DELETE"},"#generateMsg");
  if(button.dataset.deleteExclusion)mutate("/exclusions/"+button.dataset.deleteExclusion,{method:"DELETE"},"#generateMsg");
  if(button.dataset.schedule){
    const id=button.dataset.schedule,weekday=Number($("#weekday-"+id).value);
    mutate("/schedule-config?"+params({organ_id:id,weekday:weekday<0?0:weekday,active:weekday>=0}),{method:"POST"},"#generateMsg");
  }
});
document.querySelectorAll("[data-tab]").forEach(button=>button.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(tab=>tab.hidden=true);
  $("#"+button.dataset.tab).hidden=false;
}));
$("#exportCsv").addEventListener("click",()=>{
  const rows=[["DATA","ÓRGÃO","PROCURADORIA NOMINAL","ATUAÇÃO EFETIVA","SITUAÇÃO"],...filteredSessions().map(s=>[formatDate(s.date),organLabel(s.organ_id),officeLabel(s.nominal_office_id),officeLabel(s.effective_office_id),s.status])];
  const csv=rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(";")).join("\r\n");
  const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download="escala-tjce-"+year()+".csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$("#publicMonth").innerHTML='<option value="all">Ano inteiro</option>'+months.map((m,i)=>'<option value="'+(i+1)+'">'+m+'</option>').join("");
boot();

