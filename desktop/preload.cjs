const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("setup",{
  currentUrl:()=>ipcRenderer.invoke("current-url"),
  configureUrl:value=>ipcRenderer.invoke("configure-url",value)
});

