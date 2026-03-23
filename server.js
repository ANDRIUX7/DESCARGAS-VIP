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
  const type = req.query.type || "video";

  const filename = `video_${Date.now()}.mp4`;

  let command = "";

  if (type === "audio") {
    command = `yt-dlp -x --audio-format mp3 -o "${filename}" "${url}"`;
  } else {
    // 🔥 máxima calidad + intenta sin marca de agua
    command = `yt-dlp -f "bestvideo+bestaudio/best" -o "${filename}" "${url}"`;
  }

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.log(stderr);
    return res.send("Error: " + stderr);
  }

    res.download(filename, () => {
      fs.unlinkSync(filename);
    });
  });
});

app.listen(3000, () => console.log("🔥 Server PRO listo"));