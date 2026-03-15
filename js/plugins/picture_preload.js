/*:
 * @target MZ
 * @plugindesc Load all pictures from a specified folder on game start.
 * @param PictureFolder
 * @text Picture Folder
 * @desc The folder path where pictures are stored.
 * @default img/pictures/
 * @help This plugin loads all pictures from the specified folder when the game starts.
 */

(() => {
    const pluginName = "LoadPictures";
    const parameters = PluginManager.parameters(pluginName);
    const pictureFolder = parameters["PictureFolder"] || "img/pictures/";

    const loadAllPictures = () => {
        const fs = require("fs");
        const path = require("path");
        const fullPath = path.join(path.dirname(process.mainModule.filename), pictureFolder);

        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            files.forEach(file => {
                const ext = path.extname(file).toLowerCase();
                if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
                    const filenameWithoutExt = path.basename(file, ext);
                    const bitmap = ImageManager.loadBitmap(pictureFolder, filenameWithoutExt, 0, true);
                    // Store the bitmap or process it as needed
                }
            });
        } else {
            console.error(`The folder ${fullPath} does not exist.`);
        }
    };

    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        loadAllPictures();
    };

    const _Scene_Boot_terminate = Scene_Boot.prototype.terminate;
    Scene_Boot.prototype.terminate = function() {
        _Scene_Boot_terminate.call(this);
        // Optional: Clear any loaded resources if necessary
    };
})();
