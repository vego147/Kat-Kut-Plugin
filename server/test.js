const { transcribeAudio } = require("./whisper"); // Ensure this matches your filename
const path = require("path");
const fs = require("fs");

async function startTest() {
    // Path to your specific MP3
    const audioPath = "D:\\VEGO\\Python\\katkut\\PF\\One_kiss.mp3";

    
    if (!fs.existsSync(audioPath)) {
        console.error("❌ File not found at path: " + audioPath);
        return;
    }

    console.log("🎙️ Sending 'One Kiss' to Groq for transcription...");

    try {
        const result = await transcribeAudio(audioPath);
        
        console.log("✅ Transcription Received!");
        

        const outputFilename = "groq_response.json";
        fs.writeFileSync(outputFilename, JSON.stringify(result, null, 2));
        
        console.log(`📂 Full response saved to: ${outputFilename}`);
        console.log("------------------------------------------");
        
        // Quick Preview of the first few words
        if (result.words) {
            console.log("First 5 words for AE timing:");
            console.table(result.words.slice(0, 5));
        } else {
            console.log("No word-level data found. (Check if you added 'word' granularity)");
        }

    } catch (error) {
        console.error("❌ API Error:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

startTest();