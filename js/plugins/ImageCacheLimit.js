/*:
 * @target MZ
 * @plugindesc 画像のキャッシュ上限値を設定するプラグイン
 * @help このプラグインを使用して、画像のキャッシュ上限値を設定します。
 *
 * @param cacheLimit
 * @text キャッシュ上限値
 * @type number
 * @default 20
 */

(() => {
    const parameters = PluginManager.parameters('YourPluginName');
    const cacheLimit = Number(parameters['cacheLimit'] || 20);

    const _ImageManager_initialize = ImageManager.initialize;
    ImageManager.initialize = function() {
        _ImageManager_initialize.call(this);
        this.cache._limit = cacheLimit;
    };
})();
