const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static("public"));

// DESCARGA
app.get("/download", (req, res) => {
  const url = req.query.url;

  if (!url) return res.send("Falta URL");

  // evita caracteres problemáticos en nombres
  const output = "%(title).50s.%(ext)s";

  const command = `yt-dlp -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "${output}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.log(stderr);
      return res.send("Error al descargar");
    }

    // buscar archivo más reciente
    const files = fs.readdirSync("./")
      .filter(f => f.endsWith(".mp4"))
      .map(f => ({
        name: f,
        time: fs.statSync(f).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      return res.send("No se encontró el archivo");
    }

    const file = files[0].name;
    const filePath = path.join(__dirname, file);

    res.download(filePath, file, (err) => {
      if (!err) {
        fs.unlinkSync(filePath); // borrar después
      }
    });
  });
});

// 🔥 IMPORTANTE PARA RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(" Server corriendo en puerto " + PORT);
});
