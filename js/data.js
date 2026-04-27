// ================================================
// data.js — Base de datos completa + Helpers
// ================================================

const USUARIOS_DB = [
    // PADRES
    { rol: "padre", usuario: "1001", password: "1234", nombre: "Carlos Perez",      hijos: [{ nombre: "Juan Perez",     dni: "2001", grado: "3", seccion: "A" }, { nombre: "Sofia Perez",    dni: "2002", grado: "1", seccion: "B" }] },
    { rol: "padre", usuario: "1002", password: "1234", nombre: "Maria Lopez",      hijos: [{ nombre: "Diego Lopez",    dni: "2003", grado: "2", seccion: "A" }] },
    { rol: "padre", usuario: "1003", password: "1234", nombre: "Luis Torres",      hijos: [{ nombre: "Camila Torres",  dni: "2004", grado: "5", seccion: "B" }] },
    { rol: "padre", usuario: "1004", password: "1234", nombre: "Ana Ruiz",         hijos: [{ nombre: "Mateo Ruiz",     dni: "2005", grado: "4", seccion: "A" }] },
    { rol: "padre", usuario: "1005", password: "1234", nombre: "Pedro Gomez",      hijos: [{ nombre: "Valeria Gomez",  dni: "2006", grado: "3", seccion: "B" }] },
    { rol: "padre", usuario: "1006", password: "1234", nombre: "Rosa Diaz",        hijos: [{ nombre: "Lucas Diaz",     dni: "2007", grado: "2", seccion: "A" }] },
    { rol: "padre", usuario: "1007", password: "1234", nombre: "Miguel Castro",    hijos: [{ nombre: "Martina Castro", dni: "2008", grado: "1", seccion: "A" }] },
    { rol: "padre", usuario: "1008", password: "1234", nombre: "Lucia Vargas",     hijos: [{ nombre: "Thiago Vargas",  dni: "2009", grado: "5", seccion: "B" }] },
    { rol: "padre", usuario: "1009", password: "1234", nombre: "Jose Rojas",       hijos: [{ nombre: "Daniel Rojas",   dni: "2010", grado: "4", seccion: "A" }] },
    { rol: "padre", usuario: "1010", password: "1234", nombre: "Elena Flores",     hijos: [{ nombre: "Juan Perez",     dni: "2001", grado: "3", seccion: "A" }] },

    // PROFESORES
    { rol: "profesor", usuario: "jrubio",    password: "1234", nombre: "Jose Luis Rubio Altuna",         curso: "CyT",            emoji: "🔬" },
    { rol: "profesor", usuario: "ccalixto",  password: "1234", nombre: "Carmen Rosaura Calixto Argomedo", curso: "CyT",            emoji: "🔬" },
    { rol: "profesor", usuario: "gpena",     password: "1234", nombre: "Gloria Edilma Peña Novoa",        curso: "Inglés",         emoji: "🌎" },
    { rol: "profesor", usuario: "cazanedo",  password: "1234", nombre: "Corina Elizabeth Azañedo Suarez", curso: "Inglés",         emoji: "🌎" },
    { rol: "profesor", usuario: "msaldana",  password: "1234", nombre: "Maria del Rosario Saldaña Elias", curso: "Comunicación",   emoji: "📚" },
    { rol: "profesor", usuario: "aaguilar",  password: "1234", nombre: "Alida Aguilar Carrión",          curso: "Comunicación",   emoji: "📚" },
    { rol: "profesor", usuario: "lsuarez",   password: "1234", nombre: "Luis Enrique Suarez Avalos",     curso: "CCSS",           emoji: "🌎" },
    { rol: "profesor", usuario: "sdetan",    password: "1234", nombre: "Silvia Detan Sipiran",           curso: "CCSS",           emoji: "🌎" },
    { rol: "profesor", usuario: "ogarcia",   password: "1234", nombre: "Omero García Fernández",         curso: "IP",             emoji: "💻" },
    { rol: "profesor", usuario: "acueva",    password: "1234", nombre: "Aydee Cueva Vasquez",            curso: "Religión",       emoji: "🎓" },
    { rol: "profesor", usuario: "vvalencia", password: "1234", nombre: "Viviana Valencia Chalco",          curso: "EPT",            emoji: "🎓" },
    { rol: "profesor", usuario: "cleon",     password: "1234", nombre: "Carlos Diego Leon Villacorta",   curso: "DPCC",           emoji: "🎓" },
    { rol: "profesor", usuario: "diglesias", password: "1234", nombre: "Dany Daniel Iglesias Vasquez",   curso: "Educación Física", emoji: "🎓" },

    // ADMIN
    { rol: "admin", usuario: "admin", password: "admin123", nombre: "Administrador", curso: "", emoji: "⚙️" }
];

// Estudiantes únicos
const ESTUDIANTES = [];
USUARIOS_DB.forEach(user => {
    if (user.rol === "padre" && user.hijos) {
        user.hijos.forEach(hijo => {
            if (!ESTUDIANTES.some(e => e.dni === hijo.dni)) {
                ESTUDIANTES.push({ ...hijo });
            }
        });
    }
});

// Helpers
function getUsuarioActual() {
    const usuario = localStorage.getItem("usuario");
    const rol = localStorage.getItem("rol");
    return USUARIOS_DB.find(u => u.usuario === usuario && u.rol === rol);
}

function getHijosPadre() {
    const user = getUsuarioActual();
    return user && user.hijos ? user.hijos : [];
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
}

function toast(msg, tipo = "success") {
    const container = document.getElementById("toast-container");
    const t = document.createElement("div");
    t.className = `toast toast-${tipo}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function leerArchivo(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve({ base64: e.target.result, tipo: file.type, nombre: file.name });
        reader.readAsDataURL(file);
    });
}

// Modal global
function abrirModal(src) {
    const modal = document.getElementById("modal-global");
    const img = document.getElementById("img-global");
    img.src = src;
    modal.style.display = "flex";
}

function cerrarModalGlobal() {
    document.getElementById("modal-global").style.display = "none";
}

document.addEventListener("click", e => {
    const modal = document.getElementById("modal-global");
    if (modal && e.target === modal) modal.style.display = "none";
});