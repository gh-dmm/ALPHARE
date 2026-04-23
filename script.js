// ==========================================
// CONFIGURACIÓN DE ALPHARE
// ==========================================
const CONFIG = {
    showVideo: false,               // true para mostrar, false para ocultar
    youtubeURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", // URL de EMBED
    
};

// ==========================================
// LÓGICA DEL VIDEO
// ==========================================
const videoSection = document.getElementById('videoContainer');
const videoIframe = document.getElementById('alphareVideo');

if (CONFIG.showVideo) {
    videoSection.style.display = 'flex';
    videoIframe.src = CONFIG.youtubeURL;
} else {
    videoSection.style.display = 'none';
}
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('startBtn');

let isSimulating = false;
let offset = 0;
const fs = 500; // Frecuencia de muestreo ajustada para web

// Datos del modelo
let estado = {
    cog: "Esperando...",
    emo: "Inactivo",
    jerarquia: ""
};

// --- Función de Procesamiento (Tu lógica de MATLAB) ---
function runNeuroSimulation() {
    // 1. Generación Estocástica (Equivalente a tu randi)
    const modoAlpha = Math.random() > 0.5;
    
    // Amplitudes (A) según tu script
    // [Delta, Theta, Alpha, Beta, Gamma]
    let A = modoAlpha ? [2, 5, 40, 10, 5] : [2, 10, 5, 40, 15];
    let F = [2, 6, 10, 22, 35]; // Frecuencias centrales de cada banda

    // 2. Clasificación (Tu lógica de potencias P)
    // Cog: Si Alpha > Theta y Alpha > Beta
    if (A[2] > A[1] && A[2] > A[3]) {
        estado.cog = "Estado de Flujo (Alpha Dominante)";
    } else {
        estado.cog = "Carga Cognitiva Alta";
    }

    // Emo: Basado en Gamma y Beta
    if (A[4] > A[3]) {
        estado.emo = "Excitación / Enfoque";
    } else if (A[3] > A[2]) {
        estado.emo = "Estrés / Alerta";
    } else {
        estado.emo = "Tranquilidad";
    }

    // 3. Jerarquía
    const bandas = ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'];
    let pares = A.map((amp, i) => ({ amp, nombre: bandas[i] }));
    pares.sort((a, b) => b.amp - a.amp);
    estado.jerarquia = pares.map(p => p.nombre).join(' > ');
}

// --- Animación del Canvas ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    
    if (isSimulating) {
        // Dibujar señal "filtrada" (Simulación de la suma de senos del .m)
        ctx.strokeStyle = '#00d4ff';
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x++) {
            let t = (x + offset) * 0.02;
            // Recreamos la señal bruta de tu MATLAB: Suma de frecuencias
            // Simplificado para visualización en tiempo real
            let y = 0;
            const amps = isSimulating ? [5, 8, 30, 5, 2] : [2, 2, 2, 2, 2];
            const freqs = [0.01, 0.05, 0.1, 0.2, 0.4];
            
            freqs.forEach((f, i) => {
                y += Math.sin(t * f * 10) * amps[i];
            });

            const posY = (canvas.height / 2) + y;
            if (x === 0) ctx.moveTo(x, posY);
            else ctx.lineTo(x, posY);
        }
        ctx.stroke();
        
        // Actualizar interfaz con los datos del modelo
        updateUI();
    } else {
        // Onda Alpha de espera
        drawIdleWave();
    }
    
    offset += 2; 
    requestAnimationFrame(draw);
}

function drawIdleWave() {
    ctx.strokeStyle = 'rgba(112, 0, 255, 0.3)';
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
        let y = Math.sin(x * 0.01 + offset * 0.02) * 20 + (canvas.height / 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function updateUI() {
    const tagline = document.querySelector('.tagline');
    tagline.innerHTML = `
        <span style="color: #00d4ff;">${estado.cog}</span> | 
        <span style="color: #7000ff;">${estado.emo}</span><br>
        <small style="font-size: 0.8rem; color: #555;">${estado.jerarquia}</small>
    `;
}

// --- Eventos ---
// --- Eventos y Control de Repeticiones ---
btn.addEventListener('click', () => {
    // Generar un "randi" entre 4 y 10
    const repeticionesTotales = Math.floor(Math.random() * (10 - 4 + 1)) + 4;
    let ejecucionesActuales = 0;

    isSimulating = true;
    btn.innerText = "Analizando Cerebro...";
    btn.disabled = true; // Desactivamos el botón durante el proceso
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";

    //console.log(`Simulación iniciada. Se repetirá ${repeticionesTotales} veces.`);

    // Función que se ejecuta de forma recursiva
    function ejecutarCiclo() {
        if (ejecucionesActuales < repeticionesTotales) {
            runNeuroSimulation(); // Tu lógica de MATLAB traducida
            ejecucionesActuales++;
            
            // Espera 3 segundos antes del siguiente ciclo
            setTimeout(ejecutarCiclo, 3000);
        } else {
            // Finalización de la simulación
            isSimulating = false;
            btn.disabled = false;
            btn.innerText = "Reiniciar Análisis";
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            
            // Mensaje final en la interfaz
            const tagline = document.querySelector('.tagline');
            tagline.innerHTML += "<br><strong style='color:var(--primary)'>Sesión Finalizada. Datos guardados.</strong>";
        }
    }

    ejecutarCiclo(); // Primera ejecución
});

// Ajuste de pantalla
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.4;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.4;

draw();