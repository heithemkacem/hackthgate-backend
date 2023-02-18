//Express Router
const express = require("express");
const router = express.Router();
const { google } = require("googleapis");

router.get("/captions", async (req, res) => {
  try {
    // Parse the video ID from the YouTube URL
    const videoUrl = req.query.videoUrl;
    const videoId = videoUrl.split("v=")[1];

    // Initialize the YouTube API client
    const youtube = google.youtube({
      version: "v3",
      auth: "AIzaSyBGRtye-8euox4WyCxW4p1lKaJ0pj0aJJE",
    });

    // Define the parameters for the API request
    const params = {
      part: "snippet",
      videoId: videoId,
      captions: true,
    };

    // Call the API to retrieve the caption tracks
    const response = await youtube.captions.list(params);

    // Find the caption track with the desired format (e.g. srt)
    const caption = response.data.items.find(
      (item) =>
        item.kind === "youtube#caption" &&
        item.snippet.trackKind === "standard" &&
        item.snippet.format === "srt"
    );

    if (!caption) {
      // No caption track found
      res.json({ status: "Failed", message: "Caption track not found" });
      return;
    }

    // Download the caption track
    const downloadResponse = await youtube.captions.download(
      {
        id: caption.id,
        tfmt: "srt",
      },
      { responseType: "stream" }
    );

    // Create a buffer to store the caption data
    let captionBuffer = Buffer.alloc(0);

    // Read the caption data from the response stream
    downloadResponse.data.on("data", (chunk) => {
      captionBuffer = Buffer.concat([captionBuffer, chunk]);
    });

    downloadResponse.data.on("end", () => {
      // Convert the caption data to a string
      const captions = captionBuffer.toString("utf8");

      // Send the captions as a JSON response
      res.json({ status: "Success", captions: captions });
    });
  } catch (err) {
    // Handle any errors that occur
    console.error(err);
    res.json({ status: "Failed", message: err.message });
  }
});

module.exports = router;

//Passport
module.exports = router;
