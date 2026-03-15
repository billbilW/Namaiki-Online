//=============================================================================
// Parallax_Animation.js
//=============================================================================

/*:
 * @plugindesc 遠景をアニメーションさせます。
 * @author 村人C
 *
 * @help
 *
 * 使い方
 * コマンド:
 * Wait
 * アニメーションを更新する間隔。
 *
 * Animation
 * アニメーションの数。
 *
 * プラグインコマンド：
 * Parallax_Wait 10
 * アニメーションを更新する間隔を１０に変更します。
 *
 * Parallax_Animation 10
 * アニメーションの数を１０に変更します。
 * マップ変更まで変化ありません。
 *
 * アニメーションさせたい画像の名前の後ろに _〇〇 を追加して下さい。
 * 
 * 例 Mountains の画像を5アニメーションさせたい
 * Mountains_01
 * Mountains_02
 * Mountains_03
 * Mountains_04
 * Mountains_05
 * の様に連番にします。
 *
 * 仕様
 * アニメーションの判定で名前に _ があるかで分岐しているので
 * 名前に _ をつける場合は、アニメーション画像だけにして下さい。
 *
 * アニメーション画像が、一瞬ちらつくことがありますが、画像読み込み時の仕様です。
 *
 * Parallax_Wait と Parallax_Animation はマップ移動前に使うこと推奨です。
 *
 * readmeやスタッフロールの明記、使用報告は任意
 *
 * @param Wait
 * @desc アニメーションを更新する間隔
 * デフォルト: 120
 * @default 120
 *
 * @param Animation
 * @desc アニメーションの数
 * デフォルト: 5
 * @default 5
 *
 */

var Parallax_Animation = Parallax_Animation || {};
Parallax_Animation.Status = []; // 格納用に配列の作成
Parallax_Animation.Parameters = PluginManager.parameters('Parallax_Animation');
// 初期設定
Parallax_Animation.Status[0] = Number(Parallax_Animation.Parameters["Wait"])  || 120;
Parallax_Animation.Status[1] = Number(Parallax_Animation.Parameters["Animation"])  || 5;

(function() {
	// プラグインコマンド
	// プラグインコマンド
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        switch(command) {
			case 'Parallax_Wait':
				$gameSystem._parallax_wait = Number(args[0]);
				break;
            case 'Parallax_Animation':
				$gameSystem._parallax_anim = Number(args[0]);
                break;
        }
    };
	// 設定保存用
	var _Game_System_initialize_Parallax_Animation = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_initialize_Parallax_Animation.call(this);
		this._parallax_wait = Parallax_Animation.Status[0];
		this._parallax_anim = Parallax_Animation.Status[1];
	};
	// 遠景の作成
	var _Spriteset_Map_createParallax_Parallax_Animation = Spriteset_Map.prototype.createParallax;
	Spriteset_Map.prototype.createParallax = function() {
		_Spriteset_Map_createParallax_Parallax_Animation.call(this);
		this._wait_cnt  = 0; // 追加
		this._anime_cnt = 1; // 追加
		// 事前に読み込み
		var name = $gameMap.parallaxName().split("_") // 名前を分割
		this._parallax._bitmaps  = [this._parallax.bitmap];
		if (name[1] !== undefined) {
			if (this._parallax._bitmaps[2] === undefined) {
				for (var i = 1; i <= $gameSystem._parallax_anim; i++) {
					if (i > 9) {
						var filename = name[0] + '_' + String(i);
					}
					else {
						var filename = name[0] + '_' + String(0) + String(i);
					}
					this._parallax._bitmaps[i] = ImageManager.loadParallax(filename);
				}
			}
		}
	};
	// 遠景の更新
	var _Spriteset_Map_updateParallax_Parallax_Animation = Spriteset_Map.prototype.updateParallax;
	Spriteset_Map.prototype.updateParallax = function() {
		if (this._parallax._bitmaps[1] !== undefined) {
			// アニメーション判定
			if ((this._wait_cnt % $gameSystem._parallax_wait) === 0) {
				// カウントリセット判定
				if (this._anime_cnt > this._parallax._bitmaps.length-1) {
					this._anime_cnt = 1 // カウントリセット
				}
				var i = Math.min(this._anime_cnt, (this._parallax._bitmaps.length-1));
				this._parallax.bitmap = this._parallax._bitmaps[i];
				this._anime_cnt += 1; // 表示アニメ判定
			}
			this._wait_cnt = (this._wait_cnt + 1) % ($gameSystem._parallax_anim * $gameSystem._parallax_wait)
			// 元の処理
			if (this._parallax.bitmap) {
				this._parallax.origin.x = $gameMap.parallaxOx();
				this._parallax.origin.y = $gameMap.parallaxOy();
			}
		} else {
			return _Spriteset_Map_updateParallax_Parallax_Animation.call(this);
		}
	};
})();