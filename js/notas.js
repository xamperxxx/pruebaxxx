// ================================================
// notas.js — Módulo Notas (Padre + Profesor)
// ================================================

function initNotas(contenedor) {
    const rol = localStorage.getItem("rol");
    if (rol === "profesor") {
        renderNotasProfesor(contenedor);
    } else {
        renderNotasPadre(contenedor);
    }
}

/* ==================== VISTA PADRE ==================== */
function renderNotasPadre(cont) {
    const notas = JSON.parse(localStorage.getItem("notas") || "[]");
    const hijos = getHijosPadre();

    if (!hijos.length) { 
        cont.innerHTML = "<p class='vacio'>No tienes hijos asignados.</p>"; 
        return; 
    }
    if (!notas.length) { 
        cont.innerHTML = "<p class='vacio'>No hay notas disponibles aún.</p>"; 
        return; 
    }

    const filtradas = notas.filter(n => hijos.some(h => h.dni === n.estudiante)).reverse();
    if (!filtradas.length) { 
        cont.innerHTML = "<p class='vacio'>No hay notas para tus hijos aún.</p>"; 
        return; 
    }

    cont.innerHTML = filtradas.map(n => {
        const hijo = hijos.find(h => h.dni === n.estudiante);
        return `
        <div class="card nota-card">
            <div class="nota-header">
                <div>
                    <h4>${escapeHTML(n.emoji || "👨‍🏫")} De: <strong>${escapeHTML(n.profesor || "Profesor")}</strong></h4>
                    ${n.curso ? `<span class="curso-tag">${escapeHTML(n.curso)}</span>` : ""}
                </div>
                <span class="fecha">${escapeHTML(n.fecha || "")}</span>
            </div>
            <div class="destinatario-badge">
                👦 Para: <strong>${escapeHTML(hijo?.nombre || n.nombre)}</strong>
                <span class="grado-badge">${escapeHTML(n.grado || "")}° ${escapeHTML(n.seccion || "")}</span>
            </div>
            <p class="mensaje-texto">${escapeHTML(n.mensaje || "")}</p>
            <div class="galeria-fotos">${generarGaleria(n)}</div>
        </div>`;
    }).join("");

    activarModalNotas();
}

function generarGaleria(n) {
    if (!n.archivos?.length) return "";
    return n.archivos.map(arc => {
        const esImg = arc.tipo?.startsWith("image");
        return `
        <div class="foto-item">
            ${esImg 
                ? `<img src="${arc.base64}" class="img-pequena" alt="${escapeHTML(arc.nombre)}" onclick="abrirModal('${arc.base64}')">`
                : `<div class="archivo-adjunto">📎 ${escapeHTML(arc.nombre)}</div>`}
            <a href="${arc.base64}" download="${escapeHTML(arc.nombre || 'archivo')}" class="btn-descargar">⬇ Descargar</a>
        </div>`;
    }).join("");
}

/* ==================== VISTA PROFESOR ==================== */
let selNotas = [];
let archivosNotas = [];

function renderNotasProfesor(cont) {
    selNotas = []; 
    archivosNotas = [];
    
    cont.innerHTML = `
        <div class="box">
            <h3>📚 Subir notas</h3>
            <div class="buscador">
                <input type="text" id="buscarNota" placeholder="Buscar nombre o DNI">
                <select id="gradoNota">
                    <option value="">Grado</option>
                    <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                </select>
                <select id="seccionNota">
                    <option value="">Sección</option>
                    <option>A</option><option>B</option>
                </select>
            </div>
            <div id="listaNotas" class="lista-scroll"></div>
            <div class="seleccionados-box">
                <h4>Seleccionados:</h4>
                <div id="selNotasBox"></div>
                <button class="btn-confirmar" onclick="confirmarNotas()">Confirmar</button>
            </div>
            <div id="formSubida" class="form-subida" style="display:none;">
                <textarea id="msgNota" placeholder="Escribe un mensaje..."></textarea>
                <input type="file" id="fileNota" multiple onchange="archivosNotas=Array.from(this.files)">
                <button class="btn-enviar" onclick="subirNotas()">📤 Enviar</button>
            </div>
        </div>
        <div id="previewNotas"></div>
    `;

    document.getElementById("buscarNota").addEventListener("input", buscarNotas);
    document.getElementById("gradoNota").addEventListener("change", buscarNotas);
    document.getElementById("seccionNota").addEventListener("change", buscarNotas);
    mostrarPreviewNotas();
}

function buscarNotas() {
    const texto = document.getElementById("buscarNota").value.toLowerCase();
    const grado = document.getElementById("gradoNota").value;
    const seccion = document.getElementById("seccionNota").value;
    const lista = document.getElementById("listaNotas");
    lista.innerHTML = "";

    const res = ESTUDIANTES.filter(est =>
        (est.nombre.toLowerCase().includes(texto) || est.dni.includes(texto)) &&
        (!grado || est.grado === grado) &&
        (!seccion || est.seccion === seccion) &&
        !selNotas.some(s => s.dni === est.dni)
    );

    res.forEach(est => {
        const div = document.createElement("div");
        div.className = "item-estudiante";
        div.innerHTML = `
            <span>
                <strong>${escapeHTML(est.nombre)}</strong>
                <small>${est.grado}° ${est.seccion}</small>
            </span>
            <button class="btn-agregar" onclick="agregarNota('${est.dni}')">Agregar</button>
        `;
        lista.appendChild(div);
    });
}

function agregarNota(dni) {
    const est = ESTUDIANTES.find(e => e.dni === dni);
    if (!est || selNotas.some(s => s.dni === dni)) return;
    selNotas.push(est);
    document.getElementById("buscarNota").value = "";
    buscarNotas();
    renderSelNotas();
}

function renderSelNotas() {
    const box = document.getElementById("selNotasBox");
    if (!selNotas.length) { 
        box.innerHTML = "<p class='hint'>No hay seleccionados</p>"; 
        return; 
    }
    box.innerHTML = selNotas.map((est, i) => 
        `<span class="tag">${escapeHTML(est.nombre)} <b onclick="quitarNota(${i})">×</b></span>`
    ).join("");
}

function quitarNota(i) {
    selNotas.splice(i, 1);
    buscarNotas();
    renderSelNotas();
}

function confirmarNotas() {
    if (!selNotas.length) return alert("Selecciona al menos un estudiante");
    document.getElementById("formSubida").style.display = "block";
}

async function subirNotas() {
    const msg = document.getElementById("msgNota").value.trim();
    if (!selNotas.length) return alert("Selecciona estudiantes");
    if (!archivosNotas.length) return alert("Selecciona archivos");

    const prof = getUsuarioActual();
    const notas = JSON.parse(localStorage.getItem("notas") || "[]");
    const archivos = await Promise.all(archivosNotas.map(leerArchivo));
    const fecha = new Date().toLocaleString();

    selNotas.forEach(est => {
        notas.unshift({
            id: Date.now() + Math.random(),
            estudiante: est.dni,
            nombre: est.nombre,
            grado: est.grado,
            seccion: est.seccion,
            archivos, 
            mensaje: msg, 
            fecha,
            profesor: prof?.nombre || prof?.usuario,
            curso: prof?.curso || "",
            emoji: prof?.emoji || "👨‍🏫"
        });
    });

    localStorage.setItem("notas", JSON.stringify(notas));
    selNotas = []; 
    archivosNotas = [];
    renderNotasProfesor(document.getElementById("modulo-contenido"));
    toast("✅ Notas enviadas correctamente");
}

function mostrarPreviewNotas() {
    const preview = document.getElementById("previewNotas");
    if (!preview) return;
    
    const prof = getUsuarioActual();
    const notas = JSON.parse(localStorage.getItem("notas") || "[]")
        .filter(n => n.profesor === (prof?.nombre || prof?.usuario));

    if (!notas.length) { 
        preview.innerHTML = "<p class='vacio'>No hay notas enviadas aún</p>"; 
        return; 
    }

    preview.innerHTML = notas.map(n => `
        <div class="card nota-card">
            <div class="header">
                <h4>👦 ${escapeHTML(n.nombre)}</h4>
                <span class="fecha">${escapeHTML(n.fecha)}</span>
            </div>
            <div class="profesor-badge">
                ${escapeHTML(n.emoji || "👨‍🏫")} ${escapeHTML(n.profesor)} 
                ${n.curso ? "· " + escapeHTML(n.curso) : ""}
            </div>
            <p class="mensaje-texto">${escapeHTML(n.mensaje || "")}</p>
            <div class="galeria">
                ${n.archivos.map(a => mostrarArchivoNota(a)).join("")}
            </div>
            <button class="btn-eliminar" onclick="eliminarNota('${n.id}')">❌ Eliminar</button>
        </div>
    `).join("");

    activarModalNotas();
}

function mostrarArchivoNota(a) {
    if (a.tipo?.startsWith("image")) {
        return `<img src="${a.base64}" class="img-click" alt="" onclick="abrirModal('${a.base64}')">`;
    }
    return `<a href="${a.base64}" download="${escapeHTML(a.nombre)}" class="archivo">📎 ${escapeHTML(a.nombre)}</a>`;
}

function eliminarNota(id) {
    if (!confirm("¿Eliminar esta nota?")) return;
    let notas = JSON.parse(localStorage.getItem("notas") || "[]");
    notas = notas.filter(n => n.id != id);
    localStorage.setItem("notas", JSON.stringify(notas));
    mostrarPreviewNotas();
    toast("🗑️ Nota eliminada");
}

function activarModalNotas() {
    document.querySelectorAll(".img-pequena, .img-click").forEach(img => {
        img.onclick = () => abrirModal(img.src);
    });
}