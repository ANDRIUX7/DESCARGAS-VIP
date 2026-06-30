const express = require("express");
const fs = require("fs");
const path = require("path");
const youtubeDl = require("youtube-dl-exec");
const ffmpeg = require("ffmpeg-static");

const app = express();
app.use(express.static("public"));

app.get("/download", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("Falta URL");

  // Plantilla para guardar temporalmente en la carpeta /tmp de Render
  const outputTemplate = path.join("/tmp", "%(title).50s.%(ext)s");

  try {
    // Ejecución segura usando la librería nativa de Node.js
    await youtubeDl(url, {
      format: "bestvideo+bestaudio/best",
      mergeOutputFormat: "mp4",
      output: outputTemplate,
      ffmpegLocation: ffmpeg, // Usa el FFmpeg estático integrado
      noCheckCertificates: true
    });

    // Buscar el archivo .mp4 descargado más reciente en /tmp
    const files = fs.readdirSync("/tmp")
      .filter(f => f.endsWith(".mp4"))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join("/tmp", f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      return res.status(404).send("No se encontró el archivo en el servidor");
    }

    const file = files[0].name;
    const filePath = path.join("/tmp", file);

    // Forzar la descarga en el navegador del usuario y limpiar el servidor
    res.download(filePath, file, (downloadErr) => {
      if (!downloadErr) {
        try {
          fs.unlinkSync(filePath); 
        } catch (unlinkErr) {
          console.error("No se pudo borrar el archivo temporal:", unlinkErr);
        }
      }
    });

  } catch (error) {
    console.error("Error en la descarga:", error.message);
    return res.status(500).send("Error al procesar y descargar el video");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Server corriendo en puerto " + PORT);
});
