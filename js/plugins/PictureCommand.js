/**
 * PictureCommand.js
 */
/*:ja
 * @target MZ
 * @plugindesc プラグインコマンドからピクチャの操作を行えるようにします。
 * @author aoitaku
 * @license Zlib
 *
 * @help PictureCommand.js
 *
 * このプラグインは、ピクチャの操作を行うためのプラグインコマンドを
 * 提供します。
 * 座標以外のピクチャ操作の各種パラメータに変数を利用できるようになるため、動的に
 * 操作したいピクチャ番号を指定したい場合などに有効です。
 *
 * @command showPicture
 * @text ピクチャの表示
 * @desc ピクチャを表示します。
 *
 * @arg pictureNumber
 * @text 番号
 * @desc ピクチャを表示する番号を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"1","var":"1"}
 *
 * @arg pictureName
 * @text 画像
 * @desc 表示する画像を指定します。
 * @type file
 * @dir img/pictures
 *
 * @arg origin
 * @text 原点
 * @desc ピクチャを表示する座標の原点を指定します。
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 1
 * @default 0
 *
 * @arg x
 * @text X
 * @desc ピクチャを表示するX座標を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg y
 * @text Y
 * @desc ピクチャを表示するY座標を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg scaleX
 * @text 拡大率 幅
 * @desc ピクチャの幅の拡大率を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"100","var":"1"}
 *
 * @arg scaleY
 * @text 拡大率 高さ
 * @desc ピクチャの高さの拡大率を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"100","var":"1"}
 *
 * @arg opacity
 * @text 不透明度
 * @desc ピクチャの不透明度を指定します。ます。
 * @type struct<unsigned8bitValueOrVariable>
 * @default {"isVar":"false","val":"255","var":"1"}
 *
 * @arg blendMode
 * @text 合成方法
 * @desc ピクチャの合成方法を指定します。
 * @type select
 * @option 通常
 * @value 0
 * @option 加算
 * @value 1
 * @option 乗算
 * @value 2
 * @option スクリーン
 * @value 3
 * @default 0
 *
 * @command movePicture
 * @text ピクチャの移動
 * @desc ピクチャを移動します。
 *
 * @type struct<unsigned8bitValueOrVariable>
 * @default {"isVar":"false","val":"255","var":"1"}
 *
 * @arg blendMode
 * @text 合成方法
 * @desc ピクチャの合成方法を指定します。
 * @type select
 * @option 通常
 * @value 0
 * @option 加算
 * @value 1
 * @option 乗算
 * @value 2
 * @option スクリーン
 * @value 3
 * @default 0
 *
 * @command movePicture
 * @text ピクチャの移動
 * @desc ピクチャを移動します。
 *
 * @arg pictureNumber
 * @text 番号
 * @desc 移動するピクチャの番号を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"1","var":"1"}
 *
 * @arg easing
 * @text イージング
 * @desc ピクチャの移動時のイージングを指定します。
 * @type select
 * @option 一定速度
 * @value 0
 * @option ゆっくり始まる
 * @value 1
 * @option ゆっくり終わる
 * @value 2
 * @option ゆっくり始まってゆっくり終わる
 * @value 3
 * @default 0
 *
 * @arg origin
 * @text 原点
 * @desc ピクチャの移動先の座標の原点を指定します。
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 1
 * @default 0
 *
 * @arg x
 * @text X
 * @desc ピクチャの移動先のX座標を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg y
 * @text Y
 * @desc ピクチャの移動先のY座標を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg scaleX
 * @text 拡大率 幅
 * @desc ピクチャの移動後の幅の拡大率を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"100","var":"1"}
 *
 * @arg scaleY
 * @text 拡大率 高さ
 * @desc ピクチャの移動後の高さの拡大率を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"100","var":"1"}
 *
 * @arg opacity
 * @text 不透明度
 * @desc ピクチャの移動後の不透明度を指定します。を指定します。
 * @type struct<unsigned8bitValueOrVariable>
 * @default {"isVar":"false","val":"255","var":"1"}
 *
 * @arg blendMode
 * @text 合成方法
 * @desc 移動するピクチャの合成方法を指定します。
 * @type select
 * @option 通常
 * @value 0
 * @option 加算
 * @value 1
 * @option 乗算
 * @value 2
 * @option スクリーン
 * @value 3
 * @default 0
 *
 * @arg duration
 * @text 時間
 * @desc ピクチャの移動にかける時間を指定します。
 * @type number
 * @type struct<unsigned8bitValueOrVariable>
 * @default {"isVar":"false","val":"255","var":"1"}
 *
 * @arg blendMode
 * @text 合成方法
 * @desc 移動するピクチャの合成方法を指定します。
 * @type select
 * @option 通常
 * @value 0
 * @option 加算
 * @value 1
 * @option 乗算
 * @value 2
 * @option スクリーン
 * @value 3
 * @default 0
 *
 * @arg duration
 * @text 時間
 * @desc ピクチャの移動にかける時間を指定します。
 * @type struct<unsignedValueOrVariable>
 * @default {"isVar":"false","val":"60","var":"1"}
 *
 * @arg wait
 * @text 完了するまでウェイト
 * @desc ピクチャの移動完了までウェイトするかどうかを指定します。
 * @type boolean
 * @default false
 *
 * @command rotatePicture
 * @text ピクチャの回転
 * @desc ピクチャを回転します。
 *
 * @arg pictureNumber
 * @text 番号
 * @desc 回転するピクチャの番号を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"1","var":"1"}
 *
 * @arg speed
 * @text 回転速度
 * @desc ピクチャの回転速度を指定します。
 * @type struct<speedValueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @command tintPicture
 * @text ピクチャの色調変更
 * @desc ピクチャの色調を変更します。
 *
 * @arg pictureNumber
 * @text 番号
 * @desc 色調変更するピクチャの番号を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"1","var":"1"}
 *
 * @arg red
 * @text 色調 赤
 * @desc ピクチャの色調の赤成分を指定します。
 * @type struct<signed8bitValueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg green
 * @text 色調 緑
 * @desc ピクチャの色調の緑成分を指定します。
 * @type struct<signed8bitValueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg blue
 * @text 色調 青
 * @desc ピクチャの色調の青成分を指定します。
 * @type struct<signed8bitValueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg grey
 * @text 色調 グレー
 * @desc ピクチャの色調のグレー成分を指定します。
 * @type struct<unsigned8bitValueOrVariable>
 * @default {"isVar":"false","val":"0","var":"1"}
 *
 * @arg duration
 * @text 時間
 * @desc ピクチャの色調変更にかける時間を指定します。
 * @type struct<unsignedValueOrVariable>
 * @default {"isVar":"false","val":"60","var":"1"}
 *
 * @arg wait
 * @text 完了するまでウェイト
 * @desc ピクチャの色調変更完了までウェイトするかどうかを指定します。
 * @type boolean
 * @default false
 *
 * @command erasePicture
 * @text ピクチャの消去
 * @desc ピクチャを消去します。
 *
 * @arg pictureNumber
 * @text 番号
 * @desc 消去するピクチャの番号を指定します。
 * @type struct<valueOrVariable>
 * @default {"isVar":"false","val":"1","var":"1"}
 */
/*~struct~valueOrVariable:ja
 * @param isVar
 * @text 変数で指定する
 * @desc true なら変数に設定された値を、false なら値に設定された値を利用します。
 * @type boolean
 * @default false
 *
 * @param val
 * @text 値
 * @desc isByVariable が false のときに利用されます。
 * @type number
 * @default 0
 *
 * @param var
 * @text 変数
 * @desc isByVariable が true のときに利用されます。
 * @type variable
 * @default 1
 */
/*~struct~speedValueOrVariable:ja
 * @param isVar
 * @text 変数で指定する
 * @desc true なら変数に設定された値を、false なら値に設定された値を利用します。
 * @type boolean
 * @default false
 *
 * @param val
 * @text 値
 * @desc isByVariable が false のときに利用されます。
 * @type number
 * @default 0
 * @min -90
 * @max 90
 *
 * @param var
 * @text 変数
 * @desc isByVariable が true のときに利用されます。
 * @type variable
 * @default 1
 */
/*~struct~unsignedValueOrVariable:ja
 * @param isVar
 * @text 変数で指定する
 * @desc true なら変数に設定された値を、false なら値に設定された値を利用します。
 * @type boolean
 * @default false
 *
 * @param val
 * @text 値
 * @desc isByVariable が false のときに利用されます。
 * @type number
 * @default 0
 * @min 0
 *
 * @param var
 * @text 変数
 * @desc isByVariable が true のときに利用されます。
 * @type variable
 * @default 1
 */
/*~struct~signed8bitValueOrVariable:ja
 * @param isVar
 * @text 変数で指定する
 * @desc true なら変数に設定された値を、false なら値に設定された値を利用します。
 * @type boolean
 * @default false
 *
 * @param val
 * @text 値
 * @desc isByVariable が false のときに利用されます。
 * @type number
 * @default 0
 * @min -255
 * @max 255
 *
 * @param var
 * @text 変数
 * @desc isByVariable が true のときに利用されます。
 * @type variable
 * @default 1
 */
/*~struct~unsigned8bitValueOrVariable:ja
 * @param isVar
 * @text 変数で指定する
 * @desc true なら変数に設定された値を、false なら値に設定された値を利用します。
 * @type boolean
 * @default false
 *
 * @param val
 * @text 値
 * @desc isByVariable が false のときに利用されます。
 * @type number
 * @default 0
 * @min 0
 * @max 255
 *
 * @param var
 * @text 変数
 * @desc isByVariable が true のときに利用されます。
 * @type variable
 * @default 1
 */
{
  'use strict';

  function getPluginName() {
    return document.currentScript.src.split('/').pop().split('.').slice(0, -1).join('.');
  }

  function parseValueOrVariable(value) {
    const parameter = JSON.parse(value);
    return parseBoolean(parameter.isVar)
      ? $gameVariables.value(parseInt(parameter.var))
      : parseInt(parameter.val);
  }

  function parseBoolean(value) {
    return value === 'true'
  }

  function parseParameters(args) {
    return Object.keys(args).reduce((prev, key) => {
      return {
        ...prev,
        [key]: parameterParser[key]
          ? parameterParser[key](args[key])
          : args[key],
      }
    }, {});
  }

  const pluginName = getPluginName();
  console.log(pluginName);

  const parameterParser = {
    pictureNumber: parseValueOrVariable,
    easing: parseInt,
    origin: parseInt,
    x: parseValueOrVariable,
    y: parseValueOrVariable,
    scaleX: parseValueOrVariable,
    scaleY: parseValueOrVariable,
    opacity: parseValueOrVariable,
    blendMode: parseInt,
    duration: parseValueOrVariable,
    wait: parseBoolean,
    speed: parseValueOrVariable,
    red: parseValueOrVariable,
    green: parseValueOrVariable,
    blue: parseValueOrVariable,
    grey: parseValueOrVariable,
  };

  PluginManager.registerCommand(pluginName, 'showPicture', function(args) {
    const parameters = parseParameters(args);
    $gameScreen.showPicture(
      parameters.pictureNumber,
      parameters.pictureName,
      parameters.origin,
      parameters.x,
      parameters.y,
      parameters.scaleX,
      parameters.scaleY,
      parameters.opacity,
      parameters.blendMode,
    );
  });

  PluginManager.registerCommand(pluginName, 'movePicture', function(args) {
    const parameters = parseParameters(args);
    $gameScreen.movePicture(
        parameters.pictureNumber,
        parameters.origin,
        parameters.x,
        parameters.y,
        parameters.scaleX,
        parameters.scaleY,
        parameters.opacity,
        parameters.blendMode,
        parameters.duration,
        parameters.easing || 0
    );
    if (parameters.wait) {
        this.wait(parameters.duration);
    }
    return true;
  });

  PluginManager.registerCommand(pluginName, 'rotatePicture', function(args) {
    const parameters = parseParameters(args);
    $gameScreen.rotatePicture(
      parameters.pictureNumber,
      parameters.speed,
    );
    return true;
  });

  PluginManager.registerCommand(pluginName, 'tintPicture', function(args) {
    const parameters = parseParameters(args);
    $gameScreen.tintPicture(
      parameters.pictureNumber,
      [
        parameters.red,
        parameters.green,
        parameters.blue,
        parameters.grey,
      ],
      parameters.duration,
    );
    if (parameters.wait) {
      this.wait(parameters.duration);
    }
    return true;
  });

  PluginManager.registerCommand(pluginName, 'erasePicture', function(args) {
    const parameters = parseParameters(args);
    $gameScreen.erasePicture(
      parameters.pictureNumber,
    );
    return true;
  });
}
