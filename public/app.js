function login() {
  const pass = document.getElementById("pass").value;

  if (pass === "ANDRIUXVIP7") {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";

    //  CAMBIAR FONDO A GIF
    document.body.style.background = "url('https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3lyczk5Yno1bW55Z2t2OGp5MWY0eGE2b3Ryc3c0eTQ0a2RoczVxMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3f63VcWeaGeaQ6AfKk/giphy.gif') no-repeat center center fixed";
    document.body.style.backgroundSize = "cover";

  } else {
    alert("Contraseña incorrecta");
  }
}
function descargar() {
  const url = document.getElementById("url").value;
  const bar = document.getElementById("bar");

  let progreso = 0;

  const interval = setInterval(() => {
    progreso += 1;
    bar.style.width = progreso + "%";

    if (progreso >= 100) clearInterval(interval);
  }, 100); // 100ms x 100 = 10 segundos

  window.location.href = `/download?url=${encodeURIComponent(url)}`;
}
