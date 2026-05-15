import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Modal, RefreshControl, Dimensions, Linking } from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const [vista, setVista] = useState('catalogo'); // 'catalogo' | 'admin' | 'registrar'
  const [carrito, setCarrito] = useState({});
  const [modalLogin, setModalLogin] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [usuario, setUsuario] = useState(null);
  
  const [pedidos, setPedidos] = useState([]);
  const [lideres, setLideres] = useState([]);
  
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [esAdminNuevo, setEsAdminNuevo] = useState(false);
  const [nuevoLiderAsignado, setNuevoLiderAsignado] = useState('');
  const [adminSeccion, setAdminSeccion] = useState('pedidos');
  const [adminLiderVer, setAdminLiderVer] = useState(null);
  const [manualesUrls, setManualesUrls] = useState({ saltador: '', caminante: '', escalador: '' });
  const [qrImagen, setQrImagen] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [niños, setNiños] = useState([]);
  const [ninoSeleccionado, setNinoSeleccionado] = useState(null);
  const [progresoManual, setProgresoManual] = useState({ saltador: false, caminante: false, escalador: false });
  const [nuevoNiño, setNuevoNiño] = useState({
    nombreNino: '',
    padre: '',
    direccion: '',
    telefono: '',
    fechaNacimiento: '',
    iglesia: '',
    traidoPor: '',
    trajoA: '',
    numeroMembresia: ''
  });
  const [productos, setProductos] = useState([
    { id: 'joya-roja', nombre: 'Joya Roja', disponible: true, image: require('./assets/joya-roja.png') },
    { id: 'joya-amarilla', nombre: 'Joya Amarilla', disponible: true, image: require('./assets/joya-amarilla.png') },
    { id: 'joya-azul', nombre: 'Joya Azul', disponible: true, image: require('./assets/joya-azul.png') },
    { id: 'joya-verde', nombre: 'Joya Verde', disponible: true, image: require('./assets/joya-verde.png') },
    { id: 'rango-saltador', nombre: 'Rango Saltador', disponible: true, image: require('./assets/rango-saltador.png') },
    { id: 'rango-caminante', nombre: 'Rango Caminante', disponible: true, image: require('./assets/rango-caminante.png') },
    { id: 'rango-escalador', nombre: 'Rango Escalador', disponible: true, image: require('./assets/rango-escalador.png') },
    { id: 'premio-saltador', nombre: 'Premio Saltador', disponible: true, image: require('./assets/premio-saltador.png') },
    { id: 'premio-caminante', nombre: 'Premio Caminante', disponible: true, image: require('./assets/premio-caminante.png') },
    { id: 'premio-escalador', nombre: 'Premio Escalador', disponible: true, image: require('./assets/premio-escalador.png') },
    { id: 'manualidad-saltador', nombre: 'Manual Saltador', disponible: true, image: require('./assets/manual-saltador.png') },
    { id: 'manualidad-caminante', nombre: 'Manual Caminante', disponible: true, image: require('./assets/manual-caminante.png') },
    { id: 'manualidad-escalador', nombre: 'Manual Escalador', disponible: true, image: require('./assets/manual-escalador.png') },
    { id: 'folleto', nombre: 'Folleto', disponible: true, image: require('./assets/folleto.png') },
    { id: 'polera', nombre: 'Chaleco', disponible: true, image: require('./assets/chaleco-nuevo.webp') },
    { id: 'chaleco', nombre: 'Polera', disponible: true, image: require('./assets/chaleco.webp') }
  ]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [editandoNiño, setEditandoNiño] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [nivelViendo, setNivelViendo] = useState(null); // 'saltador','caminante','escalador'
  const [editModeActivo, setEditModeActivo] = useState(false);
  const [calendarioVisible, setCalendarioVisible] = useState(false);
  const [calendarioMes, setCalendarioMes] = useState(new Date());
  const celdaPendiente = useRef(null);
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const vistasConRefresh = ['registrar', 'seleccionar-nivel', 'detalle-nino', 'editar-datos'];
    if (vistasConRefresh.includes(vista)) cargarDatos();

    if (vista !== 'registrar') return;
    cargarDatos();
    const interval = setInterval(() => cargarDatos(), 5000);
    return () => clearInterval(interval);
  }, [vista]);

  const cargarDatos = async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    try {
      const opts = { cache: 'no-store' };
      const [pedidosRes, lideresRes, manualesRes, qrRes, niñosRes, periodosRes] = await Promise.all([
        fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/pedidos', opts),
        fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/lideres', opts),
        fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/configuracion/manuales', opts),
        fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/configuracion/qr', opts),
        fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/ninos', opts),
        fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/configuracion/periodos', opts)
      ]);
      
      const pData = await pedidosRes.json();
      const lData = await lideresRes.json();
      const mData = manualesRes.ok ? await manualesRes.json() : {};
      const qrData = qrRes.ok ? await qrRes.json() : {};
      const niñosData = niñosRes.ok ? await niñosRes.json() : {};
      const periodosData = periodosRes.ok ? await periodosRes.json() : {};

      const mFields = mData.fields || {};
      setManualesUrls({
        saltador: mFields.saltador?.stringValue || '',
        caminante: mFields.caminante?.stringValue || '',
        escalador: mFields.escalador?.stringValue || ''
      });
      
      setQrImagen(qrData.fields?.url?.stringValue || '');
      setQrInput(qrData.fields?.url?.stringValue || '');

      const pFields = periodosData.fields || {};
      setPeriodos([
        { inicio: pFields.periodo1_inicio?.stringValue || '', fin: pFields.periodo1_fin?.stringValue || '', activo: pFields.periodo1_activo?.booleanValue || false },
        { inicio: pFields.periodo2_inicio?.stringValue || '', fin: pFields.periodo2_fin?.stringValue || '', activo: pFields.periodo2_activo?.booleanValue || false },
        { inicio: pFields.periodo3_inicio?.stringValue || '', fin: pFields.periodo3_fin?.stringValue || '', activo: pFields.periodo3_activo?.booleanValue || false },
        { inicio: pFields.periodo4_inicio?.stringValue || '', fin: pFields.periodo4_fin?.stringValue || '', activo: pFields.periodo4_activo?.booleanValue || false }
      ]);
      
      const pedidosOrdenados = (pData.documents || []).sort((a, b) => {
        const dateA = new Date(a.fields?.fecha?.timestampValue || 0);
        const dateB = new Date(b.fields?.fecha?.timestampValue || 0);
        return dateB - dateA;
      });
      
      const lideresDocs = lData.documents || [];
      
      setPedidos(pedidosOrdenados);
      setLideres(lideresDocs);
      
      const niñosDocs = niñosData.documents || [];
      setNiños(niñosDocs);
      
      const guard = localStorage.getItem('oansa_user');
      if (guard) {
        if (guard === '2580') {
           setUsuario({ codigo: '2580', nombre: 'Admin', admin: true });
        } else {
           const found = lideresDocs.find(l => {
              const parts = l.name.split('/');
              const id = parts[parts.length - 1];
              return id === guard || l.fields?.codigo?.stringValue === guard;
           });
           if (found) {
              setUsuario({
                  codigo: guard,
                  nombre: found.fields?.nombre?.stringValue || 'Líder',
                  admin: found.fields?.admin?.booleanValue || false,
                  liderAsignado: found.fields?.liderAsignado?.stringValue || ''
              });
           } else if (guard === '4321') {
             setUsuario({ codigo: '4321', nombre: 'Josue Guzman', admin: false });
           }
        }
      }
      
      const cart = localStorage.getItem('oansa_cart');
      if (cart) setCarrito(JSON.parse(cart));
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setCargando(false);
      if (esRefresh) setRefrescando(false);
    }
  };

  const login = () => {
    if (!codigo.trim()) return;
    const code = codigo.trim().toLowerCase();
    
    let valid = false;
    let isAdmin = false;
    let nombreLider = '';
    
    if (code === '2580') {
      valid = true; isAdmin = true; nombreLider = 'Admin';
    } else {
      const found = lideres.find(l => {
         const parts = l.name.split('/');
         const id = parts[parts.length - 1];
         return id === code || l.fields?.codigo?.stringValue === code;
      });
      if (found) {
        valid = true;
        isAdmin = found.fields?.admin?.booleanValue || false;
        nombreLider = found.fields?.nombre?.stringValue || 'Líder';
      } else if (code === '4321') {
        valid = true; isAdmin = false; nombreLider = 'Josue Guzman';
      }
    }
    
    if (valid) {
      setUsuario({ codigo: code, nombre: nombreLider, admin: isAdmin });
      localStorage.setItem('oansa_user', code);
      setModalLogin(false);
      setCodigo('');
      if (isAdmin) setVista('admin');
    } else {
      Alert.alert('Error', 'Código incorrecto o no registrado');
    }
  };

  const logout = () => {
    localStorage.removeItem('oansa_user');
    setUsuario(null);
    setVista('catalogo');
  };

  const agregar = (id) => {
    const nuevo = { ...carrito, [id]: (carrito[id] || 0) + 1 };
    setCarrito(nuevo);
    localStorage.setItem('oansa_cart', JSON.stringify(nuevo));
  };

  const quitar = (id) => {
    if (!carrito[id]) return;
    const nuevo = { ...carrito };
    if (nuevo[id] === 1) delete nuevo[id];
    else nuevo[id]--;
    setCarrito(nuevo);
    localStorage.setItem('oansa_cart', JSON.stringify(nuevo));
  };

  const getTotal = () => Object.values(carrito).reduce((a, b) => a + b, 0);

  const enviarPedido = async () => {
    if (getTotal() === 0) return;
    if (!usuario) {
      setModalLogin(true);
      return;
    }
    
    try {
      const pedidoId = 'pedido_' + Date.now();
      const itemsArray = Object.entries(carrito).map(([id, cant]) => ({
        mapValue: { fields: { productoId: { stringValue: id }, cantidad: { integerValue: cant } } }
      }));
      
      await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            lider: { stringValue: usuario.codigo },
            nombreLider: { stringValue: usuario.nombre },
            items: { arrayValue: { values: itemsArray } },
            fecha: { timestampValue: new Date().toISOString() },
            estado: { stringValue: 'pendiente' }
          }
        })
      });
      
      setCarrito({});
      localStorage.setItem('oansa_cart', '{}');
      Alert.alert('Éxito', 'Pedido guardado correctamente.');
      cargarDatos();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el pedido.');
    }
  };

  const crearLider = async () => {
    if (!nuevoNombre) return;
    
    let codeId;
    let existe = true;
    while (existe) {
      codeId = Math.floor(1000 + Math.random() * 9000).toString();
      existe = lideres.some(l => {
        const parts = l.name.split('/');
        const id = parts[parts.length - 1];
        return id === codeId || l.fields?.codigo?.stringValue === codeId;
      });
    }
    
    try {
      await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/lideres/${codeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            codigo: { stringValue: codeId },
            nombre: { stringValue: nuevoNombre },
            admin: { booleanValue: esAdminNuevo },
            liderAsignado: { stringValue: nuevoLiderAsignado }
          }
        })
      });
      Alert.alert('Completado', `Líder añadido con éxito. Código: ${codeId}`);
      setNuevoCodigo('');
      setNuevoNombre('');
      setEsAdminNuevo(false);
      setNuevoLiderAsignado('');
      cargarDatos();
    } catch (e) {
      Alert.alert('Error', 'No se pudo añadir al líder.');
    }
  };

  const eliminarLider = async (idDocumento) => {
    if (window.confirm && !window.confirm("¿Estás seguro de que deseas eliminar este líder?")) return;
    
    try {
      const parts = idDocumento.split('/');
      const id = parts[parts.length - 1];
      await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/lideres/${id}`, {
        method: 'DELETE'
      });
      cargarDatos();
    } catch(e) {
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  const guardarManuales = async () => {
    try {
      await fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/configuracion/manuales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            saltador: { stringValue: manualesUrls.saltador },
            caminante: { stringValue: manualesUrls.caminante },
            escalador: { stringValue: manualesUrls.escalador }
          }
        })
      });
      Alert.alert('Éxito', 'Enlaces de manuales guardados.');
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar los enlaces.');
    }
  };

  const guardarQr = async (url) => {
    if (!url) return;
    try {
      await fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/configuracion/qr', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: { url: { stringValue: url } }
        })
      });
      setQrImagen(url);
      Alert.alert('Éxito', 'QR guardado.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el QR.');
    }
  };

  const toggleProducto = async (id) => {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    const nuevoEstado = !prod.disponible;
    setProductos(productos.map(p => p.id === id ? { ...p, disponible: nuevoEstado } : p));
    try {
      await fetch('https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/configuracion/productos/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: { disponible: { booleanValue: nuevoEstado } }
        })
      });
    } catch (e) {}
  };

  const codigosLider = (() => {
    const codes = new Set();
    if (usuario?.codigo) codes.add(usuario.codigo);
    if (usuario?.liderAsignado) codes.add(usuario.liderAsignado);
    lideres.forEach(l => {
      const lCodigo = l.fields?.codigo?.stringValue;
      const lAsignado = l.fields?.liderAsignado?.stringValue;
      if (lAsignado === usuario?.codigo && lCodigo) codes.add(lCodigo);
    });
    return [...codes];
  })();

  const filtrarNiños = (nino) => codigosLider.includes(nino.fields?.lider?.stringValue || '');

  const registrarNiño = async (datos, liderCodigo) => {
    if (!datos.nombreNino) {
      window.alert('El nombre del niño es obligatorio');
      return;
    }
    setRegistrando(true);
    const niñoId = 'nino_' + Date.now();
    try {
      const body = {
        fields: {
          nombreNino: { stringValue: datos.nombreNino },
          padre: { stringValue: datos.padre || '' },
          direccion: { stringValue: datos.direccion || '' },
          telefono: { stringValue: datos.telefono || '' },
          fechaNacimiento: { stringValue: datos.fechaNacimiento || '' },
          iglesia: { stringValue: datos.iglesia || '' },
          traidoPor: { stringValue: datos.traidoPor || '' },
          trajoA: { stringValue: datos.trajoA || '' },
          numeroMembresia: { stringValue: datos.numeroMembresia || '' },
          lider: { stringValue: liderCodigo },
          fechaRegistro: { timestampValue: new Date().toISOString() }
        }
      };
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/ninos/${niñoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        window.alert('Error al registrar: ' + res.status);
        setRegistrando(false);
        return;
      }
      window.alert('Niño registrado correctamente.');
      setNuevoNiño({
        nombreNino: '', padre: '', direccion: '', telefono: '',
        fechaNacimiento: '', iglesia: '', traidoPor: '', trajoA: '', numeroMembresia: ''
      });
      setRegistrando(false);
      cargarDatos();
    } catch (e) {
      window.alert('Error: ' + e.message);
      setRegistrando(false);
    }
  };

  const eliminarNiño = async (ninoDoc) => {
    if (!window.confirm('¿Estás seguro de eliminar este niño?')) return;
    const parts = ninoDoc.name.split('/');
    const id = parts[parts.length - 1];
    try {
      await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/ninos/${id}`, {
        method: 'DELETE'
      });
      cargarDatos();
    } catch (e) {
      window.alert('Error al eliminar');
    }
  };

  const guardarEdicion = async () => {
    const nombre = editandoNiño?.nombreNino?.stringValue;
    if (!nombre) {
      window.alert('El nombre del niño es obligatorio');
      return;
    }
    const parts = ninoSeleccionado.name.split('/');
    const id = parts[parts.length - 1];
    const campos = ['nombreNino', 'padre', 'direccion', 'telefono', 'fechaNacimiento', 'iglesia', 'traidoPor', 'trajoA', 'numeroMembresia', 'lider'];
    const fields = {};
    campos.forEach(c => {
      fields[c] = { stringValue: (editandoNiño[c]?.stringValue || '') };
    });
    try {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/ninos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      if (!res.ok) {
        window.alert('Error al guardar: ' + res.status);
        return;
      }
      window.alert('Datos guardados correctamente.');
      await cargarDatos();
      setNivelViendo(null);
      setNinoSeleccionado(null);
      setEditandoNiño(null);
      setVista('registrar');
    } catch (e) {
      window.alert('Error: ' + e.message);
    }
  };

  const abrirVistaImpresion = (fields) => {
    const p = (k) => { try { return JSON.parse(fields[k]?.stringValue || '{}'); } catch(e) { return {}; } };
    const sd = p('saltador_json'), cd = p('caminante_json'), ed = p('escalador_json');
    let ad = {club:{},iglesia:{}};
    try { ad = JSON.parse(fields.asistencia_json?.stringValue || '{}'); } catch(e) {}
    const premiosDefaults = {
      saltador: { manual:'', uniforme:'', credito_extra:'', rango:'', ejercicios_biblicos:['','','',''], actividades:['','','',''], asistencia_club:['','','',''], asistencia_iglesia:['',''], premio_manual_saltador:'' },
      caminante: { manual:'', uniforme:'', credito_extra:'', rango:'', ejercicios_biblicos:['','','',''], actividades:['','','',''], asistencia_club:['','','',''], joyas_azules:['',''], premio_manual_caminante:'' },
      escalador: { manual:'', uniforme:'', credito_extra:'', rango:'', ejercicios_biblicos:['','','',''], actividades:['','','',''], asistencia_club:['','','',''], asistencia_iglesia:['',''], premio_manual_escalador:'' }
    };
    const meses = ['febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre'];
    const cs = (s) => s||'';
    const cbox = (v) => `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:20px;border:1px solid #999;font-size:9px;margin:1px">${cs(v)}</span>`;
    const cbox8 = (v) => `<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:20px;border:1px solid #999;font-size:9px;margin:1px">${cs(v)}</span>`;
    const celdas = (n) => Array.from({length:n}, (_,i)=>cbox('')).join('');
    const joyasRows = (arr, rows) => {
      const a = arr||[];
      let i = 0;
      return rows.map(r => {
        const cells = Array.from({length: r}, (_, ci) => a[i] !== undefined && a[i] !== '' ? cbox(a[i++]) : (a[i]!==undefined ? (i++,cbox('')) : cbox('')));
        return `<div style="display:flex;gap:1px;margin:1px 0">${cells.join('')}</div>`;
      }).join('');
    };
    const nivHTML = (titulo, data, k) => {
      const rMap = {saltador:[4,4,9,6],caminante:[6,5,10,8],escalador:[8,7,7,7]};
      const vgSizes = {saltador:{g1:1,g2:2,g3:4,g4:2},caminante:{g1:2,g2:3,g3:5,g4:4},escalador:{g1:3,g2:4,g3:6,g4:1}};
      const rows = rMap[k]||[];
      const vg = vgSizes[k]||{};
      const ac = (m) => { const v=ad?.club?.[m]||['','','','','']; return v.map(x => `<td style="border:1px solid #bbb;padding:2px;text-align:center;font-size:9px;width:18px;height:16px">${cs(x)}</td>`).join(''); };
      const ai = (m) => { const v=ad?.iglesia?.[m]||['','','','','']; return v.map(x => `<td style="border:1px solid #bbb;padding:2px;text-align:center;font-size:9px;width:18px;height:16px">${cs(x)}</td>`).join(''); };
      const fi = data?.folleto_inicio||[];
      const ra = data?.rango||[];
      const jr = data?.joyas_rojas;
      const jv = data?.joyas_verdes;
      const pr = { ...premiosDefaults[k], ...(data?.premios || {}) };
      const pc = data?.premio_chispita;
      const rangoH = `<div style="display:flex;gap:1px;margin-top:2px">${Array.from({length:6},(_,i)=>cbox(ra[i]||'')).join('')}</div>`;
      let folletoH = '';
      if (k==='saltador') folletoH = `<div style="margin:3px 0"><span style="font-size:9px;font-weight:600">Folleto Inicio</span> <span style="display:flex;gap:1px;margin-top:2px">${Array.from({length:6},(_,i)=>cbox(fi[i]||'')).join('')}</span></div>`;
      const joyasVH = ['g1','g2','g3','g4'].map(gk => {
        const size = vg[gk]||0;
        const g = jv?.[gk]||[];
        return `<div style="display:flex;gap:1px;margin:1px 0">${Array.from({length:size},(_,i)=>cbox(g[i]||'')).join('')}</div>`;
      }).join('');
      const premiosLabels = {manual:'Manual',uniforme:'Uniforme',credito_extra:'Crédito Extra',rango:'Rango',ejercicios_biblicos:'Ej. Bíblicos',actividades:'Actividades',asistencia_club:'Asist. Club',asistencia_iglesia:'Asist. Iglesia',joyas_azules:'Joyas Azules',premio_manual_saltador:'Premio Manual',premio_manual_caminante:'Premio Manual',premio_manual_escalador:'Premio Manual'};
      let ph = '';
      for (const [lk,ll] of Object.entries(premiosLabels)) {
        const v = pr[lk];
        if (v===undefined) continue;
        ph += `<div style="display:flex;align-items:center;gap:2px;margin:2px 0"><span style="font-size:9px;min-width:70px">${ll}:</span>${Array.isArray(v)?v.map(x=>cbox(x)).join(''):cbox8(v)}</div>`;
      }
      const premiosH = `<div style="background:#FDE047;padding:6px 8px;border:1px solid #EAB308;margin-top:6px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:4px">PREMIO</div>${ph}</div>`;
      return `
      <div style="page-break-inside:avoid;margin-bottom:8px">
        <table style="border-collapse:collapse;width:100%">
          <tr><td colspan="2" style="background:#000;color:#fff;padding:5px 10px;font-size:13px;font-weight:700;letter-spacing:2px">${titulo}</td></tr>
          <tr>
            <td style="vertical-align:top;padding:6px 8px;width:62%;border:1px solid #ddd">
              <div style="display:flex;gap:12px;margin-bottom:4px;font-size:10px"><strong>Año:</strong> ${data?.año||''} <strong>M:</strong> ${data?.m?'✓':'□'} <strong>F:</strong> ${data?.f?'✓':'□'}</div>
              ${folletoH}
              <div style="margin:3px 0"><span style="font-size:9px;font-weight:600">Rango</span> ${rangoH}</div>
              <div style="margin:4px 0"><span style="font-size:9px;font-weight:600">Joyas Rojas</span> ${joyasRows(jr, rows)}</div>
              <div style="margin:4px 0"><span style="font-size:9px;font-weight:600">Joyas Verdes</span> ${joyasVH}</div>
              ${premiosH}
            </td>
            <td style="vertical-align:top;padding:4px;width:38%;background:#f5f5f5;border:1px solid #ddd">
              <div style="font-size:9px;font-weight:700;text-align:center;margin-bottom:4px">ASISTENCIA AL CLUB</div>
              <table style="border-collapse:collapse;width:100%">${meses.map(m => `<tr><td style="border:1px solid #bbb;padding:1px 3px;font-size:8px">${m.slice(0,3)}</td>${ac(m)}</tr>`).join('')}</table>
              <div style="font-size:9px;font-weight:700;text-align:center;margin:6px 0 4px">ASISTENCIA A LA IGLESIA</div>
              <table style="border-collapse:collapse;width:100%">${meses.map(m => `<tr><td style="border:1px solid #bbb;padding:1px 3px;font-size:8px">${m.slice(0,3)}</td>${ai(m)}</tr>`).join('')}</table>
              ${k==='escalador' ? `<div style="margin-top:8px;padding:6px;background:#FDE047;border:1px solid #EAB308;text-align:center"><span style="font-size:9px;font-weight:700">PREMIO CHISPITA</span><br>${cbox8(pc||'')}</div>` : ''}
            </td>
          </tr>
        </table>
      </div>`;
    };
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Registro - ${fields.nombreNino?.stringValue||'Niño'}</title>
    <style>
      @page{margin:0.8cm;size:letter}
      body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:0}
      table{border-collapse:collapse}
    </style></head><body>
    <table style="width:100%;margin-bottom:10px"><tr>
      <td style="width:50px"><img src="https://ipdea.org/img/chispitas.png" style="height:45px"></td>
      <td style="text-align:center;font-size:16px;font-weight:700;letter-spacing:3px">REGISTRO DE NIÑO</td>
      <td style="width:50px;text-align:right"><span style="font-size:9px;color:#999">OANSA</span></td>
    </tr></table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:10px;border:1px solid #ccc">
      <tr><td style="padding:2px 6px;font-size:9px;color:#666">Nombre</td><td style="padding:2px 6px;font-size:11px;font-weight:600;border-right:1px solid #ccc">${fields.nombreNino?.stringValue||''}</td><td style="padding:2px 6px;font-size:9px;color:#666">Fecha Nac.</td><td style="padding:2px 6px;font-size:11px;font-weight:600">${fields.fechaNacimiento?.stringValue||''}</td></tr>
      <tr><td style="padding:2px 6px;font-size:9px;color:#666;border-top:1px solid #ddd">Dirección</td><td style="padding:2px 6px;font-size:11px;font-weight:600;border-right:1px solid #ccc;border-top:1px solid #ddd">${fields.direccion?.stringValue||''}</td><td style="padding:2px 6px;font-size:9px;color:#666;border-top:1px solid #ddd">Teléfono</td><td style="padding:2px 6px;font-size:11px;font-weight:600;border-top:1px solid #ddd">${fields.telefono?.stringValue||''}</td></tr>
      <tr><td style="padding:2px 6px;font-size:9px;color:#666;border-top:1px solid #ddd">Iglesia</td><td style="padding:2px 6px;font-size:11px;font-weight:600;border-right:1px solid #ccc;border-top:1px solid #ddd">${fields.iglesia?.stringValue||''}</td><td style="padding:2px 6px;font-size:9px;color:#666;border-top:1px solid #ddd">Traído por</td><td style="padding:2px 6px;font-size:11px;font-weight:600;border-top:1px solid #ddd">${fields.traidoPor?.stringValue||''}</td></tr>
      <tr><td style="padding:2px 6px;font-size:9px;color:#666;border-top:1px solid #ddd">Trajo a</td><td style="padding:2px 6px;font-size:11px;font-weight:600;border-right:1px solid #ccc;border-top:1px solid #ddd">${fields.trajoA?.stringValue||''}</td><td style="padding:2px 6px;font-size:9px;color:#666;border-top:1px solid #ddd">N° Membresía</td><td style="padding:2px 6px;font-size:11px;font-weight:600;border-top:1px solid #ddd">${fields.numeroMembresia?.stringValue||''}</td></tr>
    </table>
    ${nivHTML('SALTADOR', sd, 'saltador')}
    ${nivHTML('CAMINANTE', cd, 'caminante')}
    <div style="page-break-before:always"></div>
    ${nivHTML('ESCALADOR', ed, 'escalador')}
    <div style="text-align:center;margin-top:6px;font-size:8px;color:#aaa">CHISPAS - Oansa</div>
    <script>window.onload=function(){window.print();};</script>
    </body></html>`;
    const w = window.open('','_blank');
    w.document.write(html);
    w.document.close();
  };

  const getNombre = (id) => {
    const nombres = {
      'joya-roja': 'Joya Roja',
      'joya-amarilla': 'Joya Amarilla',
      'joya-azul': 'Joya Azul',
      'joya-verde': 'Joya Verde',
      'rango-saltador': 'Rango Saltador',
      'rango-caminante': 'Rango Caminante',
      'rango-escalador': 'Rango Escalador',
      'premio-saltador': 'Premio Saltador',
      'premio-caminante': 'Premio Caminante',
      'premio-escalador': 'Premio Escalador',
      'manualidad-saltador': 'Manual Saltador',
      'manualidad-caminante': 'Manual Caminante',
      'manualidad-escalador': 'Manual Escalador',
      'folleto': 'Folleto',
      'polera': 'Chaleco',
      'chaleco': 'Polera'
    };
    return nombres[id] || id;
  };

  // VISTA ADMIN
  if (vista === 'admin' && usuario?.admin) {
    return (
      <View style={admin.contenedor}>
        <View style={admin.encabezado}>
          <Text style={admin.titulo}>Admin</Text>
          <View style={{flexDirection: 'row', gap: 15}}>
            <TouchableOpacity onPress={() => setVista('catalogo')}><Text style={admin.linkTexto}>Tienda</Text></TouchableOpacity>
            <TouchableOpacity onPress={logout}><Text style={admin.linkTexto}>Salir</Text></TouchableOpacity>
          </View>
        </View>

        <View style={admin.tabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[admin.tab, adminSeccion === 'pedidos' && admin.tabActivo]} onPress={() => setAdminSeccion('pedidos')}>
              <Text style={[admin.tabTexto, adminSeccion === 'pedidos' && admin.tabTextoActivo]}>Pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[admin.tab, adminSeccion === 'lideres' && admin.tabActivo]} onPress={() => setAdminSeccion('lideres')}>
              <Text style={[admin.tabTexto, adminSeccion === 'lideres' && admin.tabTextoActivo]}>Líderes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[admin.tab, adminSeccion === 'productos' && admin.tabActivo]} onPress={() => setAdminSeccion('productos')}>
              <Text style={[admin.tabTexto, adminSeccion === 'productos' && admin.tabTextoActivo]}>Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[admin.tab, adminSeccion === 'registros' && admin.tabActivo]} onPress={() => setAdminSeccion('registros')}>
              <Text style={[admin.tabTexto, adminSeccion === 'registros' && admin.tabTextoActivo]}>Registros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <ScrollView style={admin.lista} refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargarDatos(true)} colors={['#000']} />}>
          {adminSeccion === 'pedidos' && (
            <View style={admin.seccion}>
              {pedidos.length === 0 ? <Text style={admin.vacio}>Sin pedidos</Text> : 
                pedidos.map((p) => {
                  const fields = p.fields || {};
                  const items = fields.items?.arrayValue?.values || [];
                  const estado = fields.estado?.stringValue || 'pendiente';
                  return (
                    <View key={p.name} style={admin.tarjeta}>
                      <View style={admin.tarjetaHeader}>
                        <Text style={admin.tarjetaTitulo}>{fields.nombreLider?.stringValue || 'Desconocido'}</Text>
                        <Text style={admin.tarjetaEstado}>{estado.toUpperCase()}</Text>
                      </View>
                      <Text style={admin.tarjetaFecha}>{fields.fecha?.timestampValue ? new Date(fields.fecha.timestampValue).toLocaleString() : ''}</Text>
                      {items.length > 0 && (
                        <View style={admin.tarjetaItems}>
                          {items.map((i, idx) => (
                            <Text key={idx} style={admin.itemLinea}>
                              <Text style={{fontWeight: '600'}}>{i.mapValue?.fields?.cantidad?.integerValue}x </Text>
                              {getNombre(i.mapValue?.fields?.productoId?.stringValue)}
                            </Text>
                          ))}
                        </View>
                      )}
                      {estado === 'pendiente' && (
                        <TouchableOpacity 
                          style={{backgroundColor: '#10B981', padding: 10, alignItems: 'center', marginTop: 10}}
                          onPress={async () => {
                            try {
                              const docId = p.name.split('/').pop();
                              const updatedFields = Object.assign({}, fields, { estado: {stringValue: 'listo'} });
                              await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/pedidos/${docId}`, {
                                method: 'PATCH',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ fields: updatedFields })
                              });
                              cargarDatos();
                            } catch(e) {Alert.alert('Error', 'No se pudo actualizar');}
                          }}
                        >
                          <Text style={{color: '#FFF', fontWeight: '600'}}>MARCAR COMO LISTO</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              }
            </View>
          )}

          {adminSeccion === 'productos' && (
            <View style={admin.seccion}>
              <Text style={admin.seccionTitulo}>Gestionar Productos</Text>
              <Text style={{color: '#6B7280', fontSize: 13, marginBottom: 20}}>Activa o desactiva productos en la tienda</Text>
              <TouchableOpacity onPress={async () => {
                const nuevoEstado = !productos.every(p => p.disponible);
                setProductos(productos.map(p => ({...p, disponible: nuevoEstado})));
                for (const p of productos) {
                  try {
                    await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/configuracion/productos/${p.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ fields: { disponible: { booleanValue: nuevoEstado } } })
                    });
                  } catch(e) {}
                }
              }} style={{backgroundColor: '#000', padding: 12, alignItems: 'center', marginBottom: 20}}>
                <Text style={{color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 1}}>{productos.every(p => p.disponible) ? 'OCULTAR TODOS' : 'MOSTRAR TODOS'}</Text>
              </TouchableOpacity>
              {productos.map(prod => (
                <View key={prod.id} style={admin.productoRow}>
                  <Text style={admin.productoNombre}>{prod.nombre}</Text>
                  <TouchableOpacity onPress={() => toggleProducto(prod.id)} style={[admin.toggleBtn, prod.disponible ? admin.toggleOn : admin.toggleOff]}>
                    <Text style={admin.toggleTexto}>{prod.disponible ? 'DISPONIBLE' : 'OCULTO'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {adminSeccion === 'lideres' && (
            <View style={admin.seccion}>
              <View style={admin.tarjetaForm}>
                <Text style={admin.seccionTitulo}>Nuevo Líder</Text>
                <Text style={{color: '#6B7280', fontSize: 13, marginBottom: 12}}>El código se generará automáticamente</Text>
                <TextInput style={admin.input} placeholder="Nombre del líder" value={nuevoNombre} onChangeText={setNuevoNombre} placeholderTextColor="#9CA3AF" />
                <TouchableOpacity style={admin.checkRow} onPress={() => setEsAdminNuevo(!esAdminNuevo)}>
                  <Text style={admin.checkTexto}>Rol de Administrador</Text>
                  <View style={[admin.checkBox, esAdminNuevo && admin.checkBoxActivo]} />
                </TouchableOpacity>
                <TextInput style={admin.input} placeholder="Código del líder asignado (opcional)" value={nuevoLiderAsignado} onChangeText={setNuevoLiderAsignado} placeholderTextColor="#9CA3AF" keyboardType="numeric" />
                <TouchableOpacity style={admin.botonCrear} onPress={crearLider}>
                  <Text style={admin.botonCrearTexto}>Añadir</Text>
                </TouchableOpacity>
              </View>

              <Text style={admin.seccionSubtitulo}>Directorio de Líderes</Text>
              {[...lideres].sort((a, b) => {
                const nameA = (a.fields?.nombre?.stringValue || '').toLowerCase();
                const nameB = (b.fields?.nombre?.stringValue || '').toLowerCase();
                return nameA.localeCompare(nameB);
              }).map((l) => {
                const fields = l.fields || {};
                const esAdmin = fields.admin?.booleanValue;
                return (
                  <View key={l.name} style={admin.tarjetaLider}>
                    <View>
                      <Text style={admin.tarjetaTitulo}>{fields.nombre?.stringValue}</Text>
                      <Text style={admin.tarjetaCodigo}>Código: {fields.codigo?.stringValue} {esAdmin ? '(Admin)' : ''}</Text>
                      {fields.liderAsignado?.stringValue ? <Text style={{fontSize: 12, color: '#9CA3AF', marginTop: 2}}>Ayudante de: {lideres.find(l => l.fields?.codigo?.stringValue === fields.liderAsignado?.stringValue)?.fields?.nombre?.stringValue || fields.liderAsignado?.stringValue}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => eliminarLider(l.name)} style={admin.botonEliminar}>
                      <Text style={admin.botonEliminarTexto}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {adminSeccion === 'registros' && (
            <View style={admin.seccion}>
              <Text style={admin.seccionTitulo}>Registros por Líder</Text>
              <Text style={{color: '#6B7280', fontSize: 13, marginBottom: 20}}>Toca un líder para ver sus niños registrados</Text>
              {[...lideres].filter(l => !l.fields?.liderAsignado?.stringValue).sort((a, b) => {
                const nameA = (a.fields?.nombre?.stringValue || '').toLowerCase();
                const nameB = (b.fields?.nombre?.stringValue || '').toLowerCase();
                return nameA.localeCompare(nameB);
              }).map((l) => {
                const lFields = l.fields || {};
                const lCodigo = lFields.codigo?.stringValue || l.name.split('/').pop();
                const asistentes = lideres.filter(a => a.fields?.liderAsignado?.stringValue === lCodigo).map(a => a.fields?.codigo?.stringValue).filter(Boolean);
                const niñosDelLider = niños.filter(n => [lCodigo, ...asistentes].includes(n.fields?.lider?.stringValue));
                const expandido = adminLiderVer === l.name;
                return (
                  <View key={l.name} style={{marginBottom: 12}}>
                    <TouchableOpacity onPress={() => setAdminLiderVer(expandido ? null : l.name)} style={{backgroundColor: '#FFF', padding: 16, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <View>
                        <Text style={{fontSize: 15, fontWeight: '600', color: '#000'}}>{lFields.nombre?.stringValue || 'Sin nombre'}</Text>
                        <Text style={{fontSize: 12, color: '#9CA3AF'}}>Código: {lCodigo} · {niñosDelLider.length} niños</Text>
                      </View>
                      <Text style={{fontSize: 14, color: '#9CA3AF'}}>{expandido ? '▼' : '▶'}</Text>
                    </TouchableOpacity>
                    {expandido && (
                      <View style={{backgroundColor: '#FAFAFA', borderWidth: 1, borderTopWidth: 0, borderColor: '#E5E7EB', padding: 12}}>
                        {niñosDelLider.length === 0 ? (
                          <Text style={{fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: 16}}>Sin niños registrados</Text>
                        ) : (
                          niñosDelLider.map((n, idx) => {
                            const nFields = n.fields || {};
                            const nivelesConData = ['saltador','caminante','escalador'].filter(nv => {
                              try { const d = JSON.parse(nFields[nv+'_json']?.stringValue || '{}'); return Object.keys(d).length > 0; } catch(e) { return false; }
                            });
                            return (
                              <View key={idx} style={{flexDirection:'row', alignItems:'center', borderBottomWidth: idx < niñosDelLider.length - 1 ? 1 : 0, borderBottomColor: '#E5E7EB'}}>
                                <TouchableOpacity onPress={() => { setNinoSeleccionado(n); setEditandoNiño({...nFields}); setVista('seleccionar-nivel'); }} style={{flex:1, paddingVertical: 10}}>
                                  <Text style={{fontSize: 14, fontWeight: '600', color: '#000'}}>{nFields.nombreNino?.stringValue || 'Sin nombre'}</Text>
                                  <Text style={{fontSize: 12, color: '#6B7280', marginTop: 2}}>Padre: {nFields.padre?.stringValue || 'N/A'}</Text>
                                  {nivelesConData.length > 0 && (
                                    <Text style={{fontSize: 11, color: '#059669', marginTop: 2}}>
                                      {nivelesConData.map(nv => nv.charAt(0).toUpperCase() + nv.slice(1)).join(' · ')} ✓
                                    </Text>
                                  )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => abrirVistaImpresion(nFields)} style={{padding: 10}}>
                                  <Text style={{fontSize: 16}}>🖨</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // VISTA REGISTRAR NIÑO
  if (vista === 'registrar' && usuario) {
    return (
      <View style={estilos.contenedor}>
        <View style={estilos.encabezado}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image source={{ uri: 'https://ipdea.org/img/chispitas.png' }} style={estilos.logo} />
            <Text style={estilos.tituloHeaderMain}>REGISTRAR NIÑO</Text>
          </View>
          <View style={{flexDirection:'row', gap:15}}>
            <TouchableOpacity onPress={() => { setRefrescando(true); cargarDatos(true); }}>
              <Text style={estilos.linkTop}>⟳</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVista('catalogo')}>
              <Text style={estilos.linkTop}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={estilos.lista}>
          <View style={{backgroundColor: '#FFFFFF', padding: 24, borderWidth: 1, borderColor: '#E5E7EB'}}>
            <Text style={estilos.seccionTitulo}>Datos del Niño</Text>
            
            <TextInput
              style={estilos.input}
              placeholder="Nombre del niño"
              value={nuevoNiño.nombreNino}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, nombreNino: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Padre/Madre"
              value={nuevoNiño.padre}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, padre: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Dirección"
              value={nuevoNiño.direccion}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, direccion: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Teléfono"
              value={nuevoNiño.telefono}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, telefono: text})}
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Fecha de nacimiento (DD/MM/AAAA)"
              value={nuevoNiño.fechaNacimiento}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, fechaNacimiento: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Iglesia"
              value={nuevoNiño.iglesia}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, iglesia: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Traído por"
              value={nuevoNiño.traidoPor}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, traidoPor: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Trajo a..."
              value={nuevoNiño.trajoA}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, trajoA: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={estilos.input}
              placeholder="Número de membresía"
              value={nuevoNiño.numeroMembresia}
              onChangeText={(text) => setNuevoNiño({...nuevoNiño, numeroMembresia: text})}
              placeholderTextColor="#9CA3AF"
            />
            
            <TouchableOpacity
              style={{backgroundColor: registrando ? '#9CA3AF' : '#000000', padding: 16, alignItems: 'center', marginTop: 20}}
              onPress={() => {
                if (registrando) return;
                const lider = usuario?.liderAsignado || usuario?.codigo || '';
                registrarNiño(nuevoNiño, lider);
              }}
              disabled={registrando}
            >
              <Text style={{color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 2}}>{registrando ? 'GUARDANDO...' : 'REGISTRAR'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{marginTop: 30}}>
            <Text style={estilos.seccionTitulo}>Niños Registrados</Text>
            {niños.filter(filtrarNiños).length === 0 ? (
              <Text style={{color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 20}}>No hay niños registrados</Text>
            ) : (
              niños.filter(filtrarNiños).map((n, idx) => {
                const fields = n.fields || {};
                return (
                  <View key={idx} style={{backgroundColor: '#F9FAFB', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB'}}>
                    <TouchableOpacity onPress={() => { setNinoSeleccionado(n); setEditandoNiño({ ...fields }); setVista('seleccionar-nivel'); }} style={{padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <View style={{flex: 1}}>
                        <Text style={{fontSize: 16, fontWeight: '600', color: '#000000'}}>{fields.nombreNino?.stringValue || 'Sin nombre'}</Text>
                        <Text style={{fontSize: 13, color: '#6B7280', marginTop: 4}}>Padre: {fields.padre?.stringValue || 'N/A'}</Text>
                        <Text style={{fontSize: 13, color: '#6B7280'}}>Fecha: {fields.fechaNacimiento?.stringValue || 'N/A'}</Text>
                      </View>
                      <Text style={{fontSize: 12, color: '#9CA3AF'}}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => eliminarNiño(n)} style={{position: 'absolute', top: 8, right: 8, width: 28, height: 28, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center'}}>
                      <Text style={{color: '#FFFFFF', fontSize: 14, fontWeight: '700'}}>X</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // VISTA SELECCIONAR MANUAL/NIVEL
  if (vista === 'seleccionar-nivel' && ninoSeleccionado) {
    const editar = editandoNiño || {};
    const niveles = [
      { id: 'saltador', nombre: 'Manual Saltador' },
      { id: 'caminante', nombre: 'Manual Caminante' },
      { id: 'escalador', nombre: 'Manual Escalador' }
    ];
    return (
      <View style={estilos.contenedor}>
        <View style={estilos.encabezado}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={estilos.tituloHeaderMain}>MANUALES</Text>
          </View>
          <View style={{flexDirection:'row', gap:15}}>
            <TouchableOpacity onPress={() => abrirVistaImpresion(editandoNiño)}>
              <Text style={[estilos.linkTop, {color:'#000', fontWeight:'700'}]}>GUARDAR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditandoNiño(null); setNinoSeleccionado(null); setVista(usuario?.admin ? 'admin' : 'registrar'); }}>
              <Text style={estilos.linkTop}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={estilos.lista}>
          <View style={{backgroundColor: '#FFF', padding: 20, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20}}>
            <Text style={{fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 4}}>{editar.nombreNino?.stringValue || 'Sin nombre'}</Text>
            <Text style={{fontSize: 13, color: '#6B7280'}}>Padre: {editar.padre?.stringValue || 'N/A'}</Text>
          </View>
          <Text style={{fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16}}>Seleccionar Manual</Text>
          {niveles.map(n => {
            const jsonField = n.id + '_json';
            const hasData = (() => {
              try {
                const d = JSON.parse(editar[jsonField]?.stringValue || '{}');
                return Object.keys(d).length > 0;
              } catch(e) { return false; }
            })();
            return (
              <TouchableOpacity key={n.id} onPress={() => { setNivelViendo(n.id); setVista('detalle-nino'); }} style={{backgroundColor: '#FFF', padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                  <View>
                    <Text style={{fontSize: 15, fontWeight: '600', color: '#000'}}>{n.nombre}</Text>
                    <Text style={{fontSize: 12, color: hasData ? '#059669' : '#9CA3AF', marginTop: 2}}>{hasData ? '✓ En progreso' : 'Sin iniciar'}</Text>
                  </View>
                </View>
                <Text style={{fontSize: 16, color: '#9CA3AF'}}>→</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={() => setVista('editar-datos')} style={{backgroundColor: '#FFF', padding: 20, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', marginTop: 20}}>
            <Text style={{fontSize: 13, color: '#000', fontWeight: '600'}}>EDITAR DATOS DEL NIÑO</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => eliminarNiño(ninoSeleccionado)} style={{backgroundColor: '#EF4444', padding: 16, alignItems: 'center', marginTop: 12, marginBottom: 40}}>
            <Text style={{color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 2}}>ELIMINAR NIÑO</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // VISTA DETALLE NIÑO
  if (vista === 'detalle-nino' && ninoSeleccionado) {
    const editar = editandoNiño || {};
    const nivel = nivelViendo || 'saltador';

    // Form definitions per level
    const formDefs = {
      saltador: () => ({
        m: '', f: '', año: '', folleto_inicio: Array(6).fill(''), rango: Array(6).fill(''),
        joyas_rojas: Array(23).fill(''), joyas_verdes: { g1:[''], g2:['',''], g3:['','','',''], g4:['',''] },
        premios: { manual:'', uniforme:'', credito_extra:'', rango:'', ejercicios_biblicos:['','','',''], actividades:['','','',''], joyas_rojas:'', joyas_verdes:'', asistencia_club:['','','',''], asistencia_iglesia:['',''], premio_manual_saltador:'' }
      }),
      caminante: () => ({
        m: '', f: '', año: '', rango: Array(6).fill(''),
        joyas_rojas: Array(30).fill(''),
        joyas_verdes: { g1:['',''], g2:['','',''], g3:['','','','',''], g4:['','','',''] },
        premios: { manual:'', uniforme:'', credito_extra:'', rango:'', ejercicios_biblicos:['','','',''], actividades:['','','',''], asistencia_club:['','','',''], joyas_azules:['',''], premio_manual_caminante:'' }
      }),
      escalador: () => ({
        m: '', f: '', año: '', rango: Array(6).fill(''),
        joyas_rojas: Array(29).fill(''),
        joyas_verdes: { g1:['','',''], g2:['','','',''], g3:['','','','','',''], g4:[''] },
        premios: { manual:'', uniforme:'', credito_extra:'', rango:'', ejercicios_biblicos:['','','',''], actividades:['','','',''], asistencia_club:['','','',''], asistencia_iglesia:['',''], premio_manual_escalador:'' },
        premio_chispita: ''
      })
    };

    const nivelLabel = { saltador: 'Saltador', caminante: 'Caminante', escalador: 'Escalador' };
    const jsonField = nivel + '_json';

    const loadNivelData = () => {
      let data;
      try { data = JSON.parse(editar[jsonField]?.stringValue || '{}'); } catch(e) { data = {}; }
      const def = formDefs[nivel]();
      let valid = true;
      if (nivel === 'saltador' && !data.folleto_inicio) valid = false;
      if ((nivel === 'caminante' || nivel === 'escalador') && !data.rango) valid = false;
      return valid ? data : def;
    };

    let nivelData = loadNivelData();

    // Asistencia (shared across levels)
    const asisStr = editar.asistencia_json?.stringValue || '{"club":{},"iglesia":{}}';
    let asistencia;
    try { asistencia = JSON.parse(asisStr); } catch(e) { asistencia = {club:{}, iglesia:{}}; }
    const mesesForm = ['febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre'];
    mesesForm.forEach(m => {
      if (!asistencia.club[m]) asistencia.club[m] = ['','','','',''];
      if (!asistencia.iglesia[m]) asistencia.iglesia[m] = ['','','','',''];
    });

    const saveNivelData = async (nuevosDatos) => {
      const hoyD = new Date();
      const dd = hoyD.getDate();
      const mm = hoyD.getMonth() + 1;
      const todayNum = mm * 100 + dd;
      let periodoActivo = 0;
      for (let i = 0; i < periodos.length; i++) {
        const p = periodos[i];
        if (p.activo && p.inicio && p.fin) {
          const [iniD, iniM] = p.inicio.split('/').map(Number);
          const [finD, finM] = p.fin.split('/').map(Number);
          if (!isNaN(iniD) && !isNaN(finD)) {
            const iniNum = iniM * 100 + iniD;
            const finNum = finM * 100 + finD;
            if (todayNum >= iniNum && todayNum <= finNum) { periodoActivo = i + 1; break; }
          }
        }
      }
      nuevosDatos.periodo_activo = periodoActivo;
      const jsonStr = JSON.stringify(nuevosDatos);
      const id = ninoSeleccionado.name.split('/').pop();
      setEditandoNiño(prev => ({...prev, [jsonField]: {stringValue: jsonStr}}));
      setNiños(prev => prev.map(n =>
        n.name === ninoSeleccionado.name ? { ...n, fields: { ...n.fields, [jsonField]: { stringValue: jsonStr } } } : n
      ));
      setNinoSeleccionado(prev => prev?.name === ninoSeleccionado.name ? { ...prev, fields: { ...prev.fields, [jsonField]: { stringValue: jsonStr } } } : prev);
      try {
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/ninos/${id}?updateMask.fieldPaths=${jsonField}`, {
          method: 'PATCH', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({fields: {[jsonField]: {stringValue: jsonStr}}})
        });
        if (!res.ok) console.log('Error saving:', res.status, await res.text());
      } catch(e) { console.log('Save error:', e); }
    };

    const toggleAsistencia = async (tipo, mes, idx, valor) => {
      const a = JSON.parse(editandoNiño?.asistencia_json?.stringValue || '{"club":{},"iglesia":{}}');
      if (!a[tipo]) a[tipo] = {};
      if (!a[tipo][mes]) a[tipo][mes] = ['','','','',''];
      a[tipo][mes][idx] = valor;
      const nuevoJson = JSON.stringify(a);
      const id = ninoSeleccionado.name.split('/').pop();
      setEditandoNiño(prev => ({...prev, asistencia_json: {stringValue: nuevoJson}}));
      setNiños(prev => prev.map(n =>
        n.name === ninoSeleccionado.name ? { ...n, fields: { ...n.fields, asistencia_json: { stringValue: nuevoJson } } } : n
      ));
      setNinoSeleccionado(prev => prev?.name === ninoSeleccionado.name ? { ...prev, fields: { ...prev.fields, asistencia_json: { stringValue: nuevoJson } } } : prev);
      try {
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/oansa-chispas/databases/(default)/documents/ninos/${id}?updateMask.fieldPaths=asistencia_json`, {
          method: 'PATCH', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({fields: {asistencia_json: {stringValue: nuevoJson}}})
        });
        if (!res.ok) console.log('Error saving asistencia:', res.status, await res.text());
      } catch(e) { console.log('Save asistencia error:', e); }
    };

    const Cell = ({ val, onChange, idx, sizeW = 32, sizeH = 24, fontSize = 8, editMode }) => {
      const h = new Date();
      const hs = ('0'+h.getDate()).slice(-2) + '/' + ('0'+(h.getMonth()+1)).slice(-2);
      return (
        <View style={{width: sizeW, height: sizeH, alignItems:'center', justifyContent:'center'}}>
          <TextInput
            style={{width: sizeW-4, height: sizeH-4, borderWidth:1, borderColor: editMode ? '#3B82F6' : '#D1D5DB', textAlign:'center', color:'#000', fontSize, fontWeight:'600', padding:0}}
            value={val || ''}
            onChangeText={onChange}
            onFocus={() => {
              if (editMode) {
                celdaPendiente.current = onChange;
                setCalendarioMes(new Date());
                setCalendarioVisible(true);
              } else if (!val) {
                onChange(hs);
              }
            }}
            placeholder={idx != null ? String(idx) : ''}
            placeholderTextColor="#D1D5DB"
          />
        </View>
      );
    };

    return (
      <View style={estilos.contenedor}>
        <View style={estilos.encabezado}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Image source={{ uri: 'https://ipdea.org/img/chispitas.png' }} style={estilos.logo} />
            <Text style={estilos.tituloHeaderMain}>{nivelLabel[nivel].toUpperCase()}</Text>
          </View>
          <View style={{flexDirection:'row', gap:15}}>
            <TouchableOpacity onPress={() => setEditModeActivo(!editModeActivo)}>
              <Text style={[estilos.linkTop, {color: editModeActivo ? '#3B82F6' : '#6B7280', fontWeight: editModeActivo ? '700' : '500'}]}>{editModeActivo ? 'LISTO' : 'EDITAR'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditModeActivo(false); setNivelViendo(null); setVista('seleccionar-nivel'); }}>
              <Text style={estilos.linkTop}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={estilos.lista}>
          {/* INFO + M/F + EDIT */}
          <View style={{backgroundColor:'#FFF', padding:20, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16}}>
            <Text style={{fontSize:18, fontWeight:'700', color:'#000', marginBottom:8}}>{editar.nombreNino?.stringValue || 'Sin nombre'}</Text>
            <Text style={{fontSize:13, color:'#6B7280', marginBottom:2}}>Padres: {editar.padre?.stringValue || 'N/A'}</Text>
            <Text style={{fontSize:13, color:'#6B7280', marginBottom:2}}>Dirección: {editar.direccion?.stringValue || 'N/A'}</Text>
            <Text style={{fontSize:13, color:'#6B7280', marginBottom:2}}>Teléfono: {editar.telefono?.stringValue || 'N/A'}</Text>
            <Text style={{fontSize:13, color:'#6B7280', marginBottom:2}}>Fecha Nac: {editar.fechaNacimiento?.stringValue || 'N/A'}</Text>
            <Text style={{fontSize:13, color:'#6B7280', marginBottom:2}}>Iglesia: {editar.iglesia?.stringValue || 'N/A'}</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:16, marginTop:8}}>
              <TouchableOpacity onPress={() => { const d = {...nivelData}; if (d.m) { d.m = ''; } else { d.m = 'X'; d.f = ''; } saveNivelData(d); }} style={{flexDirection:'row', alignItems:'center', gap:4}}>
                <View style={{width:22, height:22, borderWidth:1.5, borderColor:'#000', alignItems:'center', justifyContent:'center', backgroundColor:nivelData.m ? '#000' : 'transparent'}}>
                  <Text style={{fontSize:11, color:nivelData.m ? '#FFF' : '#000', fontWeight:'600'}}>M</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { const d = {...nivelData}; if (d.f) { d.f = ''; } else { d.f = 'X'; d.m = ''; } saveNivelData(d); }} style={{flexDirection:'row', alignItems:'center', gap:4}}>
                <View style={{width:22, height:22, borderWidth:1.5, borderColor:'#000', alignItems:'center', justifyContent:'center', backgroundColor:nivelData.f ? '#000' : 'transparent'}}>
                  <Text style={{fontSize:11, color:nivelData.f ? '#FFF' : '#000', fontWeight:'600'}}>F</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVista('editar-datos')} style={{marginLeft:'auto'}}>
                <Text style={{fontSize:12, color:'#000', textDecorationLine:'underline'}}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AÑO */}
          <View style={{backgroundColor:'#FFF', padding:12, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16, flexDirection:'row', alignItems:'center', gap:12}}>
            <Text style={{fontSize:12, fontWeight:'700', color:'#000', letterSpacing:1, textTransform:'uppercase'}}>Año</Text>
            <TextInput style={{width:80, height:30, borderWidth:1, borderColor:'#D1D5DB', textAlign:'center', color:'#000', fontSize:12, fontWeight:'600', padding:0}} value={nivelData.año || ''} onChangeText={(t) => saveNivelData({...nivelData, año: t})} placeholder="AAAA" placeholderTextColor="#D1D5DB" />
          </View>

          {/* FOLLETO DE INICIO - Only Saltador */}
          {nivel === 'saltador' && (
            <>
              <Text style={{fontSize:12, fontWeight:'700', color:'#000', letterSpacing:1, marginBottom:8, textTransform:'uppercase'}}>Folleto de Inicio</Text>
              <View style={{backgroundColor:'#FFF', padding:12, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16}}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={{flexDirection:'row', gap:4}}>
                        {(nivelData.folleto_inicio || []).map((v, i) => (
                          <Cell editMode={editModeActivo} key={i} idx={i+1} val={v} onChange={(t) => { const a = [...nivelData.folleto_inicio]; a[i] = t; saveNivelData({...nivelData, folleto_inicio: a}); }} sizeW={40} sizeH={30} fontSize={8} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            </>
          )}

          {/* RANGO */}
          <Text style={{fontSize:12, fontWeight:'700', color:'#000', letterSpacing:1, marginBottom:8, textTransform:'uppercase', marginTop: nivel !== 'saltador' ? 12 : 0}}>Rango</Text>
          <View style={{backgroundColor:'#FFF', padding:12, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={{flexDirection:'row', gap:4}}>
                {(nivelData.rango || []).map((v, i) => (
                  <Cell editMode={editModeActivo} key={i} idx={i+1} val={v} onChange={(t) => { const a = [...nivelData.rango]; a[i] = t; saveNivelData({...nivelData, rango: a}); }} sizeW={40} sizeH={30} fontSize={8} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* JOYAS ROJAS */}
          <Text style={{fontSize:12, fontWeight:'700', color:'#000', letterSpacing:1, marginBottom:8, textTransform:'uppercase'}}>Joyas Rojas</Text>
          <View style={{backgroundColor:'#FFF', padding:12, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {(() => {
                  const rows = nivel === 'saltador' ? [4,4,9,6] : (nivel === 'caminante' ? [6,5,10,8] : [8,7,7,7]);
                  const flat = nivelData.joyas_rojas || [];
                  let idx = 0;
                  return rows.map((count, ri) => (
                    <View key={ri} style={{flexDirection:'row', gap:2, marginBottom:2}}>
                      {Array.from({length: count}, (_, ci) => {
                        const cellIdx = idx++;
                        return <Cell editMode={editModeActivo} key={ci} idx={ci+1} val={flat[cellIdx]} onChange={(t) => { const a = [...flat]; a[cellIdx] = t; saveNivelData({...nivelData, joyas_rojas: a}); }} />;
                      })}
                    </View>
                  ));
                })()}
              </View>
            </ScrollView>
          </View>

          {/* JOYAS VERDES */}
          <Text style={{fontSize:12, fontWeight:'700', color:'#000', letterSpacing:1, marginBottom:8, textTransform:'uppercase'}}>Joyas Verdes</Text>
          <View style={{backgroundColor:'#FFF', padding:12, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {['g1','g2','g3','g4'].map((gk, gi) => {
                  const grupo = nivelData.joyas_verdes?.[gk] || [];
                  return (
                      <View key={gk} style={{marginBottom:4}}>
                        <View style={{flexDirection:'row', gap:2}}>
                        {grupo.map((v, i) => (
                          <Cell editMode={editModeActivo} key={i} idx={i+1} val={v} onChange={(t) => { const g = {...nivelData.joyas_verdes}; g[gk] = [...grupo]; g[gk][i] = t; saveNivelData({...nivelData, joyas_verdes: g}); }} />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* ASISTENCIA AL CLUB */}
          <Text style={{fontSize:12, fontWeight:'700', color:'#000', letterSpacing:1, marginBottom:8, textTransform:'uppercase', backgroundColor:'#FEF3C7', padding:4}}>Asistencia al Club</Text>
          <View style={{backgroundColor:'#FFF', padding:8, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {mesesForm.map(m => (
                  <View key={m} style={{flexDirection:'row', alignItems:'center', marginBottom:1}}>
                    <Text style={{width:55, fontSize:10, color:'#4B5563', textTransform:'capitalize'}}>{m.slice(0,3)}</Text>
                    {asistencia.club[m].map((v, i) => (
                      <Cell editMode={editModeActivo} key={i} idx={i+1} val={v} onChange={(t) => toggleAsistencia('club', m, i, t)} />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ASISTENCIA A LA IGLESIA */}
          <Text style={{fontSize:12, fontWeight:'700', color:'#000', letterSpacing:1, marginBottom:8, textTransform:'uppercase', backgroundColor:'#FEF3C7', padding:4}}>Asistencia a la Iglesia</Text>
          <View style={{backgroundColor:'#FFF', padding:8, borderWidth:1, borderColor:'#E5E7EB', marginBottom:16}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {mesesForm.map(m => (
                  <View key={m} style={{flexDirection:'row', alignItems:'center', marginBottom:1}}>
                    <Text style={{width:55, fontSize:10, color:'#4B5563', textTransform:'capitalize'}}>{m.slice(0,3)}</Text>
                    {asistencia.iglesia[m].map((v, i) => (
                      <Cell editMode={editModeActivo} key={i} idx={i+1} val={v} onChange={(t) => toggleAsistencia('iglesia', m, i, t)} />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* PREMIOS */}
          <Text style={{fontSize:14, fontWeight:'700', color:'#000', letterSpacing:1, marginBottom:12, textTransform:'uppercase', backgroundColor:'#FEF3C7', padding:8, borderWidth:1, borderColor:'#E5E7EB'}}>PREMIOS</Text>
          <View style={{backgroundColor:'#FFF', padding:16, borderWidth:1, borderColor:'#E5E7EB', marginBottom:20}}>
            {(nivel === 'saltador' ? [
              {label:'Manual', key:'manual'},
              {label:'Uniforme', key:'uniforme'},
              {label:'Crédito Extra', key:'credito_extra'},
              {label:'Rango', key:'rango'},
              {label:'Ejercicios Bíblicos', key:'ejercicios_biblicos', arr:4},
              {label:'Actividades', key:'actividades', arr:4},
              {label:'Asistencia al Club', key:'asistencia_club', arr:4},
              {label:'Asistencia a la Iglesia', key:'asistencia_iglesia', arr:2},
              {label:'Premio Manual Saltador', key:'premio_manual_saltador'}
            ] : nivel === 'caminante' ? [
              {label:'Manual', key:'manual'},
              {label:'Uniforme', key:'uniforme'},
              {label:'Crédito Extra', key:'credito_extra'},
              {label:'Rango', key:'rango'},
              {label:'Ejercicios Bíblicos', key:'ejercicios_biblicos', arr:4},
              {label:'Actividades', key:'actividades', arr:4},
              {label:'Asistencia al Club', key:'asistencia_club', arr:4},
              {label:'Joyas Azules', key:'joyas_azules', arr:2},
              {label:'Premio Manual Caminante', key:'premio_manual_caminante'}
            ] : [
              {label:'Manual', key:'manual'},
              {label:'Uniforme', key:'uniforme'},
              {label:'Crédito Extra', key:'credito_extra'},
              {label:'Rango', key:'rango'},
              {label:'Ejercicios Bíblicos', key:'ejercicios_biblicos', arr:4},
              {label:'Actividades', key:'actividades', arr:4},
              {label:'Asistencia al Club', key:'asistencia_club', arr:4},
              {label:'Asistencia a la Iglesia', key:'asistencia_iglesia', arr:2},
              {label:'Premio Manual Escalador', key:'premio_manual_escalador'}
            ]).map((item) => {
              const val = nivelData.premios?.[item.key];
              return (
                <View key={item.key} style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#F3F4F6'}}>
                  <Text style={{fontSize:12, color:'#000', fontWeight:'600', flex:1}}>{item.label}</Text>
                  <View style={{flexDirection:'row', gap:2}}>
                    {item.arr ? (
                      Array.from({length: item.arr}, (_, i) => {
                        const v = val?.[i] || '';
                        return (
                          <Cell editMode={editModeActivo} key={i} idx={i+1} val={v} onChange={(t) => { const p = {...nivelData.premios}; if (!p[item.key]) p[item.key] = []; const a = [...p[item.key]]; a[i] = t; p[item.key] = a; saveNivelData({...nivelData, premios: p}); }} />
                        );
                      })
                    ) : item.isPremio ? (
                      <Cell editMode={editModeActivo} val={val} onChange={(t) => { const p = {...nivelData.premios}; p[item.key] = t; saveNivelData({...nivelData, premios: p}); }} />
                    ) : (
                      <Cell editMode={editModeActivo} val={val} onChange={(t) => { const p = {...nivelData.premios}; p[item.key] = t; saveNivelData({...nivelData, premios: p}); }} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* PREMIO CHISPITA - Only Escalador */}
          {nivel === 'escalador' && (
            <View style={{backgroundColor:'#FFF', padding:16, borderWidth:1, borderColor:'#E5E7EB', marginBottom:20}}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={{fontSize:13, fontWeight:'700', color:'#000', letterSpacing:1}}>Premio Chispita</Text>
                <Cell editMode={editModeActivo} val={nivelData.premio_chispita || ''} onChange={(t) => saveNivelData({...nivelData, premio_chispita: t})} />
              </View>
            </View>
          )}

        </ScrollView>

        {/* CALENDAR MODAL */}
        <Modal visible={calendarioVisible} transparent animationType="fade">
          <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:24}}>
            <View style={{backgroundColor:'#FFF', borderRadius:12, padding:20}}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                <TouchableOpacity onPress={() => { const d = new Date(calendarioMes); d.setMonth(d.getMonth()-1); setCalendarioMes(d); }} style={{padding:8}}>
                  <Text style={{fontSize:18, color:'#000'}}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={{fontSize:16, fontWeight:'700', color:'#000'}}>
                  {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][calendarioMes.getMonth()]} {calendarioMes.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => { const d = new Date(calendarioMes); d.setMonth(d.getMonth()+1); setCalendarioMes(d); }} style={{padding:8}}>
                  <Text style={{fontSize:18, color:'#000'}}>{'>'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection:'row', marginBottom:8}}>
                {['L','M','M','J','V','S','D'].map(d => (
                  <View key={d} style={{flex:1, alignItems:'center'}}><Text style={{fontSize:11, color:'#9CA3AF', fontWeight:'600'}}>{d}</Text></View>
                ))}
              </View>
              {(() => {
                const año = calendarioMes.getFullYear();
                const mes = calendarioMes.getMonth();
                const primerDia = new Date(año, mes, 1).getDay();
                const domingo = primerDia === 0 ? 6 : primerDia - 1;
                const diasEnMes = new Date(año, mes + 1, 0).getDate();
                const rows = [];
                let days = [];
                for (let i = 0; i < domingo; i++) days.push(<View key={`e${i}`} style={{flex:1}} />);
                for (let d = 1; d <= diasEnMes; d++) {
                  const dia = d;
                  const hoy = new Date();
                  const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
                  days.push(
                    <TouchableOpacity key={d} onPress={() => {
                      const fecha = ('0'+dia).slice(-2) + '/' + ('0'+(mes+1)).slice(-2);
                      if (celdaPendiente.current) { celdaPendiente.current(fecha); celdaPendiente.current = null; }
                      setCalendarioVisible(false);
                    }} style={{flex:1, alignItems:'center', padding:6}}>
                      <View style={{width:32, height:32, borderRadius:16, backgroundColor: esHoy ? '#3B82F6' : 'transparent', alignItems:'center', justifyContent:'center'}}>
                        <Text style={{fontSize:14, color: esHoy ? '#FFF' : '#000', fontWeight: esHoy ? '700' : '400'}}>{dia}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                  if (days.length === 7) { rows.push(<View key={rows.length} style={{flexDirection:'row'}}>{days}</View>); days = []; }
                }
                if (days.length > 0) rows.push(<View key={rows.length} style={{flexDirection:'row'}}>{days}</View>);
                return rows;
              })()}
              <TouchableOpacity onPress={() => setCalendarioVisible(false)} style={{alignItems:'center', marginTop:16, padding:12}}>
                <Text style={{color:'#9CA3AF', fontSize:13, fontWeight:'600'}}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // VISTA EDITAR DATOS NIÑO (desde detalle)
  if (vista === 'editar-datos' && editandoNiño) {
    const editar = editandoNiño;
    return (
      <View style={estilos.contenedor}>
        <View style={estilos.encabezado}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image source={{ uri: 'https://ipdea.org/img/chispitas.png' }} style={estilos.logo} />
            <Text style={estilos.tituloHeaderMain}>EDITAR DATOS</Text>
          </View>
          <TouchableOpacity onPress={() => { setNivelViendo(null); setEditandoNiño(null); setNinoSeleccionado(null); setVista('registrar'); }}>
            <Text style={estilos.linkTop}>Volver</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={estilos.lista}>
          <View style={{backgroundColor: '#FFFFFF', padding: 24, borderWidth: 1, borderColor: '#E5E7EB'}}>
            <TextInput style={estilos.input} placeholder="Nombre del niño" value={editar.nombreNino?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, nombreNino: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <TextInput style={estilos.input} placeholder="Padre/Madre" value={editar.padre?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, padre: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <TextInput style={estilos.input} placeholder="Dirección" value={editar.direccion?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, direccion: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <TextInput style={estilos.input} placeholder="Teléfono" value={editar.telefono?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, telefono: {stringValue: t}})} placeholderTextColor="#9CA3AF" keyboardType="phone-pad" />
            <TextInput style={estilos.input} placeholder="Fecha de nacimiento (DD/MM/AAAA)" value={editar.fechaNacimiento?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, fechaNacimiento: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <TextInput style={estilos.input} placeholder="Iglesia" value={editar.iglesia?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, iglesia: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <TextInput style={estilos.input} placeholder="Traído por" value={editar.traidoPor?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, traidoPor: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <TextInput style={estilos.input} placeholder="Trajo a..." value={editar.trajoA?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, trajoA: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <TextInput style={estilos.input} placeholder="Número de membresía" value={editar.numeroMembresia?.stringValue || ''} onChangeText={(t) => setEditandoNiño({...editar, numeroMembresia: {stringValue: t}})} placeholderTextColor="#9CA3AF" />
            <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
              <TouchableOpacity onPress={() => { setNivelViendo(null); setEditandoNiño(null); setNinoSeleccionado(null); setVista(usuario?.admin ? 'admin' : 'registrar'); }} style={{flex: 1, backgroundColor: '#F3F4F6', padding: 16, alignItems: 'center'}}>
                <Text style={{color: '#4B5563', fontSize: 13, fontWeight: '700', letterSpacing: 2}}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={guardarEdicion} style={{flex: 1, backgroundColor: '#000000', padding: 16, alignItems: 'center'}}>
                <Text style={{color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 2}}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // VISTA CATÁLOGO (Principal)
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={{ uri: 'https://ipdea.org/img/chispitas.png' }} style={estilos.logo} />
          <Text style={estilos.tituloHeaderMain}>CHISPAS</Text>
        </View>
        
        <View style={estilos.derecha}>
          {usuario ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
              {usuario.admin && (
                <TouchableOpacity onPress={() => setVista('admin')}>
                  <Text style={estilos.linkTop}>Admin</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setVista('registrar')}>
                <Text style={estilos.linkTop}>Registrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <Text style={estilos.linkTop}>Salir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setModalLogin(true)}>
              <Text style={estilos.linkTopBold}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={estilos.lista} contentContainerStyle={{paddingBottom: 120}}>
        {usuario && <Text style={estilos.bienvenida}>Hola, {usuario.nombre}</Text>}
        
        <Text style={estilos.tituloSeccion}>PREMIOS</Text>
        <View style={estilos.grid}>
          {productos.filter(p => (p.id.startsWith('joya-') || p.id.startsWith('rango-') || p.id.startsWith('premio-')) && p.disponible).map((p) => (
            <View key={p.id} style={estilos.producto}>
              {p.image ? (
                <Image source={p.image} style={estilos.productoImg} />
              ) : (
                <View style={[estilos.colorJoya, { backgroundColor: p.color }]} />
              )}
              <Text style={estilos.nombreProducto}>{p.nombre}</Text>
              <View style={estilos.botones}>
                <TouchableOpacity style={estilos.botonAccion} onPress={() => quitar(p.id)}><Text style={estilos.botonSigno}>−</Text></TouchableOpacity>
                <Text style={estilos.cantidad}>{carrito[p.id] || 0}</Text>
                <TouchableOpacity style={estilos.botonAccion} onPress={() => agregar(p.id)}><Text style={estilos.botonSigno}>+</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
        <Text style={estilos.tituloSeccion}>MATERIALES</Text>
        <View style={estilos.grid}>
          {productos.filter(p => !p.id.startsWith('joya-') && !p.id.startsWith('rango-') && !p.id.startsWith('premio-') && p.disponible).map((p) => (
            <View key={p.id} style={estilos.producto}>
              {p.image ? (
                <TouchableOpacity onPress={() => {
                  if (p.id === 'folleto') Linking.openURL('/folleto-inicio.pdf');
                  else if (p.id === 'manualidad-saltador') Linking.openURL('/manual-saltador.pdf');
                  else if (p.id === 'manualidad-caminante') Linking.openURL('/manual-caminante.pdf');
                  else if (p.id === 'manualidad-escalador') Linking.openURL('/manual-escalador.pdf');
                }}>
                  <Image source={p.image} style={estilos.productoImg} />
                </TouchableOpacity>
              ) : p.color ? (
                <View style={[estilos.colorJoya, { backgroundColor: p.color }]} />
              ) : (
                <Text style={estilos.productoIcono}>{p.icon || '📦'}</Text>
              )}
              <Text style={estilos.nombreProducto}>{p.nombre}</Text>
              <View style={estilos.botones}>
                <TouchableOpacity style={estilos.botonAccion} onPress={() => quitar(p.id)}><Text style={estilos.botonSigno}>−</Text></TouchableOpacity>
                <Text style={estilos.cantidad}>{carrito[p.id] || 0}</Text>
                <TouchableOpacity style={estilos.botonAccion} onPress={() => agregar(p.id)}><Text style={estilos.botonSigno}>+</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {getTotal() > 0 && (
        <View style={estilos.flotanteContainer}>
          <TouchableOpacity style={estilos.botonEnviar} onPress={enviarPedido}>
            <Text style={estilos.botonEnviarTexto}>ENVIAR PEDIDO ({getTotal()})</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <Modal visible={modalLogin} transparent animationType="fade">
        <View style={modal.fondo}>
          <View style={modal.caja}>
            <Text style={modal.titulo}>Acceso</Text>
            <TextInput 
              style={modal.input} 
              placeholder="Código" 
              placeholderTextColor="#9CA3AF" 
              value={codigo} 
              onChangeText={setCodigo} 
              secureTextEntry 
              keyboardType="numeric" 
              autoFocus
            />
            <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
              <TouchableOpacity onPress={() => setModalLogin(false)} style={modal.botonCancelar}>
                <Text style={modal.botonTextoCancelar}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modal.boton} onPress={login}>
                <Text style={modal.botonTexto}>ENTRAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FAFAF0', paddingTop: 50 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  logo: { width: 40, height: 40, marginRight: 10 },
  tituloHeaderMain: { fontSize: 18, fontWeight: '700', color: '#000000', letterSpacing: 2 },
  derecha: { flexDirection: 'row', alignItems: 'center' },
  linkTop: { fontSize: 13, color: '#6B7280', fontWeight: '500', letterSpacing: 1 },
  linkTopBold: { fontSize: 13, color: '#000000', fontWeight: '700', letterSpacing: 1 },
  lista: { flex: 1, padding: 20 },
  bienvenida: { fontSize: 14, color: '#6B7280', marginBottom: 20, letterSpacing: 1 },
  tituloSeccion: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  producto: { width: '48%', backgroundColor: '#FFFFFF', padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  productoImg: { width: 100, height: 100, marginBottom: 12, resizeMode: 'contain' },
  productoIcono: { fontSize: 40, marginBottom: 12 },
  colorJoya: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  nombreProducto: { fontSize: 13, fontWeight: '600', color: '#000000', textAlign: 'center', marginBottom: 8 },
  botones: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botonAccion: { backgroundColor: '#F3F4F6', width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  botonSigno: { fontSize: 16, color: '#000000', fontWeight: '600' },
  cantidad: { fontSize: 15, fontWeight: '700', color: '#000000', minWidth: 24, textAlign: 'center' },
  flotanteContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FAFAF0' },
  botonEnviar: { backgroundColor: '#000000', padding: 16, alignItems: 'center' },
  botonEnviarTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  carga: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF0' },
  cargaTexto: { fontSize: 14, color: '#9CA3AF', letterSpacing: 2 }
});

const admin = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FAFAF0', paddingTop: 50 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  titulo: { fontSize: 18, fontWeight: '700', color: '#000000', letterSpacing: 2 },
  linkTexto: { fontSize: 13, color: '#6B7280', fontWeight: '500', letterSpacing: 1 },
  tabs: { padding: 20, paddingBottom: 0 },
  tab: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActivo: { borderBottomColor: '#000000' },
  tabTexto: { fontSize: 13, color: '#9CA3AF', fontWeight: '600', letterSpacing: 1 },
  tabTextoActivo: { color: '#000000' },
  seccion: { padding: 20 },
  tarjeta: { backgroundColor: '#FFFFFF', padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tarjetaTitulo: { fontSize: 15, fontWeight: '600', color: '#000000' },
  tarjetaEstado: { fontSize: 10, color: '#000000', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  tarjetaFecha: { fontSize: 12, color: '#9CA3AF' },
  tarjetaItems: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  itemLinea: { fontSize: 13, color: '#4B5563', marginBottom: 8 },
  productoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  productoNombre: { fontSize: 14, fontWeight: '500', color: '#000000', flex: 1 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  toggleOn: { backgroundColor: '#10B981' },
  toggleOff: { backgroundColor: '#EF4444' },
  toggleTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  vacio: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 40, letterSpacing: 1 },
  tarjetaForm: { backgroundColor: '#FFFFFF', padding: 24, marginBottom: 40, borderWidth: 1, borderColor: '#E5E7EB' },
  seccionTitulo: { fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' },
  seccionSubtitulo: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' },
  input: { backgroundColor: '#FAFAFA', padding: 16, marginBottom: 16, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', color: '#000000' },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginBottom: 16 },
  checkTexto: { fontSize: 14, color: '#4B5563' },
  checkBox: { width: 20, height: 20, borderWidth: 1, borderColor: '#D1D5DB' },
  checkBoxActivo: { backgroundColor: '#000000', borderColor: '#000000' },
  botonCrear: { backgroundColor: '#000000', padding: 16, alignItems: 'center' },
  botonCrearTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  tarjetaLider: { backgroundColor: '#FFFFFF', padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tarjetaCodigo: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  botonEliminar: { padding: 10 },
  botonEliminarTexto: { color: '#EF4444', fontSize: 16, fontWeight: '300' }
});

const modal = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center', padding: 24 },
  caja: { backgroundColor: '#FFFFFF', padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: {width: 0, height: 20}, shadowOpacity: 0.1, shadowRadius: 30, elevation: 10 },
  titulo: { fontSize: 18, fontWeight: '700', color: '#000000', marginBottom: 32, letterSpacing: 2, textTransform: 'uppercase' },
  input: { backgroundColor: '#FAFAFA', width: '100%', padding: 16, fontSize: 20, marginBottom: 32, textAlign: 'center', borderWidth: 1, borderColor: '#E5E7EB', color: '#000000', letterSpacing: 4 },
  boton: { backgroundColor: '#000000', flex: 1, paddingVertical: 16, alignItems: 'center' },
  botonTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  botonCancelar: { backgroundColor: '#F3F4F6', flex: 1, paddingVertical: 16, alignItems: 'center' },
  botonTextoCancelar: { color: '#4B5563', fontSize: 13, fontWeight: '700', letterSpacing: 2 }
});
