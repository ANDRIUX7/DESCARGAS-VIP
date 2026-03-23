function login() {
  const pass = document.getElementById("pass").value;

  if (pass === "ANDRIUXVIP7") {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    alert("Contraseña incorrecta");
  }
}

function descargar() {
  const url = document.getElementById("url").value;
  const bar = document.getElementById("bar");

  let progreso = 0;

  const interval = setInterval(() => {
    progreso += 10;
    bar.style.width = progreso + "%";

    if (progreso >= 90) clearInterval(interval);
  }, 500);

  window.location.href = `/download?url=${encodeURIComponent(url)}`;

  setTimeout(() => {
    bar.style.width = "100%";
  }, 4000);
}
