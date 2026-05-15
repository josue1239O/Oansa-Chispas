import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuVd8G8jKbhNpX0J7qYHhZCF2isMhIqgw",
  authDomain: "oansa-chispas.firebaseapp.com",
  projectId: "oansa-chispas",
  storageBucket: "oansa-chispas.firebasestorage.app",
  messagingSenderId: "185599059495",
  appId: "1:185599059495:web:ca201c2c60908f1e931002"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const productos = [
  { id: 'joya-roja', nombre: 'Joya Roja', color: '#E53935', imagen: 'https://previews.123rf.com/images/ryzhi/ryzhi1712/ryzhi171200006/90908800-realistic-red-ruby-isolated-on-white-background-shining-red-jewel-colorful-gemstone-can-be-used.jpg' },
  { id: 'joya-amarilla', nombre: 'Joya Amarilla', color: '#FFD700', imagen: 'https://www.shutterstock.com/image-photo/beautiful-yellow-diamond-closeup-threedimensional-260nw-2688031215.jpg' },
  { id: 'joya-azul', nombre: 'Joya Azul', color: '#1976D2', imagen: 'https://us.123rf.com/450wm/3dart/3dart2108/3dart210800086/173608336-hermoso-diamante-brillante-renderizado-en-3d-en-corte-brillante-sobre-fondo-blanco-fondo-de.jpg' },
  { id: 'joya-verde', nombre: 'Joya Verde', color: '#388E3C', imagen: 'https://us.123rf.com/450wm/ryzhi/ryzhi1609/ryzhi160900100/64720859-realista-joya-brillante-de-color-verde-esmeralda-con-la-reflexi%C3%B3n-y-brillo-verde-aislado-sobre-fondo.jpg' },
  { id: 'manualidad', nombre: 'Manualidad Chispitas', imagen: 'https://scontent.fsrz3-1.fna.fbcdn.net/v/t39.30808-6/511209762_9797215847043696_8674955153457822848_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_ohc=4b6sj5zp8kYQ7kNvwEus56H&_nc_oc=Adr10qySIyJ_ZCcWvehPDM9YfvRL7wcJTTCEGZQ3Lm-IQknLhEXdp-vyHRGsNojuXUQ&_nc_zt=23&_nc_ht=scontent.fsrz3-1.fna&_nc_gid=y-UmAEK6ELRtPYHLbhuCZg&_nc_ss=7a389&oh=00_Af0hY64ioAEjLlgmt-xRgQeXX8IwjKjrVKK8EMaRCFyFWw&oe=69EC26BD' },
  { id: 'cuaderno', nombre: 'Cuaderno de Actividades', imagen: 'https://scontent.fsrz3-1.fna.fbcdn.net/v/t39.30808-6/511209762_9797215847043696_8674955153457822848_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_ohc=4b6sj5zp8kYQ7kNvwEus56H&_nc_oc=Adr10qySIyJ_ZCcWvehPDM9YfvRL7wcJTTCEGZQ3Lm-IQknLhEXdp-vyHRGsNojuXUQ&_nc_zt=23&_nc_ht=scontent.fsrz3-1.fna&_nc_gid=y-UmAEK6ELRtPYHLbhuCZg&_nc_ss=7a389&oh=00_Af0hY64ioAEjLlgmt-xRgQeXX8IwjKjrVKK8EMaRCFyFWw&oe=69EC26BD' }
];

export async function guardarPedido(liderCode, items) {
  await addDoc(collection(db, 'pedidos'), {
    lider: liderCode,
    items,
    fecha: new Date(),
    estado: 'pendiente'
  });
}

export async function getPedidos() {
  const q = query(collection(db, 'pedidos'), orderBy('fecha', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function actualizarEstado(pedidoId, estado) {
  await setDoc(doc(db, 'pedidos', pedidoId), { estado }, { merge: true });
}

export async function getLideres() {
  const snap = await getDocs(collection(db, 'lideres'));
  return snap.docs.map(d => d.data());
}

export async function crearLider(codigo, nombre, esAdmin = false) {
  await setDoc(doc(db, 'lideres', codigo), { codigo, nombre, admin: esAdmin, createdAt: new Date() });
}