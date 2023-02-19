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
const API_KEY = process.env.RAPID_API_KEY;
const axios = require("axios");
const multer = require("multer");
const mindee = require("mindee");

const upload = multer({ dest: "uploads/" });
const mindeeClient = new mindee.Client({
  apiKey: "cb34ce0c1b3eea38766de718a20733f1",
}).addEndpoint({
  accountName: "whitecape",
  endpointName: "image",
});

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
        temperature: 0.2,
      });
      res
        .status(200)
        .json({ status: "Success", response: response.data.choices[0].text });
    } catch (error) {
      res.status(500).json({ status: "Failed", error: error.message });
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

      res.status(200).json({ status: "Success", imageURL: image_url });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({
        status: "Failed",
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
          status: "Success",
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
router.get(
  "/trending",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const options = {
      method: "GET",
      url: "https://tiktok-all-in-one.p.rapidapi.com/feed",
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "tiktok-all-in-one.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        //const trendingVideos = response.data.items.slice(0, 10);
        //get only the first 10 videos from the response data
        res.status(200).json({ status: "Success", videos: response.data });
      })
      .catch(function (error) {
        console.error(error);
      });
  }
);
router.post(
  "/upload",
  upload.single("C:UsersMSIPicturesmindeeImage-containing-text.png"),
  (req, res) => {
    if (!req.file || !req.file.path) {
      res.status(400).send("File not found.");
      return;
    }

    const filePath = req.file.path;

    mindeeClient
      .docFromPath(filePath)
      .parse(mindee.CustomV1, { endpointName: "image" })
      .then((resp) => {
        if (resp.document === undefined) {
          res.status(400).send("Failed to parse document.");
          return;
        }

        // full object
        console.log(resp.document);

        // string summary
        console.log(resp.document.toString());

        res.send(resp.document.toString());
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Failed to parse document.");
      });
  }
);

module.exports = router;
