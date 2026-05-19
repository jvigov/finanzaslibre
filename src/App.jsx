import { useState, useEffect } from "react";

const SUPA_URL = "https://zvdnwnknmkrwcpnyorle.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZG53bmtubWtyd2NwbnlvcmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTY2ODcsImV4cCI6MjA5MzY3MjY4N30.nBoMnQbatFQekFakmKsEIS4qjgU2BHpzUzUz9nvxY-E";
const h=(tok)=>({"Content-Type":"application/json","apikey":SUPA_KEY,"Authorization":"Bearer "+(tok||SUPA_KEY)});
const sb={
  async select(table,query,tok){const r=await fetch(SUPA_URL+"/rest/v1/"+table+"?"+(query||"select=*"),{headers:h(tok)});return r.json();},
  async insert(table,body,tok){const r=await fetch(SUPA_URL+"/rest/v1/"+table,{method:"POST",headers:{...h(tok),"Prefer":"return=representation"},body:JSON.stringify(body)});const d=await r.json();return Array.isArray(d)?d[0]:d;},
  async update(table,id,body,tok){await fetch(SUPA_URL+"/rest/v1/"+table+"?id=eq."+id,{method:"PATCH",headers:{...h(tok),"Prefer":"return=minimal"},body:JSON.stringify(body)});},
  async delete(table,id,tok){await fetch(SUPA_URL+"/rest/v1/"+table+"?id=eq."+id,{method:"DELETE",headers:h(tok)});},
  async signUp(email,pwd,nombre){const r=await fetch(SUPA_URL+"/auth/v1/signup",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPA_KEY},body:JSON.stringify({email,password:pwd,options:{data:{nombre}}})});return r.json();},
  async signIn(email,pwd){const r=await fetch(SUPA_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPA_KEY},body:JSON.stringify({email,password:pwd})});return r.json();},
};

const fmt=(n)=>"S/ "+Number(n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtD=(n)=>"$ "+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtK=(n)=>{const a=Math.abs(n||0);if(a>=1e6)return"S/ "+(n/1e6).toFixed(1)+"M";if(a>=1000)return"S/ "+(n/1000).toFixed(1)+"k";return fmt(n);};
const fmtF=(f)=>{if(!f)return"";const s=f.split("T")[0];const[,m,d]=s.split("-");const ms=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return parseInt(d)+" "+ms[parseInt(m)-1];};
const today=()=>new Date().toISOString().split("T")[0];
const curMes=()=>new Date().toISOString().slice(0,7);
const semanaNum=(fecha)=>{const d=new Date(fecha);const ini=new Date(d.getFullYear(),0,1);const diff=d-ini;const oneWeek=604800000;return Math.ceil((diff/oneWeek)+1);};
const semanaRango=(ini)=>{if(!ini)return"";const d=new Date(ini);const fin=new Date(d);fin.setDate(fin.getDate()+6);return fmtF(ini)+" - "+fmtF(fin.toISOString().split("T")[0])+" · Sem "+semanaNum(ini)+"-"+new Date(ini).getFullYear();};

const SBS_L=["Normal","Prob. Potenciales","Deficiente","Dudoso","Perdida"];
const SBS_C=["#22c55e","#eab308","#f97316","#ef4444","#dc2626"];
const sbsI=(d)=>d<=7?0:d<=30?1:d<=60?2:d<=120?3:4;

const GASTOS_FIJOS=[
  {nombre:"Cuota Extracash Interbank",monto:2077},
  {nombre:"Ruleteo Platinum (S/21k x 1.5%)",monto:315},
  {nombre:"ChatGPT",monto:85},
  {nombre:"Claude",monto:85},
  {nombre:"Entel postpago",monto:80},
  {nombre:"Dentista",monto:200},
  {nombre:"Contabilidad EIRL",monto:236},
  {nombre:"DirecTV Go",monto:83.9},
];
const TOTAL_FIJOS=GASTOS_FIJOS.reduce((a,g)=>a+g.monto,0);

const GC=["Alimentacion","Comida afuera","Taxi / Uber","Viaje y combustible","Salud y farmacia","Entretenimiento","Regalo / detalle","Ropa y personal","Suscripciones IA","Educacion","Extraordinario"];
const IC=["Sueldo SUNAT","Gestiones admin","Fuxion personal","Fuxion EIRL","Venta productos Fuxion","Firu / Bancaje","Otro ingreso"];
const FT=["Personal","EIRL","Familiar hermano","Familiar pareja","Familiar mama","Familiar papa","Otro"];
const ESTRATEGIAS=["Pagando puntual","Negociando","En espera","Castigada"];
const ESTRATEGIA_C={"Pagando puntual":"#10b981","Negociando":"#f59e0b","En espera":"#8b5cf6","Castigada":"#f43f5e"};

const C={bg:"#060c15",surface:"#0a1520",card:"#0e1c2c",border:"#172538",accent:"#0ea5e9",emerald:"#10b981",danger:"#f43f5e",warn:"#f59e0b",gold:"#fbbf24",purple:"#8b5cf6",text:"#e0eaf8",soft:"#7a9bb8",muted:"#3d5570"};
const S={
  app:{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,fontSize:14},
  nav:{display:"flex",background:C.surface,borderBottom:"1px solid "+C.border,overflowX:"auto"},
  nb:(a)=>({padding:"12px 13px",border:"none",borderBottom:a?"2px solid "+C.accent:"2px solid transparent",background:"transparent",color:a?C.accent:C.muted,fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}),
  page:{padding:16,maxWidth:840,margin:"0 auto",paddingBottom:60},
  card:{background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:16,marginBottom:12},
  lbl:{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,display:"block"},
  lbl2:{fontSize:11,fontWeight:600,color:C.soft,marginBottom:5,display:"block"},
  g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10},
  box:(c)=>({background:C.surface,borderRadius:12,padding:14,border:"1px solid "+(c||C.accent)+"20"}),
  bv:(c,sz)=>({fontSize:sz||20,fontWeight:900,color:c||C.text,lineHeight:1.1,marginBottom:3}),
  bl:{fontSize:11,color:C.muted},
  btn:(c)=>({background:c||C.accent,color:"#040a12",border:"none",borderRadius:10,padding:"10px 18px",fontWeight:700,cursor:"pointer",fontSize:13}),
  bsm:(c)=>({background:(c||C.accent)+"18",color:c||C.accent,border:"1px solid "+(c||C.accent)+"40",borderRadius:8,padding:"5px 12px",fontWeight:600,cursor:"pointer",fontSize:11}),
  inp:{width:"100%",background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none"},
  sel:{width:"100%",background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,outline:"none"},
  bar:(hh)=>({background:C.border,borderRadius:99,height:hh||6,overflow:"hidden"}),
  fill:(p,c,hh)=>({width:Math.min(Math.max(p||0,0),100)+"%",height:hh||6,background:c||C.accent,borderRadius:99,transition:"width .5s"}),
  tag:(c)=>({background:(c||C.accent)+"20",color:c||C.accent,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,display:"inline-block"}),
  alert:(c)=>({background:(c||C.warn)+"12",border:"1px solid "+(c||C.warn)+"40",borderLeft:"3px solid "+(c||C.warn),borderRadius:12,padding:13,marginBottom:11}),
  hr:{borderTop:"1px solid "+C.border,margin:"12px 0"},
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
    try{const d=await sb.signIn(email,pwd);if(d.access_token)onLogin({user:d.user,token:d.access_token,nombre:d.user.user_metadata?.nombre||email.split("@")[0]});else setError(d.error_description||"Email o contrasena incorrectos");}
    catch{setError("Error de conexion");}
    setLoading(false);
  };
  const registro=async()=>{
    if(!nombre||!email||!pwd){setError("Completa todos los campos");return;}
    if(pwd.length<6){setError("Minimo 6 caracteres");return;}
    setLoading(true);setError("");
    try{const d=await sb.signUp(email,pwd,nombre);if(d.error){setError(d.error_description||"Error");setLoading(false);return;}const d2=await sb.signIn(email,pwd);if(d2.access_token)onLogin({user:d2.user,token:d2.access_token,nombre});else setError("Confirma tu email primero");}
    catch{setError("Error de conexion");}
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:30,fontWeight:900}}><span style={{color:C.accent}}>Finanzas</span><span style={{color:C.text}}>Libre</span></div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Tu segundo cerebro financiero</div></div>
        <div style={{display:"flex",background:C.surface,borderRadius:12,padding:4,marginBottom:20,border:"1px solid "+C.border}}>{[["login","Iniciar sesion"],["registro","Crear cuenta"]].map(([k,l])=><button key={k} onClick={()=>{setModo(k);setError("");}} style={{flex:1,padding:"10px",borderRadius:9,border:"none",background:modo===k?C.card:"transparent",color:modo===k?C.text:C.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>{l}</button>)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {modo==="registro"&&<div><label style={S.lbl2}>Tu nombre</label><input style={S.inp} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Johnatan Vigo"/></div>}
          <div><label style={S.lbl2}>Email</label><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e=>e.key==="Enter"&&login()}/></div>
          <div><label style={S.lbl2}>Contrasena</label><input style={S.inp} type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Minimo 6 caracteres"/></div>
          {error&&<div style={S.alert(C.danger)}><span style={{fontSize:12}}>{error}</span></div>}
          <button style={{...S.btn(C.accent),width:"100%",padding:"13px",fontSize:14,opacity:loading?0.7:1}} onClick={modo==="login"?login:registro} disabled={loading}>{loading?"Cargando...":(modo==="login"?"Entrar":"Crear cuenta")}</button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function TabDashboard({perfil,txns,fuxionSemanas,cajaEirl}){
  const mes=curMes();
  const hoy=today();
  const diasMes=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
  const diaActual=new Date().getDate();
  const pctMes=Math.round((diaActual/diasMes)*100);

  // Ingresos: base perfil + txns manuales + fuxion del mes
  const ingTxns=txns.filter(t=>t.tipo==="ingreso"&&t.fecha&&t.fecha.startsWith(mes)).reduce((a,t)=>a+t.monto,0);
  const ingBase=(perfil.sueldo_neto||3000)+(perfil.ing_gestiones||180);
  const fuxMes=(fuxionSemanas||[]).filter(s=>s.semana_inicio&&s.semana_inicio.startsWith(mes));
  const ingFuxMes=fuxMes.reduce((a,s)=>a+(s.ganancias_codigos||0)+(s.ventas||0),0);
  const ingTotal=ingTxns>0?(ingTxns+ingFuxMes):(ingBase+ingFuxMes);

  // Gastos
  const gastVar=txns.filter(t=>t.tipo==="gasto"&&t.fecha&&t.fecha.startsWith(mes)).reduce((a,t)=>a+t.monto,0);
  const gastMes=TOTAL_FIJOS+gastVar;
  const margen=ingTotal-gastMes;

  // Fuxion semana actual
  const semAct=(fuxionSemanas||[]).find(s=>{
    if(!s.semana_inicio)return false;
    const ini=new Date(s.semana_inicio);const fin=new Date(ini);fin.setDate(fin.getDate()+6);
    return new Date(hoy)>=ini&&new Date(hoy)<=fin;
  });
  const fuxInv=semAct?((semAct.google_ads||0)+(semAct.productos||0)):0;
  const fuxRet=semAct?((semAct.ganancias_codigos||0)+(semAct.ganancias_eirl||0)+(semAct.ventas||0)):0;
  const fuxRes=fuxRet-fuxInv;

  // Ultimos 3 movimientos
  const recientes=[...txns].sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).slice(0,3);

  return(
    <div>
      {/* HERO — margen libre protagonista */}
      <div style={{background:"linear-gradient(135deg,#0a1f35,"+C.card+")",border:"1px solid "+(margen>=0?C.emerald:C.danger)+"35",borderRadius:20,padding:20,marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Margen libre — {new Date().toLocaleString("es-PE",{month:"long"})} {new Date().getFullYear()}</div>
        <div style={{fontSize:42,fontWeight:900,color:margen>=0?C.emerald:C.danger,lineHeight:1,marginBottom:8}}>{fmtK(margen)}</div>
        <div style={{fontSize:12,color:C.soft,marginBottom:12}}>
          <span style={{color:C.emerald}}>+{fmtK(ingTotal)}</span>
          <span style={{color:C.muted}}> ingresos &nbsp;·&nbsp; </span>
          <span style={{color:C.danger}}>-{fmtK(gastMes)}</span>
          <span style={{color:C.muted}}> gastos</span>
        </div>
        {/* barra de progreso del mes */}
        <div style={{...S.bar(4),marginBottom:4}}><div style={S.fill(pctMes,C.accent+"80",4)}/></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted}}>
          <span>Dia {diaActual} de {diasMes}</span>
          <span>{pctMes}% del mes transcurrido</span>
        </div>
      </div>

      {/* 3 pildoras compactas */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[
          {label:"Ingresos",val:fmtK(ingTotal),color:C.emerald},
          {label:"Fijos",val:fmtK(TOTAL_FIJOS),color:C.danger},
          {label:"Variables",val:fmtK(gastVar),color:C.warn},
        ].map(p=>(
          <div key={p.label} style={{background:C.surface,borderRadius:12,padding:"10px 12px",border:"1px solid "+p.color+"20"}}>
            <div style={{fontSize:14,fontWeight:900,color:p.color}}>{p.val}</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{p.label}</div>
          </div>
        ))}
      </div>

      {/* Fuxion semana actual */}
      <div style={{...S.card,border:"1px solid "+(semAct?(fuxRes>=0?C.emerald:C.danger):C.border)+"40"}}>
        <div style={S.lbl}>Fuxion · semana actual</div>
        {semAct?(
          <div>
            <div style={{fontSize:11,color:C.soft,marginBottom:10}}>{semanaRango(semAct.semana_inicio)}</div>
            <div style={S.g3}>
              <div style={S.box(C.danger)}><div style={S.bv(C.danger,15)}>{fmtK(fuxInv)}</div><div style={S.bl}>Invertido</div></div>
              <div style={S.box(C.emerald)}><div style={S.bv(C.emerald,15)}>{fmtK(fuxRet)}</div><div style={S.bl}>Retorno</div></div>
              <div style={S.box(fuxRes>=0?C.emerald:C.danger)}><div style={S.bv(fuxRes>=0?C.emerald:C.danger,15)}>{fuxRes>=0?"+":""}{fmtK(fuxRes)}</div><div style={S.bl}>Resultado</div></div>
            </div>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"12px 0",color:C.muted,fontSize:12}}>Sin registro esta semana · Ve a Fuxion para agregar</div>
        )}
      </div>

      {/* Caja EIRL */}
      {cajaEirl>0&&(
        <div style={{...S.card,border:"1px solid "+C.purple+"35"}}>
          <div style={S.lbl}>Caja EIRL</div>
          <div style={{fontWeight:900,fontSize:24,color:C.purple}}>{fmt(cajaEirl)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>Tu dinero en cuenta empresa</div>
        </div>
      )}

      {/* Ultimos 3 movimientos */}
      {recientes.length>0&&(
        <div style={S.card}>
          <div style={S.lbl}>Ultimos movimientos</div>
          {recientes.map(t=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+C.border}}>
              <div>
                <div style={{fontSize:12,fontWeight:600}}>{t.descripcion||t.cat}</div>
                <div style={{fontSize:10,color:C.muted}}><b style={{color:C.soft}}>{fmtF(t.fecha)}</b> · {t.cat}</div>
              </div>
              <span style={{fontWeight:700,color:t.tipo==="ingreso"?C.emerald:C.danger,flexShrink:0,marginLeft:8}}>{t.tipo==="ingreso"?"+":"-"}{fmt(t.monto)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Meta */}
      {perfil.meta&&(
        <div style={{...S.card,border:"1px solid "+C.gold+"30"}}>
          <div style={S.lbl}>Tu meta</div>
          <div style={{fontSize:13,color:C.soft,fontStyle:"italic",lineHeight:1.5}}>"{perfil.meta}"</div>
        </div>
      )}
    </div>
  );
}

// ── REGISTRAR ─────────────────────────────────────────────────────────────────
function TabRegistrar({userId,sesion,txns,setTxns,fuxionSemanas}){
  const [guardado,setGuardado]=useState(false);
  const [mForm,setMForm]=useState({tipo:"gasto",cat:"Alimentacion",monto:"",descripcion:"",fecha:today(),fuente:"Personal"});
  const uf=(k,v)=>setMForm(p=>({...p,[k]:v}));
  // Filtro por rango de fechas
  const [filtroTipo,setFiltroTipo]=useState("mes"); // "mes" | "rango"
  const [mes,setMes]=useState(curMes());
  const [rangoIni,setRangoIni]=useState(today());
  const [rangoFin,setRangoFin]=useState(today());

  const guardarManual=async()=>{
    if(!mForm.monto||+mForm.monto<=0)return;
    const body={user_id:userId,...mForm,monto:+mForm.monto};
    const saved=await sb.insert("transacciones",body,sesion.token);
    if(saved&&saved.id){setTxns(p=>[saved,...p]);setMForm({tipo:"gasto",cat:"Alimentacion",monto:"",descripcion:"",fecha:today(),fuente:"Personal"});setGuardado(true);setTimeout(()=>setGuardado(false),2000);}
  };
  const eliminar=async(id)=>{await sb.delete("transacciones",id,sesion.token);setTxns(p=>p.filter(t=>t.id!==id));};

  // Filtrado
  const filtradas=txns.filter(t=>{
    if(!t.fecha)return false;
    const fd=t.fecha.split("T")[0];
    if(filtroTipo==="mes")return fd.startsWith(mes);
    return fd>=rangoIni&&fd<=rangoFin;
  });

  const ingMes=filtradas.filter(t=>t.tipo==="ingreso").reduce((a,t)=>a+t.monto,0);
  const gastVar=filtradas.filter(t=>t.tipo==="gasto").reduce((a,t)=>a+t.monto,0);
  const gastMes=filtroTipo==="mes"?TOTAL_FIJOS+gastVar:gastVar;

  // Fuxion del mes para sumar a ingresos
  const mesActivo=filtroTipo==="mes"?mes:rangoIni.slice(0,7);
  const ingFuxMes=(fuxionSemanas||[]).filter(s=>s.semana_inicio&&s.semana_inicio.startsWith(mesActivo)).reduce((a,s)=>a+(s.ganancias_codigos||0)+(s.ventas||0),0);
  const ingTotal=ingMes+ingFuxMes;

  const porDia={};
  filtradas.forEach(t=>{const d=t.fecha&&t.fecha.split("T")[0];if(d){if(!porDia[d])porDia[d]=[];porDia[d].push(t);}});
  const dias=Object.keys(porDia).sort((a,b)=>b.localeCompare(a));

  return(
    <div>
      {/* Formulario */}
      <div style={S.card}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["gasto","ingreso"].map(t=>(
            <button key={t} onClick={()=>uf("tipo",t)} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid "+(t===mForm.tipo?(t==="gasto"?C.danger:C.emerald):C.border),background:t===mForm.tipo?(t==="gasto"?C.danger+"20":C.emerald+"20"):C.surface,color:t===mForm.tipo?(t==="gasto"?C.danger:C.emerald):C.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>
              {t==="gasto"?"Gasto":"Ingreso"}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={S.lbl2}>Categoria</label><select style={S.sel} value={mForm.cat} onChange={e=>uf("cat",e.target.value)}>{(mForm.tipo==="ingreso"?IC:GC).map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={S.lbl2}>Monto (S/)</label><input style={S.inp} type="number" value={mForm.monto} onChange={e=>uf("monto",e.target.value)} placeholder="0.00"/></div>
          <div><label style={S.lbl2}>Fecha</label><input style={S.inp} type="date" value={mForm.fecha} onChange={e=>uf("fecha",e.target.value)}/></div>
          <div><label style={S.lbl2}>Fuente</label><select style={S.sel} value={mForm.fuente} onChange={e=>uf("fuente",e.target.value)}>{FT.map(f=><option key={f}>{f}</option>)}</select></div>
        </div>
        <div style={{marginBottom:12}}><label style={S.lbl2}>Descripcion</label><input style={S.inp} value={mForm.descripcion} onChange={e=>uf("descripcion",e.target.value)} placeholder="Ej: taxi al dentista..."/></div>
        <button style={{...S.btn(mForm.tipo==="ingreso"?C.emerald:C.danger),width:"100%",padding:"13px"}} onClick={guardarManual}>Guardar</button>
        {guardado&&<div style={{...S.alert(C.emerald),textAlign:"center",marginTop:10}}><b>Guardado</b></div>}
      </div>

      {/* Filtro */}
      <div style={{...S.card,padding:12}}>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["mes","Por mes"],["rango","Por fechas"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFiltroTipo(k)} style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid "+(filtroTipo===k?C.accent:C.border),background:filtroTipo===k?C.accent+"18":C.surface,color:filtroTipo===k?C.accent:C.muted,fontWeight:600,fontSize:12,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        {filtroTipo==="mes"?(
          <input type="month" style={S.inp} value={mes} onChange={e=>setMes(e.target.value)}/>
        ):(
          <div style={S.g2}>
            <div><label style={S.lbl2}>Desde</label><input type="date" style={S.inp} value={rangoIni} onChange={e=>setRangoIni(e.target.value)}/></div>
            <div><label style={S.lbl2}>Hasta</label><input type="date" style={S.inp} value={rangoFin} onChange={e=>setRangoFin(e.target.value)}/></div>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div style={S.g3}>
        <div style={S.box(C.emerald)}><div style={S.bv(C.emerald,15)}>{fmtK(ingTotal)}</div><div style={S.bl}>Ingresos{ingFuxMes>0?" *":""}</div></div>
        <div style={S.box(C.danger)}><div style={S.bv(C.danger,15)}>{fmtK(gastMes)}</div><div style={S.bl}>Gastos</div></div>
        <div style={S.box(ingTotal-gastMes>=0?C.accent:C.danger)}><div style={S.bv(ingTotal-gastMes>=0?C.accent:C.danger,15)}>{fmtK(ingTotal-gastMes)}</div><div style={S.bl}>Balance</div></div>
      </div>
      {ingFuxMes>0&&<div style={{fontSize:10,color:C.muted,marginBottom:8,marginTop:-6}}>* Incluye {fmtK(ingFuxMes)} de Fuxion este mes</div>}

      {/* Fijos */}
      {filtroTipo==="mes"&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:700,fontSize:12}}>Fijos automaticos</span><span style={{fontWeight:800,color:C.danger}}>-{fmt(TOTAL_FIJOS)}</span></div>
          {GASTOS_FIJOS.map(g=>(
            <div key={g.nombre} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:"1px solid "+C.border}}>
              <span style={{fontSize:11,color:C.soft}}>{g.nombre}</span>
              <span style={{fontSize:11,fontWeight:600,color:C.danger}}>-{fmt(g.monto)}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",borderTop:"1px solid "+C.border,marginTop:4}}>
            <span style={{fontSize:12,fontWeight:700}}>Variables registrados</span>
            <span style={{fontWeight:800,color:C.warn}}>-{fmt(gastVar)}</span>
          </div>
        </div>
      )}

      {/* Movimientos por dia */}
      {dias.map(dia=>{
        const movs=porDia[dia];
        const tot=movs.reduce((a,t)=>a+(t.tipo==="ingreso"?t.monto:-t.monto),0);
        return(
          <div key={dia} style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontWeight:800,fontSize:14,color:C.accent}}>{fmtF(dia)}</span>
              <span style={{fontWeight:700,color:tot>=0?C.emerald:C.danger}}>{tot>=0?"+":""}{fmt(tot)}</span>
            </div>
            {movs.map(t=>(
              <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:"1px solid "+C.border}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.descripcion||t.cat}</div>
                  <div style={{fontSize:10,color:C.muted}}>{t.cat} · {t.fuente}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <span style={{fontWeight:700,color:t.tipo==="ingreso"?C.emerald:C.danger}}>{t.tipo==="ingreso"?"+":"-"}{fmt(t.monto)}</span>
                  <button onClick={()=>eliminar(t.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>x</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── FUXION ────────────────────────────────────────────────────────────────────
function TabFuxion({userId,sesion,fuxionSemanas,setFuxionSemanas,cajaMovs,setCajaMovs}){
  const [vistaFuxion,setVistaFuxion]=useState("semanas"); // "semanas" | "caja"
  const [modal,setModal]=useState(false);
  const [modalCaja,setModalCaja]=useState(false);
  const [f,setF]=useState({semana_inicio:"",google_ads:"",productos:"",ganancias_codigos:"",ganancias_eirl:"",ventas:"",nota:""});
  const [fc,setFc]=useState({fecha:today(),concepto:"",monto:"",tipo:"salida"});
  const uf=(k,v)=>setF(p=>({...p,[k]:v}));
  const ufc=(k,v)=>setFc(p=>({...p,[k]:v}));
  const mes=curMes();

  const semMes=(fuxionSemanas||[]).filter(s=>s.semana_inicio&&s.semana_inicio.startsWith(mes));
  const totInv=semMes.reduce((a,s)=>a+(s.google_ads||0)+(s.productos||0),0);
  const totRet=semMes.reduce((a,s)=>a+(s.ganancias_codigos||0)+(s.ganancias_eirl||0)+(s.ventas||0),0);
  const totRes=totRet-totInv;

  // Caja EIRL: automaticos de fuxion + manuales
  const cajaAuto=(fuxionSemanas||[]).reduce((a,s)=>a+(s.ganancias_eirl||0),0);
  const cajaManualEntradas=(cajaMovs||[]).filter(m=>m.tipo==="entrada").reduce((a,m)=>a+m.monto,0);
  const cajaManualSalidas=(cajaMovs||[]).filter(m=>m.tipo==="salida").reduce((a,m)=>a+m.monto,0);
  const cajaTotal=cajaAuto+cajaManualEntradas-cajaManualSalidas;

  const mejorSem=(fuxionSemanas||[]).length>0?(fuxionSemanas||[]).reduce((best,s)=>{
    const r=(s.ganancias_codigos||0)+(s.ganancias_eirl||0)+(s.ventas||0)-(s.google_ads||0)-(s.productos||0);
    const br=(best.ganancias_codigos||0)+(best.ganancias_eirl||0)+(best.ventas||0)-(best.google_ads||0)-(best.productos||0);
    return r>br?s:best;
  }):null;

  const guardarSemana=async()=>{
    if(!f.semana_inicio)return;
    const body={user_id:userId,semana_inicio:f.semana_inicio,google_ads:+f.google_ads||0,productos:+f.productos||0,ganancias_codigos:+f.ganancias_codigos||0,ganancias_eirl:+f.ganancias_eirl||0,ventas:+f.ventas||0,nota:f.nota||""};
    if(f.id){await sb.update("fuxion_semanas",f.id,body,sesion.token);setFuxionSemanas(p=>p.map(s=>s.id===f.id?{...body,id:f.id}:s));}
    else{const saved=await sb.insert("fuxion_semanas",body,sesion.token);if(saved&&saved.id)setFuxionSemanas(p=>[saved,...p]);}
    setModal(false);
  };
  const delSemana=async(id)=>{await sb.delete("fuxion_semanas",id,sesion.token);setFuxionSemanas(p=>p.filter(s=>s.id!==id));};
  const editSemana=(s)=>{setF({...s,google_ads:s.google_ads+"",productos:s.productos+"",ganancias_codigos:(s.ganancias_codigos||0)+"",ganancias_eirl:(s.ganancias_eirl||0)+"",ventas:(s.ventas||0)+""});setModal(true);};

  const guardarCaja=async()=>{
    if(!fc.concepto||!fc.monto||+fc.monto<=0)return;
    const body={user_id:userId,fecha:fc.fecha,concepto:fc.concepto,monto:+fc.monto,tipo:fc.tipo,origen:"manual"};
    const saved=await sb.insert("caja_eirl",body,sesion.token);
    if(saved&&saved.id){setCajaMovs(p=>[saved,...p]);setFc({fecha:today(),concepto:"",monto:"",tipo:"salida"});setModalCaja(false);}
  };
  const delCaja=async(id)=>{await sb.delete("caja_eirl",id,sesion.token);setCajaMovs(p=>p.filter(m=>m.id!==id));};

  const inv2=(+f.google_ads||0)+(+f.productos||0);
  const ret2=(+f.ganancias_codigos||0)+(+f.ganancias_eirl||0)+(+f.ventas||0);
  const res2=ret2-inv2;

  return(
    <div>
      {/* Tabs internas */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["semanas","Semanas Fuxion"],["caja","Caja EIRL"]].map(([k,l])=>(
          <button key={k} onClick={()=>setVistaFuxion(k)} style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid "+(vistaFuxion===k?C.accent:C.border),background:vistaFuxion===k?C.accent+"18":C.surface,color:vistaFuxion===k?C.accent:C.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {vistaFuxion==="semanas"&&(
        <div>
          {/* Resumen mes */}
          <div style={S.card}>
            <div style={S.lbl}>Fuxion · {mes}</div>
            <div style={S.g3}>
              <div style={S.box(C.danger)}><div style={S.bv(C.danger,15)}>{fmtK(totInv)}</div><div style={S.bl}>Invertido</div></div>
              <div style={S.box(C.emerald)}><div style={S.bv(C.emerald,15)}>{fmtK(totRet)}</div><div style={S.bl}>Retorno</div></div>
              <div style={S.box(totRes>=0?C.emerald:C.danger)}><div style={S.bv(totRes>=0?C.emerald:C.danger,15)}>{totRes>=0?"+":""}{fmtK(totRes)}</div><div style={S.bl}>Resultado</div></div>
            </div>
            {semMes.length>0&&<div style={{fontSize:11,color:C.soft,marginTop:10}}>Promedio semanal: <b style={{color:C.accent}}>{fmtK(totRes/semMes.length)}</b> · {semMes.length} semana(s)</div>}
          </div>

          {mejorSem&&(()=>{const r=(mejorSem.ganancias_codigos||0)+(mejorSem.ganancias_eirl||0)+(mejorSem.ventas||0)-(mejorSem.google_ads||0)-(mejorSem.productos||0);return r>0?<div style={{...S.alert(C.gold),marginBottom:12}}><span style={{fontSize:11,color:C.gold}}>Mejor semana: <b>{semanaRango(mejorSem.semana_inicio)}</b> · resultado <b>{fmt(r)}</b></span></div>:null;})()}

          <button style={{...S.btn(C.accent),width:"100%",padding:"13px",marginBottom:12}} onClick={()=>{setF({semana_inicio:"",google_ads:"",productos:"",ganancias_codigos:"",ganancias_eirl:"",ventas:"",nota:""});setModal(true);}}>+ Registrar semana Fuxion</button>

          {(fuxionSemanas||[]).length===0&&<div style={{textAlign:"center",padding:30,color:C.muted,fontSize:12}}>Sin semanas registradas</div>}

          {(fuxionSemanas||[]).map(s=>{
            const inv=(s.google_ads||0)+(s.productos||0);
            const ret=(s.ganancias_codigos||0)+(s.ganancias_eirl||0)+(s.ventas||0);
            const res=ret-inv;
            return(
              <div key={s.id} style={{...S.card,borderLeft:"3px solid "+(res>=0?C.emerald:C.danger)}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>Semana del {fmtF(s.semana_inicio)}</div>
                    <div style={{fontSize:11,color:C.soft,marginTop:2}}>{semanaRango(s.semana_inicio)}</div>
                    {s.nota&&<div style={{fontSize:11,color:C.soft,marginTop:2}}>{s.nota}</div>}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:900,fontSize:16,color:res>=0?C.emerald:C.danger}}>{res>=0?"+":""}{fmt(res)}</div><div style={{fontSize:10,color:C.muted}}>resultado</div></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,marginBottom:10}}>
                  {s.google_ads>0&&<div style={{color:C.muted}}>Google Ads: <b style={{color:C.danger}}>-{fmt(s.google_ads)}</b></div>}
                  {s.productos>0&&<div style={{color:C.muted}}>Productos: <b style={{color:C.danger}}>-{fmt(s.productos)}</b></div>}
                  {s.ganancias_codigos>0&&<div style={{color:C.muted}}>Gan. codigos: <b style={{color:C.emerald}}>+{fmt(s.ganancias_codigos)}</b></div>}
                  {s.ganancias_eirl>0&&<div style={{color:C.muted}}>Gan. EIRL: <b style={{color:C.purple}}>+{fmt(s.ganancias_eirl)}</b></div>}
                  {s.ventas>0&&<div style={{color:C.muted}}>Ventas: <b style={{color:C.emerald}}>+{fmt(s.ventas)}</b></div>}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button style={S.bsm(C.accent)} onClick={()=>editSemana(s)}>Editar</button>
                  <button style={S.bsm(C.danger)} onClick={()=>delSemana(s.id)}>x</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {vistaFuxion==="caja"&&(
        <div>
          {/* Saldo caja */}
          <div style={{...S.card,border:"1px solid "+C.purple+"35",background:"linear-gradient(135deg,"+C.purple+"10,"+C.card+")"}}>
            <div style={S.lbl}>Saldo Caja EIRL</div>
            <div style={{fontWeight:900,fontSize:32,color:C.purple}}>{fmt(cajaTotal)}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:6}}>Auto (cheques EIRL): {fmt(cajaAuto)} · Entradas manuales: {fmt(cajaManualEntradas)} · Salidas: {fmt(cajaManualSalidas)}</div>
          </div>

          <button style={{...S.btn(C.purple),width:"100%",padding:"13px",marginBottom:12,color:"#fff"}} onClick={()=>setModalCaja(true)}>+ Registrar movimiento EIRL</button>

          {(cajaMovs||[]).length===0&&<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Sin movimientos manuales aun</div>}

          {(cajaMovs||[]).map(m=>(
            <div key={m.id} style={{...S.card,borderLeft:"3px solid "+(m.tipo==="entrada"?C.emerald:C.danger)}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{m.concepto}</div>
                  <div style={{fontSize:10,color:C.muted}}>{fmtF(m.fecha)} · {m.tipo==="entrada"?"Entrada":"Salida"}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontWeight:700,color:m.tipo==="entrada"?C.emerald:C.danger}}>{m.tipo==="entrada"?"+":"-"}{fmt(m.monto)}</span>
                  <button onClick={()=>delCaja(m.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>x</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva/editar semana */}
      {modal&&(
        <Modal title={f.id?"Editar semana":"Nueva semana Fuxion"} onClose={()=>setModal(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div><label style={S.lbl2}>Semana que inicia (lunes)</label><input style={S.inp} type="date" value={f.semana_inicio} onChange={e=>uf("semana_inicio",e.target.value)}/></div>
            {f.semana_inicio&&<div style={{fontSize:11,color:C.accent,marginTop:-6}}>{semanaRango(f.semana_inicio)}</div>}
            <div style={S.hr}/>
            <div style={{fontSize:11,fontWeight:700,color:C.danger,textTransform:"uppercase",letterSpacing:1}}>Inversion</div>
            <div style={S.g2}>
              <div><label style={S.lbl2}>Google Ads (S/)</label><input style={S.inp} type="number" value={f.google_ads} onChange={e=>uf("google_ads",e.target.value)} placeholder="0"/></div>
              <div><label style={S.lbl2}>Productos comprados (S/)</label><input style={S.inp} type="number" value={f.productos} onChange={e=>uf("productos",e.target.value)} placeholder="0"/></div>
            </div>
            <div style={S.hr}/>
            <div style={{fontSize:11,fontWeight:700,color:C.emerald,textTransform:"uppercase",letterSpacing:1}}>Retorno</div>
            <div style={S.g2}>
              <div><label style={S.lbl2}>Ganancias de codigos (S/)</label><input style={S.inp} type="number" value={f.ganancias_codigos} onChange={e=>uf("ganancias_codigos",e.target.value)} placeholder="0"/></div>
              <div><label style={S.lbl2}>Ganancias de codigo EIRL (S/)</label><input style={S.inp} type="number" value={f.ganancias_eirl} onChange={e=>uf("ganancias_eirl",e.target.value)} placeholder="0"/></div>
            </div>
            <div><label style={S.lbl2}>Ventas de productos (S/)</label><input style={S.inp} type="number" value={f.ventas} onChange={e=>uf("ventas",e.target.value)} placeholder="0"/></div>
            <div><label style={S.lbl2}>Nota (opcional)</label><input style={S.inp} value={f.nota} onChange={e=>uf("nota",e.target.value)} placeholder="Ej: campana nueva, semana floja..."/></div>
            {(inv2||ret2)>0&&<div style={{...S.alert(res2>=0?C.emerald:C.danger),textAlign:"center"}}><span style={{fontWeight:700}}>Resultado: </span><span style={{fontWeight:900,color:res2>=0?C.emerald:C.danger}}>{res2>=0?"+":""}{fmt(res2)}</span></div>}
            <button style={{...S.btn(C.accent),width:"100%",padding:"13px"}} onClick={guardarSemana}>Guardar semana</button>
          </div>
        </Modal>
      )}

      {/* Modal caja EIRL */}
      {modalCaja&&(
        <Modal title="Movimiento Caja EIRL" onClose={()=>setModalCaja(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",gap:8}}>
              {["entrada","salida"].map(t=>(
                <button key={t} onClick={()=>ufc("tipo",t)} style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid "+(t===fc.tipo?(t==="entrada"?C.emerald:C.danger):C.border),background:t===fc.tipo?(t==="entrada"?C.emerald+"20":C.danger+"20"):C.surface,color:t===fc.tipo?(t==="entrada"?C.emerald:C.danger):C.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>
                  {t==="entrada"?"Entrada":"Salida"}
                </button>
              ))}
            </div>
            <div><label style={S.lbl2}>Fecha</label><input style={S.inp} type="date" value={fc.fecha} onChange={e=>ufc("fecha",e.target.value)}/></div>
            <div><label style={S.lbl2}>Concepto</label><input style={S.inp} value={fc.concepto} onChange={e=>ufc("concepto",e.target.value)} placeholder="Ej: Pago contabilidad, ingreso servicio..."/></div>
            <div><label style={S.lbl2}>Monto (S/)</label><input style={S.inp} type="number" value={fc.monto} onChange={e=>ufc("monto",e.target.value)} placeholder="0"/></div>
            <button style={{...S.btn(fc.tipo==="entrada"?C.emerald:C.danger),width:"100%",padding:"13px"}} onClick={guardarCaja}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── DEUDAS ────────────────────────────────────────────────────────────────────
function TabDeudas({userId,sesion,deudas,setDeudas}){
  const [modal,setModal]=useState(null);
  const [f,setF]=useState({nombre:"",entidad:"",tipo:"Prestamo personal",saldo:"",tasa:"",cuota:"",dias_atraso:0,estrategia:"Pagando puntual",nota:""});
  const uf=(k,v)=>setF(p=>({...p,[k]:v}));
  const total=deudas.reduce((a,d)=>a+d.saldo,0);

  const guardar=async()=>{
    const body={user_id:userId,nombre:f.nombre,entidad:f.entidad,tipo:f.tipo,saldo:+f.saldo,tasa:+f.tasa,cuota:+f.cuota,dias_atraso:+f.dias_atraso,estrategia:f.estrategia||"Pagando puntual",nota:f.nota};
    if(f.id){await sb.update("deudas",f.id,body,sesion.token);setDeudas(p=>p.map(d=>d.id===f.id?{...body,id:f.id}:d));}
    else{const data=await sb.insert("deudas",body,sesion.token);if(data&&data.id)setDeudas(p=>[...p,data]);}
    setModal(null);
  };
  const del=async(id)=>{await sb.delete("deudas",id,sesion.token);setDeudas(p=>p.filter(d=>d.id!==id));};
  const edit=(d)=>{setF({...d,saldo:d.saldo+"",tasa:(d.tasa||0)+"",cuota:(d.cuota||0)+"",dias_atraso:(d.dias_atraso||0)+"",estrategia:d.estrategia||"Pagando puntual"});setModal("edit");};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontWeight:900,fontSize:22,color:C.danger}}>{fmt(total)}</div><div style={{fontSize:11,color:C.muted}}>{deudas.length} deuda(s)</div></div>
        <button style={S.btn(C.accent)} onClick={()=>{setF({nombre:"",entidad:"",tipo:"Prestamo personal",saldo:"",tasa:"",cuota:"",dias_atraso:0,estrategia:"Pagando puntual",nota:""});setModal("new");}}>+ Agregar</button>
      </div>
      {deudas.map(d=>{
        const esP=d.tipo==="Deuda personal";
        const estrategia=d.estrategia||"Pagando puntual";
        const color=ESTRATEGIA_C[estrategia]||(esP?C.purple:C.accent);
        const sbsIdx=esP?0:sbsI(d.dias_atraso||0);
        const pct=total>0?(d.saldo/total)*100:0;
        return(
          <div key={d.id} style={{...S.card,borderLeft:"3px solid "+color}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div style={{flex:1,minWidth:0,paddingRight:10}}>
                <div style={{fontWeight:700,fontSize:14}}>{d.nombre}</div>
                <div style={{fontSize:11,color:C.muted}}>{d.entidad} · {d.tipo}</div>
                {d.nota&&<div style={{fontSize:11,color:C.soft,marginTop:3}}>{d.nota}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontWeight:900,fontSize:18,color:C.danger}}>{fmt(d.saldo)}</div>
                {d.tasa>0&&<div style={{fontSize:11,color:C.muted}}>TEA {d.tasa}%</div>}
              </div>
            </div>
            <div style={S.bar()}><div style={S.fill(pct,color)}/></div>
            <div style={{fontSize:10,color:C.muted,marginTop:3,marginBottom:8}}>{pct.toFixed(1)}% del total</div>
            {d.cuota>0&&<div style={{fontSize:11,marginBottom:8}}><span style={{color:C.muted}}>Cuota: </span><b>{fmt(d.cuota)}/mes</b></div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={S.tag(color)}>{estrategia}</span>
                {!esP&&<span style={S.tag(SBS_C[sbsIdx])}>SBS: {SBS_L[sbsIdx]}</span>}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button style={S.bsm(C.accent)} onClick={()=>edit(d)}>Editar</button>
                <button style={S.bsm(C.danger)} onClick={()=>del(d.id)}>x</button>
              </div>
            </div>
          </div>
        );
      })}
      {modal&&(
        <Modal title={modal==="new"?"Nueva deuda":"Editar deuda"} onClose={()=>setModal(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Nombre</label><input style={S.inp} value={f.nombre} onChange={e=>uf("nombre",e.target.value)} placeholder="Ej: Prestamo BCP"/></div>
            <div><label style={S.lbl2}>Entidad</label><input style={S.inp} value={f.entidad} onChange={e=>uf("entidad",e.target.value)}/></div>
            <div><label style={S.lbl2}>Tipo</label><select style={S.sel} value={f.tipo} onChange={e=>uf("tipo",e.target.value)}>{["Prestamo personal","Tarjeta credito","Prestamo PYME","Hipoteca","Deuda personal","Otro"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={S.lbl2}>Saldo (S/)</label><input style={S.inp} type="number" value={f.saldo} onChange={e=>uf("saldo",e.target.value)}/></div>
            <div><label style={S.lbl2}>TEA %</label><input style={S.inp} type="number" value={f.tasa} onChange={e=>uf("tasa",e.target.value)}/></div>
            <div><label style={S.lbl2}>Cuota mensual</label><input style={S.inp} type="number" value={f.cuota} onChange={e=>uf("cuota",e.target.value)}/></div>
            <div><label style={S.lbl2}>Dias de atraso</label><input style={S.inp} type="number" value={f.dias_atraso} onChange={e=>uf("dias_atraso",e.target.value)} min="0"/></div>
            <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Estrategia</label><select style={S.sel} value={f.estrategia} onChange={e=>uf("estrategia",e.target.value)}>{ESTRATEGIAS.map(e=><option key={e}>{e}</option>)}</select></div>
            <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Nota</label><input style={S.inp} value={f.nota} onChange={e=>uf("nota",e.target.value)} placeholder="Ej: Esperando negociacion..."/></div>
          </div>
          <button style={{...S.btn(C.accent),width:"100%",padding:"13px"}} onClick={guardar}>Guardar deuda</button>
        </Modal>
      )}
    </div>
  );
}

// ── POR COBRAR ────────────────────────────────────────────────────────────────
function TabCobrar({userId,sesion,cobrar,setCobrar,txns,setTxns}){
  const [modal,setModal]=useState(null);
  const [f,setF]=useState({deudor:"",concepto:"",monto:"",moneda:"PEN",abonado:0,fecha:today(),vencimiento:"",nota:"",estado:"pendiente",es_firu:false});
  const uf=(k,v)=>setF(p=>({...p,[k]:v}));

  const pendientes=cobrar.filter(c=>c.estado!=="cobrado");
  const total=pendientes.filter(c=>c.moneda!=="USD").reduce((a,c)=>a+(c.monto-(c.abonado||0)),0);
  const totalUSD=pendientes.filter(c=>c.moneda==="USD").reduce((a,c)=>a+(c.monto-(c.abonado||0)),0);

  const guardar=async()=>{
    const ab=+f.abonado,mn=+f.monto;
    const body={user_id:userId,deudor:f.deudor,concepto:f.concepto,monto:mn,moneda:f.moneda||"PEN",abonado:ab,estado:ab>=mn?"cobrado":ab>0?"parcial":"pendiente",fecha:f.fecha,vencimiento:f.vencimiento||null,nota:f.nota,es_firu:f.es_firu||false};
    if(f.id){await sb.update("cobrar",f.id,body,sesion.token);setCobrar(p=>p.map(c=>c.id===f.id?{...body,id:f.id}:c));}
    else{const data=await sb.insert("cobrar",body,sesion.token);if(data&&data.id)setCobrar(p=>[...p,data]);}
    setModal(null);
  };
  const del=async(id)=>{await sb.delete("cobrar",id,sesion.token);setCobrar(p=>p.filter(c=>c.id!==id));};
  const abonar=async(c)=>{
    const m=prompt("Cuanto abono "+c.deudor+"? ("+(c.moneda||"PEN")+")");
    if(!m||+m<=0)return;
    const nuevo=(c.abonado||0)+(+m);
    const estado=nuevo>=c.monto?"cobrado":"parcial";
    await sb.update("cobrar",c.id,{abonado:nuevo,estado},sesion.token);
    setCobrar(p=>p.map(x=>x.id===c.id?{...x,abonado:nuevo,estado}:x));
    // Si es soles, registrar como ingreso en movimientos
    if((c.moneda||"PEN")==="PEN"){
      const body={user_id:userId,tipo:"ingreso",cat:"Otro ingreso",monto:+m,descripcion:"Abono de "+c.deudor,fecha:today(),fuente:"Personal"};
      const saved=await sb.insert("transacciones",body,sesion.token);
      if(saved&&saved.id)setTxns(p=>[saved,...p]);
    }
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          {total>0&&<div style={{fontWeight:900,fontSize:20,color:C.emerald}}>{fmt(total)}</div>}
          {totalUSD>0&&<div style={{fontWeight:900,fontSize:20,color:C.gold}}>{fmtD(totalUSD)}</div>}
          <div style={{fontSize:11,color:C.muted}}>{pendientes.length} pendiente(s)</div>
        </div>
        <button style={S.btn(C.emerald)} onClick={()=>{setF({deudor:"",concepto:"",monto:"",moneda:"PEN",abonado:0,fecha:today(),vencimiento:"",nota:"",estado:"pendiente",es_firu:false});setModal("new");}}>+ Agregar</button>
      </div>

      {pendientes.length===0&&<div style={{textAlign:"center",padding:30,color:C.muted}}>Sin cuentas por cobrar pendientes</div>}

      {pendientes.map(c=>{
        const pend=c.monto-(c.abonado||0);
        const venc=c.vencimiento&&c.vencimiento<today();
        const esUSD=(c.moneda||"PEN")==="USD";
        const esFiru=c.es_firu||c.deudor==="Firu";
        const color=esFiru?C.gold:venc?C.danger:c.estado==="parcial"?C.warn:C.emerald;
        return(
          <div key={c.id} style={{...S.card,borderLeft:"3px solid "+color}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <div style={{fontWeight:700,fontSize:15}}>{c.deudor}</div>
                  {esFiru&&<span style={S.tag(C.gold)}>Bancaje</span>}
                  {esUSD&&<span style={S.tag(C.accent)}>USD</span>}
                </div>
                <div style={{fontSize:11,color:C.muted}}>{c.concepto} · desde {fmtF(c.fecha)}</div>
                {esFiru&&!c.vencimiento&&<div style={{fontSize:10,color:C.muted}}>Recuperacion variable · sin fecha limite</div>}
                {c.nota&&<div style={{fontSize:11,color:C.soft,marginTop:3}}>{c.nota}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontWeight:900,fontSize:18,color:esFiru?C.gold:C.emerald}}>{esUSD?fmtD(pend):fmt(pend)}</div>
                <div style={{fontSize:11,color:C.muted}}>de {esUSD?fmtD(c.monto):fmt(c.monto)}</div>
              </div>
            </div>
            {c.abonado>0&&(
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,color:C.muted}}>Recuperado: {esUSD?fmtD(c.abonado):fmt(c.abonado)}</span>
                  <span style={{fontSize:11,fontWeight:700}}>{c.monto>0?((c.abonado/c.monto)*100).toFixed(0):0}%</span>
                </div>
                <div style={S.bar()}><div style={S.fill(c.monto>0?(c.abonado/c.monto)*100:0,color)}/></div>
              </div>
            )}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={S.tag(color)}>{c.estado==="parcial"?"Parcial":"Pendiente"}</span>
              <button style={S.bsm(C.emerald)} onClick={()=>abonar(c)}>Registrar pago</button>
              <button style={S.bsm(C.accent)} onClick={()=>{setF({...c,monto:c.monto+"",abonado:(c.abonado||0)+"",es_firu:c.es_firu||false});setModal("edit");}}>Editar</button>
              <button style={S.bsm(C.danger)} onClick={()=>del(c.id)}>x</button>
            </div>
          </div>
        );
      })}

      {cobrar.filter(c=>c.estado==="cobrado").length>0&&(
        <div style={S.card}>
          <div style={S.lbl}>Ya cobrado</div>
          {cobrar.filter(c=>c.estado==="cobrado").map(c=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+C.border}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{c.deudor}</div><div style={{fontSize:10,color:C.muted}}>{c.concepto}</div></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontWeight:700,color:C.emerald}}>{(c.moneda||"PEN")==="USD"?fmtD(c.monto):fmt(c.monto)}</span>
                <button onClick={()=>del(c.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer"}}>x</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal&&(
        <Modal title={modal==="new"?"Nueva cuenta por cobrar":"Editar"} onClose={()=>setModal(null)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Quien te debe?</label><input style={S.inp} value={f.deudor} onChange={e=>uf("deudor",e.target.value)} placeholder="Nombre"/></div>
            <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Concepto</label><input style={S.inp} value={f.concepto} onChange={e=>uf("concepto",e.target.value)} placeholder="Prestamo, bancaje, servicio..."/></div>
            <div><label style={S.lbl2}>Monto</label><input style={S.inp} type="number" value={f.monto} onChange={e=>uf("monto",e.target.value)}/></div>
            <div><label style={S.lbl2}>Moneda</label><select style={S.sel} value={f.moneda} onChange={e=>uf("moneda",e.target.value)}><option value="PEN">Soles (S/)</option><option value="USD">Dolares ($)</option></select></div>
            <div><label style={S.lbl2}>Ya recupero</label><input style={S.inp} type="number" value={f.abonado} onChange={e=>uf("abonado",e.target.value)}/></div>
            <div><label style={S.lbl2}>Fecha inicio</label><input style={S.inp} type="date" value={f.fecha} onChange={e=>uf("fecha",e.target.value)}/></div>
            <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Nota</label><input style={S.inp} value={f.nota} onChange={e=>uf("nota",e.target.value)}/></div>
            <div style={{gridColumn:"span 2",display:"flex",alignItems:"center",gap:8}}>
              <input type="checkbox" id="esfiru" checked={f.es_firu} onChange={e=>uf("es_firu",e.target.checked)}/>
              <label htmlFor="esfiru" style={{fontSize:12,color:C.soft}}>Es Firu / Bancaje (inversion recuperable, sin fecha limite)</label>
            </div>
          </div>
          <button style={{...S.btn(C.emerald),width:"100%",padding:"13px"}} onClick={guardar}>Guardar</button>
        </Modal>
      )}
    </div>
  );
}

// ── MI PLAN ───────────────────────────────────────────────────────────────────
function TabPlan({perfil,deudas,extras,sesion,setExtras}){
  const [editExtra,setEditExtra]=useState(null);
  const [fe,setFe]=useState({mes:"",concepto:"",monto:""});

  const guardarExtra=async()=>{
    if(!fe.mes||!fe.concepto||!fe.monto)return;
    const body={concepto:fe.concepto,mes:fe.mes,monto:+fe.monto,accion:""};
    await sb.update("extraordinarios",editExtra,body,sesion.token);
    setExtras(p=>p.map(e=>e.id===editExtra?{...e,...body}:e));
    setEditExtra(null);
  };

  // Deduplicar extras por mes+concepto (por si hay duplicados en BD)
  const extrasUnicos=extras.filter((e,i,arr)=>arr.findIndex(x=>x.mes===e.mes&&x.concepto===e.concepto)===i);
  const proximos=extrasUnicos.filter(e=>e.mes>=curMes()).sort((a,b)=>a.mes.localeCompare(b.mes));

  return(
    <div>
      {/* Tu meta */}
      {perfil.meta&&(
        <div style={{...S.card,border:"1px solid "+C.gold+"30",background:"linear-gradient(135deg,"+C.gold+"08,"+C.card+")"}}>
          <div style={S.lbl}>Tu meta</div>
          <div style={{fontSize:14,color:C.soft,lineHeight:1.6,fontStyle:"italic"}}>"{perfil.meta}"</div>
        </div>
      )}

      {/* Calendario extraordinarios */}
      <div style={S.card}>
        <div style={S.lbl}>Calendario de ingresos extraordinarios</div>
        {proximos.length===0&&<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Sin extraordinarios proximos</div>}
        {proximos.map(e=>(
          <div key={e.id} style={{padding:"12px 0",borderBottom:"1px solid "+C.border}}>
            {editExtra===e.id?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={S.g2}>
                  <div><label style={S.lbl2}>Mes</label><input type="month" style={S.inp} value={fe.mes} onChange={ev=>setFe(p=>({...p,mes:ev.target.value}))}/></div>
                  <div><label style={S.lbl2}>Monto (S/)</label><input type="number" style={S.inp} value={fe.monto} onChange={ev=>setFe(p=>({...p,monto:ev.target.value}))}/></div>
                </div>
                <div><label style={S.lbl2}>Concepto</label><input style={S.inp} value={fe.concepto} onChange={ev=>setFe(p=>({...p,concepto:ev.target.value}))}/></div>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...S.btn(C.emerald),flex:2,padding:"9px"}} onClick={guardarExtra}>Guardar</button>
                  <button style={{...S.bsm(C.danger),flex:1,padding:"9px"}} onClick={()=>setEditExtra(null)}>Cancelar</button>
                </div>
              </div>
            ):(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{e.concepto}</div>
                  <div style={{fontSize:11,color:C.muted}}>{e.mes}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontWeight:900,color:C.gold,fontSize:16}}>{fmtK(e.monto)}</span>
                  <button style={S.bsm(C.accent)} onClick={()=>{setEditExtra(e.id);setFe({mes:e.mes,concepto:e.concepto,monto:e.monto+""});}}>Editar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estado de deudas */}
      <div style={S.card}>
        <div style={S.lbl}>Estado de deudas</div>
        {deudas.map(d=>{
          const estrategia=d.estrategia||"Pagando puntual";
          const color=ESTRATEGIA_C[estrategia]||C.accent;
          return(
            <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+C.border}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{d.nombre}</div>
                <span style={S.tag(color)}>{estrategia}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,color:C.danger}}>{fmt(d.saldo)}</div>
                {d.cuota>0&&<div style={{fontSize:10,color:C.muted}}>{fmt(d.cuota)}/mes</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App(){
  const [appState,setAppState]=useState("splash");
  const [sesion,setSesion]=useState(null);
  const [perfil,setPerfil]=useState({});
  const [deudas,setDeudas]=useState([]);
  const [txns,setTxns]=useState([]);
  const [cobrar,setCobrar]=useState([]);
  const [extras,setExtras]=useState([]);
  const [fuxionSemanas,setFuxionSemanas]=useState([]);
  const [cajaMovs,setCajaMovs]=useState([]);
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState(0);

  // Validar sesion al arrancar — nunca pantalla en blanco
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
      sb.select("caja_eirl","select=*&user_id=eq."+uid+"&order=fecha.desc",tok).then(d=>setCajaMovs(d||[])).catch(()=>setCajaMovs([])),
      sb.select("extraordinarios","select=*&user_id=eq."+uid+"&order=mes.asc",tok).then(async d=>{
        if(d&&d.length>0){setExtras(d);return;}
        const base=[
          {user_id:uid,mes:"2026-07",concepto:"Gratificacion SUNAT",monto:4500,accion:""},
          {user_id:uid,mes:"2026-11",concepto:"CTS SUNAT",monto:3000,accion:""},
          {user_id:uid,mes:"2026-12",concepto:"Gratificacion SUNAT",monto:4500,accion:""},
          {user_id:uid,mes:"2027-02",concepto:"Bono SUNAT",monto:9000,accion:""},
        ];
        const saved=await sb.insert("extraordinarios",base,tok);
        if(saved)setExtras(Array.isArray(saved)?saved:[saved]);
      }),
    ]).finally(()=>setLoading(false));
  },[sesion,appState]);

  const onLogin=(s)=>{setSesion(s);setAppState("ready");};
  const onLogout=()=>{setSesion(null);setPerfil({});setDeudas([]);setTxns([]);setCobrar([]);setExtras([]);setFuxionSemanas([]);setCajaMovs([]);setAppState("auth");};

  const totalDeuda=deudas.reduce((a,d)=>a+d.saldo,0);
  const totalCobrar=cobrar.filter(c=>c.estado!=="cobrado"&&(c.moneda||"PEN")==="PEN").reduce((a,c)=>a+(c.monto-(c.abonado||0)),0);
  const cajaAuto=(fuxionSemanas||[]).reduce((a,s)=>a+(s.ganancias_eirl||0),0);
  const cajaManualE=(cajaMovs||[]).filter(m=>m.tipo==="entrada").reduce((a,m)=>a+m.monto,0);
  const cajaManualS=(cajaMovs||[]).filter(m=>m.tipo==="salida").reduce((a,m)=>a+m.monto,0);
  const cajaEirl=cajaAuto+cajaManualE-cajaManualS;
  const TABS=["Inicio","Registrar","Fuxion","Deudas","Por Cobrar","Mi Plan"];
  const uid=sesion&&sesion.user.id;

  if(appState==="splash")return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <div style={{fontSize:28,fontWeight:900}}><span style={{color:C.accent}}>Finanzas</span><span style={{color:C.text}}>Libre</span></div>
      <div style={{width:36,height:36,border:"3px solid "+C.border,borderTop:"3px solid "+C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(appState==="auth")return <AuthScreen onLogin={onLogin}/>;

  return(
    <div style={S.app}>
      <div style={{background:C.surface,padding:"11px 16px",borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900,fontSize:16}}><span style={{color:C.accent}}>Finanzas</span><span style={{color:C.text}}>Libre</span></div>
            <div style={{fontSize:10,color:C.muted}}>{perfil.nombre||sesion.nombre}</div>
          </div>
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
        {tab===0&&<TabDashboard perfil={perfil} txns={txns} fuxionSemanas={fuxionSemanas} cajaEirl={cajaEirl}/>}
        {tab===1&&<TabRegistrar userId={uid} sesion={sesion} txns={txns} setTxns={setTxns} fuxionSemanas={fuxionSemanas}/>}
        {tab===2&&<TabFuxion userId={uid} sesion={sesion} fuxionSemanas={fuxionSemanas} setFuxionSemanas={setFuxionSemanas} cajaMovs={cajaMovs} setCajaMovs={setCajaMovs}/>}
        {tab===3&&<TabDeudas userId={uid} sesion={sesion} deudas={deudas} setDeudas={setDeudas}/>}
        {tab===4&&<TabCobrar userId={uid} sesion={sesion} cobrar={cobrar} setCobrar={setCobrar} txns={txns} setTxns={setTxns}/>}
        {tab===5&&<TabPlan perfil={perfil} deudas={deudas} extras={extras} sesion={sesion} setExtras={setExtras}/>}
      </div>
    </div>
  );
}
