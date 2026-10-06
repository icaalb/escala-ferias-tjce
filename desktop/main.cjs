const {app,BrowserWindow,ipcMain,session}=require("electron");
const fs=require("node:fs");
const path=require("node:path");

let window;
const settingsPath=()=>path.join(app.getPath("userData"),"settings.json");
function configuredUrl(){
  try{return JSON.parse(fs.readFileSync(settingsPath(),"utf8")).url}catch{return ""}
}
function validUrl(value){
  try{
    const url=new URL(value);
    if(url.username||url.password||url.hash)return false;
    return url.protocol==="https:" || (url.protocol==="http:"&&["localhost","127.0.0.1"].includes(url.hostname));
  }catch{return false}
}
function openApp(value){
  if(!validUrl(value)){window.loadFile("setup.html");return}
  const target=new URL(value);
  window.webContents.setWindowOpenHandler(()=>({action:"deny"}));
  window.webContents.on("will-navigate",(event,destination)=>{
    if(new URL(destination).origin!==target.origin)event.preventDefault();
  });
  window.loadURL(target.toString());
}
app.whenReady().then(()=>{
  session.defaultSession.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
  window=new BrowserWindow({
    width:1400,height:900,minWidth:900,minHeight:650,
    webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,preload:path.join(__dirname,"preload.cjs")}
  });
  window.setMenuBarVisibility(false);
  openApp(configuredUrl());
  ipcMain.handle("configure-url",async(event,value)=>{
    if(event.senderFrame.url!==require("node:url").pathToFileURL(path.join(__dirname,"setup.html")).href)return {ok:false,error:"Origem inválida."};
    if(!validUrl(value))return {ok:false,error:"Informe um endereço HTTPS da intranet (ou localhost para teste)."};
    fs.writeFileSync(settingsPath(),JSON.stringify({url:new URL(value).toString()}),"utf8");
    openApp(value);
    return {ok:true};
  });
  ipcMain.handle("current-url",event=>event.senderFrame.url===require("node:url").pathToFileURL(path.join(__dirname,"setup.html")).href?configuredUrl():"");
});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});

