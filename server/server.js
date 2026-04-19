require("dotenv").config({
    path: __dirname + "/.env"
});

// console.log("CWD:", process.cwd());
// console.log("DIRNAME:", __dirname);
// console.log("GROQ KEY:", process.env.GROQ_API_KEY);

const express = require('express');
const cors = require('cors');
const { transcribeAudio } = require('./whisper');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server running");
});

app.post("/transcribe", async (req, res) => {
    const {path} = req.body;

    if (!path) {
        return res.status(400).json({ error: "Missing File Path"});
    }

    try {
        console.log("Transcribing", path);
        const data = await transcribeAudio(path);

        const words = data.words || data.segments.flatMap(s => s.words || []);
            
        let subtitles = buildSubtitlesFromWords(words);
        subtitles = removeGaps(subtitles);
            
        res.json({ segments: subtitles });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Transcription failed",
            details: err.toString()
        });
    }
});  

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});


function buildSubtitlesFromWords(words) {
    const maxWords = 6;
    const maxGap = 0.5; // seconds

    let subtitles = [];
    let current = [];

    for (let i = 0; i < words.length; i++) {
        const w = words[i];

        if (current.length === 0) {
            current.push(w);
            continue;
        }

        const prev = current[current.length - 1];
        const gap = w.start - prev.end;

        // break conditions
        if (
            current.length >= maxWords ||
            gap > maxGap ||
            /[.,!?]/.test(prev.word)
        ) {
            subtitles.push(makeSubtitle(current));
            current = [w];
        } else {
            current.push(w);
        }
    }

    if (current.length) {
        subtitles.push(makeSubtitle(current));
    }

    return subtitles;
}

function makeSubtitle(words) {
    return {
        start: words[0].start,
        end: words[words.length - 1].end,
        text: words.map(w => w.word).join(" ")
    };
}

function removeGaps(subs) {
    for (let i = 0; i < subs.length - 1; i++) {
        subs[i].end = subs[i + 1].start;
    }
    return subs;
}