// ================================================
// comportamiento.js — Módulo Comportamiento (Padre + Profesor)
// ================================================

function initComportamiento(contenedor) {
    const rol = localStorage.getItem("rol");
    if (rol === "profesor") {
        renderComportProfesor(contenedor);
    } else {
        renderComportPadre(contenedor);
    }
}

/* ==================== VISTA PADRE ==================== */
function renderComportPadre(cont) {
    const data = JSON.parse(localStorage.getItem("comportamientos") || "[]");
    const hijos = getHijosPadre();

    if (!hijos.length) { 
        cont.innerHTML = "<p class='vacio'>No tienes hijos asignados</p>"; 
        return; 
    }
    if (!data.length) { 
        cont.innerHTML = "<p class='vacio'>No hay comunicados aún</p>"; 
        return; 
    }

    const filtrado = data.filter(c => hijos.some(h => h.dni === c.estudiante)).reverse();
    if (!filtrado.length) { 
        cont.innerHTML = "<p class='vacio'>No hay comunicados para tus hijos</p>"; 
        return; 
    }

    cont.innerHTML = filtrado.map(c => `
        <div class="card-msg">
            <div class="header-msg">
                <div class="nota-header">
                    <h4>${escapeHTML(c.emoji || "👨‍🏫")} De: <strong>${escapeHTML(c.profesor || "Profesor")}</strong>
                        ${c.curso ? `<span class="curso-tag">${escapeHTML(c.curso)}</span>` : ""}
                    </h4>
                    <span class="fecha">📅 ${escapeHTML(c.fecha || "")}</span>
                </div>
                <div class="destinatario-badge">
                    👦 Para: <strong>${escapeHTML(c.nombre)}</strong>
                    <span class="grado-badge">${escapeHTML(c.grado)}° ${escapeHTML(c.seccion)}</span>
                </div>
            </div>
            <p class="mensaje">${escapeHTML(c.mensaje)}</p>
        </div>
    `).join("");
}

/* ==================== VISTA PROFESOR ==================== */
let selComp = null;

function renderComportProfesor(cont) {
    selComp = null;
    cont.innerHTML = `
        <div class="box">
            <h3>📢 Enviar Comunicado</h3>
            <input type="text" id="buscarComp" placeholder="Buscar estudiante..." oninput="buscarComp()">
            <div id="listaComp" class="lista-scroll"></div>
            <div class="seleccionado-box">
                <h4>Estudiante seleccionado:</h4>
                <div id="selCompBox"><p class="hint">Ninguno</p></div>
            </div>
            <textarea id="msgComp" class="mensaje" placeholder="Escribe el comportamiento o comunicado..."></textarea>
            <button class="btn-enviar" onclick="enviarComp()">📨 Enviar</button>
            <hr class="separador">
            <h3>📋 Mi Historial</h3>
            <div id="previewComp"></div>
        </div>
    `;
    mostrarHistorialComp();
}

function buscarComp() {
    const texto = document.getElementById("buscarComp").value.toLowerCase();
    const lista = document.getElementById("listaComp");
    lista.innerHTML = "";
    if (!texto) return;

    ESTUDIANTES.filter(est => est.nombre.toLowerCase().includes(texto)).forEach(est => {
        const div = document.createElement("div");
        div.className = "item-estudiante";
        div.innerHTML = `
            <span>
                <strong>${escapeHTML(est.nombre)}</strong>
                <small>${est.grado}° ${est.seccion}</small>
            </span>
            <button class="btn-agregar" onclick="seleccionarComp('${est.dni}')">Seleccionar</button>
        `;
        lista.appendChild(div);
    });
}

function seleccionarComp(dni) {
    const est = ESTUDIANTES.find(e => e.dni === dni);
    if (!est) return;
    selComp = est;
    document.getElementById("buscarComp").value = "";
    document.getElementById("listaComp").innerHTML = "";
    document.getElementById("selCompBox").innerHTML = 
        `<span class="tag">${escapeHTML(est.nombre)} (${est.grado}° ${est.seccion})</span>`;
}

function enviarComp() {
    if (!selComp) return alert("Selecciona un estudiante");
    const msg = document.getElementById("msgComp").value.trim();
    if (!msg) return alert("Escribe un mensaje");

    const prof = getUsuarioActual();
    let data = JSON.parse(localStorage.getItem("comportamientos") || "[]");
    data.unshift({
        id: Date.now(),
        estudiante: selComp.dni,
        nombre: selComp.nombre,
        grado: selComp.grado,
        seccion: selComp.seccion,
        mensaje: msg,
        fecha: new Date().toLocaleString(),
        profesor: prof?.nombre || prof?.usuario,
        curso: prof?.curso || "",
        emoji: prof?.emoji || "👨‍🏫"
    });

    localStorage.setItem("comportamientos", JSON.stringify(data));
    document.getElementById("msgComp").value = "";
    selComp = null;
    document.getElementById("selCompBox").innerHTML = "<p class='hint'>Ninguno</p>";
    mostrarHistorialComp();
    toast("✅ Comunicado enviado");
}

function mostrarHistorialComp() {
    const cont = document.getElementById("previewComp");
    if (!cont) return;
    
    const prof = getUsuarioActual();
    const data = JSON.parse(localStorage.getItem("comportamientos") || "[]")
        .filter(c => c.profesor === (prof?.nombre || prof?.usuario));

    if (!data.length) { 
        cont.innerHTML = "<p class='vacio'>No hay comunicados enviados aún</p>"; 
        return; 
    }

    cont.innerHTML = data.map(c => `
        <div class="card-msg">
            <div class="header">
                <h4>${escapeHTML(c.nombre)}</h4>
                <span class="fecha">${escapeHTML(c.fecha)}</span>
            </div>
            <div class="profesor-badge">
                ${escapeHTML(c.emoji || "👨‍🏫")} ${escapeHTML(c.profesor)} 
                ${c.curso ? "· " + escapeHTML(c.curso) : ""}
            </div>
            <span class="detalle">${escapeHTML(c.grado)}° ${escapeHTML(c.seccion)}</span>
            <p id="texto-${c.id}">${escapeHTML(c.mensaje)}</p>
            <textarea id="input-${c.id}" class="edit-input" style="display:none;">${escapeHTML(c.mensaje)}</textarea>
            <div class="acciones">
                <button onclick="activarEdicionC(${c.id})" class="btn-editar">✏️</button>
                <button onclick="guardarEdicionC(${c.id})" class="btn-guardar">💾</button>
                <button onclick="eliminarComp(${c.id})" class="btn-eliminar">❌</button>
            </div>
        </div>
    `).join("");
}

function activarEdicionC(id) {
    document.getElementById("texto-" + id).style.display = "none";
    document.getElementById("input-" + id).style.display = "block";
}

function guardarEdicionC(id) {
    const nuevo = document.getElementById("input-" + id).value.trim();
    if (!nuevo) return alert("Mensaje vacío");
    let data = JSON.parse(localStorage.getItem("comportamientos") || "[]");
    data = data.map(c => c.id === id ? {...c, mensaje: nuevo} : c);
    localStorage.setItem("comportamientos", JSON.stringify(data));
    mostrarHistorialComp();
    toast("💾 Guardado");
}

function eliminarComp(id) {
    if (!confirm("¿Eliminar este comunicado?")) return;
    let data = JSON.parse(localStorage.getItem("comportamientos") || "[]");
    data = data.filter(c => c.id !== id);
    localStorage.setItem("comportamientos", JSON.stringify(data));
    mostrarHistorialComp();
    toast("🗑️ Eliminado");
}