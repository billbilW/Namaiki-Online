// RemoveSaveFile.js Ver.1.2.2
// MIT License (C) 2022 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MZ MV
* @plugindesc データ削除コマンドをオプションに追加します。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/491022960.html
* @help 
*
* [更新履歴]
* 2022/08/26：Ver.1.0.0　公開。
* 2022/08/26：Ver.1.0.1　パラメータが反映されない不具合を修正。
* 2022/08/26：Ver.1.1.0　MVに対応。パラメータ追加。
* 2022/08/28：Ver.1.1.1　プラグイン管理で間違った警告が出ないように修正。
* 2022/08/28：Ver.1.1.2　機能の整理。
* 2023/01/16：Ver.1.1.3　Windowクラスを外部から参照可能に。
* 2023/03/31：Ver.1.2.0　globalInfoの配列長さを補正する機能を追加。
* 2023/05/20：Ver.1.2.1　MVでの挙動を修正。
* 2023/10/09：Ver.1.2.2　MZでコマンド名を設定しなかった場合の挙動を修正。
*
* @param message
* @text メッセージ
* @desc 画面上部に表示するメッセージ
* @default どのファイルを削除しますか？
*
* @param commandName
* @text コマンド名
* @desc オプションに表示するコマンド名
* @default セーブファイル削除
*
* @param seParam
* @text 効果音
* @desc ファイル削除時に効果音を鳴らします。
* @type struct<audio>
* @default {"name":"Decision5","volume":"90","pitch":"100","pan":"0"}
*
*/

/*~struct~audio:
*
* @param name
* @text ファイル名
* @type file
* @dir audio/se
*
* @param volume
* @text 音量
* @type number
* @default 90
*
* @param pitch
* @text ピッチ
* @type number
* @default 100
*
* @param pan
* @text 位相
* @type number
* @default 0
* @min -100
*
*/

'use strict';

{
	//プラグイン名取得。
	const script = document.currentScript;
	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
	const useMZ = Utils.RPGMAKER_NAME === "MZ";

	const parameters = PluginManager.parameters(pluginName);
	const message = parameters["message"];
	const commandName = parameters["commandName"];
	const seParam = JSON.parse(parameters["seParam"] || "{}");
	for (const propName in seParam) {
		if (propName !== "name") {
			seParam[propName] = Number(seParam[propName]);
		}
	}

	//-----------------------------------------------------------------------------
	// Scene_Remove

	function Scene_Remove() {
		this.initialize(...arguments);
	}

	Scene_Remove.prototype = Object.create(Scene_File.prototype);
	Scene_Remove.prototype.constructor = Scene_Remove;

	Scene_Remove.prototype.initialize = function() {
		Scene_File.prototype.initialize.call(this);
	};

	Scene_Remove.prototype.mode = function() {
		return useMZ ? "remove" : "load";
	};

	Scene_Remove.prototype.helpWindowText = function() {
	    return message;
	};

	Scene_Remove.prototype.onSavefileOk = function() {
		Scene_File.prototype.onSavefileOk.call(this);
		const savefileId = this.savefileId();
		if (useMZ ? this.isSavefileEnabled(savefileId) : DataManager.isThisGameFile(savefileId)) {
			this.executeRemove(savefileId);
		} else {
			this.onRemoveFailure();
		}
	};

	Scene_Remove.prototype.executeRemove = function(savefileId) {
		try {
			DataManager.removeGame(savefileId);
			this.onRemoveSuccess();
		} catch (e) {
			console.error(e);
			this.onRemoveFailure();
		}
	};

	Scene_Remove.prototype.onRemoveSuccess = function() {
		AudioManager.playSe(seParam);
		this.activateListWindow();
		this._listWindow.refresh();
	};

	Scene_Remove.prototype.onRemoveFailure = function() {
		SoundManager.playBuzzer();
		this.activateListWindow();
	};
	
	//-----------------------------------------------------------------------------
	// DataManager

	DataManager.removeGame = function(savefileId) {
		const saveName = useMZ ? this.makeSavename(savefileId) : savefileId;
		StorageManager.remove(saveName);
		if (!useMZ) {
			StorageManager.cleanBackup(saveName);
		}
		const info = useMZ ? this._globalInfo : this.loadGlobalInfo();
		delete info[savefileId];
		if (info.length > 0) {
			let len = info.length;
			for (let i = info.length - 1; i >= 0; i--) {
				if (info[i]) {
					break;
				}
				len = i;
			}
			info.length = len;
		}
		this.saveGlobalInfo(info);
	};

	//-----------------------------------------------------------------------------
	// Window_Options

	const _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
	Window_Options.prototype.makeCommandList = function() {
		_Window_Options_makeCommandList.call(this);
		if (commandName) {
			this.addRemoveSaveFileOption();
		}
	};

	Window_Options.prototype.addRemoveSaveFileOption = function() {
		const continueEnabled = this.isContinueEnabled();
		this.addCommand(commandName, "removeSaveFile", continueEnabled);
	};

	Window_Options.prototype.isContinueEnabled = function() {
		return DataManager.isAnySavefileExists();
	};

	Window_Options.prototype.isRemoveSaveFileSymbol = function(symbol) {
		return symbol === "removeSaveFile";
	};

	const _Window_Options_statusText = Window_Options.prototype.statusText;
	Window_Options.prototype.statusText = function(index) {
		const symbol = this.commandSymbol(index);
		if (this.isRemoveSaveFileSymbol(symbol)) {
			return "";
		} else {
			return _Window_Options_statusText.call(this, index);
		}
	};

	const _Window_Options_processOk = Window_Options.prototype.processOk;
	Window_Options.prototype.processOk = function() {
		const index = this.index();
		const symbol = this.commandSymbol(index);
		if (this.isRemoveSaveFileSymbol(symbol)) {
			Window_Selectable.prototype.processOk.call(this);
		} else {
			_Window_Options_processOk.call(this);
		}
	};

	const _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
	Window_Options.prototype.cursorRight = function() {
		const index = this.index();
		const symbol = this.commandSymbol(index);
		if (!this.isRemoveSaveFileSymbol(symbol)) {
			_Window_Options_cursorRight.call(this);
		}
	};

	const _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
	Window_Options.prototype.cursorLeft = function() {
		const index = this.index();
		const symbol = this.commandSymbol(index);
		if (!this.isRemoveSaveFileSymbol(symbol)) {
			_Window_Options_cursorLeft.call(this);
		}
	};

	//-----------------------------------------------------------------------------
	// Scene_Options

	const _Scene_Options_createOptionsWindow = Scene_Options.prototype.createOptionsWindow;
	Scene_Options.prototype.createOptionsWindow = function() {
		_Scene_Options_createOptionsWindow.call(this);
		this._optionsWindow.setHandler("removeSaveFile", this.commandRemove.bind(this));
	};

	Scene_Options.prototype.commandRemove = function() {
		SceneManager.push(Scene_Remove);
	};

	const _Scene_Options_maxCommands = Scene_Options.prototype.maxCommands;
	Scene_Options.prototype.maxCommands = function() {
		return _Scene_Options_maxCommands.call(this) + (commandName ? 1 : 0);
	};

	window.Scene_Remove = Scene_Remove;

}