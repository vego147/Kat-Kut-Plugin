var csInterface = new CSInterface();
var transcript = [];
var EXTENSION_SCRIPT_PATH = null;
var SERVER_URL = "http://localhost:3000/transcribe";


document.addEventListener("DOMContentLoaded", function () {
    EXTENSION_SCRIPT_PATH = getJSXPath();

    // Load the ExtendScript file once when the panel opens
    csInterface.evalScript('$.evalFile(' + JSON.stringify(EXTENSION_SCRIPT_PATH) + ')');

    bindUI();
});


function bindUI() {
    var renderBtn = document.getElementById("renderBtn");
    var generateBtn = document.getElementById("generate");

    if (renderBtn) {
        renderBtn.onclick = onRenderAndTranscribe;
    }

    if (generateBtn) {
        generateBtn.onclick = onGenerateSubtitles;
    }
}

function onRenderAndTranscribe() {
    var renderBtn = document.getElementById("renderBtn");
    var originalText = renderBtn ? renderBtn.textContent : "";

    setBusy(renderBtn, "Rendering...");

    csInterface.evalScript("runPipeline()", function (audioPath) {
        if (!audioPath) {
            setBusy(renderBtn, originalText);
            alert("Audio render failed");
            return;
        }

        setBusy(renderBtn, "Transcribing...");

        transcribeWithServer(audioPath)
            .then(function (data) {
                var segments = data && data.segments ? data.segments : data;

                if (!segments || !segments.length) {
                    throw new Error("No transcript segments returned");
                }

                loadTranscript(segments);
            })
            .catch(function (err) {
                console.error(err);
                alert("Transcription failed. Check if the Node server is running.");
            })
            .finally(function () {
                setBusy(renderBtn, originalText);
            });
    });
}

function transcribeWithServer(audioPath) {
    return fetch(SERVER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ path: audioPath })
    }).then(function (res) {
        if (!res.ok) {
            return res.text().then(function (text) {
                throw new Error("Server error: " + text);
            });
        }
        return res.json();
    });
}

function onGenerateSubtitles() {
    var data = getEditedTranscript();

    if (!data.length) {
        alert("No transcript available");
        return;
    }

    var settings = {
        font: document.getElementById("font").value,
        fontSize: parseInt(document.getElementById("fontSize").value),
        color: hexToRgb(document.getElementById("color").value),
        stroke: document.getElementById("stroke").checked,
        strokeWidth: parseInt(document.getElementById("strokeWidth").value)
    };

    csInterface.evalScript(
        "createSubtitles(" +
        JSON.stringify(JSON.stringify(data)) + "," +
        JSON.stringify(JSON.stringify(settings)) +
        ")"
    );
}

function hexToRgb(hex) {
    var bigint = parseInt(hex.replace("#", ""), 16);
    return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255
    ];
}

function loadTranscript(data) {
    transcript = data || [];

    var container = document.getElementById("container");
    if (!container) return;

    container.innerHTML = "";

    transcript.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "row";

        var startInput = document.createElement("input");
        startInput.className = "start";
        startInput.type = "number";
        startInput.step = "0.01";
        startInput.value = item.start != null ? item.start : 0;

        var endInput = document.createElement("input");
        endInput.className = "end";
        endInput.type = "number";
        endInput.step = "0.01";
        endInput.value = item.end != null ? item.end : 0;

        var textInput = document.createElement("input");
        textInput.className = "text";
        textInput.type = "text";
        textInput.value = item.text != null ? item.text : "";

        row.appendChild(startInput);
        row.appendChild(endInput);
        row.appendChild(textInput);

        container.appendChild(row);
    });
}

function getEditedTranscript() {
    var rows = document.querySelectorAll("#container div");
    var result = [];

    Array.prototype.forEach.call(rows, function (row) {
        var startEl = row.querySelector(".start");
        var endEl = row.querySelector(".end");
        var textEl = row.querySelector(".text");

        var start = parseFloat(startEl && startEl.value);
        var end = parseFloat(endEl && endEl.value);
        var text = textEl ? textEl.value : "";

        if (isNaN(start)) start = 0;
        if (isNaN(end)) end = start;

        result.push({
            start: start,
            end: end,
            text: text
        });
    });

    return result;
}

function getJSXPath() {
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
    return extensionRoot + "/host/extendscript.jsx";
}

function setBusy(button, label) {
    if (!button) return;
    button.disabled = !!label;
    button.textContent = label || button.textContent;
}