const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.static("public"));

app.get("/info", (req, res) => {
  const url = req.query.url;

  exec(`yt-dlp -j "${url}"`, (err, stdout) => {
    if (err) return res.status(500).send("Error");

    const data = JSON.parse(stdout);

    res.json({
      title: data.title,
      thumbnail: data.thumbnail
    });
  });
});

app.get("/download", (req, res) => {
  const url = req.query.url;

  if (!url) return res.send("Falta URL");

  const command = `yt-dlp -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "%(title)s.%(ext)s" "${url}"`;

  const { exec } = require("child_process");

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.log(stderr);
      return res.send("Error al descargar");
    }

    // buscar el archivo descargado
    const fs = require("fs");
    const files = fs.readdirSync("./").filter(f => f.endsWith(".mp4"));

    const file = files[files.length - 1];

    res.download(file, file, () => {
      fs.unlinkSync(file);
    });
  });
});
