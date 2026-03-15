//=============================================================================
//  Keke_FreeCamera - フリーカメラ
// バージョン: 1.9.9
//=============================================================================
// Copyright (c) 2022 ケケー
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @target MZ
 * @plugindesc カメラを自由に操作する
 * @author ケケー
 * @url https://kekeelabo.com
 * 
 * @help
 * 【ver.1.9.9】
 * カメラを自由自在に操作する。ズーム・ずらし・注視など
 *
 * ● 特徴 ●
 *
 * ■自由自在なカメラ操作
 * ◎なめらかで縦横無尽なカメラワーク
 * ◎好きなキャラを注視・追尾
 * ◎メッセージ制御文字でも操作可能
 * ◎指定のキャラをズーム時サイズ固定にする『ズーム除外』
 *
 * ■カメラの維持
 * ◎シーン変更・データロードしてもカメラの状態を維持
 * ◎シーンを切り替えてもカメラの動きが途切れない
 * 
 * ■スワイプモード
 * ◎スワイプで画面を自在にスクロール
 * ◎快適かつ直覚的な操作感
 * ◎特にスマホプレイに最適(マウスでも可)
 *
 * 
 * ● 使い方 ●
 *
 * 【機能1】カメラ操作
 * => プラグインコマンド → カメラ操作
 * ◎ズーム倍率・ずらしX・ずらしYは「動作文字での動作制御」が可能
 * 　詳しくは後述
 *
 *
 * 【機能1+】「メッセージ中の制御文字」でのカメラ操作
 * メッセージ中に
 *  　\cm[注視キャラ名/ID, 動作時間, ズーム倍率, ずらしX, ずらしY]
 * ◎cm の部分はプラグインパラメータから変更できる
 * ◎注視キャラは入力が数字の場合はIDでの指定、それ以外なら名前での指定になる
 * ◎キャラ名 => ***:イベント検索、セルフ:イベント自身、プレイヤー:同、
 *　　フォロワー:同、乗り物:同、\v[***] :変数
 * ◎キャラID => 1〜:イベントID。0:イベント自身、-1:プレイヤー、
 * 　　-11〜:フォロワー、-101〜:乗り物。\v[***] :変数
 * 例)
 * \cm[プリシア]
 * 　名前に「プリシア」が含まれるイベントを注視
 * \cm[セルフ, 30]
 * 　メッセージを実行しているイベントに向けて、30フレーム かけてカメラ移動
 * \cm[プレイヤー, 30, 2]
 * 　プレイヤーに向けて、30フレーム かけて 2倍 にズームしながらカメラ移動
 * \cm[プレイヤー, 30, 2, 100, 50]
 * 　プレイヤーから右に 100ピクセル、下に 50ピクセル の位置に向けて、
 * 　30フレーム かけて 2倍 にズームしながらカメラ移動
 *
 *
 * 【機能2】ズーム除外
 * => プラグインコマンド → ズーム除外
 * ◎除外キャラはズームしてもサイズが変わらなくなる
 * ◎除外拡大率を設定した場合はズーム時にサイズ補正される
 * 　2 なら 2倍、0.5 なら 0.5倍
 * ◎効果があるのはズームアウト(カメラを引いた)時のみ
 * 
 * 
 * 【機能3】スワイプモード
 * スワイプモードを開始する場合
 * => プラグインコマンド → スワイプモード開始
 * スワイプモードを終了する場合
 * => プラグインコマンド → スワイプモード終了
 * ◎スワイプモード中はスワイプで画面スクロールできる
 * ◎マウスの場合は左ボタンを押しながらマウスを動かす
 * ◎ピンチ操作(指をつまむような動作)かマウスホイールでズームも可能
 * 　(ズームは無効化することもできる)
 * ◎スワイプモード中はタッチでの移動が無効化される
 * ◎スワイプモードを終了すると開始時の位置に戻る(戻さないことも可能)
 *
 *
 * 【機能4】カメラ位置を初期化
 * => プラグインコマンド → カメラ位置を初期化
 * ◎カメラの位置を初期状態に戻す
 * ◎初期状態とはプレイヤー注視、ズーム倍率は基本値、ずらし 0 の状態のこと
 * 
 * 
 * 【機能5】カメラ位置を保存/復元
 * カメラ位置を保存する場合
 * => プラグインコマンド → カメラ位置を保存
 * カメラ位置を復元する場合
 * => プラグインコマンド → カメラ位置を復元
 * ◎「カメラ位置を保存」で現在のカメラの位置を保存
 * ◎その後「カメラ位置を復元」を実行すると保存した位置に戻すことができる
 * ◎一時的にカメラを変更する場合に使う
 *  「カメラ位置を保存」→「カメラ操作」でカメラの位置を変更
 * 　→「カメラ位置を復元」で元の位置に戻す、といった具合で
 * ◎保存/復元する項目を限定することも可能。ズーム倍率のみ復元するなど
 *
 *
 * 【応用1】マップ開始時にカメラ変更状態にする
 * => 各プラグインコマンドの『開始時に実行』を true にする
 *
 *
 * 【応用2】好きな地点を注視する
 * 　カメラ専用のイベントを作り、それを好きな地点に移動させて、注視する
 *
 *
 * 【応用3】マルチ演算
 * ◎ズーム倍率・ずらしX・ずらしYの頭に、
 * 　以下の計算記号を付けると演算ができる
 * 例: 元の値が 10 の場合
 * 2
 * 　= 2。2 で上書きする。
 * +2
 * 　= 12。2 を足す
 * +-2
 * 　= 8。-2 を足す、つまり 2 を引く
 * *2
 * 　= 20。2 をかける
 * /2
 * 　= 5。2 で割る
 * %3
 * 　= 1。3 で割った余りを出す
 * 
 * 
 * 【応用4】動作文字
 * ◎ズーム倍率・ずらしX・ずらしYの末尾に、
 * 　以下の動作文字を付けるとイージング等の特殊な動作ができる
 *  e
 * 　イージングインアウト。ゆっくり始まってゆっくり終わる
 *  ei
 * 　イージングイン。ゆっくり始まる
 *  eo
 * 　イージングアウト。ゆっくり終わる
 *  tn
 * 　ターン。→←。進んで戻る
 *  cg
 * 　チャージ。←→→。少し戻ってから一気に進む。cg(**)で戻り幅が **倍
 *  fk
 * 　フック。→→←。一気に進んでから少し戻る。fk(**)で戻り幅が **倍
 *  cf
 * 　チャージフック。←→→←。チャージとフックの融合。cf(**)で戻り幅が **倍
 *  rd
 * 　ラウンド。→←←→。ぐるりと円を描く
 *  bk
 * 　バック。←。戻ってくる
 *  _回数
 * 　動作回数。_2 なら 2回繰り返す
 * ※これら動作文字は一度に一つのみ。二つ以上書いても効果を発揮しない
 * ※動作文字がない場合は自動的にイージングインアウトになる
 * 例)
 * ズーム倍率　2
 * 　ズーム倍率をイージングインアウトをかけながら 2倍 にする
 * ズーム倍率　2ei
 * 　ズーム倍率をイージングインをかけながら 2倍 にする
 * ズーム倍率　2tn
 * 　ズーム倍率を 2倍 にして、元に戻す
 * ずらしX　100cg
 * 　左に 100ピクセル 戻った後、右に 200ピクセル 進む
 * ずらしX　100cg(0.5)
 * 　左に 50ピクセル 戻った後、右に 150ピクセル 進む
 * ずらしX　100tn_2
 * 　右に 100ピクセル 進み、元の位置に戻る。それを2回繰り返す
 *
 *
 * 【注釈1】開始時に実行
 * ◎プラグインコマンドの『開始時に実行』を true にすると、
 * 　マップ/バトル開始前に自動的に実行される
 * ◎具体的には、イベントを作ったら、出現条件とかトリガーとか一切いじらずに、
 * 　『開始時に実行』を true にしたプラグインコマンドを置くだけでよい
 * 　それだけで自動的に実行される
 * ◎トリガーを自動実行や並列処理にする必要はない
 * 　するとプラグインコマンドが重ねて実行されてしまうので注意
 * ◎バトルの場合はバトルイベントの1ページ目に、
 * 　条件を設定せずにそのまま置く
 * ◎この『開始時に実行』はマップ/バトルが開始される前に実行されるので、
 * 　コマンドの効果を最初から反映された状態にしたい場合に使うとよい
 * 
 * 
 * 【注釈2】名前でのキャラ指定
 * ◎語句を入力すると、
 * 　入力語句が名前+メモ欄に“含まれている”イベントを指定する
 * 　『zoom』なら、名前+メモ欄に zoom が含まれているイベント
 * ◎プレイヤー と入力すると プレイヤー を指定
 * ◎セルフ と入力すると、動作中のイベント自身 を指定
 * ◎フォロワー1 と入力すると 1番目 のフォロワーを指定。フォロワー2 なら 2番目
 * ◎乗り物1 と入力すると 1番目 の乗り物を指定。乗り物2 なら 2番目
 * ◎\v[***] と入力すると変数使用。\v[5] なら 変数5番 と置換される
 * ◎ , で区切ると複数指定。プリシア, リード ならプリシアとリード
 *
 *
 * 【注釈3】IDでのキャラ指定
 * ◎数値を入力すると、イベントIDがその値のイベントを指定する
 * 　5なら、ID 5 のイベント
 * ◎-1 を入力すると プレイヤー を指定
 * ◎0 を入力すると、動作中のイベント自身 を指定
 * ◎-11 を入力すると 1番目 のフォロワーを指定。-12 なら 2番目
 * ◎-101 を入力すると 1番目 の乗り物を指定。-101 なら 2番目
 * ◎\v[***] と入力すると変数使用。\v[5] なら 変数5番 と置換される
 * ◎ , で区切ると複数指定。5, 7 なら 5 と 7
 * ◎ ~ でまとめて指定。5~7 なら 5 と 6 と 7
 * 　
 *
 * ● 利用規約 ●
 * MITライセンスのもと、自由に使ってくれて大丈夫です
 *
 *
 *
 * Control your camera freely. Zoom, shift, gaze, etc.
 *
 * ● Features ●
 *
 * ■ Flexible camera operation
 * ◎ Smooth and unlimited camera work
 * ◎ Gaze and track your favorite character
 * ◎ Can also be operated with message control characters
 * ◎"Exclude zoom" to fix the size of the specified character when zooming
 * 
 * ■ Maintenance of the camera
 * ◎ Maintains the camera state even when changing scenes or loading data
 * ◎ The movement of the camera is not interrupted even
 *   when the scene is switched.
 *
 *
 * ● How to use ●
 *
 * [Function 1] Operate the camera
 * => plug-in command → camera operation
 * ◎Zoom magnification, shift X,
 *   and shift Y can be controlled by motion characters.
 *   See below for details
 * 　
 *
 * [Function 1+] Camera operation with "control characters in messages"
 * in a message
 *   \cm[Gaze Character Name/ID,
 *   Action Time, Zoom Magnification, Shift X, Shift Y]
 * ◎ cm part can be changed from the plug-in parameter
 * ◎ Gaze character is specified by ID if the input is a number,
 *   otherwise specified by name
 * ◎ Character name => ***: Event search, Self: Event itself, Player: Same,
 *   Follower: Same, Vehicle: Same, \v[***]: Variable
 * ◎ Character ID => 1~: Event ID. 0: event itself, -1: player,
 *   From -11: followers, from -101: vehicles. \v[***] : variable
 * 
 * 
 * [Function 2] Set characters excluded from zoom
 * => plugin command → exclude zoom
 * ◎ Excluded characters do not change size even when zoomed
 * ◎ If you set an exclusion magnification rate,
 *   the size will be corrected when zooming.
 *   2 is 2 times, 0.5 is 0.5 times
 * ◎ Effective only when zooming out (pulling the camera)
 *
 * 
 * [Function 3] Swipe mode
 * When starting swipe mode
 * => plugin command → start swipe mode
 * When exiting swipe mode
 * => plugin command → exit swipe mode
 * ◎ You can scroll the screen by swiping while in swipe mode
 * ◎ When using a mouse, move the mouse while holding down the left button.
 * ◎ Zoom is also possible with pinch operation
 * 　 (movement like pinching fingers)
 * 　 or mouse wheel
 *   (Zoom can be disabled)
 * ◎ Touch movement is disabled during swipe mode
 * ◎ Return to the starting position when exiting swipe mode
 * 　 (it is also possible not to return)
 *
 *
 * [Function 4] Initialize camera position
 * => plugin command → initialize camera position
 * ◎ Reset the camera position to the initial state
 * ◎ The initial state is the player's gaze,
 * 　 the zoom magnification is the basic value, and the shift is 0.
 *
 *
 * [Function 5] Save/restore camera position
 * When saving the camera position
 * => plugin command → save camera position
 * When restoring the camera position
 * => plugin command → restore camera position
 * ◎ Save the current camera position with "Save camera position"
 * ◎ After that, you can restore the saved position
 * 　 by executing "Restore camera position".
 * ◎ Used to temporarily change the camera
 *   Change the camera position by "Save camera position" → "Camera operation"
 *   → Restore the original position with "Restore camera position"
 * ◎ It is also possible to limit the items to be saved/restored.
 *   Restoring only the zoom ratio, etc.
 *
 *
 * [Applied 1] Set the camera change state at the start of the map
 * => Set "apply at start" of each plugin command to true
 *
 *
 * [Application 2] Focus on your favorite spot
 * Create an event dedicated to the camera,
 * move it to any point, and watch it
 *
 *
 * [Applied 3] Motion control with action characters
 * At the end of zoom magnification, shift X, shift Y
 * ---------- only one of these easing systems
 * e
 *   Easing in/out. Start slowly and end slowly. the standard is this
 *   If you want to do this movement, you don't have to write anything
 * ei
 *   Easing in. start slowly
 * eo
 *   Easing out. finish slowly
 * tn
 *   Turn. →←. willing to go back
 * cg
 *   Charge. ←→→.
 *   Backtrack a little and then move on. cg(**) returns width ** times
 * fk
 *   hook. →→←.
 *   Go forward and then back up a bit. Return width is ** times with fk(**)
 * cf
 *   Charge hook. ←→→←.
 *   Fusion of charge and hook. cf(**) returns width ** times
 * rd
 *   Round. →←←→. draw a circle around
 * bk
 *   Back. ←. Come back
 * ---------- If you do not indicate the easing system,
 *   it will automatically be easing in-out
 * _ times
 * Number of operations. _2 repeats twice
 * example)
 * Zoom magnification 2
 *   Double the zoom ratio while applying easing in/out
 * Zoom magnification 2ei
 *   Double the zoom ratio while easing in
 * Zoom magnification 2tn
 *   Double the zoom factor and restore
 * Shift X 100cg
 *   Go back 100 pixels to the left, then go 200 pixels to the right
 * Shift X 100cg (0.5)
 *   Go back 50 pixels to the left, then go 150 pixels to the right
 * Shift X 100tn_2
 * 　Advance 100 pixels to the right and return to the original position.
 *   repeat it twice
 *
 *
 * [Note 1] About character designation by name
 * ◎ When you enter a word,
 *   Specify events where the input phrase is "included"
 *   in the name + memo field
 *   For "zoom", events that include "zoom" in the name + memo field
 * ◎ When you type player, he specifies the player
 * ◎ When you enter self, specify the event itself in action.
 * ◎ Enter follower 1 to specify the first follower. 2nd follower
 * ◎ Enter vehicle 1 to specify the first vehicle. 2nd if vehicle 2
 * ◎ Enter \v[***] to use variables. \v[5] is replaced with variable number 5
 * ◎ Multiple specifications can be specified by delimiting with ,
 *   Priscilla, Reed If Priscilla and Reed
 *
 *
 * [Note 2] Regarding character designation by ID
 * ◎ If you enter a number, the event ID specifies the event with that value.
 *   If 5, the event with ID 5
 *   Enter -1 and he will specify a player
 * ◎ Entering 0 specifies the active event itself.
 *   Enter -11 to specify the first follower. -12 is second
 *   Enter -101 to specify the first ride. -101 is second
 * ◎ Enter \v[***] to use variables. \v[5] is replaced with variable number 5
 * ◎ Multiple specifications can be specified by delimiting with,
 *   5, 7 then 5 and 7
 * ◎ Specified collectively with ~. 5~7 then 5 and 6 and 7
 * 　
 *
 * ● Terms of Service ●
 * Feel free to use it under the MIT license.
 * 
 * 
 *  
 * @param 基本ズーム倍率
 * @desc zoomRateBasic 基本のズーム倍率。基本 1
 * @default 1
 *
 * @param ピクチャ画面固定
 * @desc pictureScreenFix ピクチャに画面に固定し、ズームの影響を受けなくする。基本 true
 * @type boolean
 * @default true
 *
 * @param 場所移動でカメラ初期化
 * @desc initCameraOnTransfar 場所移動時にカメラを初期化する。基本 true
 * @type boolean
 * @default true
 *
 * @param カメラ制御文字
 * @desc controlCharCamera カメラ操作の制御文字。cm なら \cm[注視キャラID/名前, ズーム倍率, 動作時間, ずらしX, ずらしY]
 * @default cm
 * 
 * @param キャラスムーズ無効
 * @desc noSmooth キャラクター拡縮時のアンチエイリアス処理を無効化する。ズーム時の変な線が出なくなる
 * @type boolean
 * @default true
 * 
 * @param スワイプモード
 * 
 * @param スワイプキー
 * @parent スワイプモード
 * @desc swipeKey スワイプモード中、スワイプに使うキー。このキー+方向キーでスワイプが可能。基本 shift
 * @type select
 * @option none
 * @option ok
 * @option cancel
 * @option pageup
 * @option pagedown
 * @option shift
 * @option control
 * @default shift
 * 
 * @param ズームキー
 * @parent スワイプモード
 * @desc zoomKey スワイプモード中、ズームに使うキー。このキー+方向キーでズームが可能。基本 control
 * @type select
 * @option none
 * @option ok
 * @option cancel
 * @option pageup
 * @option pagedown
 * @option shift
 * @option control
 * @default control
 *
 *
 *
 * @command カメラ操作
 * @desc cameraControl カメラをズーム・ずらし・注視させる
 *
 * @arg 開始時に実行
 * @desc startingExe シーン開始時に自動的に実行する
 * @type boolean
 * @default 
 *
 * @arg 注視キャラ-名前
 * @desc tageName 名前で対象選択。**:イベント名 セルフ:イベント自身、プレイヤー:同、フォロワー:同、乗り物:同、\v[**] :変数
 *
 * @arg 注視キャラ-ID
 * @desc tageId IDで対象選択。1〜:イベントID。0:イベント自身、-1:プレイヤー、-11〜:フォロワー、-101〜:乗り物。\v[**] :変数
 *
 * @arg 動作時間
 * @desc moveTime カメラ動作時間。5 なら 5フレーム、1s なら 1秒。_2 付きで 2回 実行、_-1 でループ実行。w 付きでウェイト
 *
 * @arg ズーム倍率
 * @desc zoomRate 目標とするズーム倍率。2 なら 2倍 カメラが対象に近づく。空欄時 1。演算可。動作文字対応
 *
 * @arg ずらしX
 * @desc offsetX 注視地点からのXずらし幅。5 なら 5ピクセル 右へ。空欄時 0。演算可。動作文字対応
 *
 * @arg ずらしY
 * @desc offsetY 注視地点からのYずらし幅。5 なら 5ピクセル 下へ。空欄時 0。演算可。動作文字対応
 *
 *
 *
 * @command ズーム除外
 * @desc zoomExept ズームアウト時にサイズ固定になるキャラを設定する
 *
 * @arg 開始時に実行
 * @desc startingExe シーン開始時に自動的に実行する
 * @type boolean
 *
 * @arg 対象キャラ-名前
 * @desc tageName 名前で対象選択。**:イベント名、セルフ:イベント自身、プレイヤー:同、全:全キャラ、\v[**]:変数。, で複数指定
 *
 * @arg 対象キャラ-ID
 * @desc tageId IDで対象選択。1〜:イベントID。0:イベント自身、-1:プレイヤー、-2:全キャラ、\v[**]:変数, で複数、~ で一括指定
 *
 * @arg 除外時拡大率
 * @desc zoomRateOnExept ズーム除外時の拡大率。空欄時 1。演算可
 *
 * @arg 除外クリア
 * @desc clearExept 全てのキャラの除外設定を解除する
 * @type boolean
 *
 *
 *
 * @command スワイプモード開始
 * @desc startSwipeMode スワイプモードを開始する。モード中は「スワイプで画面スクロール」「ピンチ/ホイールでズーム」ができる
 *
 * @arg 開始時に実行
 * @desc startingExe シーン開始時に自動的に実行する
 * @type boolean
 *
 * @arg タッチスワイプ速度
 * @desc touchSwipeSpeed タッチスワイプのスクロール速度。1.5 なら 1.5倍速
 * @default 1
 *
 * @arg …慣性時間
 * @desc inertiaTime タッチスワイプの慣性の持続時間。50 なら 50フレーム
 * @default 40
 * 
 * @arg キースワイプ速度
 * @desc keySwipeSpeed キースワイプのスクロール速度。1.5 なら 1.5倍速
 * @default 1
 *
 * @arg …キー慣性時間
 * @desc keyInertiaTime キースワイプの慣性の持続時間。50 なら 50フレーム
 * @default 20
 * 
 * @arg …キー加速度
 * @desc keyAccelerate キースワイプの加速度。5 なら 5% ずつ加速
 * @default 5
 * 
 * @arg 移動時位置戻す
 * @desc restorePosOnMove プレイヤーが移動したらカメラの位置をスワイプモード開始時の状態に戻す
 * @type boolean
 * @default true
 * 
 * @arg 移動時ズーム戻す
 * @desc restoreZoomOnMoveプレイヤーが移動したらカメラのズーム倍率をスワイプモード開始時の状態に戻す
 * @type boolean
 * @default false
 * 
 * @arg …戻し時間
 * @desc restoreTime スワイプ/ズーム分を元に戻す動作の所要時間。5 なら 5フレーム、1s なら 1秒
 * @default 30
 * 
 * @arg ずっと維持
 * @desc keepAllTime マップが切り替わってもスワイプモードを維持する。解除するには「スワイプモード解除」を実行
 * @type boolean
 * @default 
 * 
 * @arg ズーム
 * 
 * @arg ズーム有効
 * @parent ズーム
 * @desc validZoom スワイプモード中の手動ズームを有効にする
 * @type boolean
 * @default true
 * 
 * @arg タッチズーム速度
 * @parent ズーム
 * @desc touchZoomSpeed ピンチ操作(指をつまむような動作)によるズーム速度。マイナスにする動作が反転する
 * @default 1
 * 
 * @arg ホイールズーム速度
 * @parent ズーム
 * @desc wheelZoomSpeed ホイール操作によるズーム速度。マイナスにする動作が反転する
 * @default 1
 * 
 * @arg キーズーム速度
 * @parent ズーム
 * @desc keyZoomSpeed キー操作によるズーム速度。マイナスにする動作が反転する
 * @default 1
 *
 * @arg 最大ズーム倍率
 * @parent ズーム
 * @desc maxZoomRate ピンチズーム/ホイールズームによる最大ズーム倍率
 * @default 1.5
 * 
 * @arg 最小ズーム倍率
 * @parent ズーム
 * @desc minZoomRate ピンチズーム/ホイールズームによる最小ズーム倍率
 * @default 0.35
 *
 *
 *
 * @command スワイプモード終了
 * @desc endSwipeMode スワイプモードを終了する
 * 
 * @arg 開始時に実行
 * @desc startingExe シーン開始時に自動的に実行する
 * @type boolean
 * 
 * @arg 位置を戻す
 * @desc restorePos カメラの位置をスワイプモード開始時の状態に戻す
 * @type boolean
 * @default true
 * 
 * @arg ズームを戻す
 * @desc restoreZoom カメラのズーム倍率をスワイプモード開始時の状態に戻す
 * @type boolean
 * @default true
 * 
 * @arg 戻し時間
 * @desc restoretime カメラをスワイプモード開始時の状態に戻す動作の所要時間。5 なら 5フレーム、1s なら 1秒
 * @default 30
 *
 *
 *
 * @command カメラ位置を初期化
 * @desc initCameraPos カメラの位置を初期状態に戻す。初期状態とはプレイヤー注視、ズーム倍率は基本値、ずらし 0 の状態のこと
 * 
 * @arg 戻し時間
 * @desc restoreTime カメラを初期位置に戻す動作の所要時間。5 なら 5フレーム、1s なら 1秒
 * @default 30
 * 
 * 
 * 
 * 
 * @command カメラ位置を保存
 * @desc  現在のカメラの位置を保存する。保存した位置は後で復元可能
 * 
 * @arg 保存-注視キャラ
 * @desc save-focusChara 注視対象を保存する
 * @type boolean
 * @default true
 *
 * @arg 保存-ズーム倍率
 * @desc save-zoomRate ズーム倍率を保存する
 * @type boolean
 * @default true
 * 
 * @arg 保存-ずらしX
 * @desc save-offsetX ずらしXを保存する
 * @type boolean
 * @default true
 * 
 * @arg 保存-ずらしY
 * @desc save-offsetY ずらしYを保存する
 * @type boolean
 * @default true
 * 
 * 
 * 
 * @command カメラ位置を復元
 * @desc  保存したカメラの位置を復元する
 * 
 * @arg 復元時間
 * @desc カメラを復元位置に戻す動作の所要時間。5 なら 5フレーム、1s なら 1秒。w 付きでウェイト
 * @default 30
 * 
 * @arg 復元-注視キャラ
 * @desc load-focusChara 注視キャラを復元する
 * @type boolean
 * @default true
 *
 * @arg 復元-ズーム倍率
 * @desc load-zoomRate ズーム倍率を復元する
 * @type boolean
 * @default true
 * 
 * @arg 復元-ずらしX
 * @desc load-offsetX ずらしXを復元する
 * @type boolean
 * @default true
 * 
 * @arg 復元-ずらしY
 * @desc load-offsetY ずらしYを復元する
 * @type boolean
 * @default true
 */
 
 
 
(() => {
    //- プラグイン名
    const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];



    //==================================================
    //--  公開
    //==================================================

    //- ズームの呼び出し(公開)
    Game_Screen.prototype.callZoomKe = function(chara, time, scale, offsetX, offsetY, preter, isBack) {
        callZoom(chara, time, scale, offsetX, offsetY, preter, isBack);
    };

    //- ズームの呼び出し
    function callZoom(chara, time, scale, offsetX, offsetY, preter, isBack) {
        // ズームの終了
        finishZoom();
        // カメラパラムのセット
        setCameraParam(chara, scale, offsetX, offsetY, time, preter, isBack);
        // ズームの起動
        runZoom();
    };


    //- スワイプモード中か(公開)
    Game_Map.prototype.inSwipeModeKe = function() {
        return inSwipeMode();
    };

    //- スワイプモード中か
    function inSwipeMode() {
        const p = getCameraParam();
        return p && p.swipeMode;
    };


    //- キースワイプ中か(公開)
    Game_Map.prototype.inKeySwipeKe = function() {
        return inKeySwipe() || inKeyZoom();
    };



    //==================================================
    //--  パラメータ受け取り
    //==================================================
    
    //- 真偽化
    function toBoolean(str) {
        if (!str) { return false; }
        const str2 = str.toString().toLowerCase();
        if (str2 == "true" || str2 == "on") { return true; }
        if (str2 == "false" || str2 == "off") { return false; }
        return Number(str);
    };

    let parameters = PluginManager.parameters(pluginName);
    
    const keke_zoomScaleBase = Number(parameters["基本ズーム倍率"]) || 1;
    const keke_pictureScreenFix = toBoolean(parameters["ピクチャ画面固定"]);
    const keke_initCameraInLocate = toBoolean(parameters["場所移動でカメラ初期化"]);
    const keke_controlCharCamera = parameters["カメラ制御文字"] ? parameters["カメラ制御文字"].toUpperCase() : "";
    const keke_noCharaSmooth = toBoolean(parameters["キャラスムーズ無効"]);
    const keke_swipeKey = parameters["スワイプキー"];
    const keke_zoomKey = parameters["ズームキー"];

    parameters = null;

    
    
    //==================================================
    //--  プラグインコマンド
    //==================================================
    
    //- カメラ操作
    PluginManager.registerCommand(pluginName, "カメラ操作", args => {
        const self = getPlcmEvent();
        // 注視対象を取得
        const names = convertVariable(args["注視キャラ-名前"]);
        const ids = convertVariable(args["注視キャラ-ID"]);
        let chara = [...getCharasByName(names, self), ...getCharasById(ids, self)][0];
        if (!chara && (args["注視マップX"] || args["注視マップY"])) {
            chara = { _realX:args["注視地点X"] || 0, _realY:args["注視地点Y"] || 0 }
        }
        // ズームの呼び出し
        callZoom(chara, args["動作時間"], args["ズーム倍率"], args["ずらしX"], args["ずらしY"], plcmPreter);
    });
    
    
    //- ズーム除外
    PluginManager.registerCommand(pluginName, "ズーム除外", args => {
        if (toBoolean(args["除外クリア"])) {
            getAllCharacter.forEach(chara => {
                if (!chara) { return; }
                chara._zoomNoKe = null;
                chara._zoomNoScaleKe = null;
            });
        }
        const self = getPlcmEvent();
        // 除外対象を取得
        const names = convertVariable(args["対象キャラ-名前"]);
        const ids = convertVariable(args["対象キャラ-ID"]);
        const charas = Array.from(new Set([...getCharasByName(names, self), ...getCharasById(ids, self)]));
        // ズーム除外を設定
        charas.forEach(chara => {
            if (!chara) { return; }
            chara._zoomNoKe = args["除外時拡大率"] ? calcMulti(chara._zoomNoKe || 1, args["除外時拡大率"])[0].val : chara._zoomNoKe || 1;
        });
    });
    
    
    //- スワイプモード開始
    PluginManager.registerCommand(pluginName, "スワイプモード開始", args => {
        // スワイプモードの開始
        startSwipeMode(args);
    });
    
    
    //- スワイプモード終了
    PluginManager.registerCommand(pluginName, "スワイプモード終了", args => {
        // スワイプモードの終了
        endSwipeMode(args);
    });
    
    
    //- カメラ位置を初期化
    PluginManager.registerCommand(pluginName, "カメラ位置を初期化", args => {
        // カメラ位置の初期化
        initCameraPos(args);
    });


    //- カメラ位置を保存
    PluginManager.registerCommand(pluginName, "カメラ位置を保存", args => {
        // カメラ位置の保存
        saveCameraPos(args);
    });


    //- カメラ位置を復元
    PluginManager.registerCommand(pluginName, "カメラ位置を復元", args => {
        // カメラ位置の復元
        restoreCameraPos(args);
    });
    
    
    
    //==================================================
    //--  共通開始
    //==================================================

    // プラグインコマンド時のキャラスプライト一時保存変数
    let charaSpritePlcm = null;
    
    //- スプライトセット・マップ開始(コア追加)
    const _Spriteset_Map_initialize = Spriteset_Map.prototype.initialize;
    Spriteset_Map.prototype.initialize = function() {
        // カメラのロード
        loadCamera();
        _Spriteset_Map_initialize.apply(this);
    };
    
    
    //- シーンマップ・スタート(コア追加)
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.apply(this);
        // カメラの再開
        restartCamera();
    };
    
    
     //- ゲームマップ・セットアップ(コア追加)
    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        // カメラの初期化
        initCamera();
        _Game_Map_setup.apply(this, arguments);
    };
    
    
    //- スプライトキャラクター(コア追加)
    const _Sprite_Character_initialize = Sprite_Character.prototype.initialize;
    Sprite_Character.prototype.initialize = function(character) {
        _Sprite_Character_initialize.apply(this, arguments);
        // 開始時プラグインコマンドの実行
        if (character._eventId && !$gameMap._pcStartedKeFrcm && character._pageIndex >= 0) {
            setTimeout(setPcStarted, 0);
            charaSpritePlcm = this;
            runPluginCmdStarting(character.list(), [/ズーム除外/, /カメラ操作/, /スワイプモード開始/, /スワイプモード終了/], "開始時に実行");
            charaSpritePlcm = null;
            character._pcStartedKeFrcm = true;
        }
    };

    function setPcStarted() {
        $gameMap._pcStartedKeFrcm = true;
    };
    
    
    
    //==================================================
    //--  共通更新
    //==================================================
    
    //- スプライトキャラクター更新(コア追加)
    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _Sprite_Character_update.apply(this);
        // ズーム除外の更新
        updateZoomNo(this);
    };
    
    
    //- スプライトセット・マップ
    const _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.apply(this);
        // スワイプモードの更新
        updateSwipeMode()
    };
    
    
    
    //==================================================
    //--  共通終了
    //==================================================
    
    //- シーンマップ(コア追加)
    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        _Scene_Map_terminate.apply(this);
        // マップ移動時
        if ($gamePlayer._newMapId && $gamePlayer._newMapId != $gameMap.mapId()) {
            $gameMap._pcStartedKeFrcm = false;
        }
    };


    
    //==================================================
    //--  共通処理
    //==================================================

    //- マップか
    function isMap() {
        const scene = SceneManager._scene;
        return scene && scene.constructor.name == "Scene_Map";
    };



    //==================================================
    //--  ズームの実行
    //==================================================
    
    // 拡大ループ実行フラグ
    let doScaleLoop = false;
    // ずらしXループ実行フラグ
    let doXLoop = false;
    // ずらしYループ実行フラグ
    let doYLoop = false;
    
    //- カメラの初期化
    function initCamera() {
        if (keke_initCameraInLocate) { $gameMap._zoomInitedKe = false; }
        // 注視の初期化
        initFocus();
        if ($gameMap._zoomInitedKe) { return; }
        // カメラパラムのセット
        setCameraParam($gamePlayer, keke_zoomScaleBase.toString(), "0", "0");
        // ズームの起動
        runZoom();
        //callZoom(($gamePlayer, 10, keke_zoomScaleBase.toString(), "0", "0"));
        $gameMap._zoomInitedKe = true;
    };
    
    
    //- 注視の初期化
    function initFocus() {
        const p = getCameraParam();
        if (!p) { return; }
        p.chara = $gamePlayer;
        p.preChara = null;
    };
    
    
    //- ズームの終了
    function finishZoom() {
        const p = getCameraParam();
        if (!p || !p.duration) { return; }
        const gs = $gameScreen;
        p.duration = 0;
        p.scaleDuration = 0;
        p.xDuration = 0;
        p.yDuration = 0;
        gs._zoomScale = p.scaleEasing.match(/tn|rd|bk/i) ? p.scaleStart : p.scaleTarget;
        p.x = p.xEasing.match(/tn|rd|bk/i) ? (p.xStart != null ? p.xStart : p.xTarget) : p.xTarget;
        p.y = p.yEasing.match(/tn|rd|bk/i) ? (p.yStart != null ? p.yStart : p.yTarget) : p.yTarget;
        p.allNum = 0;
        // カメラ変更の更新
        updateCameraChange();
    };
    
    
    //- カメラパラムのセット
    function setCameraParam(chara, scale, x, y, time, preter, isBack) {
        const gs = $gameScreen;
        if (!gs._cameraParamKe) { gs._cameraParamKe = {}; }
        const p = gs._cameraParamKe;
        // 注視キャラ
        const preChara = p.chara || $gamePlayer;
        p.chara = chara || preChara;
        const isCharaChange = !isSameChara(preChara, p.chara);
        p.preChara = isCharaChange ? preChara : null;
        p.transX = null;
        p.transY = null;
        // 時間
        time = time ? time.toString() : "0";
        let match = time.match(/_(\-?\d+)/);
        p.allNum = match ? Number(match[1]) : 1;
        p.allNum = p.allNum <= 0 ? -1 : p.allNum;
        p.timeMax = makeTime(time);
        p.duration = p.timeMax;
        // 動作中ウェイト
        if (time.match(/w/i) && p.timeMax > 0) { preter.wait(p.timeMax); }
        // 拡大率
        const bs = keke_zoomScaleBase;
        const preScale = gs.zoomScale() || 1;
        let r = scale ? calcMulti(p.scale || bs, scale)[0] : { val:p.scale || bs };
        scale = r.val;
        p.scaleEasing = r.easing || "E";
        p.scaleEasingRate = r.easingRate || 1;
        p.scaleNum = r.num || 1;
        p.scaleTimeMax = p.duration / (p.scaleNum <= 0 ? 1 : p.scaleNum);
        p.scaleDuration = p.scaleTimeMax;
        p.scale = p.duration ? preScale : scale || p.scale || bs;
        p.scaleTarget = scale || preScale || bs;
        p.scaleStart = preScale != p.scaleTarget ? preScale : null;
        // ずらしX
        p.x = !p.x ? 0 : p.x;
        const preX = p.x || 0;
        r = x ? calcMulti(preX, x, null, [])[0] : { val:isBack || isCharaChange ? 0 : preX };
        p.xEasing = r.easing || "E";
        p.xEasingRate = r.easingRate || 1;
        p.xNum = r.num || 1;
        p.xTimeMax = p.duration / (p.xNum <= 0 ? 1 : p.xNum);
        p.xDuration = p.xTimeMax;
        p.xTarget = r.val;
        p.xStart = preX != p.xTarget ? preX : null;
        // ずらしY
        p.y = !p.y ? 0 : p.y;
        const preY = p.y || 0;
        r = y ? calcMulti(preY, y, null, [])[0] : { val:isBack || isCharaChange ? 0 : preY };
        p.yEasing = r.easing || "E";
        p.yEasingRate = r.easingRate || 1;
        p.yNum = r.num || 1;
        p.yTimeMax = p.duration / (p.yNum <= 0 ? 1 : p.yNum)
        p.yDuration = p.yTimeMax;
        p.yTarget = r.val;
        p.yStart = preY != p.yTarget ? preY : null;
        // スワイプ
        p.swipedX = 0;
        p.swipedY = 0;
    };
    
    
    //- カメラパラムの取得
    function getCameraParam() {
        return $gameScreen._cameraParamKe;
    };


    //- 注視キャラか
    function isFocusChara(chara) {
        const p = getCameraParam();
        if (!p) { return chara._followers ? true : false; }
        return isSameChara(p.chara, chara);
    };
    
    
    //- ズームの起動
    function runZoom() {
        const p = getCameraParam();
        if (!p) { return; }
        // 少しずつズーム
        if (p.duration) {
            $gameScreen.startZoom(0, 0, p.scaleTarget, p.scaleDuration);
        // 即ズーム
        } else {
            $gameScreen.setZoom(0, 0, p.scaleTarget);
            setCameraOffset(p.xTarget, p.yTarget);
            // カメラ変更の更新
            updateCameraChange();
        }
    };
    
    
    //- カメラずらしのセット
    function setCameraOffset(x, y) {
        const p = getCameraParam();
        p.x = x;
        p.y = y;
    };
    
    
    //- ズームのセット(コア追加)
    const _Game_Screen_setZoom = Game_Screen.prototype.setZoom;
    Game_Screen.prototype.setZoom = function(x, y, scale) {
        _Game_Screen_setZoom.apply(this, arguments);
        // カメラ変更の更新
        updateCameraChange();
    };
    
    
    //- ズームの更新(コア追加)
    const _Game_Screen_updateZoom = Game_Screen.prototype.updateZoom;
    Game_Screen.prototype.updateZoom = function() {
        // マップでなければは通常の更新
        if (!isMap()) {
            _Game_Screen_updateZoom.apply(this);
            return;
        }
        if (!this._zoomDuration) { return; }
        const p = getCameraParam();
        if (!p || !p.duration) { return; }
        // カウントを減らす
        if (p && p.duration) { p.duration--; }
        // ズームスケールの更新
        const did = updateZoomScale(this);
        // 通常の更新
        if (!did) { _Game_Screen_updateZoom.apply(this); }
        // カメラ変更の更新
        updateCameraChange();
    };
    
    
    //- カメラ変更の更新
    function updateCameraChange() {
        if (!isMap()) { return; }
        const p = getCameraParam();
        // ズームパラムの更新
        updateZoomParam(p);
        // カメラずらしの更新
        updateCameraOffset(p);
        // 注視の更新
        updateFocus(p);
        // マップの拡大
        scaleMap(p);
        // 遠景の拡大
        if (!$gameScreen._noZoomSaveKe) { scaleParallax(p); }
        // ループの処理
        processLoop(p);
    };
    
    
    //- ループの処理
    function processLoop(p) {
        const gs = $gameScreen;
        // 全体
        if (p.duration <= 0) {
            if (p.allNum > 0) { p.allNum--; }
            if (p.allNum) {
                $gameScreen._zoomDuration = p.timeMax;
                p.duration = p.timeMax;
            }
        }
        // 拡大率
        if (doScaleLoop) {
            p.scaleDuration = p.scaleTimeMax;
            gs._zoomDuration = p.scaleDuration;
            gs._zoomScale = p.scaleStart;
            p.scale = p.scaleStart;
            doScaleLoop = false;
        }
        // Xずらし
        if (doXLoop) {
            p.xDuration = p.xTimeMax;
            p.x = p.xStart;
            doXLoop = false;
        }
        // Yずらし
        if (doYLoop) {
            p.yDuration = p.yTimeMax;
            p.y = p.yStart;
            doYLoop = false;
        }
    };
    
    
    //- ズームパラムの更新
    function updateZoomParam(p) {
        const saveNo = $gameScreen._noZoomSaveKe || SceneManager._scene.constructor.name != "Scene_Map";
        if (!saveNo) { p.scale = $gameScreen.zoomScale(); }
    };
    
    
    //- ズームスケールの更新
    function updateZoomScale(gs) {
        if (!isMap()) { return; }
        const p = getCameraParam();
        // 残り時間がずれたら他の干渉があったとみて終了
        if (gs._zoomDuration != p.scaleDuration) {
            return true;
        }
        // スケールイージングの更新
        if (p && p.scaleTarget != null && p.scaleEasing) {
            updateScaleEasing(gs, p);
            return true;
        }
        return false;
    };
    
    
    //- スケールイージングの更新
    function updateScaleEasing(gs, p) {
        // カウントを減らす
        gs._zoomDuration--;
        p.scaleDuration--;
        gs._zoomScale = applyEasing(gs._zoomScale, p.scaleStart, gs._zoomScaleTarget, p.scaleDuration, p.scaleTimeMax, p.scaleEasing, p.scaleEasingRate);
        gs._zoomScale = Math.max(gs._zoomScale, 0.1);
        // 終了
        if (!p.scaleDuration) {
            gs._zoomScale = p.scaleEasing.match(/tn|rd|bk/i) ? p.scaleStart : p.scaleTarget;
            if (p.scaleNum > 0) { p.scaleNum--; }
            // 繰り返し処理
            if (p.scaleNum || (p.allNum - 1) != 0) {
                doScaleLoop = true;
            } else {
                p.scaleTarget = null;
            }
        }
    };
    
    
    //- カメラずらしの更新
    function updateCameraOffset(p) {
        if (!p || !p.timeMax) { return; }  
        // Xずらし
        if (p.xTarget != null) {
            // カウントを減らす
            p.xDuration--;
            if (p.xEasing) {
                p.x = applyEasing(p.x, p.xStart, p.xTarget, p.xDuration, p.xTimeMax, p.xEasing, p.xEasingRate);
            } else {
                p.x = p.xStart + (p.xStart - p.x) * p.duration / p.timeMax;
            }
            // 終了
            if (!p.xDuration) {
                p.x = p.xEasing.match(/tn|rd|bk/i) ? (p.xStart != null ? p.xStart : p.xTarget) : p.xTarget;
                if (p.xNum > 0) { p.xNum--; }
                // 繰り返し処理
                if (p.xNum || (p.allNum - 1) != 0) {
                    doXLoop = true;
                } else {
                    p.xTarget = null;
                }
            }
        }
        // Yずらし
        if (p.yTarget != null) {
            // カウントを減らす
            p.yDuration--;
            if (p.yEasing) {
                p.y = applyEasing(p.y, p.yStart, p.yTarget, p.yDuration, p.yTimeMax, p.yEasing, p.yEasingRate);
            } else {
                p.y = p.yStart + (p.yStart - p.y) * p.duration / p.timeMax;
            }
            // 終了
            if (!p.yDuration) {
                p.y = p.yEasing.match(/tn|rd|bk/i) ? (p.yStart != null ? p.yStart : p.yTarget) : p.yTarget;
                if (p.yNum) { p.yNum--; }
                // 繰り返し処理
                if (p.yNum || (p.allNum - 1) != 0) {
                    doYLoop = true;
                } else {
                    p.yTarget = null;
                }
            }
        }
    };


    //- 注視の更新
    function updateFocus(p) {
        if (!p) { return; }
        // 移行注視
        if (p.preChara && p.timeMax) {
            transfarFocus(p);
        // 注視
        } else {
            p.chara.center(p.chara._realX, p.chara._realY);
        }
    };
    
    
    //- 移行注視
    function transfarFocus(p) {
        const cx = $gamePlayer.centerX();
        const cy = $gamePlayer.centerY();
        const newX = p.chara._realX - cx;
        const preX = p.preChara._realX - cx;
        const volX = preX - newX;
        p.transX = newX + (Math.sin(Math.PI * (p.duration / p.timeMax + 1.5)) * volX + volX) / 2;
        const newY = p.chara._realY - cy;
        const preY = p.preChara._realY - cy;
        const volY = preY - newY;
        p.transY = newY + (Math.sin(Math.PI * (p.duration / p.timeMax + 1.5)) * volY + volY) / 2;
        const gm = $gameMap;
        $gameMap.setDisplayPos(p.transX, p.transY);
    };
    
    
    
    //==================================================
    //--  各グラフィックのズーム対応
    //==================================================

    // ズームクリア無効フラグ
    let noZoomClear = null;

    //- マップの拡大
    function scaleMap(p) {
        const spriteset = SceneManager._scene._spriteset;
        if (!spriteset || !spriteset._tilemap || !spriteset._tilemap.parent) { return; }
        const scale = $gameScreen.zoomScale();
        spriteset._tilemap.width = Math.ceil((Graphics.width / scale) * 1) + spriteset._tilemap._margin * 2;
        spriteset._tilemap.height = Math.floor((Graphics.height / scale) * 1) + spriteset._tilemap._margin * 2;
        spriteset._tilemap.refresh();
    };
    
    
    //- 遠景の拡大
    function scaleParallax(p) {
        const spriteset = SceneManager._scene._spriteset;
        if (!spriteset || !spriteset._parallax) { return; }
        const scale = $gameScreen.zoomScale();
        const parallax = spriteset._parallax;
        parallax.move(parallax.x, parallax.y, Graphics.width / scale * 2, Graphics.height / scale * 2);
    };
    
    
    //- 画面タイル数のズーム対応(コア追加)
    const _Game_Map_screenTileX = Game_Map.prototype.screenTileX;
    Game_Map.prototype.screenTileX = function () {
        if ($gameScreen.zoomScale() != 1) {
            return Graphics.width / (this.tileWidth() * $gameScreen.zoomScale());
        }
        return _Game_Map_screenTileX.apply(this);
    };
    
    const _Game_Map_screenTileY = Game_Map.prototype.screenTileY;
    Game_Map.prototype.screenTileY = function () {
        if ($gameScreen.zoomScale() != 1) {
            return Graphics.height / (this.tileHeight() * $gameScreen.zoomScale());
        }
        return _Game_Map_screenTileY.apply(this);
    };
    
    
    //- 画面座標→マップ座標のズーム対応(コア追加)
    const _Game_Map_canvasToMapX = Game_Map.prototype.canvasToMapX;
    Game_Map.prototype.canvasToMapX = function (x) {
        if ($gameScreen.zoomScale() != 1) {
            const tileWidth = this.tileWidth() * $gameScreen.zoomScale();
            const originX = this._displayX * tileWidth;
            const mapX = Math.floor((originX + x) / tileWidth);
            return this.roundX(mapX);
        }
        return _Game_Map_canvasToMapX.apply(this, arguments);
    };
    
    const _Game_Map_canvasToMapY = Game_Map.prototype.canvasToMapY;
    Game_Map.prototype.canvasToMapY = function (y) {
        if ($gameScreen.zoomScale() != 1) {
            const tileHeight = this.tileHeight() * $gameScreen.zoomScale();
            const originY = this._displayY * tileHeight;
            const mapY = Math.floor((originY + y) / tileHeight);
            return this.roundY(mapY);
        }
        return _Game_Map_canvasToMapY.apply(this, arguments);
    };


    //- ゲームキャラクターのセンター化関数を追加
    Game_Character.prototype.centerX = function () {
        const p = getCameraParam();
        return ($gameMap.screenTileX() - 1) / 2;// - (p ? p.x / $gameMap.tileWidth() : 0);
    };

    Game_Character.prototype.centerY = function () {
        const p = getCameraParam();
        return ($gameMap.screenTileY() - 1) / 2;// - (p ? p.y / $gameMap.tileHeight() : 0);
    };
    
    Game_Character.prototype.center = function (x, y) {
        return $gameMap.setDisplayPos(x - this.centerX(), y - this.centerY());
    };


    //- カメラ中心の位置補正(コア追加)
    const _Game_Map_setDisplayPos = Game_Map.prototype.setDisplayPos;
    Game_Map.prototype.setDisplayPos = function(x, y) {
        const gm = $gameMap;
        const displayXMax = gm.width() - gm.screenTileX();
        const displayYMax = gm.height() - gm.screenTileY();
        const tw = gm.tileWidth();
        const th = gm.tileHeight();
        // X軸を一定範囲に収める
        if (!this.isLoopHorizontal()) {
            if (x < 0) { x = 0; } else
            if (x > displayXMax) { x = displayXMax; }
        }
        // X軸を一定範囲に収める
        if (!this.isLoopVertical()) {
            if (y < 0) { y = 0; } else
            if (y > displayYMax) { y = displayYMax; }
        }
        // 位置ずらしを追加
        const p = getCameraParam();
        if (p.x) { x += p.x / tw; }
        if (p.y) { y += p.y / th; }
        // スワイプモード中
        if (inSwipeMode() && $gameTemp._swipingKeFrcm) {
            // 一定範囲からはみ出たずらしを除外-X
            if (!$gameMap.isLoopHorizontal()) {
                if (x < 0) {
                    p.x += (0 - x) * tw;
                } else if (x > displayXMax) {
                    p.x += (displayXMax - x) * tw;
                }
            }
            // 一定範囲からはみ出たずらしを除外-Y
            if (!$gameMap.isLoopVertical()) {
                if (y < 0) {
                    p.y += (0 - y) * th;
                } else if (y > displayYMax) {
                    p.y += (displayYMax - y) * th;
                }
            }
        }
        // 自動スクロール遠景のカクつきを防止
        let preParallaxX = null;
        if (this._parallaxSx > 0 || this._parallaxSy > 0) {
            preParallaxX = this._parallaxX;
        }
        _Game_Map_setDisplayPos.call(this, x, y);
        if (this._parallaxSx > 0 || this._parallaxSy > 0) {
            this._parallaxX = preParallaxX;
        }
    };


    //- 同マップ・フェードなしでの場所移動・改(コア追加)
    const _Game_Player_reserveTransfer = Game_Player.prototype.reserveTransfer;
    Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType) {
        if (mapId == $gameMap.mapId() && !this._needsMapReload && fadeType == 2) {
            this.locate(x, y);
            this.setDirection(d);
            this.refresh();
            this.clearTransferInfo();
            return;
        }
        _Game_Player_reserveTransfer.apply(this, arguments);
    };
    
    
    //- 天候の拡大(コア再定義)
    const _Weather_rebornSprite = Weather.prototype._rebornSprite;
    Weather.prototype._rebornSprite = function(sprite) {
        // マップでなければ通常の処理
        if (!isMap()) {
            _Weather_rebornSprite.apply(this, arguments);
            return;
        }
        const zoomScale = $gameScreen.zoomScale();
        sprite.ax = Math.randomInt(Graphics.width / zoomScale + 100) - 100 + this.origin.x;
        sprite.ay = Math.randomInt(Graphics.height / zoomScale + 200) - 200 + this.origin.y;
        sprite.opacity = 160 + Math.randomInt(60);
    };
    
    
    //- ピクチャの画面固定(コア追加)
    const _Sprite_Picture_updatePosition = Sprite_Picture.prototype.updatePosition;
    Sprite_Picture.prototype.updatePosition = function() {
        _Sprite_Picture_updatePosition.apply(this);
        if (isMap()) {
            if (isChildScene(this)) { return; }
            // ズーム画面固定値の取得
            const zoomOffset = getZoomScreenFix(this);
            this.x += zoomOffset.x;
            this.y += zoomOffset.y;
        }
    };
    
    const _Sprite_Picture_updateScale = Sprite_Picture.prototype.updateScale;
    Sprite_Picture.prototype.updateScale = function() {
        _Sprite_Picture_updateScale.apply(this);
        if (isMap()) {
            if (!keke_pictureScreenFix) { return; }
            if (isChildScene(this)) { return; }
            const scale = $gameScreen.zoomScale();
            this.scale.x /= scale;
            this.scale.y /= scale;
        }
    };


    //- シーンにチルドされているか
    function isChildScene(sprite) {
        const parent = sprite.parent;
        if (!parent) { return false; }
        if (parent.constructor.name.includes("Scene_")) { return true; }
        const parent2 = parent.parent;
        if (!parent2) { return false; }
        if (parent2.constructor.name.includes("Scene_")) { return true; }
        return false;
    };
    
    
    //- ズーム画面固定値の取得
    function getZoomScreenFix(sprite) {
        const gs = $gameScreen;
        const rate = 1 / gs.zoomScale();
        const offsetX = (sprite.x - gs.zoomX()) * (rate - 1);
        const offsetY = (sprite.y - gs.zoomY()) * (rate - 1);
        return { x:offsetX, y:offsetY };
    };
    
    
    //- タイマーの画面固定(コア追加)
    const _Sprite_Timer_updatePosition = Sprite_Timer.prototype.updatePosition;
    Sprite_Timer.prototype.updatePosition = function () {
        _Sprite_Timer_updatePosition.apply(this);
        const scale = $gameScreen.zoomScale();
        this.x /= scale;
        this.y /= scale;
        this.scale.x = 1 / scale;
        this.scale.y = 1 / scale;
    };
    
    
    //- エンカウントエフェクト(コア再定義)
    Scene_Map.prototype.updateEncounterEffect = function() {
        if (this._encounterEffectDuration > 0) {
            if (this._encounterEffectDuration == this.encounterEffectSpeed()) { $gameScreen._noZoomSaveKe = true; }
            this._encounterEffectDuration--;
            const speed = this.encounterEffectSpeed();
            const n = speed - this._encounterEffectDuration;
            const p = n / speed;
            const q = ((p - 1) * 20 * p + 5) * p + 1;
            const pr = getCameraParam();
            const zoomX = pr ? pr.x : $gamePlayer.screenX();
            const zoomY = pr ? pr.y : $gamePlayer.screenY() - 24;
            const zoomScale = pr ? pr.scale : 1;
            if (n === 2) {
                $gameScreen.setZoom(zoomX, zoomY, zoomScale);
                this.snapForBattleBackground();
                this.startFlashForEncounter(speed / 2);
            }
            $gameScreen.setZoom(zoomX, zoomY, q * zoomScale);
            if (n === Math.floor(speed / 6)) {
                this.startFlashForEncounter(speed / 2);
            }
            if (n === Math.floor(speed / 2)) {
                BattleManager.playBattleBgm();
                this.startFadeOut(this.fadeSpeed());
            }
            if (!this._encounterEffectDuration) {
                $gameScreen._noZoomSaveKe = false;
            }
        }
    };


    //- エンカウント時のズームクリアを無効(コア追加)
    const _Game_Screen_onBattleStart = Game_Screen.prototype.onBattleStart;
    Game_Screen.prototype.onBattleStart = function() {
        noZoomClear = true;
        _Game_Screen_onBattleStart.apply(this);
        noZoomClear = false;
    };

    const _Game_Screen_clearZoom = Game_Screen.prototype.clearZoom;
    Game_Screen.prototype.clearZoom = function() {
        if (noZoomClear) { return; }
        _Game_Screen_clearZoom.apply(this);
    };


    // Xずらし最大値
    /*function xOffsetMax(p) {
        return Math.max(Math.abs(p.xTarget || 0), Math.abs(p.x || 0), Math.abs(p.xStart || 0))
    };
    
    
    // Yずらし最大値
    function yOffsetMax(p) {
        return Math.max(Math.abs(p.yTarget || 0), Math.abs(p.y || 0), Math.abs(p.yStart || 0))
    };*/


    //- センター関数にカメラがらしを適用
    /*const _Game_Player_centerX = Game_Player.prototype.centerX;
    Game_Player.prototype.centerX = function () {
        let result = _Game_Player_centerX.apply(this);
        const p = getCameraParam();
        if (p) {
            result -= p.x / $gameMap.tileWidth();
        }
        return result;
    };

    const _Game_Player_centerY = Game_Player.prototype.centerY;
    Game_Player.prototype.centerY = function () {
        let result = _Game_Player_centerY.apply(this);
        const p = getCameraParam();
        if (p) {
            result -= p.y / $gameMap.tileHeight();
        }
        return result;
    };*/


    //- ポインタ移動のズーム対応(コア追加)
    /*const _Game_Temp_setDestination = Game_Temp.prototype.setDestination;
    Game_Temp.prototype.setDestination = function(x, y) {
        const zoomScale = $gameScreen.zoomScale();
        if (zoomScale != 1) {
            //x = Math.floor(x / zoomScale);
            //y = Math.floor(y / zoomScale);
        }
        _Game_Temp_setDestination.call(this, x, y);
    };*/
    
    
    
    //==================================================
    //--  カメラの維持
    //==================================================
    
    //- カメラのロード
    function loadCamera() {
        p = getCameraParam();
        if (!p) { return; }
        $gameScreen.setZoom(0, 0, p.scale);
        setCameraOffset(p.x, p.y);
        if (p.chara) { p.chara = searchSameChara(p.chara); }
        if (!p.chara) { p.chara = $gamePlayer; }
        if (p.preChara) { p.preChara = searchSameChara(p.preChara); }
        // スワイプモードの終了判定
        const preScene = SceneManager._previousScene;
        if (preScene.constructor.name == "Scena_Map") {
            endCheckSwipeMode(p);
        }
        // ツインタッチを初期化
        twinTouched = false;
    };
    
    
    //- カメラの再開
    function restartCamera() {
        p = getCameraParam();
        if (!p) { return; }
        if (p.duration) {
            const gs = $gameScreen;
            gs._zoomScaleTarget = p.scaleTarget;
            gs._zoomDuration = p.scaleDuration || p.duration;
        }
        // スワイプモードの再開
        restartSwipeMode(p);
        // カメラ変更の更新
        updateCameraChange();
    };
    
    
    
    //==================================================
    //--  カメラ注視
    //==================================================
    
    //- プレイヤーの注視(コア追加)
    const _Game_Player_updateScroll = Game_Player.prototype.updateScroll;
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        // 注視キャラでなければリターン
        if (!isFocusChara(this)) { return; };
        _Game_Player_updateScroll.apply(this, arguments);
        // ずらしの相殺
        //reduceOffset(this);
    };
    
    
    //- イベントの注視(コア追加)
    const _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        const lastScrolledX = this.scrolledX();
        const lastScrolledY = this.scrolledY();
        _Game_Event_update.apply(this);
        updateScroll(this, lastScrolledX, lastScrolledY);
    };
    
    
    //- フォロワーの注視(コア追加)
    const _Game_Follower_update = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function() {
        const lastScrolledX = this.scrolledX();
        const lastScrolledY = this.scrolledY();
        _Game_Follower_update.apply(this);
        updateScroll(this, [lastScrolledX, lastScrolledY]);
    };
    
    
    //- 乗り物の注視(コア追加)
    const _Game_Vehicle_update = Game_Vehicle.prototype.update;
    Game_Vehicle.prototype.update = function() {
        const lastScrolledX = this.scrolledX();
        const lastScrolledY = this.scrolledY();
        _Game_Vehicle_update.apply(this);
        updateScroll(this, [lastScrolledX, lastScrolledY]);
    };
    
    
    //- マップのスクロールに対応(コア追加)
    const _Game_Map_updateScroll = Game_Map.prototype.updateScroll;
    Game_Map.prototype.updateScroll = function() {
        const lastX = this._displayX;
        const lastY = this._displayY;
         _Game_Map_updateScroll.apply(this);
         if (this.isScrolling()) {
             const p = getCameraParam();
            if (this._displayX != lastX) { p.x += (this._displayX - lastX) * $gameMap.tileWidth(); }
            if (this._displayY != lastY) { p.y += (this._displayY - lastY) * $gameMap.tileHeight(); }
        }
    };


    //- スクロールの更新-共通
    function updateScroll(chara, lastScrolledX, lastScrolledY) {
        // 注視キャラでなければリターン
        if (!isFocusChara(chara)) { return; };
        const x1 = lastScrolledX;
        const y1 = lastScrolledY;
        const x2 = chara.scrolledX();
        const y2 = chara.scrolledY();
        if (y2 > y1 && y2 > $gamePlayer.centerY()) {
            $gameMap.scrollDown(y2 - y1);
        }
        if (x2 < x1 && x2 < $gamePlayer.centerX()) {
            $gameMap.scrollLeft(x1 - x2);
        }
        if (x2 > x1 && x2  >$gamePlayer.centerX()) {
            $gameMap.scrollRight(x2 - x1);
        }
        if (y2 < y1 && y2 < $gamePlayer.centerY()) {
            $gameMap.scrollUp(y1 - y2);
        }
        // ずらしの相殺
        //reduceOffset(chara);
    };


    //- ズーム中も自律移動を停止しない(コア再定義)
    Game_CharacterBase.prototype.isNearTheScreen = function() {
        return true;
    };


    //- 位置設定時の注視(コア追加)
    const _Game_CharacterBase_locate = Game_CharacterBase.prototype.locate;
    Game_CharacterBase.prototype.locate = function(x, y) {
        _Game_CharacterBase_locate.apply(this, arguments);
        // 注視キャラでなければリターン
        if (!isFocusChara(this)) { return; };
        // カメラ変更の更新
        updateCameraChange();
    };


    //- ずらしの相殺
    /*function reduceOffset(chara) {
        const volX = (chara._realX - chara._preXFrcmKe) * $gameMap.tileWidth();
        if (p.x > 0 && volX > 0) {
            p.x = Math.max(0, p.x - volX);
        } else if (p.x < 0 && volX < 0) {
            p.x = Math.min(0, p.x - volX);
        }
        const volY = (chara._realY - chara._preYFrcmKe) * $gameMap.tileHeight();
        if (p.y > 0 && volY > 0) {
            p.y = Math.max(0, p.y - volY);
        } else if (p.y < 0 && volY < 0) {
            p.y = Math.min(0, p.y - volY);
        }
        chara._preXFrcmKe = chara._realX;
        chara._preYFrcmKe = chara._realY;
    };*/
        
    
    
    //==================================================
    //--  ズーム除外
    //==================================================
    
    //- ズーム除外の更新
    function updateZoomNo(sprite) {
        const chara = sprite._character;
        if (!chara || !chara._zoomNoKe) { return; }
        if (sprite._zoomNoScale) {
             sprite.scale.x /= sprite._zoomNoScale;
             sprite.scale.y /= sprite._zoomNoScale;
             sprite._zoomNoScale = null;
        }
        // スケール補正の取得
        const zoomScale = $gameScreen.zoomScale();
        if (zoomScale >= 1) { return; }
        sprite._zoomNoScale = zoomScale < 1 ? Math.max(1, 1 / zoomScale * chara._zoomNoKe) : Math.min(1, 1 / zoomScale * chara._zoomNoKe);
        // 補正
        sprite.scale.x *= sprite._zoomNoScale;
        sprite.scale.y *= sprite._zoomNoScale;
        sprite.z = 100;
    };
    
    
    
    //==================================================
    //-  制御文字でのカメラ操作
    //==================================================
    
    // インタープリター保存変数
    msgPreter = null;
    
    //-  制御文字にカメラ操作を追加(コア追加)
    const _Window_Message_convertEscapeCharacters = Window_Message.prototype.convertEscapeCharacters;
    Window_Message.prototype.convertEscapeCharacters = function(text) {
        text = _Window_Message_convertEscapeCharacters.apply(this, arguments);
        if (isMap()) {
            const regExp = /\n*[\x1b\\](\w+)\[([^\]]*)\]\n*/gi
            let dels = [];
            while (true) {
                const match = regExp.exec(text);
                if (!match || !match[1]) { break; }
                if (match[1].toUpperCase() == keke_controlCharCamera) {
                    // カメラ操作
                    callZoomByControlChar(match[2]);
                    dels.push(match[0]);
                }
            }
            if (dels.length) { dels.forEach(del => text = text.replace(del, "")); }
        }
        return text;
    };
    
    
    //- 制御文字でのカメラ呼び出し
    function callZoomByControlChar(param) {
        const args = param.replace(/\s/g, "").split(",");
        const chara = callTarget(args[0], getPreterEvent(msgPreter), true)[0];
        callZoom(chara, args[1], args[2], args[3], args[4], msgPreter);
    };
    
    
    //- ターゲットの呼び出し
    function callTarget(tageStr, event, emptyNull) {
        const nul = emptyNull ? [null] : [event];
        // 変数の置換
        tageStr = convertVariable(tageStr);
        if (!tageStr) { return nul; }
        // IDでのキャラリスト取得
        if (tageStr.match(/^-?\d+\.?\d*(?!\w)/)) {
            const targets = getCharasById(tageStr, event);
            return targets.length ? targets : nul;
        // 名前でのキャラリスト取得
        } else {
            const targets = getCharasByName(tageStr, event);
            return  targets.length ? targets : nul;
        }
    };
    
    
    //- メッセージ時にプリターを保存(コア追加)
    const _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function(params) {
        msgPreter = this;
        return _Game_Interpreter_command101.apply(this, arguments);
    };
    
    
    
    //==================================================
    //--  スワイプモード
    //==================================================

    // ピンチズーム有効フラグ
    let isPinchZoom = false;
    // ツインタッチ済みフラグ
    let twinTouched = false;
    // ツインタッチ幅の配列
    let twinTouchWidths = [];
    // スワイプ量初期化の遅延用変数
    let timeout_initSwipeX = null;
    let timeout_initSwipeY = null;
    // タッチキャンセル無効フラグ
    let noTouchCancel = false;

    //- スワイプモードの開始
    function startSwipeMode(args) {
        const p = getCameraParam();
        p.swipeMode = true;
        p.touchSwipeSpeed = Number(args["タッチスワイプ速度"]) || 1;
        //p.wheelSpeed = Number(args["ホイール速度"]) || 1;
        p.inertiaTime = Number(args["…慣性時間"]) || 40;
        p.keySwipeSpeed = Number(args["キースワイプ速度"]) || 1;
        p.inertiaTimeKey = Number(args["…キー慣性時間"]) || 20;
        p.keySwipeAccel = Number(args["…キー加速度"]) || 5;
        p.swipeBackPosWhenMove = toBoolean(args["移動時位置戻す"]);
        p.swipeBackZoomWhenMove = toBoolean(args["移動時ズーム戻す"]);
        p.swipeBackTime = makeTime(args["…戻し時間"]);
        p.swipeModeKeep = toBoolean(args["ずっと維持"]);
        p.validZoom = toBoolean(args["ズーム有効"]);
        p.pinchZoomSpeed = Number(args["タッチズーム速度"]);
        p.wheelZoomSpeed = Number(args["ホイールズーム速度"]);
        p.keyZoomSpeed = Number(args["キーズーム速度"]);
        p.zoomScaleMax = Number(args["最大ズーム倍率"]);
        p.zoomScaleMin = Number(args["最小ズーム倍率"]);
        // ピンチズーム有効フラグ
        isPinchZoom = p.validZoom;
        // スワイプモード開始時のズームスケールを保存
        p.swipeStartZoomScale = $gameScreen.zoomScale() || 1;
        // スワイプダミーの作成
        //makeSwipeDummy(p);
        // スワイプパラムの初期化
        initSwipeParam(p);
    };
    
    
    //- スワイプモードの終了判定
    function endCheckSwipeMode(p) {
        if (!p.swipeMode) { return; }
        // モードをずっと維持でなければスワイプモードの終了
        if (!p.swipeModeKeep) {
            endSwipeMode();
        }
    };


    //- スワイプモードの再開
    function restartSwipeMode(p) {
        if (!p.swipeMode) { return; }
        // スワイプダミーの作成
        //makeSwipeDummy(p);
    };


    //- スワイプモードの終了
    function endSwipeMode(args) {
        const p = getCameraParam();
        // スワイプダミーを消去
        /*if (p.chara && p.chara._isSwipeDummyKe) {
            p.chara = p.preChara || $gamePlayer;
            // カメラ変更の更新
            updateCameraChange();
        }
        p.swipeDummy = null;*/
        if (!p.swipeMode) { return; }
        // スワイプパラムの初期化
        initSwipeParam(p);
        // カメラ位置をモード開始時に戻す
        const backZoom = toBoolean(args["ズームを戻す"]);
        const backPos = toBoolean(args["位置を戻す"]);
        if (backZoom || backPos) {
            const time = args ? makeTime(args["戻し時間"]) : 0;
            const zoomScale = backZoom ? p.swipeStartZoomScale : null;
            const pos = backPos ? 0 : null;
            callZoom(null, time, zoomScale, pos, pos, null, true); 
            p.swipeBackDura = time;
        }
        // 終了
        p.swipeMode = false;
        isPinchZoom = false;
        twinTouched = false;
        twinTouchWidths = [];
    };


    //- スワイプパラムの初期化
    function initSwipeParam(p) {
        p.touchXPre = null;
        p.touchYPre = null;
        p.swipeX = null;
        p.swipeY = null;
        p.swipeXs = null;
        p.swipeYs = [];
        p.keySwipePowX = 0;
        p.keySwipePowY = 0;
        p.swipeInertiaXMax = null;
        p.swipeInertiaX = null;
        p.swipeInertiaYMax = null;
        p.swipeInertiaY = null;
        p.inertiaDura = null;
        //p.playerX = null;
        //p.playerY = null;
        //$gameMap._noSwipeModeKe = 0;
    };
    
    
    //- スワイプモードの更新
    function updateSwipeMode() {
        // スワイプ中フラグを初期化
        $gameTemp._swipingKeFrcm = false;
        const p = getCameraParam();
        if (!p || !p.swipeMode) { return; }
        // 二本指タッチ判定
        if (isPinchZoom) {
            if (TouchInput._currentState.cancelled) { twinTouched = true; }
            if (TouchInput.isReleased() && twinTouched) { twinTouched = false; }
        }
        // スワイプの更新
        updateSwipe(p);
        // スワイプズームの更新
        updateSwipeZoom(p);
    };


    //- スワイプの更新
    function updateSwipe(p) {
        let swiped = false;
        // キースワイプ中か
        const keySwiping = inKeySwipe();
        // キースワイプ中でない場合
        if (!keySwiping) {
            // スワイプ戻しの更新
            updateSwipeBack(p);
            // スワイプ禁止時の処理
            if (!canSwipe()) {
                p.touchXPre = null;
                p.touchYPre = null;
                return;
            }
        }
        // タッチスワイプの更新
        swiped = swiped || updateTouchSwipe(p);
        // キースワイプの更新
        if (keySwiping) { swiped = swiped || updateKeySwipe(p); }
        // スワイプしたら慣性を停止
        if (swiped) {
            p.inertiaDura = 0;
        }
        // スワイプ慣性の更新
        swiped = swiped || updateSwipeInertia(p);
        // 注視の更新
        if (swiped) {
            // スワイプ中フラグ
            $gameTemp._swipingKeFrcm = true;
            updateFocus(p);
        }
    };


    // スワイプ戻しの更新
    function updateSwipeBack(p) {
        if (inKeyZoom()) { return; }
        // 戻し中ウェイト
        if (p.swipeBackDura) {
            p.swipeBackDura--;
            return true;
        }
        if (!p.swipeBackPosWhenMove && !p.swipeBackZoomWhenMove) { return false; }
        // プレイヤーが移動したか
        if (!checkPlayerMoved(p)) { return false; }
        // スワイプパラムの初期化
        initSwipeParam(p);
        // ズームの呼び出し
        const time = p.swipeBackTime;
        const pos = p.swipeBackPosWhenMove ? 0 : null;
        const zoomScale = p.swipeBackZoomWhenMove ? p.swipeStartZoomScale : null;
        callZoom(null, time, zoomScale, 0, 0, null, true); 
        p.swipeBackDura = time;
        return true;
    };


    //- プレイヤーが移動したか
    function checkPlayerMoved(p) {
        const player = $gamePlayer;
        if (!player.isMoving() && player.canMove()) {
            if (Input.isTriggered("left") || Input.isTriggered("right") || Input.isTriggered("up") || Input.isTriggered("down")) {
                return true;
            }
        }
        /*if (p.playerX != null) {
            if (p.playerX != player.x || p.playerY != player.y) { return true; }
        }
        p.playerX = player.x;
        p.playerY = player.y;*/
        return false;
    };


    //- タッチスワイプの更新
    function updateTouchSwipe(p) {
        // 二本指タッチ時はリターン
        if (twinTouched) {
            p.touchXPre = null;
            p.touchYPre = null;
            return;
        }
        let swiped = false;
        // スワイプ量の取得
        getSwipeVol(p);
        // カメラの変更
        if (p.swipeX) {
            // カメラXの変更
            p.x = changeCameraX(p.x, -p.swipeX * p.touchSwipeSpeed);
            swiped = true;
        }
        if (p.swipeY) {
            // カメラYの変更
            p.y = changeCameraY(p.y, -p.swipeY * p.touchSwipeSpeed);
            swiped = true;
        }
        return swiped;
    };


     //- キースワイプの更新
     function updateKeySwipe(p) {
        let swiped = false;
        // X移動-加速付き
        if (Input.isPressed("left")) {
            accelerateKeySwipe(p, "x", -1);
            addSwipeX(p, p.keySwipePowX);
        } else if (Input.isPressed("right")) {
            accelerateKeySwipe(p, "x", 1);
            addSwipeX(p, p.keySwipePowX);
        } else if (p.swipeXs) {
            // ある程度加速していたらスワイプ慣性の開始
            if (isKeySwipeAcceled(p, "x")) {
                startSwipeInertia(p, p.inertiaTimeKey, "x", -1);
            }
            p.swipeXs = null;
            p.keySwipePowX = 0;
        }
        // Y移動-加速付き
        if (Input.isPressed("up")) {
            accelerateKeySwipe(p, "y", -1);
            addSwipeY(p, p.keySwipePowY);
        } else if (Input.isPressed("down")) {
            accelerateKeySwipe(p, "y", 1);
            addSwipeY(p, p.keySwipePowY);
        } else if (p.swipeYs) {
            //  ある程度加速していたらスワイプ慣性の開始
            if (isKeySwipeAcceled(p, "y")) {
                startSwipeInertia(p, p.inertiaTimeKey, "y", -1);
            }
            p.swipeYs = null;
            p.keySwipePowY = 0;
        }
        // カメラの変更
        if (p.swipeX) {
            // カメラXの変更
            p.x = changeCameraX(p.x, p.swipeX * p.touchSwipeSpeed);
            p.swipeX = 0;
            swiped = true;
        }
        if (p.swipeY) {
            // カメラYの変更
            p.y = changeCameraY(p.y, p.swipeY * p.touchSwipeSpeed);
            p.swipeY = 0;
            swiped = true;
        }
        return swiped;
    };


    //- キースワイプの加速
    function accelerateKeySwipe(p, tage, dire) {
        const speed = 25 * p.keySwipeSpeed;
        const accel = p.keySwipeAccel;
        const plus = speed * (accel / 100);
        if (tage.includes("x")) {
            if (dire * p.keySwipePowX < 0) { p.keySwipePowX = 0; }
            if (dire < 0) {
                p.keySwipePowX = Math.max(p.keySwipePowX + plus * dire, -speed);
            } else {
                p.keySwipePowX = Math.min(p.keySwipePowX + plus * dire, speed);
            }
        }
        if (tage.includes("y")) {
            if (dire * p.keySwipePowY < 0) { p.keySwipePowY = 0; }
            if (dire < 0) {
                p.keySwipePowY = Math.max(p.keySwipePowY + plus * dire, -speed);
            } else {
                p.keySwipePowY = Math.min(p.keySwipePowY + plus * dire, speed);
            }
        }
    };


    //- キースワイプが加速しているか
    function isKeySwipeAcceled(p, tage) {
        const speed = 15;
        if (tage.includes("x")) {
            return Math.abs(p.keySwipePowX) >= speed / 2;
        }
        if (tage.includes("y")) {
            return Math.abs(p.keySwipePowY) >= speed / 2;
        }
    };


    //- キースワイプ中か
    function inKeySwipe() {
        const swipeKey = keke_swipeKey;
        if (!inSwipeMode() || !swipeKey || swipeKey == "なし") { return false; }
        return Input.isPressed(swipeKey);
    };


    //- スワイプ量の取得
    function getSwipeVol(p) {
        // タッチ中
        if (TouchInput.isPressed()) {
            // タッチ直後
            if (TouchInput.isTriggered()) {
                // スワイプ慣性の停止
                stopSwipeInertia(p);
            }
            // スワイプ処理
            if (p.touchXPre) {
                const playTime = TouchInput._mousePressed ? 0 : 50;
                const swipeX = TouchInput.x - p.touchXPre;
                if (swipeX) { addSwipeX(p, swipeX);  clearTimeout(timeout_initSwipeX); } else { p.swipeX = null;  timeout_initSwipeX = setTimeout(initSwipeVol, playTime, p, "x"); }
                const swipeY = TouchInput.y - p.touchYPre;
                if (swipeY) { addSwipeY(p, swipeY);  clearTimeout(timeout_initSwipeY);  } else { p.swipeY = null;  timeout_initSwipeY = setTimeout(initSwipeVol, playTime, p, "y"); }
            }
            p.touchXPre = TouchInput.x;
            p.touchYPre = TouchInput.y;
        // タッチを離した時
        } else {
            // 慣性処理
            if (p.touchXPre != null) {
                // スワイプ慣性の開始
                if (p.swipeXs || p.swipeYs) {
                    startSwipeInertia(p, p.inertiaTime, "xy");
                    p.swipeXs = null;
                    p.swipeYs = null;

                }
                p.touchXPre = null;
                p.touchYPre = null;
                p.swipeX = null;
                p.swipeY = null;
            }
        }
    };


    //- スワイプ量の初期化
    function initSwipeVol(p, xy) {
        if (xy == "x") {
            p.swipeXs = null;
        } else {
            p.swipeYs = null;
        }
    }


    //- スワイプXの追加
    function addSwipeX(p, v) {
        if (!p.swipeXs) { p.swipeXs = []; }
        p.swipeX = v;
        p.swipeXs.unshift(v);
        if (p.swipeXs.length > 2) {
            p.swipeXs.pop();
        }
    };


    //- スワイプYの追加
    function addSwipeY(p, v) {
        if (!p.swipeYs) { p.swipeYs = []; }
        p.swipeY = v;
        p.swipeYs.unshift(v);
        if (p.swipeYs.length > 2) {
            p.swipeYs.pop();
        }
    };


    //- スライプ最大値の取得
    function getSwipeMax(a) {
        if (!a || !a.length) { return null; }
        let r = 0;
        a.forEach(v => {
            if (Math.abs(v) > Math.abs(r)) {
                r = v;
            }
        });
        return r;
    };
    
    
    //- スワイプ慣性の開始
    function startSwipeInertia(p, time, tage = "xy", rvs = 1) {
        if (tage.includes("x")) {
            p.swipeInertiaXMax = getSwipeMax(p.swipeXs) * rvs;
            p.swipeInertiaX = p.swipeInertiaXMax;   
        }
        if (tage.includes("y")) {
            p.swipeInertiaYMax = getSwipeMax(p.swipeYs) * rvs;
            p.swipeInertiaY = p.swipeInertiaYMax;
        }
        p.inertiaDura = time;
    };
    

    //- スワイプ慣性の停止
    function stopSwipeInertia(p) {
        p.inertiaDura = 0;
    };

    
    //- スワイプ慣性の更新
    function updateSwipeInertia(p) {
        if (!p.inertiaDura) { return; }
        // カウントを減らす
        p.inertiaDura--;
        let swiped = false;
        if (p.swipeInertiaXMax) {
            p.swipeInertiaX = applyEasing(p.swipeInertiaX, p.swipeInertiaXMax, 0, p.inertiaDura, p.inertiaTime, "e");
            // カメラXの変更
            p.x = changeCameraX(p.x, -p.swipeInertiaX);
            swiped = true;
        }
        if (p.swipeInertiaYMax) {
            p.swipeInertiaY = applyEasing(p.swipeInertiaY, p.swipeInertiaYMax, 0, p.inertiaDura, p.inertiaTime, "e");
            // カメラYの変更
            p.y = changeCameraY(p.y, -p.swipeInertiaY);
            swiped = true;
        }
        return swiped;
    };


    //- カメラXの変更
    function changeCameraX(x, v) {
        if (!v) { return x; }
        const gm = $gameMap;
        if (gm.isLoopHorizontal()) { return x + v; }
        const displayX = gm._displayX;
        const displayXMax = gm.width() - gm.screenTileX();
        if (v < 0) {
            if (displayX <= 0) { return x; }
        } else {
            if (displayX >= displayXMax) { return x; }
        }
        return x + v;
    };


    //- カメラYの変更
    function changeCameraY(y, v) {
        if (!v) { return y; }
        const gm = $gameMap;
        if (gm.isLoopVertical()) { return y + v; }
        const displayY = gm._displayY;
        const displayYMax = gm.height() - gm.screenTileY();
        if (v < 0) {
            if (displayY <= 0) { return y; }
        } else {
            if (displayY >= displayYMax) { return y; }
        }
        return y + v;
    };


    //- スワイプズームの更新
    function updateSwipeZoom(p) {
        if (!p.validZoom) { return; }
        // キーズーム中か
        const keyZooming = inKeyZoom();
        // キーズーム中でない場合
        if (!inKeyZoom()) {
            // スワイプ禁止時の処理
            if (!canSwipe()) { return; }
        }
        let zoomed = null;
        // ピンチズームの更新
        zoomed = zoomed || updatePinchZoom(p);
        // ホイールズームの更新
        zoomed = zoomed || updateWheelZoom(p);
        // キーズームの更新
        if (keyZooming) { zoomde = zoomed || updateKeyZoom(p); }
        // スムーズズームの更新
        smoothZoomed = updateSmoothZoom(p);
        // カメラ変更の更新
        if (zoomed || smoothZoomed) {
            // スワイプ中フラグ
            $gameTemp._swipingKeFrcm = true;
            updateCameraChange();
        }
    };


    //- ピンチズームの更新
    function updatePinchZoom(p) {
        if (!twinTouched || twinTouchWidths.length < 2) { return false; }
        const newW = twinTouchWidths[0];
        const preW = twinTouchWidths.find(w => w != newW);
        if (!preW) { return false; }
        const vol = newW - preW;
        // スムーズズームの開始
        const speedRate = zoomExtraRate(p.pinchZoomSpeed);
        changeZoomScale(vol / 50 * speedRate, p, speedRate);
        return true;
    };


    //- ホイールズームの更新
    function updateWheelZoom(p) {
        if (TouchInput.wheelY) {
            const wheelY = TouchInput.wheelY;
            // スムーズズームの開始
            const speedRate = zoomExtraRate(p.wheelZoomSpeed);
            startSmoothZoom(-wheelY / 1000 * speedRate, p, speedRate);
        }
        return false;
    };


    //- キーズームの更新
    function updateKeyZoom(p) {
        const speed = 50 * p.keyZoomSpeed;
        let pow = 0;
        if (Input.isPressed("up") || Input.isPressed("right")) {
            pow = speed;
        } else if (Input.isPressed("down") || Input.isPressed("left")) {
            pow = -speed;
        }
        // スムーズズームの開始
        const speedRate = zoomExtraRate(p.wheelZoomSpeed);
        startSmoothZoom(pow / 1000 * speedRate, p, speedRate);
        return false;
    };


    //- キーズーム中か
    function inKeyZoom() {
        const zoomKey = keke_zoomKey;
        if (!zoomKey || zoomKey == "なし") { return false; }
        return Input.isPressed(zoomKey);
    };


    //- ズーム率補正
    function zoomExtraRate(speed = 1) {
        const zoomScale = $gameScreen.zoomScale();
        return zoomScale.clamp(0.25, 4) * speed;
    };


    //- スムーズズームの開始
    function startSmoothZoom(total, p, speedRate, pileMax) {
        if (!total) { return; }
        if (!p.smoothZooms) { p.smoothZooms = []; }
        //if (pileMax && p.smoothZooms.length >= pileMax) { return; }
        const d = {};
        const speed = 0.015 * speedRate;
        //d.vol = total < 0 ? -speed : speed;
        d.timeMax = Math.floor(Math.abs(total) / speed) || 1;
        d.duration = d.timeMax
        d.target = total;
        d.start = 0;
        d.easing = "e";
        d.current = 0;
        p.smoothZooms.push(d);
    };


     //- スムーズズームの更新
     function updateSmoothZoom(p) {
        if (!p.smoothZooms || !p.smoothZooms.length) { return false; }
        let zoomed = false;
        let del = false;
        // データを全て処理
        p.smoothZooms.forEach((d, i) => {
            zoomed = true;
            // カウントを減らす
            d.duration--;
            // ズームスケールの変更
            if (d.current) { changeZoomScale(-d.current, p); }
            // イージングの適用
            d.current = applyEasing(d.current, d.start, d.target, d.duration, d.timeMax, d.easing);
            // ズームスケールの変更
            const isMax = changeZoomScale(d.current, p);
            // 終了
            if (!d.duration || isMax) {
                p.smoothZooms[i] = null;
                del = true;
            }
        });
        // nullを消去
        if (del) {
            p.smoothZooms = p.smoothZooms.filter(d => d);
        }
        return zoomed;
    };


    //- ズームスケールの変更
    function changeZoomScale(vol, p) {
        let isMax = false;
        const gs = $gameScreen;
        //if (gs._zoomScale > 1) { vol *= 2; }
        gs._zoomScale += vol;
        if (p.zoomScaleMax && gs._zoomScale > p.zoomScaleMax) { gs._zoomScale = p.zoomScaleMax;  isMax = true; }
        if (p.zoomScaleMin && gs._zoomScale < p.zoomScaleMin) { gs._zoomScale = p.zoomScaleMin;  isMax = true; }
        return isMax;
    };


    //- ツインタッチ幅の取得 呼び出し(コア追加)
    const _TouchInput_onTouchMove = TouchInput._onTouchMove
    TouchInput._onTouchMove = function(event) {
        _TouchInput_onTouchMove.apply(this, arguments);
        // ツインタッチ幅の取得
        getTwinTouchWidth(event)
    };


    //- ツインタッチ幅の取得
    function getTwinTouchWidth(event) {
        if (!isMap() || !isPinchZoom) { return; }
        if (twinTouched && event.changedTouches.length >= 2) {
             // 二本指タッチの幅を取得
            const t1 = event.changedTouches[0];
            const t1x = Graphics.pageToCanvasX(t1.pageX);
            const t1y = Graphics.pageToCanvasY(t1.pageY);
            const t2 = event.changedTouches[1];
            const t2x = Graphics.pageToCanvasX(t2.pageX);
            const t2y = Graphics.pageToCanvasY(t2.pageY);
            const distance = pointDistance(t1x, t1y, t2x, t2y);
            twinTouchWidths.unshift(distance);
            if (twinTouchWidths.length > 10) { twinTouchWidths.pop(); }
        } else {
            twinTouchWidths = [];
        }
    };


    //- ポイント間の距離
    function pointDistance(ax, ay, bx, by) {
        return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
    };


    //- ピンチズーム中は二本指でのメニューを禁止(コア追加)
    const _Scene_Map_isMenuCalled = Scene_Map.prototype.isMenuCalled;
    Scene_Map.prototype.isMenuCalled = function() {
        if (isPinchZoom) { noTouchCancel = true; }
        const result = _Scene_Map_isMenuCalled.apply(this);
        if (isPinchZoom) { noTouchCancel = false; }
        return result;
    };

    const _TouchInput_isCancelled = TouchInput.isCancelled;
    TouchInput.isCancelled = function() {
        if (isMap() && noTouchCancel && this._currentState.cancelledTwinTouchKe) {
            return false;
        }
        return _TouchInput_isCancelled.apply(this);
    };

    const _TouchInput_onTouchStart = TouchInput._onTouchStart;
    TouchInput._onTouchStart = function(event) {
        const preCancelled = this._newState.cancelled
        _TouchInput_onTouchStart.apply(this, arguments);
        if (isMap() &&!preCancelled && this._newState.cancelled) {
            this._newState.cancelledTwinTouchKe = true;
        }
    };


    //- スワイプ可能か
    function canSwipe() {
        const p = getCameraParam();
        if (!inSwipeMode() || $gameMap.isEventRunning() || $gameMap._noSwipeModeKe ) { return false; }
        if (p.duration || inTouchLayerPressDsms()) { return false; }
        return true;
    };


    //- タッチレイヤー押し中か-デザインメッセージ
    function inTouchLayerPressDsms() {
        const gt = $gameTemp;
        if (typeof gt.isPressedTouchLayerKeDsms != "function") { return false; }
        return gt.isPressedTouchLayerKeDsms();
    };
    
    
    //- スワイプモード中は標準のタッチ無効(コア追加)
    const _Game_Player_triggerTouchAction = Game_Player.prototype.triggerTouchAction;
    Game_Player.prototype.triggerTouchAction = function() {
        if (inSwipeMode()) { return false; }
        return _Game_Player_triggerTouchAction.apply(this);
    };
    
    const _Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function() {
        if (inSwipeMode()) { return; }
        _Scene_Map_processMapTouch.apply(this);
    };


    //- キースワイプ中は移動を無効
    const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        if ($gameMap.inKeySwipeKe()) { return; }
        _Game_Player_moveByInput.apply(this);
    };


    //- スワイプダミーの作成
    function makeSwipeDummy(p) {
        return
        const chara = new Game_Player();
        chara._x = p.chara ? p.chara._realX : Math.floor($gameMap.width() / 2);
        chara._realX = chara._x;
        chara._y = p.chara ? p.chara._realY : Math.floor($gameMap.height() / 2);
        chara._realY = chara._y;
        chara._isSwipeDummyKe = true;
        p.swipeDummy = chara;
        // スワイプダミーを注視
        focusSwipeDummy(p);
    };


    //- スワイプダミーを注視
    /*function focusSwipeDummy(p) {
        if (!p.swipeDummy) { return; }
        if (!isSameChara(p.chara, p.swipeDummy)) {
            p.preChara = p.chara || $gamePlayer;
            p.chara = p.swipeDummy;
        }
    };*/


    //- キー名の取得
    /*function getKeyName(key) {
        if (key == "決定") { return "ok"; } else
        if (key == "キャンセル") { return "cancel"; } else
        if (key == "ページアップ") { return "pageup"; } else
        if (key == "ページダウン") { return "pagedown"; } else
        if (key == "Shift") { return "shift"; } else
        if (key == "Ctrl") { return "control"; } else
        if (key == "←") { return "left"; } else
        if (key == "→") { return "right"; } else
        if (key == "↑") { return "up"; } else
        if (key == "↓") { return "down"; }
    };*/


    //- マウスホイールの更新
    /*function updateMouseWheel(p) {
        let swiped = false;
        if (TouchInput.wheelX) {
            const wheelX = TouchInput.wheelX;
            // カメラXの変更
            p.x = changeCameraX(p.x, wheelX * p.touchSwipeSpeed);
            swiped = true;
        }
        if (TouchInput.wheelY) {
            const wheelY = TouchInput.wheelY;
            // カメラYの変更
            p.y = changeCameraY(p.y, wheelY * p.touchSwipeSpeed);
            swiped = true;
        }
        return swiped;
    };*/


    //- マウススワイプの更新
    /*function updateMouseSwipe(p) {
        if (!TouchInput.isPressed()) {
            // スワイプ慣性の開始
            if (p.wheelSpeedX || p.wheelSpeedY) {
                startSwipeInertia(p);
            }
             // 初期化
            p.wheelSpeedX = 0;
            p.wheelSpeedY = 0
            p.preTouchX = null;
            p.preTouchY = null;
            return;
        }
        let swiped = false;
        if (p.preTouchX != null) {
            p.wheelSpeedX =  TouchInput.x - p.preTouchX;
            // カメラXの変更
            p.x = changeCameraX(p.x, -p.wheelSpeedX * p.wheelSpeed);
            swiped = true;
        }
        if (p.preTouchY != null) {
            p.wheelSpeedY =  TouchInput.y - p.preTouchY;
            // カメラYの変更
            p.y = changeCameraY(p.y, -p.wheelSpeedY * p.wheelSpeed);
            swiped = true;
        }
        p.preTouchX = TouchInput.x;
        p.preTouchY = TouchInput.y;
        return swiped;
    };*/
    

    
    //==================================================
    //--  カメラの保存と復元
    //==================================================

    //- カメラ位置の初期化
    function initCameraPos(args) {
        const chara = $gamePlayer;
        const time = makeTime(args["戻し時間"])
        const scale = keke_zoomScaleBase;
        callZoom(chara, time, scale, 0, 0, plcmPreter, true);
    };


    //- カメラ位置の保存
    function saveCameraPos(args) {
        const p = getCameraParam();
        const save = {};
        save.chara = toBoolean(args["保存-注視キャラ"]) ? p.chara : null;
        save.scale = toBoolean(args["保存-ズーム倍率"]) ? p.scale : null;
        save.x = toBoolean(args["保存-ずらしX"]) ? p.x : null;
        save.y = toBoolean(args["保存-ずらしY"]) ? p.y : null;
        $gameScreen._cameraSaveKe = save;
    };


    //- カメラ位置の復元
    function restoreCameraPos(args) {
        const save = $gameScreen._cameraSaveKe;
        if (!save) { return; }
        const time = makeTime(args["復元時間"]);
        const chara = toBoolean(args["復元-注視キャラ"]) ? save.chara : null;
        const scale = toBoolean(args["復元-ズーム倍率"]) ? save.scale : null;
        const x = toBoolean(args["復元-ずらしX"]) ? save.x : null;
        const y = toBoolean(args["復元-ずらしY"]) ? save.y : null;
        callZoom(chara, time, scale, x, y, plcmPreter, true);
    };



    //==================================================
    //--  キャラスムーズ無効
    //==================================================

    // キャラクターのビットマップをロード時にスムーズを無効
    const _Bitmap_startLoading = Bitmap.prototype._startLoading;
    Bitmap.prototype._startLoading = function() {
        if (keke_noCharaSmooth && this._url.match(/img\/characters/i)) {
            this._smooth = false;
        }
        _Bitmap_startLoading.apply(this);
    };



    //==================================================
    //--  計算基本 /ベーシック
    //==================================================
    
    //- マルチ演算
    function calcMulti(cur, tage, ori, cmds = []) {
        if (tage == null) { return [{}]; }
        const datas = [cur, tage.toString(), ori, cmds];
        cur = cur || 0;
        let tageStr = tage.toString();
        let tageLine = tageStr.split(",");
        tageLine = tageLine.map(v => v.replace(/\s/g, ""));
        let sols = [];
        tageLine.forEach((tages, i) => {
             const match = tages.match(/^(r*m*s*\/|)([\+\*\/\%←→↑↓]*)(\-*\d+\.*\d*)~*(\-*\d*\.*\d*)([\+\*\/\%←→↑↓]*)(tn|cg|fk|cf|rd|bk|ei|eo|er|e|)(\(?\-*\d*\.*\d*\)?)(&*b*j*d*c*t*o*)(\_*\-?\d*\.*\d*)$/i);
            if (!match) {
                sols.push({ val:tages, header:"", easing:"", easingRate:1, extra:"", num:0, datas:datas });
                return;
            }
            let val = 0;
            let rvs = 1;
            let header = "";
            let easing = "";
            let easingRate = 1;
            let extra = "";
            let num = 1;
            let rand = null;
            if (match[1]) {
                header = match[1].replace(/\//g, "").toUpperCase();
                if (header.match(/r/i)) { rvs = -1; }
            }
            if (match[6]) {
                easing = match[6].toUpperCase();
            }
            if (match[7]) {
                const mt = match[7].match(/\-*\d+\.*\d*/);
                easingRate = mt ? Number(mt[0]) : 1;
            }
            if (match[8]) {
                extra = match[8].replace(/&/g, "").toUpperCase();
            }
            if (match[9]) {
                num = Number(match[9].replace(/\_/g, ""));
            }
            let v = 0;
            if (match[4]) {
                const vs = [Number(match[3]), Number(match[4])];
                vs.sort((a, b) => a - b);
                v = vs[0] + Math.random() * (vs[1] - vs[0]);
            } else {
                v = Number(match[3]);
            }
            const symbol = (match[2] || "") + (match[5] || "");
            if (symbol.includes("+")) {
                val = Number(cur) + v * rvs;
            } else if (symbol.includes("*")) {
                val = Number(cur) * v * rvs;
            } else if (symbol.includes("/")) {
                val = Number(cur) / v * rvs;
            } else if (symbol.includes("%")) {
                val = Number(cur) % v * rvs;
            } else if (symbol.includes("←")) {
                val = Number(cur) - v * rvs;
            } else if (symbol.includes("→")) {
                val = Number(cur) + v * rvs;
            } else if (symbol.includes("↑")) {
                val = Number(cur) - v * rvs;
            } else if (symbol.includes("↓")) {
                val = Number(cur) + v * rvs;
            } else {
                val = v * rvs;
                if (ori) {
                    if (ori.toString().includes("*")) {
                        val *= Number(ori.replace(/\*/g, ""));
                    } else {
                        val += ori;
                    }
                }
            }
            cmds.forEach(cmd => {
                if (cmd.includes("+")) {
                    val += Number(cmd.replace(/\+/g, ""));
                } else if (cmd.includes("*")) {
                    val *= Number(cmd.replace(/\*/g, ""));
                } else if (cmd.includes("/")) {
                    val /= Number(cmd.replace(/\//g, ""));
                } else if (cmd.includes("%")) {
                    val %= Number(cmd.replace(/\%/g, ""));
                } else {
                    val = Number(cmd);
                }
            });
            sols.push({ val:val, header:header, easing:easing, easingRate:easingRate, extra:extra, num:num, datas:datas });
        });
        return sols;
    };
    
    
    //- 小数点を丸める
    function roundDecimal(val, rate) {
        const newVal = Math.floor(val* rate) / rate
        return newVal;
    };
    
    

    //==================================================
    //--  イージング /ベーシック
    //==================================================

    //- イージングの適用
    function applyEasing(current, start, target, duration, timeMax, easing, easingRate = 1) {
        // イージングの処理
        if (easing.match(/ei|eo|e/i)) {
            return processEasing(current, target, duration + 1, timeMax, easing, easingRate);
        }
        // カービング
        if (easing.match(/tn|cg|fk|cf|rd|bk/i)) {
            return processCurving(current, start, target, duration + 1, timeMax, easing, easingRate);
        }
    };
    
    
    //- イージングの処理
    function processEasing(current, target, duration, timeMax, easing, easingRate = 1) {
        const lt = calcEasing((timeMax - duration) / timeMax, easing, easingRate);
        const t = calcEasing((timeMax - duration + 1) / timeMax, easing, easingRate);
        const start = (current - target * lt) / (1 - lt);
        return start + (target - start) * t;
    };
    
    
    //- イージングの計算
    function calcEasing(t, easing, easingRate = 1) {
        const exponent = 2 * easingRate;
        switch (easing.toUpperCase()) {
            case "EI":
                return easeIn(t, exponent);
            case "EO":
                return easeOut(t, exponent);
            case "E":
                return easeInOut(t, exponent);
            default:
                return t;
        }
    };
    
    
    //- 各イージング処理
    function easeIn(t, exponent) {
        return Math.pow(t, exponent) || 0.001;
    };
    
    function easeOut(t, exponent) {;
        return 1 - (Math.pow(1 - t, exponent) || 0.001);
    };
    
    function easeInOut(t, exponent) {
        if (t < 0.5) {
            return easeIn(t * 2, exponent) / 2;
        } else {
            return easeOut(t * 2 - 1, exponent) / 2 + 0.5;
        }
    };
    
    
    //- カービングの処理
    function processCurving(current, start, target, duration, timeMax, easing, easingRate = 1) {
        // 0 の時の処理
        if (duration <= 0) { return easing.match(/tn|rd|bk/i) ? start : target; }
        let result = 0;
        // ターン
        if (easing.toUpperCase() == "TN") {
            result = processTurn(current, start, target, duration, timeMax, easingRate);
        // チャージ
        } else if (easing.toUpperCase() == "CG") {
            result = processCharge(current, start, target, duration, timeMax, easingRate);
        // フック
        } else if (easing.toUpperCase() == "FK") {
            result = processFook(current, start, target, duration, timeMax, easingRate);
        // チャージフック
        } else if (easing.toUpperCase() == "CF") {
            result = processChargeFook(current, start, target, duration, timeMax, easingRate);
        // ラウンド
        } else if (easing.toUpperCase() == "RD") {
            result = processRound(current, start, target, duration, timeMax, easingRate);
        // バック
        }  else if (easing.toUpperCase() == "BK") {
            result = processBack(current, start, target, duration, timeMax, easingRate);
        }
        return result;
    };
    
    
    //- ターンの処理
    function processTurn(current, start, target, duration, timeMax, easingRate) {
        let result = 0;
        const d1 = Math.round(timeMax / 2);
        const d2 = timeMax - d1;
        if (duration > d2) {
            result = processEasing(current, target, duration - d2, d1, "e", easingRate);
        } else {
            result = processEasing(current, start, duration, d2, "e", easingRate);
        }
        return result;
    };
    
    
    //- チャージの処理
    function processCharge(current, start, target, duration, timeMax, easingRate) {
        let result = 0;
        const d1 = Math.round(timeMax / 3);
        const d2 = timeMax - d1;
        if (duration > d2) {
            result = processEasing(current, start + (start - target) * easingRate, duration - d2, d1, "e");
        } else {
            result = processEasing(current, target, duration, d2, "e");
        }
        return result;
    };
    
    
    //- フックの処理
    function processFook(current, start, target, duration, timeMax, easingRate) {
        let result = 0;
        const d1 = Math.round(timeMax * 2 / 3);
        const d2 = timeMax - d1;
        if (duration > d2) {
            result = processEasing(current, target + (target - start) * easingRate, duration - d2, d1, "e");
        } else {
            result = processEasing(current, target, duration, d2, "e");
        }
        return result;
    };
    
    
    //- チャージフックの処理
    function processChargeFook(current, start, target, duration, timeMax, easingRate) {
        let result = 0;
        const d1 = Math.round(timeMax / 4);
        const d3 = Math.round(timeMax / 4);
        const d2 = timeMax - d1 - d3;
        if (duration > (d2 + d3)) {
            result = processEasing(current, start + (start - target) * easingRate, duration - d2 - d3, d1, "e");
        } else if (duration > d3) {
            result = processEasing(current, target + (target - start) * easingRate, duration - d3, d2, "e");
        } else {
            result = processEasing(current, target, duration, d3, "e");
        }
        return result;
    };
    
    
    //- ラウンドの処理
    function processRound(current, start, target, duration, timeMax, easingRate) {
        let result = 0;
        const d1 = Math.round(timeMax / 4);
        const d2 = Math.round(timeMax / 2);
        const d3 = timeMax - d1 - d2;
        if (duration > (d2 + d3)) {
            result = processEasing(current, target, duration - d2 - d3, d1, "eo");
        } else if (duration > d3) {
            result = processEasing(current, start + (start - target) * easingRate, duration - d3, d2, "e");
        } else {
            result = processEasing(current, start, duration, d3, "ei");
        }
        return result;
    };
    
    
    //- バックの処理
    function processBack(current, start, target, duration, timeMax, easingRate) {
        let result = 0;
        const d1 = 1;
        const d2 = timeMax - d1;
        if (duration > d2) {
            result = processEasing(current, target, duration - d2, d1, "e", easingRate);
        } else {
            result = processEasing(current, start, duration, d2, "e", easingRate);
        }
        return result;
    };
    
    
    
    //==================================================
    //---  位置基本 /ベーシック
    //==================================================
    
    //- マス座標を画面座標へ-X
    function massToScreenX(x) {
        var tw = $gameMap.tileWidth();
        var scrolledX = $gameMap.adjustX(x)
        return Math.round(scrolledX * tw + tw / 2);
    };
    
    
     // マス座標を画面座標へ-Y
    function massToScreenY(y) {
        var th = $gameMap.tileHeight();
        var scrolledY = $gameMap.adjustY(y)
        return Math.round(scrolledY * th + th / 2);
    };
    
    
    //- ピクセルXへ
    function toPixelX(v) {
        return v * $gameMap.tileWidth();
    };
    
    
    //- ピクセルYへ
    function toPixelY(v) {
        return v * $gameMap.tileHeight();
    };
    
    
    //- タイルXへ
    function toTileX(v) {
        return v / $gameMap.tileWidth();
    };
    
    
    //- タイルYへ
    function toTileY(v) {
        return v / $gameMap.tileHeight();
    };
    
    
    
    //==================================================
    //--  文字列基本 /ベーシック
    //==================================================
    
    // 文字列の数字リスト化
    function strToNumList(str) {
        const list = [];
        str = str.replace(/\[/g, "");
        str = str.replace(/\]/g, "");
        const strs = str.split(",");
        let s2 = null;
        for (let s of strs) {
            if (s.includes("~")) {
                s2 = s.split("~");
                s2 = s2.map(s => Number(s));
                if (s2[1] >= s2[0]) {
                    for (let i = s2[0]; i <= s2[1]; i++) { list.push(i); }
                } else {
                    for (let i = s2[1]; i <= s2[0]; i++) { list.push(i); }
                }
            } else {
                list.push(Number(s));
            }
        };
        return list;
    };
    
    
    //- 変数の置換
    function convertVariable(str) {
        if (!str) { return str; }
        const regExp = /[\x1b\\]v\[(\d+)\]/gi;
        while (true) {
            const match = regExp.exec(str);
            if (!match) { break; }
            const val = $gameVariables.value(Number(match[1]));
            str = str.replace(match[0], val);
        }
        return str;
    };

    
    
    //==================================================
    //--  計算基本 /ベーシック
    //==================================================
    
    //- 時間の作成
    function makeTime(time) {
        if (!time) { return 0; }
        time = time.toString();
        return Math.round(Number(time.match(/(\d+\.?\d*)/)[0]) * (time.match(/s/i) ? 60 : 1));
    };
    
    
    
    //==================================================
    //--  プラグインコマンド基本 /ベーシック
    //==================================================
    
    let plcmPreter = null;
    

    //- プラグインコマンド呼び出しプリターを保存(コア追加)
    const _PluginManager_callCommand = PluginManager.callCommand;
    PluginManager.callCommand = function(self, pluginName, commandName, args) {
        plcmPreter = self;
        _PluginManager_callCommand.apply(this, arguments);
        plcmPreter = null;
    };
    
    
    //- プラグインコマンド呼び出しイベントを取得
    function getPlcmEvent() {
        return getPreterEvent(plcmPreter);
    };


    //- インタープリターのイベント取得
    function getPreterEvent(preter) {
        if (!preter) { return null; }
        return preter.character(preter.eventId());
    };
    
    
    //- 名前でのキャラリスト取得
    function getCharasByName(names, self) {
        if (!names) { return []; }
        const nameList = names.replace(/\s/g, "").split(",");
        let charas = [];
        let match = null;
        for (const name of nameList) {
            // イベントを取得
            $gameMap.events().forEach(event => {
                const note = event.event().name + " " + event.event().note;
                if (note.includes(name)) { charas.push(event); }
            });
            // セルフを取得
            if (name.match(/^(セルフ|自分|自身|self)$/)) {
                const preself = self;
                self = self || getPlcmEvent() || charaSpritePlcm._character;
                if (self) { charas.push(self); }
            }
            // プレイヤーを取得
            if (name.match(/^(プレイヤー|操作キャラ|player)$/)) {
                charas = [...charas, $gamePlayer];
            }
            // フォロワーを取得
            match = name.match(/^(フォロワー|フォロアー|隊列|隊列キャラ|follower)(\d*)$/)
            if (match) {
                const id = match[2] ? Number(match[2]) - 1 : null;
                charas = id != null ? [...charas, $gamePlayer._followers._data[id]] : [...charas, ...$gamePlayer._followers._data];
            }
            // パーティを取得
            if (name.match(/^(パーティ|味方|味方全員|味方全体|party)$/)) {
                charas = [...charas, $gamePlayer, ...$gamePlayer._followers._data];
            }
            // 乗り物を取得
            match = name.match(/^(乗り物|乗物|乗機|vehicle)(\d*)$/);
            if (match) {
                const id = match[2] ? Number(match[2]) - 1 : 0;
                charas = id ? [...charas, $gameMap._vehicles[id]] : [...charas, ...$gameMap._vehicles];
            }
            // 全て取得
            if (name.match(/^(全て|すべて|全部|全体|all)$/)) {
                charas = [...$gameMap.events(), $gamePlayer, ...$gamePlayer._followers._data, ...$gameMap._vehicles];
            }
            // 選択なし
            if (name.match(/^(なし|無し|none)$/)) {
            }
        }
        charas = charas.filter(chara => chara);
        return charas;
    };
    
    
    //- IDでのキャラリスト取得
    function getCharasById(ids, self) {
        if (!ids) { return []; }
        const idList = !ids ? [] : strToNumList(ids.toString());
        let charas = [];
        for (const id of idList) {
            // イベントを取得
            if (id > 0) { charas.push($gameMap.event(id)); }
            // セルフを取得
            if (id == 0) {
                self = self || getPlcmEvent() || (charaSpritePlcm ?charaSpritePlcm._character : null) || $gamePlayer;
                if (self && !idList.includes(self._eventId)) { charas.push(self); }
            }
            // プレイヤーを取得
            if (id == -1) { charas = [...charas, $gamePlayer]; }
            // フォロワーを取得
            if (id <= -10 && id >= -99) {
                charas = id == -10 ? [...charas, ...$gamePlayer._followers._data] : [...charas, $gamePlayer._followers._data[Math.abs(id) - 11]];
            }
            // 乗り物を取得
            if (id <= -100) {
                charas = id == -100 ? [...charas, ...$gameMap._vehicles] : [...charas, $gameMap._vehicles[Math.abs(id) - 101]];
            }
            // 全て取得
            if (id == -2) {
                charas = [...$gameMap.events(), $gamePlayer, ...$gamePlayer._followers._data, ...$gameMap._vehicles];
            }
        }
        charas = charas.filter(chara => chara);
        return charas;
    };
    
    
    //- 全てのキャラを取得
    function getAllCharacter() {
        return  [...$gameMap.events(), $gamePlayer, ...$gamePlayer._followers._data, ...$gameMap._vehicles];
    };
    
    
    //- 同じキャラか
    function isSameChara(a, b) {
        if (!a) { return !b; }
        if (!b) { return !a; }
        if (a._eventId) {
            if (!b._eventId) { return false; }
            return a._eventId == b._eventId;
        }
        if (a._isSwipeDummyKe && !b._isSwipeDummyKe) { return false; }
        if (b._isSwipeDummyKe && !a._isSwipeDummyKe) { return false; }
        if (a._followers && b._followers) { return true; }
        if (a._memberIndex && a._memberIndex == b._memberIndex) { return true; }
        if (a._type && a._type == b._type) { return true; }
        return false;
    };
    
    
    //- 同じキャラを検索
    function searchSameChara(chara) {
        let same = null;
        for (let c of getAllCharacter()) {
            if (isSameChara(c, chara)) {
                same = c;
                break;
            }
        }
        return same;
    };


    //- キャラをIDに変換
    function charaToId(subject) {
        let id = subject._eventId;
        if (subject._followers) { id = -1; } else
        if (subject._memberIndex) { id = -1 - subject._memberIndex; } else
        if (subject._type) { id = subject._vehicleIdKe; }
        subject._charaIdKe = id;
        return id;
    };
    
    
    //- IDをキャラに変換
    function idToChara(charaId) {
        charas = [...$gameMap.events(), $gamePlayer, ...$gamePlayer._followers._data, ...$gameMap._vehicles];
        let target = null;
        for (let chara of charas) {
            if (chara._charaIdKe == charaId) {
                target = chara;
                break;
            }
        }
        return target;
    };
    
    
    //- 乗り物IDの設定(コア追加)
    const _Game_Map_createVehicles = Game_Map.prototype.createVehicles;
    Game_Map.prototype.createVehicles = function() {
        _Game_Map_createVehicles.apply(this);
        setTimeout(setVehicleId, 0, this);
    };

    function setVehicleId(gm) {
        gm._vehicles.forEach((vehicle, i) => {
            vehicle._vehicleIdKe = 1001 + i;
        });
    };
    
    
    
    //==================================================
    //--  開始時プラグインコマンド /ベーシック
    //==================================================
    
    //- 開始時プラグインコマンドの実行
    function runPluginCmdStarting(list, regs = [], condition = "") {
        if (!list || !list.length) { return; }
        // 開始時用インタープリターを作成
        const startingIp = new Game_InterpreterStartingKeAcms();
        startingIp.setup(list, regs, condition);
        while (1) {
            if (!startingIp.executeCommand()) { break; }
        }
    };
    
    
    //- 対象のプラグインコマンドか
    function isCanPluginCmd(cmd, regs = [], condition = "") {
        if (cmd.code != 357) { return false; }
        let result = false;
        const params = cmd.parameters;
        const args = params[3];
        let conditionOk = condition ? false : true;
        if (toBoolean(args[condition])) { conditionOk = true; }
        const regsOk = params[1] ? regs.filter(reg => params[1].match(reg)).length : false;
        if (regsOk && conditionOk) { result = true; }
        return result;
    };
    
    
    //- 開始時用インタープリター
    function Game_InterpreterStartingKeAcms() {
        this.initialize(...arguments);
    }
    
    Game_InterpreterStartingKeAcms.prototype = Object.create(Game_Interpreter.prototype);
    Game_InterpreterStartingKeAcms.prototype.constructor = Game_InterpreterStartingKeAcms;
    
    
    //- セットアップ
    Game_InterpreterStartingKeAcms.prototype.setup = function(list, regs, condition) {
        Game_Interpreter.prototype.setup.call(this, list);
        this._regsKe = regs;
        this._conditionKe = condition;
    };
    
    
    //- コマンド実行
    Game_InterpreterStartingKeAcms.prototype.executeCommand = function() {
        const cmd = this.currentCommand();
        if (cmd) {
            if (cmd.code == 109) {
                this.skipBranch();
                return true;
            }
            this._indent = cmd.indent;
            // 対象のプラグインコマンドのみ実行
            if (this.canExecute(cmd)) {
                const methodName = "command" + cmd.code;
                if (typeof this[methodName] === "function") {
                    if (!this[methodName](cmd.parameters)) {
                        return false;
                    }
                }
            }
            this._index++;
        } else {
            return false;
        }
        return true;
    };
    
    
    //- コマンド実行するか
    Game_InterpreterStartingKeAcms.prototype.canExecute = function(cmd) {
        result = false;
        //if (cmd.code == 111 && cmd.parameters[0] != 12) { result = true; }
        //if (cmd.code == 411) { result = true; }
        if (cmd.code == 117) { result = true; }
        if (cmd.code == 357) {
            result = isCanPluginCmd(cmd, this._regsKe, this._conditionKe);
        }
        return result;
    };
    
    
    //- 開始時コモンイベントのセットアップ
    Game_InterpreterStartingKeAcms.prototype.setupChild = function(list, eventId) {
        if (!this._childInterpreter) { this._childInterpreter = new Game_InterpreterStartingKeAcms(this._depth + 1); }
        this._childInterpreter.setup(list, this._regsKe, this._conditionKe);
        while (1) {
            if (!this._childInterpreter.executeCommand()) { break; }
        }
    };
    
})();