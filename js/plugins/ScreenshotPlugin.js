/*:
 * @plugindesc スクリーンショットを撮影するプラグイン
 * @target MZ
 * @author あなたの名前
 * 
 * @param screenshotKey
 * @text スクリーンショットキー
 * @desc スクリーンショットを撮影するキーを指定します（デフォルトはF6）。
 * @default F6
 * 
 * @help
 * このプラグインは、指定したキーを押すことでゲーム画面のスクリーンショットを保存します。
 * スクリーンショットは「/screenshots」フォルダに保存されます。
 */

(() => {
    const parameters = PluginManager.parameters('スクリーンショットプラグイン');
    const screenshotKey = parameters['screenshotKey'] || 'F6';

    const originalOnKeyDown = Input._onKeyDown;
    Input._onKeyDown = function(event) {
        originalOnKeyDown.call(this, event);
        if (event.key === screenshotKey) {
            Graphics.takeScreenshot();
        }
    };

    Graphics.takeScreenshot = function() {
        const fs = require('fs');
        const path = require('path');
        
        const width = this._width;
        const height = this._height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(this._canvas, 0, 0);

        const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
        const timestamp = new Date().toISOString().replace(/[:\-T.]/g, '');
        const filePath = path.join('screenshots', `screenshot_${timestamp}.png`);

        if (!fs.existsSync('screenshots')) {
            fs.mkdirSync('screenshots');
        }

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error('スクリーンショットの保存に失敗しました:', err);
            } else {
                console.log('スクリーンショットが保存されました:', filePath);
            }
        });
    };
})();
