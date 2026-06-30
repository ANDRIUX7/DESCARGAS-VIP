const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const ffmpeg = require("ffmpeg-static");
const instagramGetUrl = require("instagram-url-direct");
const https = require("https");

const app = express();
app.use(express.static("public"));

const YTDLP_PATH = path.join(__dirname, "node_modules", "yt-dlp-exec", "bin", "yt-dlp");

app.get("/download", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("Falta URL");

  // --- CASO ESPECIAL: INSTAGRAM (SIN COOKIES Y SIN YT-DLP) ---
  if (url.includes("instagram.com")) {
    try {
      const links = await instagramGetUrl(url);
      if (!links || !links.url_list || links.url_list.length === 0) {
        return res.status(404).send("No se pudo obtener el video de Instagram");
      }

      const videoUrl = links.url_list[0];
      const tempFilePath = path.join("/tmp", `instagram-${Date.now()}.mp4`);
      const fileStream = fs.createWriteStream(tempFilePath);

      // Descarga directa del archivo de los servidores de Instagram a /tmp
      https.get(videoUrl, (response) => {
        response.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          res.download(tempFilePath, "instagram-video.mp4", (err) => {
            if (!err) { try { fs.unlinkSync(tempFilePath); } catch (e) {} }
          });
        });
      }).on("error", (err) => { throw err; });

    } catch (instaError) {
      console.error("Error Instagram:", instaError.message);
      return res.status(500).send("Error al procesar el enlace de Instagram");
    }
    return; // Detiene la ejecución aquí para que no pase a yt-dlp
  }

  // --- CASO GENERAL: TIKTOK, FACEBOOK Y OTROS (CON YT-DLP) ---
  const outputTemplate = path.join("/tmp", "%(title).50s.%(ext)s");
  const command = `"${YTDLP_PATH}" -f "bestvideo+bestaudio/best" --merge-output-format mp4 --ffmpeg-location "${ffmpeg}" -o "${outputTemplate}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Error ejecucion:", stderr || err.message);
      return res.status(500).send("Error al descargar el video.");
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
  console.log("🔥 Servidor híbrido activo en puerto " + PORT);
});
