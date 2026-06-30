const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const app = express();
app.use(express.static("public"));

// Localiza el ejecutable directamente dentro de node_modules sin descargar nada
const YTDLP_PATH = path.join(__dirname, "node_modules", "yt-dlp-exec", "bin", "yt-dlp");

app.get("/download", (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("Falta URL");

  const outputTemplate = path.join("/tmp", "%(title).50s.%(ext)s");

  // Ejecución directa con el binario local empaquetado
  const command = `"${YTDLP_PATH}" -f "bestvideo+bestaudio/best" --merge-output-format mp4 --ffmpeg-location "${ffmpeg}" -o "${outputTemplate}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Error ejecucion:", stderr || err.message);
      return res.status(500).send("Error al descargar el video");
    }

    const files = fs.readdirSync("/tmp")
      .filter(f => f.endsWith(".mp4"))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join("/tmp", f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      return res.status(404).send("No se encontró el archivo");
    }

    const file = files[0].name;
    const filePath = path.join("/tmp", file);

    res.download(filePath, file, (downloadErr) => {
      if (!downloadErr) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Servidor operativo de forma local en puerto " + PORT);
});
