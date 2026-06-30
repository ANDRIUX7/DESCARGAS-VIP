const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static("public"));

// RUTA FIJA DE YT-DLP EN RENDER
const YTDLP_PATH = "/opt/render/.local/bin/yt-dlp";

app.get("/download", (req, res) => {
  const url = req.query.url;

  if (!url) return res.send("Falta URL");

  // Forzamos a que guarde en la carpeta temporal /tmp de Render
  const outputTemplate = path.join("/tmp", "%(title).50s.%(ext)s");

  // Usamos la ruta absoluta de yt-dlp
  const command = `"${YTDLP_PATH}" -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "${outputTemplate}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Detalle del error:", stderr || err.message);
      return res.status(500).send("Error al descargar el video");
    }

    // Buscar archivo más reciente estrictamente en /tmp
    const files = fs.readdirSync("/tmp")
      .filter(f => f.endsWith(".mp4"))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join("/tmp", f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      return res.send("No se encontró el archivo en el servidor");
    }

    const file = files[0].name;
    const filePath = path.join("/tmp", file);

    // Enviar al usuario y borrar inmediatamente después
    res.download(filePath, file, (downloadErr) => {
      if (!downloadErr) {
        try {
          fs.unlinkSync(filePath); 
        } catch (unlinkErr) {
          console.error("No se pudo borrar el archivo temporal:", unlinkErr);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Server corriendo en puerto " + PORT);
});
