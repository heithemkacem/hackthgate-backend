const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const { Deepgram } = require("@deepgram/sdk");
const ffmpeg = require("ffmpeg-static");
const fs = require("fs");

// Define a route that accepts a paragraph input
router.post("/ask-chatgpt", async (req, res) => {
  // Retrieve the input paragraph from the request body
  const { input, instruction } = req.body;

  try {
    const response = await openai.createEdit({
      model: "text-davinci-edit-001",
      input: input,
      instruction: instruction,
    });
    res
      .status(200)
      .json({ status: "Success", message: response.data.choices[0].text });
  } catch (error) {
    res.send(error);
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
    res.status(400).json({
      success: false,
      error: "Edit could not be generated, try again",
    });
  }
});
router.post("/ask-chatgpt-image", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    image_url = response.data.data[0].url;

    res.status(200).json({ success: true, imageURL: image_url });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.status(400).json({
      success: false,
      error: "Edit could not be generated, try again",
    });
  }
});

router.post("/caption", async (req, res) => {
  try {
    const deepgram = new Deepgram(process.env.DG_KEY);
    const YD = new YoutubeMp3Downloader({
      ffmpegPath: ffmpeg,
      outputPath: "./",
      youtubeVideoQuality: "highestaudio",
    });
    YD.download("ir-mWUYH_uo");
    YD.on("progress", (data) => {
      console.log(data.progress.percentage + "% downloaded");
    });
    YD.on("finished", async (err, video) => {
      const videoFileName = video.file;
      const file = {
        buffer: fs.readFileSync(videoFileName),
        mimetype: "audio/mp3",
      };
      const options = {
        punctuate: true,
      };
      const result = await deepgram.transcription
        .preRecorded(file, options)
        .catch((e) => console.log(e));
      const transcript = result.results.channels[0].alternatives[0].transcript;
      res.json({
        message: "Success",
        videoText: transcript,
      });
    });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while processing your request." });
  }
});
module.exports = router;
