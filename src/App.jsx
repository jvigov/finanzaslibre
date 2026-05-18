import { useState, useEffect } from "react";

const SUPA_URL = "https://zvdnwnknmkrwcpnyorle.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZG53bmtubWtyd2NwbnlvcmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTY2ODcsImV4cCI6MjA5MzY3MjY4N30.nBoMnQbatFQekFakmKsEIS4qjgU2BHpzUzUz9nvxY-E";
const h = (tok) => ({ "Content-Type":"application/json", "apikey":SUPA_KEY, "Authorization":"Bearer "+(tok||SUPA_KEY) });
const sb = {
  async select(table, query, tok) { const r=await fetch(SUPA_URL+"/rest/v1/"+table+"?"+(query||"select=*"),{headers:h(tok)}); return r.json(); },
  async insert(table, body, tok) { const r=await fetch(SUPA_URL+"/rest/v1/"+table,{method:"POST",headers:{...h(tok),"Prefer":"return=representation"},body:JSON.stringify(body)}); const d=await r.json(); return Array.isArray(d)?d[0]:d; },
  async update(table, id, body, tok) { await fetch(SUPA_URL+"/rest/v1/"+table+"?id=eq."+id,{method:"PATCH",headers:{...h(tok),"Prefer":"return=minimal"},body:JSON.stringify(body)}); },
  async delete(table, id, tok) { await fetch(SUPA_URL+"/rest/v1/"+table+"?id=eq."+id,{method:"DELETE",headers:h(tok)}); },
  async signUp(email,pwd,nombre) { const r=await fetch(SUPA_URL+"/auth/v1/signup",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPA_KEY},body:JSON.stringify({email,password:pwd,options:{data:{nombre}}})}); return r.json(); },
  async signIn(email,pwd) { const r=await fetch(SUPA_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPA_KEY},body:JSON.stringify({email,password:pwd})}); return r.json(); },
};

const fmt   = (n) => "S/ "+Number(n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtK  = (n) => { const a=Math.abs(n||0); if(a>=1e6) return "S/ "+(n/1e6).toFixed(1)+"M"; if(a>=1000) return "S/ "+(n/1000).toFixed(1)+"k"; return fmt(n); };
const fmtF  = (f) => { if(!f) return ""; const s=f.split("T")[0]; const [,m,d]=s.split("-"); const ms=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]; return parseInt(d)+" "+ms[parseInt(m)-1]; };
const today = () => new Date().toISOString().split("T")[0];
const curMes= () => new Date().toISOString().slice(0,7);

const SBS_L = ["Normal","Prob. Potenciales","Deficiente","Dudoso","Perdida"];
const SBS_C = ["#22c55e","#eab308","#f97316","#ef4444","#dc2626"];
const sbsI  = (d) => d<=7?0:d<=30?1:d<=60?2:d<=120?3:4;

const GASTOS_FIJOS = [
  {nombre:"Cuota Extracash Interbank",        monto:2077,  cat:"Deuda cuota"},
  {nombre:"Ruleteo Platinum (S/21k x 1.5%)", monto:315,   cat:"Deuda cuota"},
  {nombre:"ChatGPT",                          monto:85,    cat:"Suscripciones IA"},
  {nombre:"Claude",                           monto:85,    cat:"Suscripciones IA"},
  {nombre:"Entel postpago",                   monto:80,    cat:"Suscripciones IA"},
  {nombre:"Dentista",                         monto:200,   cat:"Salud y farmacia"},
  {nombre:"Contabilidad EIRL",                monto:236,   cat:"Gasto EIRL"},
  {nombre:"DirecTV Go",                       monto:83.9,  cat:"Entretenimiento"},
];
const TOTAL_FIJOS = GASTOS_FIJOS.reduce((a,g)=>a+g.monto,0);

const GC = ["Alimentacion","Comida afuera","Taxi / Uber","Viaje y combustible","Salud y farmacia","Entretenimiento","Regalo / detalle","Ropa y personal","Suscripciones IA","Educacion","Extraordinario"];
const IC = ["Sueldo SUNAT","Gestiones admin","Fuxion personal","Fuxion EIRL","Venta productos Fuxion","Firu / Bancaje","Otro ingreso"];
const FT = ["Personal","EIRL","Familiar hermano","Familiar pareja","Familiar mama","Familiar papa","Otro"];

const ESTRATEGIAS = ["Pagando puntual","Negociando","En espera","Castigada"];
const ESTRATEGIA_C = {"Pagando puntual":"#10b981","Negociando":"#f59e0b","En espera":"#8b5cf6","Castigada":"#f43f5e"};

const C = {bg:"#060c15",surface:"#0a1520",card:"#0e1c2c",card2:"#122030",border:"#172538",accent:"#0ea5e9",emerald:"#10b981",danger:"#f43f5e",warn:"#f59e0b",gold:"#fbbf24",purple:"#8b5cf6",text:"#e0eaf8",soft:"#7a9bb8",muted:"#3d5570"};
const S = {
  app:  {fontFamily:"'DM Sans','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,fontSize:14},
  nav:  {display:"flex",background:C.surface,borderBottom:"1px solid "+C.border,overflowX:"auto"},
  nb:   (a)=>({padding:"12px 13px",border:"none",borderBottom:a?"2px solid "+C.accent:"2px solid transparent",background:"transparent",color:a?C.accent:C.muted,fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}),
  page: {padding:16,maxWidth:840,margin:"0 auto",paddingBottom:60},
  card: {background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:16,marginBottom:12},
  lbl:  {fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"block"},
  lbl2: {fontSize:11,fontWeight:600,color:C.soft,marginBottom:5,display:"block"},
  g2:   {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  g3:   {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10},
  box:  (c)=>({background:C.surface,borderRadius:12,padding:14,border:"1px solid "+(c||C.accent)+"20"}),
  bv:   (c,sz)=>({fontSize:sz||20,fontWeight:900,color:c||C.text,lineHeight:1.1,marginBottom:3}),
  bl:   {fontSize:11,color:C.muted},
  btn:  (c)=>({background:c||C.accent,color:(c===C.emerald||c===C.accent||!c)?"#040a12":"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontWeight:700,cursor:"pointer",fontSize:13}),
  bsm:  (c)=>({background:(c||C.accent)+"18",color:c||C.accent,border:"1px solid "+(c||C.accent)+"40",borderRadius:8,padding:"5px 12px",fontWeight:600,cursor:"pointer",fontSize:11}),
  inp:  {width:"100%",background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none"},
  sel:  {width:"100%",background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,outline:"none"},
  bar:  (h)=>({background:C.border,borderRadius:99,height:h||6,overflow:"hidden"}),
  fill: (p,c,h)=>({width:Math.min(Math.max(p||0,0),100)+"%",height:h||6,background:c||C.accent,borderRadius:99,transition:"width .5s"}),
  tag:  (c)=>({background:(c||C.accent)+"20",color:c||C.accent,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,display:"inline-block"}),
  alert:(c)=>({background:(c||C.warn)+"12",border:"1px solid "+(c||C.warn)+"40",borderLeft:"3px solid "+(c||C.warn),borderRadius:12,padding:13,marginBottom:11}),
  hr:   {borderTop:"1px solid "+C.border,margin:"12px 0"},
};

function Modal({title,onClose,children}){
  return <div style={{position:"fixed",inset:0,background:"#000c",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{background:C.card,border:"1px solid "+C.border,borderRadius:20,padding:22,width:"100%",maxWidth:480,maxHeight:"94vh",overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><span style={{fontWeight:800,fontSize:15}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:24,cursor:"pointer"}}>x</button></div>{children}</div></div>;
}

function AuthScreen({onLogin}){
  const [modo,setModo]=useState("login");
  const [email,setEmail]=useState("");
  const [pwd,setPwd]=useState("");
  const [nombre,setNombre]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const login=async()=>{
    setLoading(true);setError("");
    try{const d=await sb.signIn(email,pwd);if(d.access_token)onLogin({user:d.user,token:d.access_token,nombre:d.user.user_metadata?.nombre||email.split("@")[0]});else setError(d.error_description||d.msg||"Email o contrasena incorrectos");}
    catch(e){setError("Error de conexion");}
    setLoading(false);
  };
  const registro=async()=>{
    if(!nombre||!email||!pwd){setError("Completa todos los campos");return;}
    if(pwd.length<6){setError("Minimo 6 caracteres");return;}
    setLoading(true);setError("");
    try{const d=await sb.signUp(email,pwd,nombre);if(d.error){setError(d.error_description||d.msg||"Error");setLoading(false);return;}const d2=await sb.signIn(email,pwd);if(d2.access_token)onLogin({user:d2.user,token:d2.access_token,nombre});else setError("Confirma tu email primero");}
    catch(e){setError("Error de conexion");}
    setLoading(false);
  };
  return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div style={{width:"100%",maxWidth:400}}><div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:30,fontWeight:900}}><span style={{color:C.accent}}>Finanzas</span><span style={{color:C.text}}>Libre</span></div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Tu camino a la libertad financiera</div></div><div style={{display:"flex",background:C.surface,borderRadius:12,padding:4,marginBottom:20,border:"1px solid "+C.border}}>{[["login","Iniciar sesion"],["registro","Crear cuenta"]].map(([k,l])=><button key={k} onClick={()=>{setModo(k);setError("");}} style={{flex:1,padding:"10px",borderRadius:9,border:"none",background:modo===k?C.card:"transparent",color:modo===k?C.text:C.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>{l}</button>)}</div><div style={{display:"flex",flexDirection:"column",gap:12}}>{modo==="registro"&&<div><label style={S.lbl2}>Tu nombre</label><input style={S.inp} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Johnatan Vigo"/></div>}<div><label style={S.lbl2}>Email</label><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e=>e.key==="Enter"&&login()}/></div><div><label style={S.lbl2}>Contrasena</label><input style={S.inp} type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Minimo 6 caracteres"/></div>{error&&<div style={S.alert(C.danger)}><span style={{fontSize:12}}>{error}</span></div>}<button style={{...S.btn(C.accent),width:"100%",padding:"13px",fontSize:14,opacity:loading?0.7:1}} onClick={modo==="login"?login:registro} disabled={loading}>{loading?"Cargando...":(modo==="login"?"Entrar":"Crear cuenta")}</button></div></div></div>;
}

function TabRegistrar({userId,sesion,txns,setTxns}){
  const [mes,setMes]=useState(curMes());
  const [guardado,setGuardado]=useState(false);
  const [mForm,setMForm]=useState({tipo:"gasto",cat:"Alimentacion",monto:"",descripcion:"",fecha:today(),fuente:"Personal"});
  const uf=(k,v)=>setMForm(p=>({...p,[k]:v}));

  const guardarManual=async()=>{
    if(!mForm.monto||+mForm.monto<=0)return;
    const body={user_id:userId,...mForm,monto:+mForm.monto};
    const saved=await sb.insert("transacciones",body,sesion.token);
    if(saved&&saved.id){setTxns(p=>[saved,...p]);setMForm({tipo:"gasto",cat:"Alimentacion",monto:"",descripcion:"",fecha:today(),fuente:"Personal"});setGuardado(true);setTimeout(()=>setGuardado(false),2000);}
  };
  const eliminar=async(id)=>{await sb.delete("transacciones",id,sesion.token);setTxns(p=>p.filter(t=>t.id!==id));};

  const filtradas=txns.filter(t=>t.fecha&&t.fecha.startsWith(mes));
  const ingMes=filtradas.filter(t=>t.tipo==="ingreso").reduce((a,t)=>a+t.monto,0);
  const gastVar=filtradas.filter(t=>t.tipo==="gasto").reduce((a,t)=>a+t.monto,0);
  const gastMes=TOTAL_FIJOS+gastVar;
  const porDia={};filtradas.forEach(t=>{const d=t.fecha&&t.fecha.split("T")[0];if(d){if(!porDia[d])porDia[d]=[];porDia[d].push(t);}});
  const dias=Object.keys(porDia).sort((a,b)=>b.localeCompare(a));

  return (
    <div>
      <div style={S.card}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["gasto","ingreso"].map(t=><button key={t} onClick={()=>uf("tipo",t)} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid "+(t===mForm.tipo?(t==="gasto"?C.danger:C.emerald):C.border),background:t===mForm.tipo?(t==="gasto"?C.danger+"20":C.emerald+"20"):C.surface,color:t===mForm.tipo?(t==="gasto"?C.danger:C.emerald):C.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>{t==="gasto"?"Gasto":"Ingreso"}</button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={S.lbl2}>Categoria</label><select style={S.sel} value={mForm.cat} onChange={e=>uf("cat",e.target.value)}>{(mForm.tipo==="ingreso"?IC:GC).map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={S.lbl2}>Monto (S/)</label><input style={S.inp} type="number" value={mForm.monto} onChange={e=>uf("monto",e.target.value)} placeholder="0.00"/></div>
          <div><label style={S.lbl2}>Fecha</label><input style={S.inp} type="date" value={mForm.fecha} onChange={e=>uf("fecha",e.target.value)}/></div>
          <div><label style={S.lbl2}>Fuente</label><select style={S.sel} value={mForm.fuente} onChange={e=>uf("fuente",e.target.value)}>{FT.map(f=><option key={f}>{f}</option>)}</select></div>
        </div>
        <div style={{marginBottom:12}}><label style={S.lbl2}>Descripcion</label><input style={S.inp} value={mForm.descripcion} onChange={e=>uf("descripcion",e.target.value)} placeholder="Ej: Taxi al dentista..."/></div>
        <button style={{...S.btn(mForm.tipo==="ingreso"?C.emerald:C.danger),width:"100%",padding:"13px"}} onClick={guardarManual}>Guardar</button>
        {guardado&&<div style={{...S.alert(C.emerald),textAlign:"center",marginTop:10}}><b>Guardado</b></div>}
      </div>

      <div style={{marginTop:8}}>
        <input type="month" style={{...S.inp,marginBottom:10}} value={mes} onChange={e=>setMes(e.target.value)}/>
        <div style={S.g3}>
          <div style={S.box(C.emerald)}><div style={S.bv(C.emerald,16)}>{fmtK(ingMes)}</div><div style={S.bl}>Ingresos</div></div>
          <div style={S.box(C.danger)}><div style={S.bv(C.danger,16)}>{fmtK(gastMes)}</div><div style={S.bl}>Gastos</div></div>
          <div style={S.box(ingMes-gastMes>=0?C.accent:C.danger)}><div style={S.bv(ingMes-gastMes>=0?C.accent:C.danger,16)}>{fmtK(ingMes-gastMes)}</div><div style={S.bl}>Balance</div></div>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:700,fontSize:12}}>Fijos automaticos</span><span style={{fontWeight:800,color:C.danger}}>-{fmt(TOTAL_FIJOS)}</span></div>
          {GASTOS_FIJOS.map(g=><div key={g.nombre} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:"1px solid "+C.border}}><span style={{fontSize:11,color:C.soft}}>{g.nombre}</span><span style={{fontSize:11,fontWeight:600,color:C.danger}}>-{fmt(g.monto)}</span></div>)}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",borderTop:"1px solid "+C.border,marginTop:4}}><span style={{fontSize:12,fontWeight:700}}>Variables registrados</span><span style={{fontWeight:800,color:C.warn}}>-{fmt(gastVar)}</span></div>
        </div>
        {dias.map(dia=>{
          const movs=porDia[dia];
          const tot=movs.reduce((a,t)=>a+(t.tipo==="ingreso"?t.monto:-t.monto),0);
          return (
            <div key={dia} style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontWeight:800,fontSize:14,color:C.accent}}>{fmtF(dia)}</span><span style={{fontWeight:700,color:tot>=0?C.emerald:C.danger}}>{tot>=0?"+":""}{fmt(tot)}</span></div>
              {movs.map(t=>(
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:"1px solid "+C.border}}>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.descripcion||t.cat}</div><div style={{fontSize:10,color:C.muted}}>{t.cat} - {t.fuente}</div></div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}><span style={{fontWeight:700,color:t.tipo==="ingreso"?C.emerald:C.danger}}>{t.tipo==="ingreso"?"+":"-"}{fmt(t.monto)}</span><button onClick={()=>eliminar(t.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>x</button></div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabDashboard({perfil,deudas,txns,extras,fuxionSemanas}){
  const mes=curMes();
  const ingTxns=txns.filter(t=>t.tipo==="ingreso"&&t.fecha&&t.fecha.startsWith(mes)).reduce((a,t)=>a+t.monto,0);
  const ingBase=(perfil.sueldo_neto||3000)+(perfil.ing_gestiones||180);
  const ingFuxionMes=(fuxionSemanas||[]).filter(s=>s.semana_inicio&&s.semana_inicio.startsWith(mes)).reduce((a,s)=>a+(s.cheque_personal||0)+(s.ventas||0),0);
  const ingTotal=ingTxns>0?ingTxns+ingFuxionMes:ingBase+ingFuxionMes;
  const gastVar=txns.filter(t=>t.tipo==="gasto"&&t.fecha&&t.fecha.startsWith(mes)).reduce((a,t)=>a+t.monto,0);
  const gastMes=TOTAL_FIJOS+gastVar;
  const margen=ingTotal-gastMes;
  const totalDeuda=deudas.reduce((a,d)=>a+d.saldo,0);
  const cuotas=deudas.reduce((a,d)=>a+(d.cuota||0),0);

  const hoy=today();
  const semanaActual=(fuxionSemanas||[]).find(s=>{
    if(!s.semana_inicio)return false;
    const ini=new Date(s.semana_inicio);const fin=new Date(ini);fin.setDate(fin.getDate()+6);const h=new Date(hoy);return h>=ini&&h<=fin;
  });
  const fuxInv=semanaActual?((semanaActual.google_ads||0)+(semanaActual.productos||0)):0;
  const fuxRet=semanaActual?((semanaActual.cheque_personal||0)+(semanaActual.cheque_eirl||0)+(semanaActual.ventas||0)):0;
  const fuxRes=fuxRet-fuxInv;
  const cajaEIRL=(fuxionSemanas||[]).reduce((a,s)=>a+(s.cheque_eirl||0),0);
  const recientes=[...txns].sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).slice(0,3);
  const proxExtra=extras.filter(e=>e.mes>=curMes()).sort((a,b)=>a.mes.localeCompare(b.mes))[0];

  const NIVELES=[
    {n:0,label:"En deficit",color:C.danger,desc:"Gastas mas de lo que ganas"},
    {n:1,label:"Sobreviviendo",color:"#f97316",desc:"Ingresos igualan gastos"},
    {n:2,label:"Con margen",color:C.warn,desc:"Tienes algo para ahorrar"},
    {n:3,label:"Atacando deudas",color:"#84cc16",desc:"Margen positivo, reduciendo deudas"},
    {n:4,label:"Sin deudas",color:C.emerald,desc:"Tu sueldo es completamente tuyo"},
    {n:5,label:"Ingresos pasivos",color:C.accent,desc:"Empiezas a construir libertad"},
    {n:6,label:"Libertad financiera",color:C.purple,desc:"Ingresos pasivos cubren gastos"},
    {n:7,label:"Abundancia",color:C.gold,desc:"Ingresos pasivos mucho mas que gastos"},
  ];
  const nAct=margen<0?0:totalDeuda>0&&margen>500?3:totalDeuda>0?2:4;
  const niv=NIVELES[nAct];

  return (
    <div>
      {/* Bloque 1 - Margen libre protagonista */}
      <div style={{...S.card,background:"linear-gradient(135deg,"+C.surface+","+C.card+")",marginBottom:12}}>
        <span style={S.lbl}>Margen libre este mes</span>
        <div style={{fontSize:36,fontWeight:900,color:margen>=0?C.emerald:C.danger,lineHeight:1}}>{fmtK(margen)}</div>
        <div style={{fontSize:12,color:C.soft,marginTop:6}}>
          <span style={{color:C.emerald}}>+{fmtK(ingTotal)}</span><span style={{color:C.muted}}> ingresos · </span>
          <span style={{color:C.danger}}>-{fmtK(gastMes)}</span><span style={{color:C.muted}}> gastos</span>
        </div>
        <div style={{...S.bar(4),marginTop:10}}><div style={S.fill(ingTotal>0?(gastMes/ingTotal)*100:0,margen>=0?C.emerald:C.danger,4)}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:10,color:C.muted}}>Fijos {fmt(TOTAL_FIJOS)}</span>
          <span style={{fontSize:10,color:C.muted}}>Variables {fmt(gastVar)}</span>
        </div>
      </div>

      {/* Bloque 2 - Nivel libertad */}
      <div style={{...S.card,background:"linear-gradient(135deg,"+niv.color+"12,"+C.card+")",border:"1px solid "+niv.color+"30"}}>
        <span style={S.lbl}>Nivel de libertad financiera</span>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
          <div style={{width:46,height:46,borderRadius:"50%",background:niv.color+"25",border:"2px solid "+niv.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:niv.color,flexShrink:0}}>{nAct}</div>
          <div><div style={{fontWeight:800,fontSize:15,color:niv.color}}>{niv.label}</div><div style={{fontSize:11,color:C.soft}}>{niv.desc}</div></div>
          {nAct<7&&<div style={{marginLeft:"auto",textAlign:"right",flexShrink:0}}><div style={{fontSize:9,color:C.muted}}>Siguiente</div><div style={{fontSize:11,fontWeight:600,color:NIVELES[nAct+1].color}}>{NIVELES[nAct+1].label}</div></div>}
        </div>
        <div style={S.bar(6)}><div style={S.fill((nAct/7)*100,niv.color,6)}/></div>
      </div>

      {/* Bloque 3 - Fuxion semana */}
      <div style={{...S.card,border:"1px solid "+(fuxRes>=0?C.emerald:C.danger)+"35"}}>
        <span style={S.lbl}>Fuxion · semana actual</span>
        {semanaActual?(
          <div>
            <div style={S.g3}>
              <div style={S.box(C.danger)}><div style={S.bv(C.danger,15)}>{fmtK(fuxInv)}</div><div style={S.bl}>Invertido</div></div>
              <div style={S.box(C.emerald)}><div style={S.bv(C.emerald,15)}>{fmtK(fuxRet)}</div><div style={S.bl}>Retorno</div></div>
              <div style={S.box(fuxRes>=0?C.emerald:C.danger)}><div style={S.bv(fuxRes>=0?C.emerald:C.danger,15)}>{fuxRes>=0?"+":""}{fmtK(fuxRes)}</div><div style={S.bl}>Resultado</div></div>
            </div>
            {semanaActual.nota&&<div style={{fontSize:11,color:C.soft,marginTop:8}}>Nota: {semanaActual.nota}</div>}
          </div>
        ):(
          <div style={{textAlign:"center",padding:"12px 0",color:C.muted,fontSize:12}}>Sin registro esta semana · Ve a Fuxion para agregar</div>
        )}
      </div>

      {/* Bloque 4 - Caja EIRL */}
      {cajaEIRL>0&&<div style={{...S.card,border:"1px solid "+C.purple+"35"}}>
        <span style={S.lbl}>Caja EIRL acumulada</span>
        <div style={{fontWeight:900,fontSize:22,color:C.purple}}>{fmt(cajaEIRL)}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>Tu dinero · en cuenta empresa · no disponible</div>
      </div>}

      {/* Bloque 5 - Deudas sin drama */}
      <div style={S.card}>
        <span style={S.lbl}>Deudas</span>
        <div style={S.g2}>
          <div style={S.box(C.danger)}><div style={S.bv(C.danger,16)}>{fmtK(totalDeuda)}</div><div style={S.bl}>Saldo total</div></div>
          <div style={S.box(C.warn)}><div style={S.bv(C.warn,16)}>{fmtK(cuotas)}</div><div style={S.bl}>Cuotas / mes</div></div>
        </div>
        {deudas.filter(d=>d.estrategia==="Negociando"||d.estrategia==="En espera").map(d=>(
          <div key={d.id} style={{fontSize:11,color:C.soft,marginTop:8,padding:"6px 0",borderTop:"1px solid "+C.border}}>
            <span style={S.tag(ESTRATEGIA_C[d.estrategia]||C.warn)}>{d.estrategia}</span>
            <span style={{marginLeft:8}}>{d.nombre}</span>
            <span style={{float:"right",color:C.danger}}>{fmt(d.saldo)}</span>
          </div>
        ))}
      </div>

      {/* Bloque 6 - Proximo extraordinario */}
      {proxExtra&&<div style={{...S.card,border:"1px solid "+C.gold+"30"}}>
        <span style={S.lbl}>Proximo extraordinario</span>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontWeight:700,fontSize:14}}>{proxExtra.concepto}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{proxExtra.mes}{proxExtra.accion?" - "+proxExtra.accion:""}</div></div>
          <div style={{fontWeight:900,fontSize:20,color:C.gold}}>{fmtK(proxExtra.monto)}</div>
        </div>
      </div>}

      {/* Bloque 7 - Ultimos 3 movimientos */}
      {recientes.length>0&&<div style={S.card}>
        <span style={S.lbl}>Ultimos movimientos</span>
        {recientes.map(t=>(
          <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+C.border}}>
            <div><div style={{fontSize:12,fontWeight:600}}>{t.descripcion||t.cat}</div><div style={{fontSize:10,color:C.muted}}><b style={{color:C.soft}}>{fmtF(t.fecha)}</b> - {t.cat}</div></div>
            <span style={{fontWeight:700,color:t.tipo==="ingreso"?C.emerald:C.danger}}>{t.tipo==="ingreso"?"+":"-"}{fmt(t.monto)}</span>
          </div>
        ))}
      </div>}

      {perfil.meta&&<div style={{...S.card,border:"1px solid "+C.gold+"30"}}><span style={S.lbl}>Tu meta</span><div style={{fontSize:13,color:C.soft,fontStyle:"italic"}}>"{perfil.meta}"</div></div>}
    </div>
  );
}

function TabFuxion({userId,sesion,fuxionSemanas,setFuxionSemanas}){
  const [modal,setModal]=useState(false);
  const [f,setF]=useState({semana_inicio:"",google_ads:"",productos:"",cheque_personal:"",cheque_eirl:"",ventas:"",nota:""});
  const uf=(k,v)=>setF(p=>({...p,[k]:v}));
  const mes=curMes();
  const semanasMes=(fuxionSemanas||[]).filter(s=>s.semana_inicio&&s.semana_inicio.startsWith(mes));
  const totInvMes=semanasMes.reduce((a,s)=>a+(s.google_ads||0)+(s.productos||0),0);
  const totRetMes=semanasMes.reduce((a,s)=>a+(s.cheque_personal||0)+(s.cheque_eirl||0)+(s.ventas||0),0);
  const totResMes=totRetMes-totInvMes;
  const cajaEIRL=(fuxionSemanas||[]).reduce((a,s)=>a+(s.cheque_eirl||0),0);
  const mejorSem=(fuxionSemanas||[]).length>0?(fuxionSemanas||[]).reduce((best,s)=>{
    const res=(s.cheque_personal||0)+(s.cheque_eirl||0)+(s.ventas||0)-(s.google_ads||0)-(s.productos||0);
    const bRes=(best.cheque_personal||0)+(best.cheque_eirl||0)+(best.ventas||0)-(best.google_ads||0)-(best.productos||0);
    return res>bRes?s:best;
  }):null;

  const guardar=async()=>{
    if(!f.semana_inicio)return;
    const body={user_id:userId,semana_inicio:f.semana_inicio,google_ads:+f.google_ads||0,productos:+f.productos||0,cheque_personal:+f.cheque_personal||0,cheque_eirl:+f.cheque_eirl||0,ventas:+f.ventas||0,nota:f.nota||""};
    if(f.id){await sb.update("fuxion_semanas",f.id,body,sesion.token);setFuxionSemanas(p=>p.map(s=>s.id===f.id?{...body,id:f.id}:s));}
    else{const saved=await sb.insert("fuxion_semanas",body,sesion.token);if(saved&&saved.id)setFuxionSemanas(p=>[saved,...p]);}
    setModal(false);
  };
  const del=async(id)=>{await sb.delete("fuxion_semanas",id,sesion.token);setFuxionSemanas(p=>p.filter(s=>s.id!==id));};
  const editar=(s)=>{setF({...s,google_ads:s.google_ads+"",productos:s.productos+"",cheque_personal:s.cheque_personal+"",cheque_eirl:s.cheque_eirl+"",ventas:s.ventas+""});setModal(true);};

  return (
    <div>
      <div style={S.card}>
        <span style={S.lbl}>Fuxion - {mes}</span>
        <div style={S.g3}>
          <div style={S.box(C.danger)}><div style={S.bv(C.danger,16)}>{fmtK(totInvMes)}</div><div style={S.bl}>Invertido</div></div>
          <div style={S.box(C.emerald)}><div style={S.bv(C.emerald,16)}>{fmtK(totRetMes)}</div><div style={S.bl}>Retorno</div></div>
          <div style={S.box(totResMes>=0?C.emerald:C.danger)}><div style={S.bv(totResMes>=0?C.emerald:C.danger,16)}>{totResMes>=0?"+":""}{fmtK(totResMes)}</div><div style={S.bl}>Resultado</div></div>
        </div>
        {semanasMes.length>0&&<div style={{fontSize:11,color:C.soft,marginTop:10}}>Promedio semanal: <b style={{color:C.accent}}>{fmtK(totResMes/semanasMes.length)}</b> - {semanasMes.length} semana(s)</div>}
      </div>

      <div style={{...S.card,border:"1px solid "+C.purple+"35"}}>
        <span style={S.lbl}>Caja EIRL acumulada</span>
        <div style={{fontWeight:900,fontSize:24,color:C.purple}}>{fmt(cajaEIRL)}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>Suma historica de todos tus cheques EIRL</div>
      </div>

      {mejorSem&&(()=>{const res=(mejorSem.cheque_personal||0)+(mejorSem.cheque_eirl||0)+(mejorSem.ventas||0)-(mejorSem.google_ads||0)-(mejorSem.productos||0);return res>0?<div style={{...S.alert(C.gold),marginBottom:12}}><span style={{fontSize:11,color:C.gold}}>Mejor semana: <b>{fmtF(mejorSem.semana_inicio)}</b> - resultado <b>{fmt(res)}</b></span></div>:null;})()}

      <button style={{...S.btn(C.accent),width:"100%",padding:"13px",marginBottom:12}} onClick={()=>{setF({semana_inicio:"",google_ads:"",productos:"",cheque_personal:"",cheque_eirl:"",ventas:"",nota:""});setModal(true);}}>+ Registrar semana Fuxion</button>

      {(fuxionSemanas||[]).length===0&&<div style={{textAlign:"center",padding:30,color:C.muted,fontSize:12}}>Sin semanas registradas aun</div>}

      {(fuxionSemanas||[]).map(s=>{
        const inv=(s.google_ads||0)+(s.productos||0);
        const ret=(s.cheque_personal||0)+(s.cheque_eirl||0)+(s.ventas||0);
        const res=ret-inv;
        return (
          <div key={s.id} style={{...S.card,borderLeft:"3px solid "+(res>=0?C.emerald:C.danger)}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <div><div style={{fontWeight:700,fontSize:14}}>Semana del {fmtF(s.semana_inicio)}</div>{s.nota&&<div style={{fontSize:11,color:C.soft,marginTop:2}}>{s.nota}</div>}</div>
              <div style={{textAlign:"right"}}><div style={{fontWeight:900,fontSize:16,color:res>=0?C.emerald:C.danger}}>{res>=0?"+":""}{fmt(res)}</div><div style={{fontSize:10,color:C.muted}}>resultado</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,marginBottom:10}}>
              {s.google_ads>0&&<div style={{color:C.muted}}>Google Ads: <b style={{color:C.danger}}>-{fmt(s.google_ads)}</b></div>}
              {s.productos>0&&<div style={{color:C.muted}}>Productos: <b style={{color:C.danger}}>-{fmt(s.productos)}</b></div>}
              {s.cheque_personal>0&&<div style={{color:C.muted}}>Cheque personal: <b style={{color:C.emerald}}>+{fmt(s.cheque_personal)}</b></div>}
              {s.cheque_eirl>0&&<div style={{color:C.muted}}>Cheque EIRL: <b style={{color:C.purple}}>+{fmt(s.cheque_eirl)}</b></div>}
              {s.ventas>0&&<div style={{color:C.muted}}>Ventas: <b style={{color:C.emerald}}>+{fmt(s.ventas)}</b></div>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button style={S.bsm(C.accent)} onClick={()=>editar(s)}>Editar</button>
              <button style={S.bsm(C.danger)} onClick={()=>del(s.id)}>x</button>
            </div>
          </div>
        );
      })}

      {modal&&<Modal title={f.id?"Editar semana":"Nueva semana Fuxion"} onClose={()=>setModal(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label style={S.lbl2}>Semana que inicia (lunes)</label><input style={S.inp} type="date" value={f.semana_inicio} onChange={e=>uf("semana_inicio",e.target.value)}/></div>
          <div style={S.hr}/>
          <div style={{fontSize:11,fontWeight:700,color:C.danger,textTransform:"uppercase",letterSpacing:1}}>Inversion</div>
          <div style={S.g2}>
            <div><label style={S.lbl2}>Google Ads (S/)</label><input style={S.inp} type="number" value={f.google_ads} onChange={e=>uf("google_ads",e.target.value)} placeholder="0"/></div>
            <div><label style={S.lbl2}>Productos comprados (S/)</label><input style={S.inp} type="number" value={f.productos} onChange={e=>uf("productos",e.target.value)} placeholder="0"/></div>
          </div>
          <div style={S.hr}/>
          <div style={{fontSize:11,fontWeight:700,color:C.emerald,textTransform:"uppercase",letterSpacing:1}}>Retorno</div>
          <div style={S.g2}>
            <div><label style={S.lbl2}>Cheque personal (S/)</label><input style={S.inp} type="number" value={f.cheque_personal} onChange={e=>uf("cheque_personal",e.target.value)} placeholder="0"/></div>
            <div><label style={S.lbl2}>Cheque EIRL (S/)</label><input style={S.inp} type="number" value={f.cheque_eirl} onChange={e=>uf("cheque_eirl",e.target.value)} placeholder="0"/></div>
          </div>
          <div><label style={S.lbl2}>Ventas de productos (S/)</label><input style={S.inp} type="number" value={f.ventas} onChange={e=>uf("ventas",e.target.value)} placeholder="0"/></div>
          <div><label style={S.lbl2}>Nota (opcional)</label><input style={S.inp} value={f.nota} onChange={e=>uf("nota",e.target.value)} placeholder="Ej: Lance campana nueva..."/></div>
          {(+f.cheque_personal||+f.cheque_eirl||+f.ventas||+f.google_ads||+f.productos)>0&&(()=>{
            const inv=(+f.google_ads||0)+(+f.productos||0);const ret=(+f.cheque_personal||0)+(+f.cheque_eirl||0)+(+f.ventas||0);const res=ret-inv;
            return <div style={{...S.alert(res>=0?C.emerald:C.danger),textAlign:"center"}}><span style={{fontWeight:700}}>Resultado: </span><span style={{fontWeight:900,color:res>=0?C.emerald:C.danger}}>{res>=0?"+":""}{fmt(res)}</span></div>;
          })()}
          <button style={{...S.btn(C.accent),width:"100%",padding:"13px"}} onClick={guardar}>Guardar semana</button>
        </div>
      </Modal>}
    </div>
  );
}

function TabDeudas({userId,sesion,deudas,setDeudas}){
  const [modal,setModal]=useState(null);
  const [f,setF]=useState({nombre:"",entidad:"",tipo:"Prestamo personal",saldo:"",tasa:"",cuota:"",dias_atraso:0,estrategia:"Pagando puntual",nota:""});
  const uf=(k,v)=>setF(p=>({...p,[k]:v}));
  const total=deudas.reduce((a,d)=>a+d.saldo,0);
  const cuotas=deudas.reduce((a,d)=>a+(d.cuota||0),0);
  const guardar=async()=>{
    const body={user_id:userId,nombre:f.nombre,entidad:f.entidad,tipo:f.tipo,saldo:+f.saldo,tasa:+f.tasa,cuota:+f.cuota,dias_atraso:+f.dias_atraso,estrategia:f.estrategia||"Pagando puntual",nota:f.nota};
    if(f.id){await sb.update("deudas",f.id,body,sesion.token);setDeudas(p=>p.map(d=>d.id===f.id?{...body,id:f.id}:d));}
    else{const data=await sb.insert("deudas",body,sesion.token);if(data&&data.id)setDeudas(p=>[...p,data]);}
    setModal(null);
  };
  const del=async(id)=>{await sb.delete("deudas",id,sesion.token);setDeudas(p=>p.filter(d=>d.id!==id));};
  const edit=(d)=>{setF({...d,saldo:d.saldo+"",tasa:(d.tasa||0)+"",cuota:(d.cuota||0)+"",dias_atraso:(d.dias_atraso||0)+"",estrategia:d.estrategia||"Pagando puntual"});setModal("edit");};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontWeight:900,fontSize:22,color:C.danger}}>{fmt(total)}</div><div style={{fontSize:11,color:C.muted}}>Cuotas: {fmt(cuotas)}/mes - {deudas.length} deuda(s)</div></div>
        <button style={S.btn(C.accent)} onClick={()=>{setF({nombre:"",entidad:"",tipo:"Prestamo personal",saldo:"",tasa:"",cuota:"",dias_atraso:0,estrategia:"Pagando puntual",nota:""});setModal("new");}}>+ Agregar</button>
      </div>
      {deudas.map(d=>{
        const esP=d.tipo==="Deuda personal";
        const estrategia=d.estrategia||"Pagando puntual";
        const color=ESTRATEGIA_C[estrategia]||(esP?C.purple:C.accent);
        const sbsIdx=esP?0:sbsI(d.dias_atraso||0);
        const pct=total>0?(d.saldo/total)*100:0;
        return (
          <div key={d.id} style={{...S.card,borderLeft:"3px solid "+color}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div style={{flex:1,minWidth:0,paddingRight:10}}><div style={{fontWeight:700,fontSize:14}}>{d.nombre}</div><div style={{fontSize:11,color:C.muted}}>{d.entidad} - {d.tipo}</div>{d.nota&&<div style={{fontSize:11,color:C.soft,marginTop:3}}>{d.nota}</div>}</div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:900,fontSize:18,color:C.danger}}>{fmt(d.saldo)}</div>{d.tasa>0&&<div style={{fontSize:11,color:C.muted}}>TEA {d.tasa}%</div>}</div>
            </div>
            <div style={S.bar()}><div style={S.fill(pct,color)}/></div>
            <div style={{fontSize:10,color:C.muted,marginTop:3,marginBottom:8}}>{pct.toFixed(1)}% del total</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
              {d.cuota>0&&<span style={{fontSize:11}}><span style={{color:C.muted}}>Cuota: </span><b>{fmt(d.cuota)}/mes</b></span>}
              {d.dias_atraso>0&&<span style={{fontSize:11}}><span style={{color:C.muted}}>Atraso: </span><b style={{color:C.warn}}>{d.dias_atraso}d</b></span>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={S.tag(color)}>{estrategia}</span>
                {!esP&&<span style={S.tag(SBS_C[sbsIdx])}>SBS: {SBS_L[sbsIdx]}</span>}
              </div>
              <div style={{display:"flex",gap:6}}><button style={S.bsm(C.accent)} onClick={()=>edit(d)}>Editar</button><button style={S.bsm(C.danger)} onClick={()=>del(d.id)}>x</button></div>
            </div>
          </div>
        );
      })}
      {modal&&<Modal title={modal==="new"?"Nueva deuda":"Editar deuda"} onClose={()=>setModal(null)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Nombre</label><input style={S.inp} value={f.nombre} onChange={e=>uf("nombre",e.target.value)} placeholder="Ej: Prestamo BCP"/></div>
          <div><label style={S.lbl2}>Entidad</label><input style={S.inp} value={f.entidad} onChange={e=>uf("entidad",e.target.value)}/></div>
          <div><label style={S.lbl2}>Tipo</label><select style={S.sel} value={f.tipo} onChange={e=>uf("tipo",e.target.value)}>{["Prestamo personal","Tarjeta credito","Prestamo PYME","Hipoteca","Deuda personal","Otro"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl2}>Saldo (S/)</label><input style={S.inp} type="number" value={f.saldo} onChange={e=>uf("saldo",e.target.value)}/></div>
          <div><label style={S.lbl2}>TEA %</label><input style={S.inp} type="number" value={f.tasa} onChange={e=>uf("tasa",e.target.value)}/></div>
          <div><label style={S.lbl2}>Cuota mensual</label><input style={S.inp} type="number" value={f.cuota} onChange={e=>uf("cuota",e.target.value)}/></div>
          <div><label style={S.lbl2}>Dias de atraso</label><input style={S.inp} type="number" value={f.dias_atraso} onChange={e=>uf("dias_atraso",e.target.value)} min="0"/></div>
          <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Estrategia</label><select style={S.sel} value={f.estrategia} onChange={e=>uf("estrategia",e.target.value)}>{ESTRATEGIAS.map(e=><option key={e}>{e}</option>)}</select></div>
          <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Nota</label><input style={S.inp} value={f.nota} onChange={e=>uf("nota",e.target.value)} placeholder="Ej: Esperando respuesta de negociacion..."/></div>
        </div>
        <button style={{...S.btn(C.accent),width:"100%",padding:"13px"}} onClick={guardar}>Guardar deuda</button>
      </Modal>}
    </div>
  );
}

function TabCobrar({userId,sesion,cobrar,setCobrar}){
  const [modal,setModal]=useState(null);
  const [f,setF]=useState({deudor:"",concepto:"",monto:"",abonado:0,fecha:today(),vencimiento:"",nota:"",estado:"pendiente"});
  const uf=(k,v)=>setF(p=>({...p,[k]:v}));
  const total=cobrar.filter(c=>c.estado!=="cobrado").reduce((a,c)=>a+(c.monto-(c.abonado||0)),0);
  const vencidas=cobrar.filter(c=>c.estado!=="cobrado"&&c.vencimiento&&c.vencimiento<today());
  const guardar=async()=>{
    const ab=+f.abonado,mn=+f.monto;
    const body={user_id:userId,deudor:f.deudor,concepto:f.concepto,monto:mn,abonado:ab,estado:ab>=mn?"cobrado":ab>0?"parcial":"pendiente",fecha:f.fecha,vencimiento:f.vencimiento||null,nota:f.nota};
    if(f.id){await sb.update("cobrar",f.id,body,sesion.token);setCobrar(p=>p.map(c=>c.id===f.id?{...body,id:f.id}:c));}
    else{const data=await sb.insert("cobrar",body,sesion.token);if(data&&data.id)setCobrar(p=>[...p,data]);}
    setModal(null);
  };
  const del=async(id)=>{await sb.delete("cobrar",id,sesion.token);setCobrar(p=>p.filter(c=>c.id!==id));};
  const abonar=async(c)=>{const m=prompt("Cuanto abono "+c.deudor+"?");if(!m||+m<=0)return;const nuevo=(c.abonado||0)+(+m);const estado=nuevo>=c.monto?"cobrado":"parcial";await sb.update("cobrar",c.id,{abonado:nuevo,estado},sesion.token);setCobrar(p=>p.map(x=>x.id===c.id?{...x,abonado:nuevo,estado}:x));};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontWeight:900,fontSize:22,color:C.emerald}}>{fmt(total)}</div><div style={{fontSize:11,color:C.muted}}>Por cobrar - {cobrar.filter(c=>c.estado!=="cobrado").length} persona(s)</div></div>
        <button style={S.btn(C.emerald)} onClick={()=>{setF({deudor:"",concepto:"",monto:"",abonado:0,fecha:today(),vencimiento:"",nota:"",estado:"pendiente"});setModal("new");}}>+ Agregar</button>
      </div>
      {vencidas.length>0&&<div style={S.alert(C.danger)}><b>{vencidas.length} vencidas: </b>{vencidas.map(v=>v.deudor).join(", ")}</div>}
      <div style={S.g3}>
        <div style={S.box(C.emerald)}><div style={S.bv(C.emerald,16)}>{fmt(total)}</div><div style={S.bl}>Por cobrar</div></div>
        <div style={S.box(C.warn)}><div style={S.bv(C.warn,16)}>{vencidas.length}</div><div style={S.bl}>Vencidas</div></div>
        <div style={S.box(C.muted)}><div style={S.bv(C.soft,16)}>{fmt(cobrar.filter(c=>c.estado==="cobrado").reduce((a,c)=>a+c.monto,0))}</div><div style={S.bl}>Cobrado</div></div>
      </div>
      {cobrar.filter(c=>c.estado!=="cobrado").length===0&&<div style={{textAlign:"center",padding:30,color:C.muted}}>Sin cuentas por cobrar pendientes</div>}
      {cobrar.filter(c=>c.estado!=="cobrado").map(c=>{
        const pend=c.monto-(c.abonado||0);const venc=c.vencimiento&&c.vencimiento<today();const color=venc?C.danger:c.estado==="parcial"?C.warn:C.emerald;
        return (
          <div key={c.id} style={{...S.card,borderLeft:"3px solid "+color}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div><div style={{fontWeight:700,fontSize:15}}>{c.deudor}</div><div style={{fontSize:11,color:C.muted}}>{c.concepto} - desde {fmtF(c.fecha)}</div>{c.vencimiento&&<div style={{fontSize:11,color:venc?C.danger:C.muted}}>Vence: {c.vencimiento}{venc?" VENCIDO":""}</div>}</div>
              <div style={{textAlign:"right"}}><div style={{fontWeight:900,fontSize:18,color:C.emerald}}>{fmt(pend)}</div><div style={{fontSize:11,color:C.muted}}>de {fmt(c.monto)}</div></div>
            </div>
            {c.abonado>0&&<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:C.muted}}>Cobrado: {fmt(c.abonado)}</span><span style={{fontSize:11,fontWeight:700}}>{c.monto>0?((c.abonado/c.monto)*100).toFixed(0):0}%</span></div><div style={S.bar()}><div style={S.fill(c.monto>0?(c.abonado/c.monto)*100:0,C.emerald)}/></div></div>}
            {c.nota&&<div style={{fontSize:11,color:C.warn,marginBottom:8}}>{c.nota}</div>}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={S.tag(color)}>{c.estado==="parcial"?"Parcial":"Pendiente"}</span>
              <button style={S.bsm(C.emerald)} onClick={()=>abonar(c)}>Registrar pago</button>
              <button style={S.bsm(C.accent)} onClick={()=>{setF({...c,monto:c.monto+"",abonado:c.abonado+""});setModal("edit");}}>Editar</button>
              <button style={S.bsm(C.danger)} onClick={()=>del(c.id)}>x</button>
            </div>
          </div>
        );
      })}
      {cobrar.filter(c=>c.estado==="cobrado").length>0&&<div style={S.card}><div style={S.lbl}>Ya cobrado</div>{cobrar.filter(c=>c.estado==="cobrado").map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+C.border}}><div><div style={{fontSize:12,fontWeight:600}}>{c.deudor}</div><div style={{fontSize:10,color:C.muted}}>{c.concepto}</div></div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontWeight:700,color:C.emerald}}>{fmt(c.monto)}</span><button onClick={()=>del(c.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer"}}>x</button></div></div>)}</div>}
      {modal&&<Modal title={modal==="new"?"Nueva cuenta por cobrar":"Editar"} onClose={()=>setModal(null)}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Quien te debe?</label><input style={S.inp} value={f.deudor} onChange={e=>uf("deudor",e.target.value)} placeholder="Nombre"/></div>
          <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Concepto</label><input style={S.inp} value={f.concepto} onChange={e=>uf("concepto",e.target.value)} placeholder="Prestamo, servicio..."/></div>
          <div><label style={S.lbl2}>Monto total</label><input style={S.inp} type="number" value={f.monto} onChange={e=>uf("monto",e.target.value)}/></div>
          <div><label style={S.lbl2}>Ya abono</label><input style={S.inp} type="number" value={f.abonado} onChange={e=>uf("abonado",e.target.value)}/></div>
          <div><label style={S.lbl2}>Fecha prestamo</label><input style={S.inp} type="date" value={f.fecha} onChange={e=>uf("fecha",e.target.value)}/></div>
          <div><label style={S.lbl2}>Fecha limite</label><input style={S.inp} type="date" value={f.vencimiento} onChange={e=>uf("vencimiento",e.target.value)}/></div>
          <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Nota</label><input style={S.inp} value={f.nota} onChange={e=>uf("nota",e.target.value)}/></div>
        </div>
        <button style={{...S.btn(C.emerald),width:"100%",padding:"13px"}} onClick={guardar}>Guardar</button>
      </Modal>}
    </div>
  );
}

function TabPlan({perfil,deudas,extras}){
  const totalDeuda=deudas.reduce((a,d)=>a+d.saldo,0);
  const cuotas=deudas.reduce((a,d)=>a+(d.cuota||0),0);
  const ingBase=(perfil.sueldo_neto||3000)+(perfil.ing_indep||0)+(perfil.fuxion||0)+(perfil.alquiler||0)+(perfil.dividendos||0)+(perfil.otros||0);
  const gastBase=TOTAL_FIJOS+(perfil.gastos_variables||1400);
  const margen=ingBase-gastBase;
  const numLib=gastBase*12*25;
  let s1=totalDeuda,m1=0;while(s1>100&&m1<360){m1++;s1=Math.max(s1*1.025-cuotas,0);}
  let s2=totalDeuda,m2=0;const ext=Math.max(margen*0.5,0);while(s2>100&&m2<360){m2++;s2=Math.max(s2*1.025-(cuotas+ext),0);}
  const FASES=[
    {n:1,tit:"Apagar incendios",sub:"Ahora",c:C.danger,activo:deudas.some(d=>(d.dias_atraso||0)>60),items:["Negociar deudas vencidas con plan de pago","Detener nuevas deudas","Usar CTS estrategicamente"]},
    {n:2,tit:"Estabilizar flujo",sub:"1-3 meses",c:"#f97316",activo:margen<=0,items:["Ingresos mayores que gastos","Pagar cuotas puntualmente","Aumentar ingresos: Fuxion, freelance"]},
    {n:3,tit:"Eliminar deudas",sub:"3-24 meses",c:C.warn,activo:totalDeuda>0&&margen>0,items:["Avalancha: mayor tasa primero","30-50% del margen en abonos extra","Golpes con extraordinarios"]},
    {n:4,tit:"Fondo emergencia",sub:"Paralelo",c:"#84cc16",activo:false,items:["3-6 meses de gastos separados","Deposito a plazo en caja municipal"]},
    {n:5,tit:"Invertir y crecer",sub:"Con flujo positivo",c:C.emerald,activo:false,items:["Fondos mutuos desde S/20","Escalar Fuxion","Acciones BVL"]},
    {n:6,tit:"Libertad financiera",sub:"El destino",c:C.purple,activo:false,items:["Ingresos pasivos cubren gastos","Trabajas porque quieres"]},
  ];
  const faseActual=FASES.findIndex(f=>f.activo);
  return (
    <div>
      <div style={{...S.card,background:"linear-gradient(135deg,"+C.purple+"15,"+C.card+")",border:"1px solid "+C.purple+"35"}}>
        <div style={S.lbl}>Tu numero de libertad financiera</div>
        <div style={{fontWeight:900,fontSize:28,color:C.purple}}>{fmtK(numLib)}</div>
        <div style={{fontSize:12,color:C.soft}}>Capital necesario para vivir de inversiones (regla 4%)</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>Gastos {fmt(gastBase)}/mes x 12 x 25</div>
      </div>
      {totalDeuda>0&&<div style={S.card}><div style={S.lbl}>Proyeccion salida de deudas</div><div style={S.g2}><div style={S.box(C.warn)}><div style={S.bv(C.warn)}>{m1>0?(m1/12).toFixed(1):"inf"} anos</div><div style={S.bl}>Solo cuotas</div></div><div style={S.box(C.emerald)}><div style={S.bv(C.emerald)}>{m2>0?(m2/12).toFixed(1):"inf"} anos</div><div style={S.bl}>+{fmtK(ext)}/mes extra</div></div></div>{ext>0&&<div style={{fontSize:11,color:C.muted,marginTop:8}}>Ahorras {m1-m2} meses pagando {fmt(ext)} extra/mes.</div>}</div>}
      {extras.length>0&&<div style={S.card}><div style={S.lbl}>Calendario estrategico</div>{extras.map(e=><div key={e.id} style={{padding:"9px 0",borderBottom:"1px solid "+C.border}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700}}>{e.mes}</span><span style={{fontWeight:900,color:C.gold}}>{fmt(e.monto)}</span></div><div style={{fontSize:11,color:C.muted}}>{e.concepto}{e.accion?" - "+e.accion:""}</div></div>)}</div>}
      <div style={S.card}><div style={S.lbl}>Tu hoja de ruta</div>
        {FASES.map((fa,i)=>{const esA=i===faseActual,comp=faseActual>=0&&i<faseActual;return(
          <div key={fa.n} style={{display:"flex",gap:14,marginBottom:18}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:comp?fa.c:esA?fa.c:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:(comp||esA)?(comp?"#fff":"#040a12"):C.muted,flexShrink:0}}>{comp?"v":fa.n}</div>
              {i<FASES.length-1&&<div style={{width:2,flex:1,background:comp?fa.c:C.border,minHeight:16,marginTop:4}}/>}
            </div>
            <div style={{flex:1,paddingBottom:6}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:5}}><span style={{fontWeight:800,color:esA?fa.c:C.text,fontSize:13}}>{fa.tit}</span>{esA&&<span style={S.tag(fa.c)}>Aqui estas</span>}<span style={{fontSize:10,color:C.muted,marginLeft:"auto"}}>{fa.sub}</span></div>
              {fa.items.map((item,j)=><div key={j} style={{fontSize:11,color:C.soft,marginBottom:3}}>{esA?"->":"."} {item}</div>)}
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

export default function App(){
  const [appState,setAppState]=useState("splash");
  const [sesion,setSesion]=useState(null);
  const [perfil,setPerfil]=useState({});
  const [deudas,setDeudas]=useState([]);
  const [txns,setTxns]=useState([]);
  const [cobrar,setCobrar]=useState([]);
  const [extras,setExtras]=useState([]);
  const [fuxionSemanas,setFuxionSemanas]=useState([]);
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState(0);

  useEffect(()=>{
    const validar=async()=>{
      let s=null;
      try{const raw=localStorage.getItem("fl_sess");s=raw?JSON.parse(raw):null;}catch{s=null;}
      if(!s||!s.token||!s.user){setAppState("auth");return;}
      try{
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),8000);
        const r=await fetch(SUPA_URL+"/rest/v1/perfiles?select=id&id=eq."+s.user.id,{headers:h(s.token),signal:controller.signal});
        clearTimeout(timeout);
        if(r.status===401||r.status===403){localStorage.removeItem("fl_sess");setAppState("auth");return;}
        setSesion(s);setAppState("ready");
      }catch(e){
        if(e.name==="AbortError"){setSesion(s);setAppState("ready");}
        else{localStorage.removeItem("fl_sess");setAppState("auth");}
      }
    };
    validar();
  },[]);

  useEffect(()=>{
    if(sesion)localStorage.setItem("fl_sess",JSON.stringify(sesion));
    else localStorage.removeItem("fl_sess");
  },[sesion]);

  useEffect(()=>{
    if(!sesion||appState!=="ready")return;
    const uid=sesion.user.id,tok=sesion.token;
    setLoading(true);
    Promise.all([
      sb.select("perfiles","select=*&id=eq."+uid,tok).then(d=>setPerfil(d[0]||{})),
      sb.select("deudas","select=*&user_id=eq."+uid,tok).then(d=>setDeudas(d||[])),
      sb.select("transacciones","select=*&user_id=eq."+uid+"&order=fecha.desc",tok).then(d=>setTxns(d||[])),
      sb.select("cobrar","select=*&user_id=eq."+uid,tok).then(d=>setCobrar(d||[])),
      sb.select("fuxion_semanas","select=*&user_id=eq."+uid+"&order=semana_inicio.desc",tok).then(d=>setFuxionSemanas(d||[])).catch(()=>setFuxionSemanas([])),
      sb.select("extraordinarios","select=*&user_id=eq."+uid+"&order=mes.asc",tok).then(async d=>{
        if(d&&d.length>0){setExtras(d);return;}
        const base=[
          {user_id:uid,mes:"2026-05",concepto:"CTS SUNAT",monto:3000,accion:"Presentarte a BCP con plan de pago"},
          {user_id:uid,mes:"2026-07",concepto:"Gratificacion SUNAT",monto:4500,accion:"Reducir Platinum Card"},
          {user_id:uid,mes:"2026-11",concepto:"CTS SUNAT",monto:3000,accion:"Extracash o BCP segun acuerdo"},
          {user_id:uid,mes:"2026-12",concepto:"Gratificacion SUNAT",monto:4500,accion:"Mayor saldo pendiente"},
          {user_id:uid,mes:"2027-02",concepto:"Bono SUNAT",monto:9000,accion:"Golpe fuerte al mayor saldo"},
        ];
        const saved=await sb.insert("extraordinarios",base,tok);
        if(saved)setExtras(Array.isArray(saved)?saved:[saved]);
      }),
    ]).finally(()=>setLoading(false));
  },[sesion,appState]);

  const onLogin=(s)=>{setSesion(s);setAppState("ready");};
  const onLogout=()=>{setSesion(null);setPerfil({});setDeudas([]);setTxns([]);setCobrar([]);setExtras([]);setFuxionSemanas([]);setAppState("auth");};
  const totalDeuda=deudas.reduce((a,d)=>a+d.saldo,0);
  const totalCobrar=cobrar.filter(c=>c.estado!=="cobrado").reduce((a,c)=>a+(c.monto-(c.abonado||0)),0);
  const TABS=["Inicio","Registrar","Fuxion","Deudas","Por Cobrar","Mi Plan"];
  const uid=sesion&&sesion.user.id;

  if(appState==="splash") return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <div style={{fontSize:28,fontWeight:900}}><span style={{color:C.accent}}>Finanzas</span><span style={{color:C.text}}>Libre</span></div>
      <div style={{width:36,height:36,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(appState==="auth") return <AuthScreen onLogin={onLogin}/>;

  return (
    <div style={S.app}>
      <div style={{background:C.surface,padding:"11px 16px",borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontWeight:900,fontSize:16}}><span style={{color:C.accent}}>Finanzas</span><span style={{color:C.text}}>Libre</span></div><div style={{fontSize:10,color:C.muted}}>{perfil.nombre||sesion.nombre}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"right"}}>
              {totalDeuda>0?<><div style={{fontSize:12,fontWeight:900,color:C.danger}}>{fmtK(totalDeuda)}</div><div style={{fontSize:9,color:C.muted}}>deuda</div></>:<div style={{fontSize:12,fontWeight:900,color:C.emerald}}>Sin deudas</div>}
              {totalCobrar>0&&<div style={{fontSize:10,fontWeight:700,color:C.emerald}}>+{fmtK(totalCobrar)} por cobrar</div>}
            </div>
            <button onClick={onLogout} style={{background:"none",border:"1px solid "+C.border,borderRadius:8,padding:"6px 10px",color:C.muted,cursor:"pointer",fontSize:11}}>Salir</button>
          </div>
        </div>
      </div>
      <nav style={S.nav}>{TABS.map((t,i)=><button key={i} style={S.nb(tab===i)} onClick={()=>setTab(i)}>{t}</button>)}</nav>
      {loading&&<div style={{textAlign:"center",padding:16,color:C.muted,fontSize:12}}>Cargando...</div>}
      <div style={S.page}>
        {tab===0&&<TabDashboard perfil={perfil} deudas={deudas} txns={txns} extras={extras} fuxionSemanas={fuxionSemanas}/>}
        {tab===1&&<TabRegistrar userId={uid} sesion={sesion} txns={txns} setTxns={setTxns}/>}
        {tab===2&&<TabFuxion userId={uid} sesion={sesion} fuxionSemanas={fuxionSemanas} setFuxionSemanas={setFuxionSemanas}/>}
        {tab===3&&<TabDeudas userId={uid} sesion={sesion} deudas={deudas} setDeudas={setDeudas}/>}
        {tab===4&&<TabCobrar userId={uid} sesion={sesion} cobrar={cobrar} setCobrar={setCobrar}/>}
        {tab===5&&<TabPlan perfil={perfil} deudas={deudas} extras={extras}/>}
      </div>
    </div>
  );
}
