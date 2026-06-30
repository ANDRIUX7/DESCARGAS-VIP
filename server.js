const express = require("express");
const { getVideoInfo } = require("javascript-youtube-downloader");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static("public"));

app.get("/download", async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send("Falta URL");

  try {
    // Obtiene la información y el enlace de descarga directo del video
    const videoInfo = await getVideoInfo(url);
    
    // Filtramos para obtener el formato MP4 con mayor calidad disponible
    const format = videoInfo.formats
      .filter(f => f.ext === "mp4" && f.url)
      .sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];

    if (!format) {
      return res.status(404).send("No se encontró un formato MP4 válido");
    }

    const tempFilePath = path.join("/tmp", `video-${Date.now()}.mp4`);
    const fileStream = fs.createWriteStream(tempFilePath);

    // Descargamos el archivo directamente en la carpeta /tmp de Render
    https.get(format.url, (response) => {
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        
        // Forzamos la descarga al navegador del usuario
        res.download(tempFilePath, `${videoInfo.title || "video"}.mp4`, (err) => {
          if (!err) {
            try { fs.unlinkSync(tempFilePath); } catch (e) {}
          }
        });
      });
    }).on("error", (err) => {
      throw err;
    });

  } catch (error) {
    console.error("Error en descarga:", error.message);
    return res.status(500).send("Error al procesar el enlace de descarga");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Server corriendo de forma limpia en puerto " + PORT);
});
