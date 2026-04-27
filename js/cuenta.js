// ================================================
// cuenta.js — Módulo Cuenta (Perfil + Hijos asignados)
// ================================================

function initCuenta(contenedor) {
    const rol = localStorage.getItem("rol");
    if (rol === "padre") {
        renderCuentaPadre(contenedor);
    } else {
        renderCuentaGenerica(contenedor);
    }
}

/* ==================== VISTA PADRE (Perfil + Hijos) ==================== */
function renderCuentaPadre(cont) {
    const datos = getUsuarioActual();
    const hijos = getHijosPadre();
    
    if (!datos) { 
        cont.innerHTML = "<p class='vacio'>No se encontraron datos.</p>"; 
        return; 
    }

    const inicial = (datos.nombre || "").charAt(0).toUpperCase();

    cont.innerHTML = `
        <div class="cuenta-wrapper">
            <!-- PERFIL -->
            <div class="cuenta-card">
                <div class="cuenta-avatar">${inicial}</div>
                <div class="cuenta-nombre">${escapeHTML(datos.nombre || datos.usuario)}</div>
                <div class="cuenta-rol-badge">👨‍👩‍👧 Padre de Familia</div>
                <div class="cuenta-info">
                    <div class="cuenta-fila">
                        <span class="cuenta-label">👤 Usuario</span>
                        <span class="cuenta-valor">${escapeHTML(datos.usuario)}</span>
                    </div>
                    <div class="cuenta-fila">
                        <span class="cuenta-label">🔑 Contraseña</span>
                        <span class="cuenta-valor cuenta-pass">••••••••</span>
                    </div>
                    <div class="cuenta-fila">
                        <span class="cuenta-label">🏫 Rol</span>
                        <span class="cuenta-valor">${escapeHTML(datos.rol)}</span>
                    </div>
                </div>
            </div>

            <!-- HIJOS ASIGNADOS -->
            <div class="hijos-section">
                <div class="hijos-header">
                    <h3>👨‍👩‍👧 Mis Hijos</h3>
                    <span class="hijos-count">${hijos.length} estudiante${hijos.length > 1 ? "s" : ""} a cargo</span>
                </div>
                <div class="hijos-grid">
                    ${hijos.length ? hijos.map(h => `
                        <div class="hijo-card">
                            <div class="hijo-avatar">${h.nombre.charAt(0).toUpperCase()}</div>
                            <div class="hijo-info">
                                <h4>${escapeHTML(h.nombre)}</h4>
                                <div class="hijo-badges">
                                    <span class="badge badge-grado">📚 ${h.grado}° Grado</span>
                                    <span class="badge badge-seccion">🏫 Sección ${h.seccion}</span>
                                </div>
                                <p class="hijo-dni">DNI: ${h.dni}</p>
                            </div>
                        </div>
                    `).join("") : "<p class='sin-hijos'>No tienes estudiantes asignados.</p>"}
                </div>
            </div>
        </div>
    `;
}

/* ==================== VISTA PROFESOR/ADMIN ==================== */
function renderCuentaGenerica(cont) {
    const datos = getUsuarioActual();
    if (!datos) { 
        cont.innerHTML = "<p class='vacio'>No se encontraron datos.</p>"; 
        return; 
    }

    const inicial = (datos.nombre || "").charAt(0).toUpperCase();
    const rolLabel = datos.rol === "profesor" ? "👨‍🏫 Profesor" : "⚙️ Administrador";

    cont.innerHTML = `
        <div class="cuenta-wrapper">
            <div class="cuenta-card">
                <div class="cuenta-avatar">${inicial}</div>
                <div class="cuenta-nombre">${escapeHTML(datos.nombre || datos.usuario)}</div>
                ${datos.rol === "profesor" ? `<div class="cuenta-curso">${datos.emoji || "📚"} ${escapeHTML(datos.curso || "")}</div>` : ""}
                <div class="cuenta-rol-badge">${rolLabel}</div>
                <div class="cuenta-info">
                    <div class="cuenta-fila">
                        <span class="cuenta-label">👤 Usuario</span>
                        <span class="cuenta-valor">${escapeHTML(datos.usuario)}</span>
                    </div>
                    <div class="cuenta-fila">
                        <span class="cuenta-label">🔑 Contraseña</span>
                        <span class="cuenta-valor cuenta-pass">••••••••</span>
                    </div>
                    ${datos.rol === "profesor" ? `
                    <div class="cuenta-fila">
                        <span class="cuenta-label">📖 Curso</span>
                        <span class="cuenta-valor">${escapeHTML(datos.curso || "—")}</span>
                    </div>` : ""}
                    <div class="cuenta-fila">
                        <span class="cuenta-label">🏫 Rol</span>
                        <span class="cuenta-valor">${escapeHTML(datos.rol)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}