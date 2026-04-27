// ================================================
// app.js — Login + Dashboard + Router principal
// ================================================

/* ==================== LOGIN ==================== */
if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const usuarioInput = document.getElementById("usuario").value.trim();
        const passwordInput = document.getElementById("password").value.trim();
        const error = document.getElementById("error");
        error.textContent = "";

        const usuario = USUARIOS_DB.find(u => 
            u.usuario === usuarioInput && u.password === passwordInput
        );

        if (usuario) {
            localStorage.clear();
            localStorage.setItem("rol", usuario.rol);
            localStorage.setItem("usuario", usuario.usuario);
            localStorage.setItem("loginTime", Date.now());
            if (usuario.rol === "padre" && usuario.hijos) {
                localStorage.setItem("hijos", JSON.stringify(usuario.hijos));
            }
            window.location.href = "dashboard.html";
        } else {
            error.textContent = "❌ Usuario o contraseña incorrectos";
        }
    });
}

/* ==================== DASHBOARD ==================== */
if (document.getElementById("menu")) {
    initDashboard();
}

function initDashboard() {
    const rol = localStorage.getItem("rol");
    const usuario = localStorage.getItem("usuario");

    // Verificar sesión (expira en 8 horas)
    const loginTime = parseInt(localStorage.getItem("loginTime") || "0");
    if (!rol || !usuario || (Date.now() - loginTime > 8 * 60 * 60 * 1000)) {
        cerrarSesion();
        return;
    }

    const datos = getUsuarioActual();
    document.getElementById("bienvenida").textContent = 
        "Bienvenido " + (datos?.nombre || usuario);

    // Menús por rol (SIN "Estudiante")
    const menus = {
        padre:    ["Notas", "Comportamiento", "Cuenta"],
        profesor: ["Notas", "Comportamiento", "Cuenta"],
        admin:    ["Notas", "Comportamiento", "Cuenta"]
    };

    const menuEl = document.getElementById("menu");
    (menus[rol] || []).forEach((opcion, idx) => {
        const li = document.createElement("li");
        li.textContent = opcion;
        if (idx === 0) li.classList.add("active");
        li.onclick = () => {
            menuEl.querySelectorAll("li").forEach(el => el.classList.remove("active"));
            li.classList.add("active");
            cargarModulo(opcion);
        };
        menuEl.appendChild(li);
    });

    // Cargar primer módulo
    cargarModulo(menus[rol][0]);
}

function cargarModulo(opcion) {
    const content = document.getElementById("content-area");
    content.innerHTML = "";
    
    // Cargar CSS específico del módulo
    const cssId = "css-" + opcion.toLowerCase();
    let cssLink = document.getElementById(cssId);
    if (!cssLink) {
        cssLink = document.createElement("link");
        cssLink.id = cssId;
        cssLink.rel = "stylesheet";
        cssLink.href = "css/" + opcion.toLowerCase() + ".css";
        document.head.appendChild(cssLink);
    }
    
    const cont = document.createElement("div");
    cont.id = "modulo-contenido";
    content.appendChild(cont);
    
    switch(opcion) {
        case "Notas": 
            initNotas(cont); 
            break;
        case "Comportamiento": 
            initComportamiento(cont); 
            break;
        case "Cuenta": 
            initCuenta(cont); 
            break;
    }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "login.html";
}