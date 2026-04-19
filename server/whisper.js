require("dotenv").config({
    path: __dirname + "/.env"
});


const axios = require("axios");

const FormData = require("form-data");
const fs = require("fs");

async function transcribeAudio(filepath) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filepath));
    form.append("model", "whisper-large-v3-turbo");
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "segment");
    form.append("timestamp_granularities[]", "word");


    const response = await axios.post("https://api.groq.com/openai/v1/audio/transcriptions", form, {
        headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        }
    });

    return response.data;
}

module.exports = { transcribeAudio };