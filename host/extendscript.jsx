/* =========================
   AE SUBTITLE PIPELINE
   ========================= */


// =========================
// 1. ENTRY POINT (CALLED FROM PANEL)
// =========================
function runPipeline() {

    var proj = app.project;

    if (!proj) {
        alert("Open a project first");
        return "";
    }

    var comp = proj.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Select a composition");
        return "";
    }

    app.beginUndoGroup("Render Audio");

    var audioPath = renderAudio(comp);

    app.endUndoGroup();

    return audioPath; // VERY IMPORTANT (goes back to panel)
}



// =========================
// 2. AUDIO RENDER FUNCTION
// =========================
function renderAudio(comp) {

    var proj = app.project;
    var rq = proj.renderQueue;

    // Clear old queue (optional but cleaner)
    while (rq.numItems > 0) {
        rq.item(1).remove();
    }

    var item = rq.items.add(comp);
    var om = item.outputModule(1);

    // Apply template
    try {
        om.applyTemplate("Audio_output");
    } catch (e) {
        alert("Missing Output Module Template: 'Audio_output'\nCreate a WAV audio template.");
        return "";
    }

    // Output path
    var outputFile = new File(Folder.myDocuments.fsName + "/ae_audio.wav");

    om.file = outputFile;

    item.render = true;

    // Render
    rq.render();

    return outputFile.fsName;
}



// function createSubtitles(jsonString) {

//     var proj = app.project;

//     if (!proj) {
//         alert(" No project open");
//         return;
//     }

//     var comp = proj.activeItem;

//     if (!(comp instanceof CompItem)) {
//         alert("Select a composition");
//         return;
//     }

//     var data;

//     try {
//         data = JSON.parse(jsonString);
//     } catch (e) {
//         alert("Invalid JSON");
//         return;
//     }

//     app.beginUndoGroup("Create Subtitles");

//     for (var i = comp.numLayers; i >= 1; i--) {
//         if (comp.layer(i).name.indexOf("SUB_") === 0) {
//             comp.layer(i).remove();
//         }
//     }

//     for (var i = 0; i < data.length; i++) {

//         var item = data[i];

//         if (!item.text) continue;

//         var textLayer = comp.layers.addText(item.text);

//         textLayer.name = "SUB_" + i;

//         textLayer.startTime = item.start;
//         textLayer.outPoint = item.end;

//         // TEXT STYLE
//         var textProp = textLayer.property("Source Text");
//         var doc = textProp.value;

//         doc.fontSize = 60;
//         doc.fillColor = [1, 1, 1];
//         doc.justification = ParagraphJustification.CENTER_JUSTIFY;

//         textProp.setValue(doc);

//         // POSITION (bottom center)
//         textLayer.property("Position").setValue([
//             comp.width / 2,
//             comp.height - 150
//         ]);
//     }

//     app.endUndoGroup();
// }

function createSubtitles(json, settings) {

    if (typeof json === "string") json = JSON.parse(json);
    if (typeof settings === "string") settings = JSON.parse(settings);

    var comp = app.project.activeItem;

    app.beginUndoGroup("Subtitles");

    for (var i = 0; i < json.length; i++) {

        var seg = json[i];

        var layer = comp.layers.addText(seg.text);

        layer.inPoint = seg.start;
        layer.outPoint = seg.end;

        var textProp = layer.property("Source Text");
        var textDoc = textProp.value;

        // 🎨 APPLY SETTINGS
        textDoc.font = settings.font;
        textDoc.fontSize = settings.fontSize;
        textDoc.fillColor = settings.color;

        if (settings.stroke) {
            textDoc.applyStroke = true;
            textDoc.strokeWidth = settings.strokeWidth;
            textDoc.strokeColor = [0,0,0];
        } else {
            textDoc.applyStroke = false;
        }

        textProp.setValue(textDoc);

        layer.position.setValue([comp.width/2, comp.height - 150]);
    }

    app.endUndoGroup();
}