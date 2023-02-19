const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const { Deepgram } = require("@deepgram/sdk");
const ffmpeg = require("ffmpeg-static");
const fs = require("fs");
const passport = require("passport");
const { strategy } = require("./../../security/strategy");
router.use(passport.initialize());
passport.use(strategy);

router.post(
  "/ask-chatgpt",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { prompt } = req.body;

    // Generate a response from the OpenAI API using the `create` method
    try {
      const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: ` ${prompt}`,
        model: "text-davinci-002",
        temperature: 0.5,
      });

      console.log(response.data.choices[0].text);
      res
        .status(200)
        .json({ success: true, response: response.data.choices[0].text });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post(
  "/get-ai-image",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
      console.log(error.message);
      res.status(400).json({
        success: false,
        error: "Edit could not be generated, try again",
      });
    }
  }
);

router.post(
  "/caption",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { videoID } = req.body;
    try {
      const deepgram = new Deepgram(process.env.DG_KEY);
      const YD = new YoutubeMp3Downloader({
        ffmpegPath: ffmpeg,
        outputPath: "./",
        youtubeVideoQuality: "highestaudio",
      });
      YD.download(videoID);
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
        const transcript =
          result.results.channels[0].alternatives[0].transcript;
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
  }
);
module.exports = router;
