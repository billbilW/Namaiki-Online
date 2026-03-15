// ProbabilityBranch.js Ver.1.0.0
// MIT License (C) 2022 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MV MZ
* @orderAfter PluginCommonBase
* @plugindesc 確率分岐を行います。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/
* @help 条件分岐で使用する事を想定したプラグインです。
*［スクリプト］
* this.probabilityBranch(n)
* nパーセントの確率でtrueが、(100-n)パーセントの確率でfalseが返ってきます。
* 条件分岐のスクリプトで使用する事を想定しています。
*
*［プラグインコマンド（MV）］
* probabilityBranch n
* または
* 確率分岐 n
*
* nには確率を百分率（パーセント）で入力します。
* パラメータで設定したスイッチがnパーセントの確率でON、
* (100-n)パーセントの確率でOFFになります。
*
* [更新履歴]
* 2022/06/23：Ver.1.0.0　公開。
*
* @command probabilityBranch
* @text 確率分岐
* @desc 設定した確率でパラメータで設定したスイッチがONになります。
* 外れるとOFFになります。
*
* @arg percentage
* @text 確率
* @desc 百分率（パーセント）で入力します。
* @default 50
*
* @param switchId
* @text スイッチID
* @desc 結果を代入するスイッチを指定します。
* @type switch
*
*/

'use strict';
{
	const useMZ = Utils.RPGMAKER_NAME === "MZ";
	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
	const hasPluginCommonBase = typeof PluginManagerEx === "function";
	const parameter = PluginManager.parameters(pluginName);
	const switchId = Number(parameter["switchId"] || 0);

	if (useMZ && hasPluginCommonBase) {
		PluginManagerEx.registerCommand(document.currentScript, "probabilityBranch", function (args) {
			const result = this.probabilityBranch(args.percentage);
			$gameSwitches.setValue(switchId, result);
		});
	} else if (useMZ) {
		PluginManager.registerCommand(pluginName, "probabilityBranch", function (args) {
			const result = this.probabilityBranch(+args.percentage);
			$gameSwitches.setValue(switchId, result);
		});
	}

	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.apply(this, arguments);
		
		if (command === "probabilityBranch" || command === "確率分岐") {
			const result = this.probabilityBranch(Number(args[0]));
			$gameSwitches.setValue(switchId, result);
		}
		
	};

	Game_Interpreter.prototype.probabilityBranch = function(percentage) {
		return (Math.random() * 100) < percentage;
	};
}