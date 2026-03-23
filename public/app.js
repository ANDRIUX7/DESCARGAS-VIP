async function obtenerInfo() {
  const url = document.getElementById("url").value;

  const res = await fetch(`/info?url=${encodeURIComponent(url)}`);
  const data = await res.json();

  document.getElementById("preview").innerHTML = `
    <h3>${data.title}</h3>
    <img src="${data.thumbnail}">
  `;
}

function descargar(tipo) {
  const url = document.getElementById("url").value;
  window.location.href = `/download?url=${encodeURIComponent(url)}&type=${tipo}`;
}