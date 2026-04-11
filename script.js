// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js');
  });
}

const tabs = document.querySelectorAll(".tab");
const contenedor = document.getElementById("contenido");

const cache = {}; // cache en memoria

async function cargarPanel(ruta) {
  try {
    // Si ya lo cargaste antes → usa memoria
    if (cache[ruta]) {
      contenedor.innerHTML = cache[ruta];
      return;
    }

    const res = await fetch(`/Panels/${ruta}`);
    const html = await res.text();

    cache[ruta] = html;
    contenedor.innerHTML = html;

  } catch (err) {
    contenedor.innerHTML = "<p>Error cargando contenido</p>";
  }
}

// Eventos de tabs
tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    // UI activa
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    // Cargar contenido
    const archivo = tab.dataset.panel;
    cargarPanel(archivo);
  });
});

// Cargar el primer tab al iniciar
cargarPanel("PedidosPanel.html");
