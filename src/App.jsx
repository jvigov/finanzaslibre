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
async function callClaude(prompt, b64, mediaType) {
  const content = b64 ? [{type:"image",source:{type:"base64",media_type:mediaType||"image/jpeg",data:b64}},{type:"text",text:prompt}] : prompt;
  const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:500,messages:[{role:"user",content}]})});
  const d = await r.json();
  return d.content&&d.content[0]?d.content[0].text:"";
}
const fmt = (n) => "S/ "+Number(n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtK = (n) => { const a=Math.abs(n||0); if(a>=1e6) return "S/ "+(n/1e6).toFixed(1)+"M"; if(a>=1000) return "S/ "+(n/1000).toFixed(1)+"k"; return fmt(n); };
const fmtF = (f) => { if(!f) return ""; const s=f.split("T")[0]; const [,m,d]=s.split("-"); const ms=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]; return parseInt(d)+" "+ms[parseInt(m)-1]; };
const today = () => new Date().toISOString().split("T")[0];
const curMes = () => new Date().toISOString().slice(0,7);
const SBS_L = ["Normal","Prob. Potenciales","Deficiente","Dudoso","Perdida"];
const SBS_C = ["#22c55e","#eab308","#f97316","#ef4444","#dc2626"];
const sbsI = (d) => d<=7?0:d<=30?1:d<=60?2:d<=120?3:4;
const GASTOS_FIJOS = [
  {nombre:"Cuota Extracash Interbank",monto:2077,cat:"Deuda cuota"},
  {nombre:"Ruleteo Platinum (S/21k x 1.5%)",monto:315,cat:"Deuda cuota"},
  {nombre:"ChatGPT",monto:85,cat:"Suscripciones"},
  {nombre:"Claude",monto:85,cat:"Suscripciones"},
  {nombre:"Entel postpago",monto:80,cat:"Suscripciones"},
  {nombre:"Dentista",monto:200,cat:"Salud"},
  {nombre:"Contabilidad EIRL",monto:236,cat:"Negocio"},
  {nombre:"DirecTV Go",monto:83.9,cat:"Suscripciones"},
];
const TOTAL_FIJOS = GASTOS_FIJOS.reduce((a,g)=>a+g.monto,0);
const C = {bg:"#060c15",surface:"#0a1520",card:"#0e1c2c",card2:"#122030",border:"#172538",accent:"#0ea5e9",emerald:"#10b981",danger:"#f43f5e",warn:"#f59e0b",gold:"#fbbf24",purple:"#8b5cf6",text:"#e0eaf8",soft:"#7a9bb8",muted:"#3d5570"};
const S = {
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
  btn:(c)=>({background:c||C.accent,color:(c===C.emerald||c===C.accent||!c)?"#040a12":"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontWeight:700,cursor:"pointer",fontSize:13}),
  bsm:(c)=>({background:(c||C.accent)+"18",color:c||C.accent,border:"1px solid "+(c||C.accent)+"40",borderRadius:8,padding:"5px 12px",fontWeight:600,cursor:"pointer",fontSize:11}),
  inp:{width:"100%",background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,boxSizing:"border-box",outline:"none"},
  sel:{width:"100%",background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,outline:"none"},
  bar:(h)=>({background:C.border,borderRadius:99,height:h||6,overflow:"hidden"}),
  fill:(p,c,h)=>({width:Math.min(Math.max(p||0,0),100)+"%",height:h||6,background:c||C.accent,borderRadius:99,transition:"width .5s"}),
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
  const [seccion,setSeccion]=useState("chat");
  const [mensajes,setMensajes]=useState([]);
  const [input,setInput]=useState("");
  const [grabando,setGrabando]=useState(false);
  const [mediaRec,setMediaRec]=useState(null);
  const [analiz,setAnaliz]=useState(false);
  const [imgB64,setImgB64]=useState(null);
  const [imgPrev,setImgPrev]=useState(null);
  const [mes,setMes]=useState(curMes());
  const [guardado,setGuardado]=useState(false);
  const [mForm,setMForm]=useState({tipo:"gasto",cat:"Alimentacion",monto:"",descripcion:"",fecha:today(),fuente:"Personal"});
  const uf=(k,v)=>setMForm(p=>({...p,[k]:v}));
  const GC=["Alimentacion","Comida afuera","Compras casa","Taxi","Transporte","Salud","Educacion","Suscripciones","Entretenimiento","Ropa","Deuda cuota","Negocio","Otro"];
  const IC=["Sueldo","CTS","Gratificacion","Bono","Freelance","Negocio ventas","Multinivel cheque","Otro ingreso"];
  const FT=["Personal","EIRL","Familiar hermano","Familiar pareja","Familiar mama","Familiar papa","Otro"];

  const makePrompt=(txt)=>`Eres asistente de finanzas peruano. Hoy es ${today()}. Analiza: "${txt}". El usuario puede escribir informal, con errores, fechas relativas (ayer, el lunes, el 5 de mayo). Responde SOLO JSON sin markdown: {"tipo":"gasto","monto":38.5,"cat":"Taxi","descripcion":"taxi","fecha":"${today()}","fuente":"Personal","confianza":"alta"}. tipo: gasto o ingreso. cats gasto: Alimentacion,Comida afuera,Compras casa,Taxi,Transporte,Salud,Educacion,Suscripciones,Entretenimiento,Ropa,Deuda cuota,Negocio,Otro. cats ingreso: Sueldo,CTS,Gratificacion,Bono,Freelance,Negocio ventas,Multinivel cheque,Otro ingreso.`;

  const parseJSON=(txt)=>{const s=txt.indexOf("{"),e=txt.lastIndexOf("}");return JSON.parse(txt.slice(s,e+1));};

  const procesarTexto=async(texto)=>{
    if(!texto.trim())return;
    setMensajes(p=>[...p,{rol:"user",texto,id:Date.now()}]);
    setInput("");setAnaliz(true);
    try{
      const resp=await callClaude(makePrompt(texto));
      const data=parseJSON(resp.replace(/```json|```/g,"").trim());
      setMensajes(p=>[...p,{rol:"bot",data,id:Date.now()+1}]);
    }catch(e){setMensajes(p=>[...p,{rol:"bot",texto:"No entendi. Intenta: 'taxi 38 soles hoy' o 'almorce 22 ayer'",id:Date.now()+1}]);}
    setAnaliz(false);
  };

  const confirmarMsg=async(data,msgId)=>{
    const body={user_id:userId,tipo:data.tipo,cat:data.cat,monto:data.monto,descripcion:data.descripcion,fecha:data.fecha,fuente:data.fuente||"Personal"};
    const saved=await sb.insert("transacciones",body,sesion.token);
    if(saved&&saved.id){setTxns(p=>[saved,...p]);setMensajes(p=>p.map(m=>m.id===msgId?{...m,confirmado:true}:m));setGuardado(true);setTimeout(()=>setGuardado(false),2000);}
  };

  const iniciarGrabacion=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const chunks=[];
      const rec=new MediaRecorder(stream);
      rec.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data);};
      rec.onstop=()=>{
        stream.getTracks().forEach(t=>t.stop());
        const blob=new Blob(chunks,{type:"audio/webm"});
        const reader=new FileReader();
        reader.onload=async()=>{
          const b64=reader.result.split(",")[1];
          setMensajes(p=>[...p,{rol:"user",texto:"Audio enviado",id:Date.now()}]);
          setAnaliz(true);
          try{
            const prompt=`Hoy es ${today()}. Audio en espanol peruano sobre gasto o ingreso. Responde SOLO JSON: {"tipo":"gasto","monto":0,"cat":"Otro","descripcion":"descripcion","fecha":"${today()}","fuente":"Personal","confianza":"alta"}`;
            const resp=await callClaude(prompt,b64,"audio/webm");
            const data=parseJSON(resp.replace(/```json|```/g,"").trim());
            setMensajes(p=>[...p,{rol:"bot",data,id:Date.now()+1}]);
          }catch(e){setMensajes(p=>[...p,{rol:"bot",texto:"No pude procesar el audio. Intenta escribirlo.",id:Date.now()+1}]);}
          setAnaliz(false);
        };
        reader.readAsDataURL(blob);
      };
      rec.start();setMediaRec(rec);setGrabando(true);
    }catch(e){setMensajes(p=>[...p,{rol:"bot",texto:"No se pudo acceder al microfono.",id:Date.now()}]);}
  };
  const detenerGrabacion=()=>{if(mediaRec){mediaRec.stop();setMediaRec(null);}setGrabando(false);};

  const handleFoto=(e)=>{const file=e.target.files[0];if(!file)return;setImgPrev(URL.createObjectURL(file));const reader=new FileReader();reader.onload=()=>setImgB64(reader.result.split(",")[1]);reader.readAsDataURL(file);};

  const analizarFoto=async()=>{
    if(!imgB64)return;setAnaliz(true);
    try{
      const prompt=`Analiza este recibo. Hoy es ${today()}. Responde SOLO JSON: {"tipo":"gasto","monto":0,"cat":"Otro","descripcion":"descripcion","fecha":"${today()}","fuente":"Personal","confianza":"alta"}`;
      const resp=await callClaude(prompt,imgB64);
      const data=parseJSON(resp.replace(/```json|```/g,"").trim());
      setMensajes(p=>[...p,{rol:"user",texto:"Foto de recibo",id:Date.now()},{rol:"bot",data,id:Date.now()+1}]);
      setSeccion("chat");setImgB64(null);setImgPrev(null);
    }catch(e){alert("No pude leer el recibo.");}
    setAnaliz(false);
  };

  const guardarManual=async()=>{
    if(!mForm.monto)return;
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
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["chat","Chat / Voz"],["foto","Foto"],["manual","Manual"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSeccion(k)} style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid "+(seccion===k?C.accent:C.border),background:seccion===k?C.accent+"18":C.surface,color:seccion===k?C.accent:C.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {seccion==="chat"&&(
        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{minHeight:200,maxHeight:360,overflowY:"auto",marginBottom:10,display:"flex",flexDirection:"column",gap:10}}>
            {mensajes.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.muted}}><div style={{fontSize:13,marginBottom:6}}>Escribe o graba lo que gastaste o recibiste</div><div style={{fontSize:11}}>Ej: "taxi 38 soles hoy", "almorce 22 ayer", "me pagaron 3000"</div></div>}
            {mensajes.map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:m.rol==="user"?"flex-end":"flex-start"}}>
                {m.rol==="user"?(
                  <div style={{background:C.accent+"30",borderRadius:"16px 16px 4px 16px",padding:"10px 14px",maxWidth:"80%",fontSize:13}}>{m.texto}</div>
                ):m.data&&!m.confirmado?(
                  <div style={{background:C.card2,border:"1px solid "+C.border,borderRadius:"16px 16px 16px 4px",padding:14,maxWidth:"90%",width:"100%"}}>
                    <div style={{display:"flex",gap:10,marginBottom:10}}>
                      <div style={S.box(m.data.tipo==="ingreso"?C.emerald:C.danger)}><div style={S.bv(m.data.tipo==="ingreso"?C.emerald:C.danger,16)}>{fmt(m.data.monto)}</div><div style={S.bl}>{m.data.tipo}</div></div>
                      <div style={S.box(C.accent)}><div style={{fontWeight:700,color:C.accent,fontSize:13}}>{m.data.cat}</div><div style={S.bl}>{m.data.fecha}</div></div>
                    </div>
                    <div style={{fontSize:12,color:C.soft,marginBottom:10}}>{m.data.descripcion}</div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={{...S.btn(C.emerald),flex:2,padding:"9px",fontSize:12}} onClick={()=>confirmarMsg(m.data,m.id)}>Guardar</button>
                      <button style={{...S.btn(C.danger),flex:1,padding:"9px",fontSize:12}} onClick={()=>setMensajes(p=>p.filter(x=>x.id!==m.id))}>x</button>
                    </div>
                  </div>
                ):m.confirmado?(
                  <div style={{background:C.emerald+"20",border:"1px solid "+C.emerald+"40",borderRadius:"16px 16px 16px 4px",padding:"10px 14px",fontSize:12,color:C.emerald}}>Guardado: {fmt(m.data.monto)} en {m.data.cat}</div>
                ):(
                  <div style={{background:C.card2,borderRadius:"16px 16px 16px 4px",padding:"10px 14px",fontSize:13,color:C.soft,maxWidth:"80%"}}>{m.texto}</div>
                )}
              </div>
            ))}
            {analiz&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:C.card2,borderRadius:"16px 16px 16px 4px",padding:"10px 14px",fontSize:13,color:C.muted}}>Procesando...</div></div>}
          </div>
          {guardado&&<div style={{...S.alert(C.emerald),textAlign:"center",marginBottom:8,fontSize:12}}><b>Guardado</b></div>}
          <div style={{display:"flex",gap:8,alignItems:"flex-end",background:C.surface,borderRadius:14,border:"1px solid "+C.border,padding:"8px 10px"}}>
            <textarea style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:13,resize:"none",minHeight:36,maxHeight:100,lineHeight:1.5,fontFamily:"inherit"}} value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe aqui..." onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();procesarTexto(input);}}} rows={1}/>
            <button onClick={grabando?detenerGrabacion:iniciarGrabacion} style={{width:36,height:36,borderRadius:"50%",border:"none",background:grabando?C.danger:C.border,color:grabando?"#fff":C.soft,cursor:"pointer",fontSize:16,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{grabando?"⏹":"🎤"}</button>
            <button onClick={()=>procesarTexto(input)} disabled={!input.trim()||analiz} style={{width:36,height:36,borderRadius:"50%",border:"none",background:input.trim()?C.accent:C.border,color:input.trim()?"#040a12":C.muted,cursor:"pointer",fontSize:18,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
          </div>
          {grabando&&<div style={{textAlign:"center",fontSize:11,color:C.danger,marginTop:6}}>Grabando... toca el cuadrado para terminar</div>}
        </div>
      )}

      {seccion==="foto"&&(
        <div>
          <label style={{display:"block",border:"2px dashed "+C.border,borderRadius:14,padding:24,textAlign:"center",cursor:"pointer",background:C.surface,marginBottom:12}}>
            {imgPrev?<img src={imgPrev} style={{maxWidth:"100%",maxHeight:220,borderRadius:10,objectFit:"contain"}}/>:<div><div style={{fontSize:48,marginBottom:8}}>📷</div><div style={{color:C.soft,fontSize:13}}>Toca para subir foto del recibo</div></div>}
            <input type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{display:"none"}}/>
          </label>
          {imgB64&&<button style={{...S.btn(C.accent),width:"100%",padding:"13px",fontSize:14,opacity:analiz?0.7:1}} onClick={analizarFoto} disabled={analiz}>{analiz?"Analizando...":"Extraer datos con IA"}</button>}
        </div>
      )}

      {seccion==="manual"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {["gasto","ingreso"].map(t=><button key={t} onClick={()=>uf("tipo",t)} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid "+(t===mForm.tipo?(t==="gasto"?C.danger:C.emerald):C.border),background:t===mForm.tipo?(t==="gasto"?C.danger+"20":C.emerald+"20"):C.surface,color:t===mForm.tipo?(t==="gasto"?C.danger:C.emerald):C.muted,fontWeight:700,cursor:"pointer"}}>{t==="gasto"?"Gasto":"Ingreso"}</button>)}
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
      )}

      <div style={{marginTop:20}}>
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

function TabDashboard({perfil,deudas,txns,extras}){
  const mes=curMes();
  const ingMes=txns.filter(t=>t.tipo==="ingreso"&&t.fecha&&t.fecha.startsWith(mes)).reduce((a,t)=>a+t.monto,0);
  const gastVar=txns.filter(t=>t.tipo==="gasto"&&t.fecha&&t.fecha.startsWith(mes)).reduce((a,t)=>a+t.monto,0);
  const gastMes=TOTAL_FIJOS+gastVar;
  const totalDeuda=deudas.reduce((a,d)=>a+d.saldo,0);
  const cuotas=deudas.reduce((a,d)=>a+d.cuota,0);
  const ingBase=(perfil.sueldo_neto||0)+(perfil.ing_indep||0)+(perfil.fuxion||0)+(perfil.alquiler||0)+(perfil.dividendos||0)+(perfil.otros||0);
  const ingTotal=ingMes||ingBase;
  const margen=ingTotal-gastMes;
  const ratioDeuda=ingTotal>0?cuotas/ingTotal:0;
  const criticas=deudas.filter(d=>d.dias_atraso>120);
  const recientes=[...txns].sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).slice(0,5);
  const hoy=new Date().getDate(),diasMes=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
  const NIVELES=[{n:0,label:"En deficit",color:C.danger,desc:"Gastas mas de lo que ganas"},{n:1,label:"Sobreviviendo",color:"#f97316",desc:"Ingresos igual a gastos"},{n:2,label:"Con margen",color:C.warn,desc:"Tienes algo para ahorrar"},{n:3,label:"Atacando deudas",color:"#84cc16",desc:"Margen positivo, reduciendo deudas"},{n:4,label:"Sin deudas",color:C.emerald,desc:"Tu sueldo es completamente tuyo"},{n:5,label:"Ingresos pasivos 25%",color:C.accent,desc:"Empiezas a construir libertad"},{n:6,label:"Libertad financiera",color:C.purple,desc:"Ingresos pasivos cubren gastos"},{n:7,label:"Abundancia",color:C.gold,desc:"Ingresos pasivos mucho mas que gastos"}];
  const nAct=margen<0?0:totalDeuda>0&&margen>500?3:totalDeuda>0?2:4;
  const niv=NIVELES[nAct];
  return (
    <div>
      {criticas.map(d=><div key={d.id} style={S.alert(C.danger)}><div style={{fontWeight:800,marginBottom:3}}>Urgente: {d.nombre} - {d.dias_atraso} dias vencido</div><div style={{fontSize:12}}>SBS: Perdida. Negociar urgente.</div></div>)}
      <div style={{...S.card,background:"linear-gradient(135deg,"+niv.color+"15,"+C.card+")",border:"1px solid "+niv.color+"35"}}>
        <div style={S.lbl}>Nivel de libertad financiera</div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:niv.color+"28",border:"2px solid "+niv.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:22,color:niv.color}}>{nAct}</div>
          <div><div style={{fontWeight:800,fontSize:16,color:niv.color}}>{niv.label}</div><div style={{fontSize:12,color:C.soft}}>{niv.desc}</div></div>
          {nAct<7&&<div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontSize:10,color:C.muted}}>Siguiente</div><div style={{fontSize:11,fontWeight:600,color:NIVELES[nAct+1].color}}>{NIVELES[nAct+1].label}</div></div>}
        </div>
        <div style={S.bar(8)}><div style={S.fill((nAct/7)*100,niv.color,8)}/></div>
      </div>
      <div style={S.g2}>
        <div style={S.box(C.emerald)}><div style={S.bv(C.emerald)}>{fmtK(ingTotal)}</div><div style={S.bl}>Ingresos/mes</div></div>
        <div style={S.box(C.danger)}><div style={S.bv(C.danger)}>{fmtK(gastMes)}</div><div style={S.bl}>Gastos/mes</div></div>
        <div style={S.box(margen>=0?C.accent:C.danger)}><div style={S.bv(margen>=0?C.accent:C.danger)}>{fmtK(margen)}</div><div style={S.bl}>Margen</div></div>
        <div style={S.box(C.danger)}><div style={S.bv(C.danger)}>{fmtK(totalDeuda)}</div><div style={S.bl}>Deuda total</div></div>
      </div>
      <div style={S.card}>
        <div style={S.lbl}>Mayo - dia {hoy} de {diasMes}</div>
        <div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12}}>Cuotas / ingresos</span><span style={{fontWeight:700,color:ratioDeuda>0.4?C.danger:C.warn}}>{(ratioDeuda*100).toFixed(0)}% (meta: -30%)</span></div><div style={S.bar()}><div style={S.fill(ratioDeuda*100,ratioDeuda>0.4?C.danger:C.warn)}/></div></div>
        <div style={S.bar()}><div style={S.fill((hoy/diasMes)*100,C.accent)}/></div>
      </div>
      {extras.filter(e=>e.mes>=curMes()).length>0&&<div style={S.card}><div style={S.lbl}>Proximos extraordinarios</div>{extras.filter(e=>e.mes>=curMes()).slice(0,4).map(e=><div key={e.id} style={{padding:"9px 0",borderBottom:"1px solid "+C.border}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700}}>{e.mes}</span><span style={{fontWeight:900,color:C.gold}}>{fmt(e.monto)}</span></div><div style={{fontSize:11,color:C.muted}}>{e.concepto}{e.accion?" - "+e.accion:""}</div></div>)}</div>}
      {perfil.eirl>0&&<div style={{...S.card,border:"1px solid "+C.purple+"35"}}><div style={S.lbl}>Cuenta EIRL (protegida)</div><div style={{fontWeight:900,fontSize:22,color:C.purple}}>{fmt(perfil.eirl)}</div><div style={{fontSize:11,color:C.muted,marginTop:4}}>Capital de trabajo Fuxion. Aislada.</div></div>}
      {recientes.length>0&&<div style={S.card}><div style={S.lbl}>Ultimos movimientos</div>{recientes.map(t=><div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+C.border}}><div><div style={{fontSize:12,fontWeight:600}}>{t.descripcion||t.cat}</div><div style={{fontSize:10,color:C.muted}}><b style={{color:C.soft}}>{fmtF(t.fecha)}</b> - {t.cat}</div></div><span style={{fontWeight:700,color:t.tipo==="ingreso"?C.emerald:C.danger}}>{t.tipo==="ingreso"?"+":"-"}{fmt(t.monto)}</span></div>)}</div>}
      {perfil.meta&&<div style={{...S.card,border:"1px solid "+C.gold+"30"}}><div style={S.lbl}>Tu meta</div><div style={{fontSize:13,color:C.soft,fontStyle:"italic"}}>"{perfil.meta}"</div></div>}
    </div>
  );
}

function TabDeudas({userId,sesion,deudas,setDeudas}){
  const [modal,setModal]=useState(null);
  const [f,setF]=useState({nombre:"",entidad:"",tipo:"Prestamo personal",saldo:"",tasa:"",cuota:"",dias_atraso:0,vencimiento:"",nota:""});
  const uf=(k,v)=>setF(p=>({...p,[k]:v}));
  const total=deudas.reduce((a,d)=>a+d.saldo,0);
  const cuotas=deudas.reduce((a,d)=>a+d.cuota,0);
  const guardar=async()=>{
    const body={user_id:userId,nombre:f.nombre,entidad:f.entidad,tipo:f.tipo,saldo:+f.saldo,tasa:+f.tasa,cuota:+f.cuota,dias_atraso:+f.dias_atraso,nota:f.nota,vencimiento:f.vencimiento||null};
    if(f.id){await sb.update("deudas",f.id,body,sesion.token);setDeudas(p=>p.map(d=>d.id===f.id?{...body,id:f.id}:d));}
    else{const data=await sb.insert("deudas",body,sesion.token);if(data&&data.id)setDeudas(p=>[...p,data]);}
    setModal(null);
  };
  const del=async(id)=>{await sb.delete("deudas",id,sesion.token);setDeudas(p=>p.filter(d=>d.id!==id));};
  const edit=(d)=>{setF({...d,saldo:d.saldo+"",tasa:d.tasa+"",cuota:d.cuota+"",dias_atraso:d.dias_atraso+"",vencimiento:d.vencimiento||""});setModal("edit");};
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontWeight:900,fontSize:22,color:C.danger}}>{fmt(total)}</div><div style={{fontSize:11,color:C.muted}}>Cuotas: {fmt(cuotas)}/mes - {deudas.length} deudas</div></div>
        <button style={S.btn(C.accent)} onClick={()=>{setF({nombre:"",entidad:"",tipo:"Prestamo personal",saldo:"",tasa:"",cuota:"",dias_atraso:0,vencimiento:"",nota:""});setModal("new");}}>+ Agregar</button>
      </div>
      {deudas.map(d=>{
        const esP=d.tipo==="Deuda personal";const idx=esP?0:sbsI(d.dias_atraso);const color=esP?C.purple:SBS_C[idx];const pct=total>0?(d.saldo/total)*100:0;
        return (
          <div key={d.id} style={{...S.card,borderLeft:"3px solid "+color}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div style={{flex:1,minWidth:0,paddingRight:10}}><div style={{fontWeight:700,fontSize:14}}>{d.nombre}</div><div style={{fontSize:11,color:C.muted}}>{d.entidad} - {d.tipo}</div>{d.nota&&<div style={{fontSize:11,color:C.warn,marginTop:3}}>{d.nota}</div>}</div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:900,fontSize:18,color:C.danger}}>{fmt(d.saldo)}</div>{d.tasa>0&&<div style={{fontSize:11,color:C.muted}}>TEA {d.tasa}%</div>}</div>
            </div>
            <div style={S.bar()}><div style={S.fill(pct,color)}/></div>
            <div style={{fontSize:10,color:C.muted,marginTop:3,marginBottom:8}}>{pct.toFixed(1)}% del total</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
              {d.cuota>0&&<span style={{fontSize:11}}><span style={{color:C.muted}}>Cuota: </span><b>{fmt(d.cuota)}/mes</b></span>}
              {d.dias_atraso>0&&<span style={{fontSize:11}}><span style={{color:C.muted}}>Atraso: </span><b style={{color:C.danger}}>{d.dias_atraso}d</b></span>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {!esP?<span style={S.tag(color)}>SBS: {SBS_L[idx]}</span>:<span style={S.tag(C.purple)}>Personal</span>}
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
          <div style={{gridColumn:"span 2"}}><label style={S.lbl2}>Nota</label><input style={S.inp} value={f.nota} onChange={e=>uf("nota",e.target.value)}/></div>
        </div>
        {f.dias_atraso>0&&<div style={{...S.alert(SBS_C[sbsI(+f.dias_atraso)]),marginBottom:10}}>SBS: <b style={{color:SBS_C[sbsI(+f.dias_atraso)]}}>{SBS_L[sbsI(+f.dias_atraso)]}</b> - {f.dias_atraso} dias</div>}
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
  const cuotas=deudas.reduce((a,d)=>a+d.cuota,0);
  const ingBase=(perfil.sueldo_neto||0)+(perfil.ing_indep||0)+(perfil.fuxion||0)+(perfil.alquiler||0)+(perfil.dividendos||0)+(perfil.otros||0);
  const gastBase=TOTAL_FIJOS+(perfil.gastos_variables||1400);
  const margen=ingBase-gastBase;
  const numLib=gastBase*12*25;
  let s1=totalDeuda,m1=0;while(s1>100&&m1<360){m1++;s1=Math.max(s1*1.025-cuotas,0);}
  let s2=totalDeuda,m2=0;const ext=Math.max(margen*0.5,0);while(s2>100&&m2<360){m2++;s2=Math.max(s2*1.025-(cuotas+ext),0);}
  const FASES=[
    {n:1,tit:"Apagar incendios",sub:"Ahora",c:C.danger,activo:deudas.some(d=>d.dias_atraso>60),items:["Negociar deudas vencidas con plan de pago","Detener nuevas deudas","Usar CTS estrategicamente"]},
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
        {FASES.map((f,i)=>{const esA=i===faseActual,comp=faseActual>=0&&i<faseActual;return(
          <div key={f.n} style={{display:"flex",gap:14,marginBottom:18}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:comp?f.c:esA?f.c:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:(comp||esA)?(comp?"#fff":"#040a12"):C.muted,flexShrink:0}}>{comp?"v":f.n}</div>
              {i<FASES.length-1&&<div style={{width:2,flex:1,background:comp?f.c:C.border,minHeight:16,marginTop:4}}/>}
            </div>
            <div style={{flex:1,paddingBottom:6}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:5}}><span style={{fontWeight:800,color:esA?f.c:C.text,fontSize:13}}>{f.tit}</span>{esA&&<span style={S.tag(f.c)}>Aqui estas</span>}<span style={{fontSize:10,color:C.muted,marginLeft:"auto"}}>{f.sub}</span></div>
              {f.items.map((item,j)=><div key={j} style={{fontSize:11,color:C.soft,marginBottom:3}}>{esA?"->":"."} {item}</div>)}
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

export default function App(){
  const [sesion,setSesion]=useState(()=>{try{const s=localStorage.getItem("fl_sess");return s?JSON.parse(s):null;}catch{return null;}});
  const [perfil,setPerfil]=useState({});
  const [deudas,setDeudas]=useState([]);
  const [txns,setTxns]=useState([]);
  const [cobrar,setCobrar]=useState([]);
  const [extras,setExtras]=useState([]);
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState(0);

  useEffect(()=>{if(sesion)localStorage.setItem("fl_sess",JSON.stringify(sesion));else localStorage.removeItem("fl_sess");},[sesion]);

  useEffect(()=>{
    if(!sesion)return;
    const uid=sesion.user.id,tok=sesion.token;
    setLoading(true);
    Promise.all([
      sb.select("perfiles","select=*&id=eq."+uid,tok).then(d=>setPerfil(d[0]||{})),
      sb.select("deudas","select=*&user_id=eq."+uid,tok).then(d=>setDeudas(d||[])),
      sb.select("transacciones","select=*&user_id=eq."+uid+"&order=fecha.desc",tok).then(d=>setTxns(d||[])),
      sb.select("cobrar","select=*&user_id=eq."+uid,tok).then(d=>setCobrar(d||[])),
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
  },[sesion]);

  const onLogin=(s)=>{setSesion(s);};
  const onLogout=()=>{setSesion(null);setPerfil({});setDeudas([]);setTxns([]);setCobrar([]);setExtras([]);};
  const totalDeuda=deudas.reduce((a,d)=>a+d.saldo,0);
  const totalCobrar=cobrar.filter(c=>c.estado!=="cobrado").reduce((a,c)=>a+(c.monto-(c.abonado||0)),0);
  const TABS=["Inicio","Registrar","Deudas","Por Cobrar","Mi Plan"];
  const uid=sesion&&sesion.user.id;

  if(!sesion)return <AuthScreen onLogin={onLogin}/>;
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
        {tab===0&&<TabDashboard perfil={perfil} deudas={deudas} txns={txns} extras={extras}/>}
        {tab===1&&<TabRegistrar userId={uid} sesion={sesion} txns={txns} setTxns={setTxns}/>}
        {tab===2&&<TabDeudas userId={uid} sesion={sesion} deudas={deudas} setDeudas={setDeudas}/>}
        {tab===3&&<TabCobrar userId={uid} sesion={sesion} cobrar={cobrar} setCobrar={setCobrar}/>}
        {tab===4&&<TabPlan perfil={perfil} deudas={deudas} extras={extras}/>}
      </div>
    </div>
  );
}
