function login() {
    const pass = document.getElementById("pass");
    const error = document.getElementById("error");

    if (pass.value === "ANDRIUX") {
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else {
        error.style.display = "block";
        pass.value = "";
        pass.focus();
    }
}

function descargar() {
  const urlInput = document.getElementById("url");
  const url = urlInput.value;
  const bar = document.getElementById("bar");

  if (!url.trim()) {
    alert("Pega una URL primero");
    return;
  }

  let progreso = 0;

  const interval = setInterval(() => {
    progreso += 1;
    bar.style.width = progreso + "%";

    if (progreso >= 100) {
      clearInterval(interval);

      // Limpiar campo URL
      urlInput.value = "";

      // Reiniciar barra
      setTimeout(() => {
        bar.style.width = "0%";
      }, 1000);
    }
  }, 100);

  window.location.href = `/download?url=${encodeURIComponent(url)}`;
}
