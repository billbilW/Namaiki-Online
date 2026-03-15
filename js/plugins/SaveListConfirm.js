// SaveListConfirm.js Ver.1.0.0
// MIT License (C) 2023 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MZ MV
* @orderAfter RemoveSaveFile
* @plugindesc セーブファイル選択時に確認ダイアログを表示します。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/491022960.html
* @help 
*
* [更新履歴]
* 2023/05/20：Ver.1.0.0　公開。
*
* @param defaultCancel
* @text 初期位置「いいえ」
* @desc 
* @default true
* @type boolean
*
* @param windowSkin
* @text ウィンドウスキン
* @desc ファイル名を指定します。
* @default 
* @type file
* @dir img/system
*
* @param windowOpacity
* @text ウィンドウ不透明度
* @desc ウィンドウの不透明度を指定します。
* -1でシステムの初期値。
* @default -1
* @type number
* @min -1
*
* @param terms
* @text 用語
* @type struct<terms>
* @default {"saveConfirm":"データをセーブします。よろしいですか？","overwriteConfirm":"データを上書きします。よろしいですか？","loadConfirm":"データをロードします。よろしいですか？","removeConfirm":"データを削除します。よろしいですか？","ok":"はい","cancel":"いいえ"}
*
*/

/*~struct~terms:
*
* @param saveConfirm
* @text セーブ確認
* @desc 
* @type string
* @default データをセーブします。よろしいですか？
*
* @param overwriteConfirm
* @text 上書き確認
* @desc 
* @type string
* @default データを上書きします。よろしいですか？
*
* @param loadConfirm
* @text ロード確認
* @desc 
* @type string
* @default データをロードします。よろしいですか？
*
* @param removeConfirm
* @text 削除確認
* @desc RemoveSaveFile.js用。
* @type string
* @default データを削除します。よろしいですか？
*
* @param ok
* @desc 決定した時のテキストです。
* @text 決定
* @type string
* @default はい
*
* @param cancel
* @desc キャンセルした時のテキストです。
* @text キャンセル
* @type string
* @default いいえ
*
*/

'use strict';

{
	//プラグイン名取得。
	const script = document.currentScript;
	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
	const parameters = PluginManager.parameters(pluginName);
	const useMZ = Utils.RPGMAKER_NAME === "MZ";

	const defaultCancel = parameters["defaultCancel"] === "true";
	const windowSkin = parameters["windowSkin"];
	const windowOpacity = Number(parameters["windowOpacity"]);
	const terms = JSON.parse(parameters["terms"]||"{}");

	//-----------------------------------------------------------------------------
	// Scene_File

	Scene_File.prototype.createConfirmWindow = function() {
		if (this._confirmWindow) {
			this.addWindow(this._confirmWindow);
			return;
		}
		const rect = this.confirmWindowRect();
		this._confirmWindow = new Window_Confirm(rect);
		this.addWindow(this._confirmWindow);
	};

	Scene_File.prototype.confirmWindowRect = function() {
		if (!useMZ) return;
		const ww = this.mainCommandWidth();
		const wh = this.calcWindowHeight(2, true);
		const wx = (Graphics.boxWidth - ww) / 2;
		const wy = (Graphics.boxHeight - wh) / 2;
		return new Rectangle(wx, wy, ww, wh);
	};

	Scene_File.prototype.openConfirmWindow = function() {
		this.createConfirmWindow();
		this._confirmWindow.setHandler("ok", this.onConfirmOk.bind(this));
		this._confirmWindow.setHandler("cancel", this.onConfirmCancel.bind(this));
		const savefileId = this.savefileId();
		const isOverwrite = useMZ ? !!DataManager.savefileInfo(savefileId) : DataManager.loadSavefileInfo(savefileId);
		this._helpWindow.setText(this.confirmText(isOverwrite));
		this._confirmWindow.select(defaultCancel ? 1 : 0);
		this._confirmWindow.open();
		this._confirmWindow.activate();
	};

	Scene_File.prototype.confirmText = function() {
		return "";
	};

	//-----------------------------------------------------------------------------
	// Scene_Save

	const _Scene_Save_onSavefileOk = Scene_Save.prototype.onSavefileOk;
	Scene_Save.prototype.onSavefileOk = function() {
		const savefileId = this.savefileId();
		if (useMZ ? this.isSavefileEnabled(savefileId) : true) {
			Window_Selectable.prototype.playOkSound.call(this);
			this.openConfirmWindow();
		} else {
			_Scene_Save_onSavefileOk.call(this);
		}
	};

	Scene_Save.prototype.onConfirmOk = function() {
		_Scene_Save_onSavefileOk.call(this);
	};

	Scene_Save.prototype.onConfirmCancel = function() {
		this._confirmWindow.close();
		this._confirmWindow.deactivate();
		this.activateListWindow();
		this._helpWindow.setText(this.helpWindowText());
	};

	const _Scene_Save_onSaveFailure = Scene_Save.prototype.onSaveFailure;
	Scene_Save.prototype.onSaveFailure = function() {
		if (this._confirmWindow) {
			this._confirmWindow.close();
			this._confirmWindow.deactivate();
		}
		_Scene_Save_onSaveFailure.call(this);
	};

	Scene_Save.prototype.confirmText = function(isOverwrite) {
		return isOverwrite ? terms.overwriteConfirm : terms.saveConfirm;
	};

	//-----------------------------------------------------------------------------
	// Scene_Load

	const _Scene_Load_onSavefileOk = Scene_Load.prototype.onSavefileOk;
	Scene_Load.prototype.onSavefileOk = function() {
		const savefileId = this.savefileId();
		if (useMZ ? this.isSavefileEnabled(savefileId) : DataManager.loadSavefileInfo(savefileId)) {
			Window_Selectable.prototype.playOkSound.call(this);
			this.openConfirmWindow();
		} else {
			_Scene_Load_onSavefileOk.call(this);
		}
	};

	Scene_Load.prototype.onConfirmOk = function() {
		_Scene_Load_onSavefileOk.call(this);
	};

	Scene_Load.prototype.onConfirmCancel = function() {
		this._confirmWindow.close();
		this._confirmWindow.deactivate();
		this.activateListWindow();
		this._helpWindow.setText(this.helpWindowText());
	};

	const _Scene_Load_onLoadFailure = Scene_Load.prototype.onLoadFailure;
	Scene_Load.prototype.onLoadFailure = function() {
		if (this._confirmWindow) {
			this._confirmWindow.close();
			this._confirmWindow.deactivate();
		}
		_Scene_Load_onLoadFailure.call(this);
	};

	Scene_Load.prototype.confirmText = function() {
		return terms.loadConfirm;
	};

	//-----------------------------------------------------------------------------
	// Scene_Remove

	if (window.Scene_Remove) {
		const _Scene_Remove_onSavefileOk = Scene_Remove.prototype.onSavefileOk;
		Scene_Remove.prototype.onSavefileOk = function() {
			const savefileId = this.savefileId();
			if (useMZ ? this.isSavefileEnabled(savefileId) : DataManager.loadSavefileInfo(savefileId)) {
				Window_Selectable.prototype.playOkSound.call(this);
				this.openConfirmWindow();
			} else {
				_Scene_Remove_onSavefileOk.call(this);
			}
		};

		Scene_Remove.prototype.onConfirmOk = function() {
			_Scene_Remove_onSavefileOk.call(this);
			this._confirmWindow.close();
			this._confirmWindow.deactivate();
			this._helpWindow.setText(this.helpWindowText());
		};

		Scene_Remove.prototype.onConfirmCancel = function() {
			this._confirmWindow.close();
			this._confirmWindow.deactivate();
			this.activateListWindow();
			this._helpWindow.setText(this.helpWindowText());
		};

		const _Scene_Remove_onRemoveFailure = Scene_Remove.prototype.onRemoveFailure;
		Scene_Remove.prototype.onRemoveFailure = function() {
			if (this._confirmWindow) {
				this._confirmWindow.close();
				this._confirmWindow.deactivate();
			}
			_Scene_Remove_onRemoveFailure.call(this);
		};

		Scene_Remove.prototype.confirmText = function() {
			return terms.removeConfirm;
		};
	}

	//-----------------------------------------------------------------------------
	// Window_Confirm

	function Window_Confirm() {
		this.initialize(...arguments);
	}

	window.Window_Confirm = Window_Confirm;

	Window_Confirm.prototype = Object.create(Window_Command.prototype);
	Window_Confirm.prototype.constructor = Window_Confirm;

	Window_Confirm.prototype.initialize = function() {
		Window_Command.prototype.initialize.apply(this, arguments);
		this.updatePlacement();
		this.openness = 0;
		this._isWindow = false;
	};

	if (windowSkin) {
		Window_Confirm.prototype.loadWindowskin = function() {
			this.windowskin = ImageManager.loadSystem(windowSkin);
		};
	}

	if (windowOpacity > -1) {
		Window_Confirm.prototype.updateBackOpacity = function() {
			this.backOpacity = windowOpacity;
		};
	};

	Window_Confirm.prototype.windowWidth = function() {
		return 240;
	};

	Window_Confirm.prototype.updatePlacement = function() {
		this.x = (Graphics.boxWidth - this.width) / 2;
		this.y = (Graphics.boxHeight - this.height) / 2;
	};

	Window_Confirm.prototype.makeCommandList = function() {
		this.addCommand(terms.ok, "ok");
		this.addCommand(terms.cancel, "cancel");
	};

	Window_Confirm.prototype.playOkSound = function() {
		if (this.currentSymbol() !== "ok") {
			Window_Command.prototype.playOkSound.call(this);
		}
	};

}