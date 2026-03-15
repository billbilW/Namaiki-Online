//===========================================================================
// MPI_TilingPicture.js
//===========================================================================

/*:
 * @plugindesc 任意のピクチャをタイル表示にします。
 * @author 奏ねこま（おとぶき ねこま）
 *
 * @param タイル表示にするピクチャ番号（下層）
 * @desc タイル表示にするピクチャの番号を指定してください。カンマ区切りで複数指定可能です。
 * @default 0
 *
 * @param タイル表示にするピクチャ番号（上層）
 * @desc タイル表示にするピクチャの番号を指定してください。カンマ区切りで複数指定可能です。
 * @default 0
 *
 * @help
 * [ 概要 ] ...
 *  プラグインパラメータで指定したピクチャをタイル表示（画面に敷き詰められたよう
 *  に画像を表示）にします。
 *
 * [ 使用方法 ] ...
 *  プラグインパラメータの「タイル表示にするピクチャ番号（下層）」「タイル表示に
 *  するピクチャ番号（上層）」に、タイル表示にしたいピクチャの番号を指定してくだ
 *  さい。複数指定したい場合は、カンマ区切りで指定できます。
 *
 *  （下層）：通常のピクチャより下に表示されます。
 *  （上層）：通常のピクチャより上に表示されます。
 *
 * [ 制限事項 ] ...
 *  タイル表示にしたピクチャは、以下の制限があります。
 *  ・「原点」の「中央」は指定できません（指定しても「左上」扱いになります）。
 *  ・「ピクチャの色調変更」は実行できません（実行しても何も起こりません）。
 *  ・「ピクチャの回転」は、実行できますが、おそらく期待の動作にはなりません。
 *  ・導入されている他のプラグインの機能は適用されません。
 *
 * [ プラグインコマンド ] ...
 *  プラグインコマンドはありません。
 *
 * [ 利用規約 ] ................................................................
 *  ・本プラグインの利用は、RPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
 *  ・商用、非商用、有償、無償、一般向け、成人向けを問わず、利用可能です。
 *  ・利用の際、連絡や報告は必要ありません。また、製作者名の記載等も不要です。
 *  ・プラグインを導入した作品に同梱する形以外での再配布、転載はご遠慮ください。
 *  ・不具合対応以外のサポートやリクエストは、基本的に受け付けておりません。
 *  ・本プラグインにより生じたいかなる問題についても、一切の責任を負いかねます。
 * [ 改訂履歴 ] ................................................................
 *   Version 1.00  2016/10/25  First edition.
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 *  Web Site: http://makonet.sakura.ne.jp/rpg_tkool/
 *  Twitter : https://twitter.com/koma_neko
 *  Copylight (c) 2016 Nekoma Otobuki
 */

var Imported = Imported || {};
Imported.MPI_TilingPicture = true;

var Makonet = Makonet || {};
Makonet.TPC = {};

(function(){
    'use strict';

    var TPC             = Makonet.TPC;
    TPC.product         = 'MPI_TilingPicture';
    TPC.parameters      = PluginManager.parameters(TPC.product);
    TPC.lowerPictureId  = TPC.parameters['タイル表示にするピクチャ番号（下層）'].trim().split(/ *, */).map(function(value){ return +value });
    TPC.upperPictureId  = TPC.parameters['タイル表示にするピクチャ番号（上層）'].trim().split(/ *, */).map(function(value){ return +value });
    
    function _(object) {
        return object[TPC.product] = object[TPC.product] || {}
    }

    //==============================================================================
    // Spriteset_Base
    //==============================================================================

    var _Spriteset_Base_createPictures = Spriteset_Base.prototype.createPictures;
    Spriteset_Base.prototype.createPictures = function() {
        _Spriteset_Base_createPictures.call(this);
        var index = this.children.indexOf(this._pictureContainer);
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        var x = (Graphics.width - width) / 2;
        var y = (Graphics.height - height) / 2;
        _(this)._tilingPictureLowerContainer = new Sprite();
        _(this)._tilingPictureLowerContainer.setFrame(x, y, width, height);
        _(this)._tilingPictureUpperContainer = new Sprite();
        _(this)._tilingPictureUpperContainer.setFrame(x, y, width, height);
        this.addChildAt(_(this)._tilingPictureLowerContainer, index);
        this.addChildAt(_(this)._tilingPictureUpperContainer, index + 2);
        this._pictureContainer.children.forEach(function(picture, index) {
            if (picture && picture._pictureId) {
                if (TPC.lowerPictureId.contains(picture._pictureId) || TPC.upperPictureId.contains(picture._pictureId)) {
                    picture._pictureId = 0;
                }
            }
        }, this);
        TPC.lowerPictureId.forEach(function(pictureId) {
            _(this)._tilingPictureLowerContainer.addChild(new Sprite_TilingPicture(pictureId));
        }, this);
        TPC.upperPictureId.forEach(function(pictureId) {
            _(this)._tilingPictureUpperContainer.addChild(new Sprite_TilingPicture(pictureId));
        }, this);
    };
    
    //==============================================================================
    // Sprite_TilingPicture
    //==============================================================================

    function Sprite_TilingPicture() {
        this.initialize.apply(this, arguments);
    }

    Sprite_TilingPicture.prototype = Object.create(TilingSprite.prototype);
    Sprite_TilingPicture.prototype.constructor = Sprite_TilingPicture;

    Sprite_TilingPicture.prototype.initialize = function(pictureId) {
        TilingSprite.prototype.initialize.call(this);
        this._pictureId = pictureId;
        this._pictureName = '';
        this._isPicture = true;
        this.move(0, 0, Graphics.width, Graphics.height);
        this.update();
    };

    Sprite_TilingPicture.prototype.picture = function() {
        return $gameScreen.picture(this._pictureId);
    };

    Sprite_TilingPicture.prototype.update = function() {
        TilingSprite.prototype.update.call(this);
        this.updateBitmap();
        if (this.visible) {
            this.updateOrigin();
            this.updatePosition();
            this.updateScale();
            this.updateTone();
            this.updateOther();
        }
    };

    Sprite_TilingPicture.prototype.updateBitmap = function() {
        var picture = this.picture();
        if (picture) {
            var pictureName = picture.name();
            if (this._pictureName !== pictureName) {
                this._pictureName = pictureName;
                this.loadBitmap();
            }
            this.visible = true;
        } else {
            this._pictureName = '';
            this.bitmap = null;
            this.visible = false;
        }
    };

    Sprite_TilingPicture.prototype.updateOrigin = function() {};

    Sprite_TilingPicture.prototype.updatePosition = function() {
        var picture = this.picture();
        this.origin.x = Math.floor((-1 / this.scale.x) * picture.x());
        this.origin.y = Math.floor((-1 / this.scale.y) * picture.y());
    };

    Sprite_TilingPicture.prototype.updateScale = function() {
        var picture = this.picture();
        this.scale.x = picture.scaleX() / 100;
        this.scale.y = picture.scaleY() / 100;
        this.move(0, 0, Graphics.width / this.scale.x, Graphics.height / this.scale.y);
    };

    Sprite_TilingPicture.prototype.updateTone = function() {};

    Sprite_TilingPicture.prototype.updateOther = function() {
        var picture = this.picture();
        this.opacity = picture.opacity();
        this.blendMode = picture.blendMode();
        this.rotation = picture.angle() * Math.PI / 180;
    };

    Sprite_TilingPicture.prototype.loadBitmap = function() {
        this.bitmap = ImageManager.loadPicture(this._pictureName);
    };
}());
