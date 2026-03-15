/*:
 * @target MZ
 * @plugindesc データロード時に特定のスイッチをONにするプラグイン
 * @help このプラグインは、ゲームがロードされたときに特定のスイッチをONにします。
 *
 * @param switchId
 * @text スイッチID
 * @type switch
 * @default 1
 */

(() => {
    const parameters = PluginManager.parameters('SwitchOnLoad');
    const switchId = Number(parameters['switchId'] || 1);

    const _DataManager_loadGame = DataManager.loadGame;
    DataManager.loadGame = function(savefileId) {
        const result = _DataManager_loadGame.call(this, savefileId);
        if (result) {
            console.log(`Switch ${switchId} is being turned ON`);
            $gameSwitches.setValue(switchId, true);
        }
        return result;
    };
})();
