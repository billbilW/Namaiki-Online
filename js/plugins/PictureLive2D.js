//==============================================================================
// PictureLive2D.js ver.1.12
//==============================================================================

/*:
 * @plugindesc Live2Dアニメーションプラグイン
 * @author 奏ねこま（おとぶきねこま）
 * @url http://makonet.sakura.ne.jp/rpg_tkool
 * @target MZ
 *
 * @param json file
 * @type string[]
 * @default []
 * @desc Live2Dファイル(*.model3.json)
 *
 * @param disable auto loading
 * @type boolean
 * @default false
 * @desc Live2Dの自動読み込みを無効にする
 *
 * @param voice volume option
 * @type struct<Voice>
 * @default {"volume option":"0","variable id":"0"}
 * @desc ボイスに適用する音量オプションを選択
 *
 * @help
 * 本プラグインの利用方法については下記マニュアルをご参照ください。
 * https://makonet.sakura.ne.jp/rpg_tkool/MVMZ/PictureLive2D/document.html
 * 
 * ------------------------------------------------------------------------------
 *   本プラグインの利用はRPGツクール/RPG Makerの正規ユーザーに限られます。
 *   商用、非商用、有償、無償、一般向け、成人向けを問わず利用可能です。
 *   ご利用の際に連絡や報告は必要ありません。また、製作者名の記載等も不要です。
 *   プラグインを導入した作品に同梱する形以外での再配布、転載はご遠慮ください。
 *   本プラグインにより生じたいかなる問題についても一切の責任を負いかねます。
 * ------------------------------------------------------------------------------
 *                                              Copylight (c) 2023 Nekoma Otobuki
 *                                         http://makonet.sakura.ne.jp/rpg_tkool/
 *                                             https://twitter.com/maconetto_labo
 */

/*~struct~Voice:
 * @param volume option
 * @type select
 * @option SE Volume
 * @value 0
 * @option ME Volume
 * @value 1
 * @option BGS Volume
 * @value 2
 * @option BGM Volume
 * @value 3
 * @option Variable
 * @value 4
 * @default 1
 * @desc 音量オプションを選択
 *
 * @param variable id
 * @type variable
 * @default 0
 * @desc 変数を選択
 */

!function() {
    'use strict';

    let $p = function parse(param) {
        try {
            param = JSON.parse(param);
        }
        catch (e) {}
        if (Array.isArray(param)) {
            param = param.map(value => parse(value));
        } else if (typeof param == 'object') {
            for (let key in param) {
                param[key] = parse(param[key]);
            }
        }
        return param;
    }({
        ...PluginManager.parameters('PictureLive2D'),
        'live2d data': {}
    });

    function load() {
        let loader = new (PIXI.Loader || PIXI.loaders.Loader)();
        for (let file of $p['json file']) {
            let name = String(file).replace(/\.(?:json|model3.json)$/i, '');
            if (!$p['disable auto loading']) {
                $p['live2d data'][name] = null;
                loader.add(name, `img/live2d/${name}.model3.json`);
            } else {
                $p['live2d data'][name] = {};
            }
        }
        loader.load((loader, resource) => {
            for (let name in $p['live2d data']) {
                if (resource[name]) {
                    $p['live2d data'][name] = resource[name].live2dData;
                }
            }
        });
    }

    if (!window.Live2DCubismCore) {
        let js = null;
        for (let element of document.getElementsByTagName('script')) {
            if (element.src.match('live2dcubismcore.min.js')) {
                js = element;
            }
        }
        if (!js) {
            js = document.createElement('script');
            js.type = 'text/javascript';
            js.src  = 'js/libs/live2dcubismcore.min.js';
            document.body.appendChild(js);
        }
        js.addEventListener('load', load);
    } else {
        load();
    }

    class MosaicFilter extends PIXI.Filter {
        constructor(size = 10) {
            let vertex   = 'attribute vec2 aVertexPosition;attribute vec2 aTextureCoord;uniform mat3 projectionMatrix;varying vec2 vTextureCoord;void main(void){gl_Position=vec4((projectionMatrix*vec3(aVertexPosition,1.0)).xy,0.0,1.0);vTextureCoord=aTextureCoord;}';
            let fragment = 'precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uSampler;void main(void){gl_FragColor=texture2D(uSampler, vTextureCoord);}';
            super(vertex, fragment);
            this.uniforms.size = [size, size];
        }
    }

    function convars(obj) {
        if (typeof obj == 'string') {
            let _obj = obj.replace(/\\v\[(\d+)\]/gi, (match, p1) => {
                return $gameVariables.value(Number(p1));
            });
            obj = _obj != obj ? convars(_obj) : _obj;
        } else if (obj instanceof Array) {
            obj = obj.map(value => convars(value));
        } else if (typeof obj == 'object') {
            obj = {...obj};
            for (let key in obj) {
                obj[key] = convars(obj[key]);
            }
        }
        return obj;
    }

    //==============================================================================
    // JsonEx
    //==============================================================================

    (___decode => {
        JsonEx._decode = function(value, circular, registry) {
            let decode = ___decode.apply(this, arguments);
            if (decode instanceof Game_Live2D) {
                if (decode._snapshot) {
                    let animation = decode._snapshot.animation;
                    animation.tracks.forEach(track => {
                        if (!track) return;
                        for (let entry of track.entries) {
                            if ('isDoFade' in entry == false) {
                                entry.isDoFade = { in: true, out: true };
                            }
                        }
                    });
                    if (!animation.lastValues) {
                        animation.lastValues = [...decode._snapshot.parameters.values];
                    }
                }
            }
            return decode;
        };
    })(JsonEx._decode);

    //==============================================================================
    // Game_Live2D
    //==============================================================================

    class Game_Live2D {
        constructor() {
            this.init();
        }

        static live2dData() {
            return $p['live2d data'];
        }

        static fullName(name = '') {
            for (let key in this.live2dData()) {
                if (key.match(`(?:^|/)${name}$`)) {
                    return key;
                }
            }
            return '';
        }

        static loadModel(name) {
            let fullName = this.fullName(name);
            let data = $p['live2d data'][fullName];
            if (!data || 'Moc' in data) return;
            $p['live2d data'][fullName] = null;
            let loader = new (PIXI.Loader || PIXI.loaders.Loader)();
            loader.add(fullName, `img/live2d/${fullName}.model3.json`);
            loader.load((loader, resource) => {
                $p['live2d data'][fullName] = resource[fullName].live2dData;
            });
        }

        static voiceVolume() {
            let option = $p['voice volume option'] || {};
            let index = option['volume option'] || 0;
            return [
                AudioManager._seVolume,
                AudioManager._meVolume,
                AudioManager._bgsVolume,
                AudioManager._bgmVolume,
                $gameVariables.value(option['variable id'])
            ][index];
        }

        get model() { return this._model; }
        get track() { return this._track; }
        get timeScale() { return this._timeScale; }
        get weight() { return this._weight; }
        get mix() { return this._mix; }
        get autoEyeBlink() { return this._autoEyeBlink; }
        get expression() { return this._expression; }
        get customExpression() { return this._customExpression; }
        get color() { return this._color; }
        get mosaic() { return this._mosaic; }
        get offset() { return this._offset; }
        get scale() { return this._scale; }
        get visible() { return this._visible; }
        get resetIds() { return this._resetIds; }
        get voice() { return this._voice; }
        get snapshot() { return this._snapshot; }

        set snapshot(value) { this._snapshot = value; }

        init() {
            this._model            = '';
            this._track            = {};
            this._timeScale        = 1;
            this._weight           = [];
            this._mix              = {};
            this._autoEyeBlink     = {};
            this._expression       = '';
            this._customExpression = null;
            this._color            = {};
            this._mosaic           = {};
            this._offset           = { x: 0, y: 0 };
            this._scale            = { x: 1, y: 1 };
            this._visible          = true;
            this._resetIds         = null;
            this._voice            = null;
            this._snapshot         = null;
        }

        setModel(name = '') {
            name = convars(name);
            this.init();
            this._model = `${name}_${Date.now()}`;
            return this;
        }

        setAnimation(index, animations, ...args) {
            [index, animations, args] = convars([index, animations, args]);
            this._track = {...this._track};
            let list, order, continuance, interrupt;
            if (typeof animations == 'string') {
                list        = [animations];
                order       = 'sequential';
                continuance = args[0] || 'continue';
                interrupt   = typeof args[1] == 'boolean' ? args[1] : args[1] == 'true';
            } else {
                list        = animations;
                order       = args[0] || 'sequential';
                continuance = args[1] || 'continue';
                interrupt   = typeof args[2] == 'boolean' ? args[2] : args[2] == 'true';
            }
            this._track[index] = { list: [], order: order, continuance: continuance, interrupt: interrupt };
            list.forEach(animation => {
                let [name, options] = `${animation}/`.replace(/ +/, '').split(/\//);
                let times           = 1;
                let timeScale       = 1;
                let weight          = 1;
                for (let option of options.replace(/ +/, '').split(/,/)) {
                    if (option.match(/^times=(\d+)$/i)) {
                        times = Number(RegExp.$1);
                    }
                    if (option.match(/^timeScale=(\d+\.?\d*)$/i)) {
                        timeScale = Number(RegExp.$1);
                    }
                    if (option.match(/^weight=(\d+\.?\d*)$/i)) {
                        weight = Number(RegExp.$1);
                    }
                }
                this._track[index].list.push({ name: name, times: times, timeScale: timeScale, weight: weight });
            });
            return this;
        }

        clearAnimation(index, mixTime = 0) {
            [index, mixTime] = convars([index, mixTime]);
            this._track = {...this._track};
            this._track[index] = { clear: true, mixTime: mixTime };
            return this;
        }

        setTimeScale(value) {
            value = convars(value);
            this._timeScale = Number(value);
            return this;
        }

        setWeight(index, value) {
            [index, value] = convars([index, value]);
            this._weight = this._weight.slice();
            this._weight[index] = Number(value);
            return this;
        }

        setMix(...args) {
            args = convars(args);
            this._mix = {...this._mix};
            let from, to, duration;
            if (args.length == 1) {
                from     = '/default';
                to       = '';
                duration = Number(args[0]);
            } else {
                from     = args[0];
                to       = args[1];
                duration = args.length > 2 ? Number(args[2]) : null;
            }
            if (duration !== null) {
                this._mix[`${from}/${to}`] = duration;
            } else {
                delete this._mix[`${from}/${to}`];
            }
            return this;
        }

        setAutoEyeBlink(enabled, options) {
            [enabled, options] = convars([enabled, options]);
            if (options) {
                for (let key in options) {
                    options[key] = Number(options[key]);
                }
            }
            this._autoEyeBlink = {
                enabled: typeof enabled == 'boolean' ? enabled : enabled == 'true',
                options: options
            };
            return this;
        }

        setExpression(name) {
            name = convars(name);
            this._expression = name;
            return this;
        }

        setCustomExpression(exp3) {
            exp3 = convars(exp3);
            this._customExpression = { Data: exp3 };
            return this;
        }

        clearExpression() {
            this._expression = '';
            return this;
        }

        setColor(...args) {
            args = convars(args);
            this._color = {...this._color};
            let id, r, g, b, a;
            if (args.length == 4) {
                id = '/default/';
                r  = Number(args[0]);
                g  = Number(args[1]);
                b  = Number(args[2]);
                a  = Number(args[3]);
            } else {
                id = args[0];
                r  = Number(args[1]);
                g  = Number(args[2]);
                b  = Number(args[3]);
                a  = Number(args[4]);
            }
            if (r != 1 || g != 1 || b != 1 || a != 1) {
                this._color[id] = [r, g, b, a];
            } else {
                delete this._color[id];
            }
            return this;
        }

        setMosaic(...args) {
            args = convars(args);
            this._mosaic = {...this._mosaic};
            let id, size;
            if (args.length == 1) {
                id   = '/default/';
                size = Number(args[0]);
            } else {
                id   = args[0];
                size = Number(args[1]);
            }
            if (size > 1) {
                this._mosaic[id] = size;
            } else {
                delete this._mosaic[id];
            }
            return this;
        }

        setOffset(x, y) {
            [x, y] = convars([x, y]);
            this._offset = { x: Number(x), y: Number(y) };
            return this;
        }

        setScale(x, y) {
            [x, y] = convars([x, y]);
            this._scale = { x: Number(x), y: Number(y) };
            return this;
        }

        setVisible(visible) {
            this._visible = !!convars(visible);
            return this;
        }

        resetParameters(...ids) {
            ids = convars(ids);
            this._resetIds = ids;
            return this;
        }

        playVoice(path, options) {
            [path, options] = convars([path, options]);
            if (options) {
                for (let key in options) {
                    options[key] = Number(options[key]);
                }
            }
            options = { volume: 100, pitch: 100, pan: 0, scale: 1, ...options };
            this._voice = { path: path, options: options };
            return this;
        }

        stopVoice() {
            this._voice = null;
            return this;
        }
    }

    window.Game_Live2D = Game_Live2D;

    //==============================================================================
    // Sprite_Live2D
    //==============================================================================

    class Sprite_Live2D extends Sprite {
        constructor(...args) {
            super();
            this._pictureId = typeof args[0] == 'number' ? args[0] : 0;
            this._live2d    = args[0] instanceof Game_Live2D ? args[0] : null;
            this._isRestore = false;
            this._voiceBuffer = null;
            this.init();
        }

        init() {
            this.clearVoice();
            this.removeChild(this._data);
            this._data             = null;
            this._model            = '';
            this._track            = {};
            this._timeScale        = 1;
            this._weight           = [];
            this._mix              = {};
            this._autoEyeBlink     = null;
            this._expression       = '';
            this._customExpression = null;
            this._color            = {};
            this._mosaic           = {};
            this._offset           = null;
            this._scale            = null;
            this._resetIds         = null;
            this._voice            = null;
        }

        live2d() {
            if (this._live2d) {
                return this._live2d;
            }
            let picture = $gameScreen.picture(this._pictureId);
            return picture ? picture._live2d : null;
        }

        update() {
            let live2d = this.live2d();
            this.updateModel(live2d);
            if (this._data) {
                this.updateColor(live2d);
                this.updateMosaic(live2d);
                this.updateOffset(live2d);
                this.updateScale(live2d);
                this.updateVisible(live2d);
                if (!this._isRestore) {
                    this.resetParameters(live2d);
                    this.updateTimeScale(live2d);
                    this.updateWeight(live2d);
                    this.updateMix(live2d);
                    this.updateExpression(live2d);
                    this.updateCustomExpression(live2d);
                    this.updateAutoEyeBlink(live2d);
                    this.updateVoice(live2d);
                    this.updateAnimation(live2d);
                    this.snapshot(live2d);
                } else {
                    this.restore(live2d);
                }
            }
            super.update();
        }

        updateModel(live2d) {
            if (live2d) {
                if (live2d.model != this._model) {
                    this.init();
                    let model = live2d.model.replace(/_\d+$/, '');
                    if (model) {
                        let fullName = Game_Live2D.fullName(model);
                        let data = Game_Live2D.live2dData()[fullName];
                        if (data) {
                            if (data.loading == 0) {
                                this._data = new PIXI.Live2D(data);
                                this._data.animation.addListener('start', this.onStart.bind(this));
                                this._data.animation.addListener('end', this.onEnd.bind(this));
                                this.addChild(this._data);
                                if (live2d.snapshot) {
                                    this._isRestore = true;
                                }
                            } else if ('Moc' in data == false) {
                                Game_Live2D.loadModel(model);
                            }
                        } else if (fullName in Game_Live2D.live2dData() == false) {
                            throw Error(`'${model}' is unknown model.`);
                        }
                    }
                    if (!model || this._data) {
                        this._model = live2d.model;
                    }
                }
            } else if (this._model) {
                this.init();
            }
        }

        updateTimeScale(live2d) {
            if (live2d.timeScale == this._timeScale) return;
            this._timeScale = live2d.timeScale;
            this._data.animation.setTimeScale(this._timeScale);
        }

        updateWeight(live2d) {
            if (live2d.weight == this._weight) return;
            this._weight = live2d.weight;
            this._weight.forEach((value, index) => {
                this._data.animation.setWeight(index, value);
            });
        }

        updateMix(live2d) {
            if (live2d.mix == this._mix) return;
            for (let key in live2d.mix) {
                if (live2d.mix[key] != this._mix[key]) {
                    let time = live2d.mix[key];
                    if (key == '/default/') {
                        this._data.animation.setDefaultMix(time);
                    } else {
                        let [from, to] = key.split('/');
                        this._data.animation.setMix(from, to, time);
                    }
                }
            }
            for (let key in this._mix) {
                if (key in live2d.mix == false) {
                    if (key == '/default/') {
                        this._data.animation.setDefaultMix(0);
                    } else {
                        let [from, to] = key.split('/');
                        this._data.animation.setMix(from, to, 0);
                    }
                }
            }
            this._mix = live2d.mix;
        }

        updateAutoEyeBlink(live2d) {
            if (live2d.autoEyeBlink == this._autoEyeBlink) return;
            this._autoEyeBlink = live2d.autoEyeBlink;
            this._data.animation.setAutoEyeBlink(this._autoEyeBlink.enabled, this._autoEyeBlink.options);
        }

        updateExpression(live2d) {
            if (live2d.expression == this._expression) return;
            this._expression = live2d.expression;
            if (this._expression) {
                this._data.direction.setExpression(this._expression);
            } else {
                this._data.direction.clearExpression();
            }
        }

        updateCustomExpression(live2d) {
            if (live2d.customExpression == this._customExpression) return;
            this._customExpression = live2d.customExpression;
            if (this._customExpression) {
                this._data.direction.setCustomExpression(this._customExpression);
            }
        }

        updateColor(live2d) {
            if (live2d.color == this._color) return;
            for (let id in live2d.color) {
                if (live2d.color[id] != this._color[id]) {
                    let color  = live2d.color[id];
                    let filter = new PIXI.filters.ColorMatrixFilter();
                    filter.matrix = [
                        color[0], 0, 0, 0, 0,
                        0, color[1], 0, 0, 0,
                        0, 0, color[2], 0, 0,
                        0, 0, 0, color[3], 0
                    ];
                    let target = (id == '/default/') ? this._data : this.getArtMesh(id);
                    let filters = (target.filters || []).filter(filter => {
                        return filter instanceof PIXI.filters.ColorMatrixFilter == false;
                    });
                    filters.push(filter);
                    target.filters = filters;
                }
            }
            for (let id in this._color) {
                if (id in live2d.color == false) {
                    let target = (id == '/default/') ? this._data : this.getArtMesh(id);
                    let filters = (target.filters || []).filter(filter => {
                        return filter instanceof PIXI.filters.ColorMatrixFilter == false;
                    });
                    target.filters = filters.length > 0 ? filters : null;
                }
            }
            this._color = live2d.color;
        }

        updateMosaic(live2d) {
            if (live2d.mosaic == this._mosaic) return;
            for (let id in live2d.mosaic) {
                if (live2d.mosaic[id] != this._mosaic[id]) {
                    let size   = live2d.mosaic[id];
                    let filter = new MosaicFilter(size);
                    let target = (id == '/default/') ? this._data : this.getArtMesh(id);
                    let filters = (target.filters || []).filter(filter => {
                        return filter instanceof MosaicFilter == false;
                    });
                    filters.push(filter);
                    target.filters = filters;
                }
            }
            for (let id in this._mosaic) {
                if (id in live2d.mosaic == false) {
                    let target = (id == '/default/') ? this._data : this.getArtMesh(id);
                    let filters = (target.filters || []).filter(filter => {
                        return filter instanceof MosaicFilter == false;
                    });
                    target.filters = filters.length > 0 ? filters : null;
                }
            }
            this._mosaic = live2d.mosaic;
        }

        updateOffset(live2d) {
            if (live2d.offset == this._offset) return;
            this._offset = live2d.offset;
            this.x = this._offset.x;
            this.y = this._offset.y;
        }

        updateScale(live2d) {
            if (live2d.scale == this._scale) return;
            this._scale = live2d.scale;
            this.scale.x = this._scale.x;
            this.scale.y = this._scale.y;
        }

        updateVisible(live2d) {
            this.visible = live2d.visible;
        }

        resetParameters(live2d) {
            if (live2d.resetIds == this._resetIds) return;
            this._resetIds = live2d.resetIds;
            this._data.animation.resetParameters(...this._resetIds);
        }

        updateVoice(live2d) {
            if (live2d.voice == this._voice) {
                if (this._voiceBuffer) {
                    let analyser = this._voiceBuffer._analyserNode;
                    if (analyser) {
                        let fftSize = analyser.fftSize;
                        let dataArray = new Uint8Array(fftSize);
                        analyser.getByteTimeDomainData(dataArray);
                        let value = Math.abs(dataArray[fftSize - 1] * 2 / 255 - 1);
                        let scale = this._voice.options.scale;
                        this._data.lipSync.setValue(value * scale);
                    } else if (this._voiceBuffer.isReady()) {
                        this._voiceBuffer = null;
                        this._data.lipSync.clear();
                    }
                }
                return;
            }
            this.clearVoice();
            if (live2d.voice && live2d.voice.path) {
                let buffer = new Voice(`audio/${live2d.voice.path + AudioManager.audioFileExt()}`);
                let volume = Game_Live2D.voiceVolume();
                AudioManager.updateBufferParameters(buffer, volume, live2d.voice.options);
                buffer.play(false, 0);
                this._voiceBuffer = buffer;
                live2d.voice.path = '';
            }
            this._voice = live2d.voice;
        }

        clearVoice() {
            if (this._voiceBuffer) {
                this._voiceBuffer.stop();
                this._voiceBuffer = null;
                this._data.lipSync.clear();
            }
        }

        updateAnimation(live2d) {
            if (live2d.track == this._track) return;
            for (let id in live2d.track) {
                if (live2d.track[id] != this._track[id]) {
                    let track = live2d.track[id];
                    if (track.clear) {
                        this._data.animation.clearAnimation(Number(id), track.mixTime);
                        continue;
                    }
                    let list  = [];
                    let loop  = track.continuance != 'none';
                    for (let animation of track.list) {
                        for (let j = 0; j < animation.times; j++) {
                            list.push(animation);
                        }
                    }
                    if (track.order == 'shuffle') {
                        let _list = [...list];
                        list = [];
                        while (_list.length > 0) {
                            let index = Math.floor(Math.random() * _list.length);
                            list.push(_list.splice(index, 1)[0]);
                        }
                    } else if (track.order == 'random') {
                        let index = Math.floor(Math.random() * list.length);
                        list = [list[index]];
                    }
                    list.forEach((animation, index) => {
                        let entry;
                        if (index == 0 && track.interrupt) {
                            entry = this._data.animation.setAnimation(Number(id), animation.name, loop);
                        } else {
                            entry = this._data.animation.addAnimation(Number(id), animation.name, loop);
                        }
                        entry.timeScale = animation.timeScale;
                        entry.weight    = animation.weight;
                    });
                }
            }
            this._track = live2d.track;
        }

        getArtMesh(id) {
            let index = this._data.model.drawables.ids.indexOf(id);
            return this._data._meshes[index];
        }

        onStart(trackInfo) {
            if (trackInfo.track.entries.length == 1) {
                this.resetAnimation(trackInfo.index);
            }
        }

        onEnd(trackInfo) {
            this.onStart(trackInfo);
        }

        resetAnimation(index) {
            let live2d = this.live2d();
            if (live2d && live2d.track[index]) {
                if (live2d.track[index] == this._track[index]) {
                    if (this._track[index].continuance == 'reset') {
                        live2d.track[index].interrupt = false;
                        this._track = {...this._track};
                        this._track[index] = null;
                    }
                }
            }
        }

        snapshot(live2d) {
            live2d.snapshot = this._data.snapshot();
        }

        restore(live2d) {
            this._data.restore(live2d.snapshot);
            this._timeScale  = live2d.timeScale;
            this._weight     = live2d.weight;
            this._mix        = live2d.mix;
            this._expression = live2d.expression;
            this._track      = live2d.track;
            this._isRestore = false;
        }
    }

    window.Sprite_Live2D = Sprite_Live2D;

    //==============================================================================
    // Game_Screen
    //==============================================================================

    Game_Screen.prototype.live2d = function(id) {
        id = Number(convars(id));
        let picture = this.picture(id);
        if (!picture._live2d) {
            picture._live2d = new Game_Live2D();
        }
        return picture._live2d;
    };

    //==============================================================================
    // Game_Picture
    //==============================================================================

    (__initialize => {
        Game_Picture.prototype.initialize = function() {
            __initialize.apply(this, arguments);
            this._live2d = null;
        };
    })(Game_Picture.prototype.initialize);

    (__erase => {
        Game_Picture.prototype.erase = function() {
            __erase.apply(this, arguments);
            this._live2d = null;
        };
    })(Game_Picture.prototype.erase);

    //==============================================================================
    // Sprite_Picture
    //==============================================================================

    (__initialize => {
        Sprite_Picture.prototype.initialize = function(pictureId) {
            __initialize.apply(this, arguments);
            this.addChild(new Sprite_Live2D(pictureId))
        };
    })(Sprite_Picture.prototype.initialize);

    //==============================================================================
    // Voice
    //==============================================================================

    class Voice extends WebAudio {
        constructor(url) {
            super(url);
            this._dataArray = new Uint8Array(32);
        }

        get value() {
            if (!this._analyserNode) return 0;
            this._analyserNode.getByteTimeDomainData(this._dataArray);
            let value = this._dataArray[this._analyserNode.fftSize - 1];
            return Math.abs(value * 2 / 255 - 1);
        }

        clear() {
            super.clear();
            this._analyserNode = null;
        }

        _createNodes() {
            super._createNodes();
            this._analyserNode = WebAudio._context.createAnalyser();
            this._analyserNode.fftSize = 32;
        }

        _connectNodes() {
            super._connectNodes();
            this._sourceNode.disconnect();
            this._sourceNode.connect(this._analyserNode);
            this._analyserNode.connect(this._gainNode);
        }

        _createGainNode() {
            super._createGainNode();
            this._analyserNode = WebAudio._context.createAnalyser();
            this._analyserNode.fftSize = 32;
            this._gainNode.disconnect();
            this._gainNode.connect(this._analyserNode);
            this._analyserNode.connect(this._pannerNode);
        }

        _removeNodes() {
            super._removeNodes();
            this._analyserNode = null;
        }
    }
}();

!function() {
    'use strict';

    class MultiplyScreenFilter extends PIXI.Filter {
        constructor(multiplyColor, screenColor) {
            let fragment = 'varying vec2 vTextureCoord;uniform sampler2D uSampler;uniform vec3 multiplyColor;uniform vec3 screenColor;void main(void){vec4 color=texture2D(uSampler, vTextureCoord);color.rgb*=multiplyColor;color.rgb=color.rgb+screenColor*color.a-color.rgb*screenColor;gl_FragColor=color;}';
            super(null, fragment);
            this.uniforms.multiplyColor = multiplyColor;
            this.uniforms.screenColor = screenColor;
        }

        get enabled() {
            return this.uniforms.multiplyColor.some(value => value != 1)
                || this.uniforms.screenColor.some(value => value != 0);
        }

        set enabled(value) { }
    }

    //==============================================================================
    // PIXI.mesh.Mesh -> PIXI.SimpleMesh
    //==============================================================================

    if (!PIXI.SimpleMesh) {
        PIXI.SimpleMesh = class extends PIXI.mesh.Mesh {
            constructor(texture, vertices, uvs, indices, drawMode) {
                super(texture, vertices, uvs, indices, drawMode);
                this.state  = {};
                this.shader = {};
                this.texture.baseTexture.resource = {
                    source: this.texture.baseTexture.source
                };
                Object.defineProperty(this.state, 'blendMode', {
                    set: value => this.blendMode = value
                });
            }
        }
    }

    //==============================================================================
    // PIXI.filters.AlphaFilter -> PIXI.filters.VoidFilter
    //==============================================================================

    if (!PIXI.filters.VoidFilter) {
        PIXI.filters.VoidFilter = PIXI.filters.AlphaFilter;
    }

    //==============================================================================
    // Mesh
    //==============================================================================

    class Mesh extends PIXI.SimpleMesh {
        constructor(texture, vertices, uvs, indices, drawMode) {
            super(texture, vertices, uvs, indices, drawMode);
            this.uvs     = this.uvs || this.uvBuffer.data;
            this.indices = this.indices || this.geometry.indexBuffer.data;
            this.orderIndex = 0;
        }

        _render(renderer) {
            if (!this.state.culling) {
                super._render(renderer);
                return;
            }
            let gl = renderer.gl;
            gl.frontFace(gl.getParameter(gl.FRAMEBUFFER_BINDING) ? gl.CW : gl.CCW);
            super._render(renderer);
            gl.frontFace(gl.CCW);
        }

        _renderWebGL(renderer) {
            if (!this.state.culling) {
                super._renderWebGL(renderer);
                return;
            }
            let gl = renderer.gl;
            gl.enable(gl.CULL_FACE);
            gl.frontFace(gl.getParameter(gl.FRAMEBUFFER_BINDING) ? gl.CW : gl.CCW);
            super._renderWebGL(renderer);
            gl.frontFace(gl.CCW);
            gl.disable(gl.CULL_FACE);
        }
    }

    //==============================================================================
    // CopyMesh
    //==============================================================================

    class CopyMesh extends Mesh {
        constructor(mesh) {
            super(mesh.texture, mesh.vertices, mesh.uvs, mesh.indices, mesh.drawMode);
            this.state  = mesh.state;
            this.shader = mesh.shader;
            this._mesh = mesh;
        }

        update() {
            this.vertices = this._mesh.vertices;
        }
    }

    //==============================================================================
    // MaskMesh
    //==============================================================================

    class MaskMesh extends CopyMesh {
        constructor(mesh) {
            super(mesh);
            this.maskTexture = null;
            this.texturePool = {};
            this.orderIndex = -Infinity;
            this.setup();
        }

        setup() {
            this.maskTexture = new PIXI.Texture(new PIXI.BaseTexture());
            this.maskTexture.baseTexture.valid = true;
            let filter = new PIXI.filters.VoidFilter();
            filter.apply = this.apply.bind(this);
            this.filters = [filter, new PIXI.filters.VoidFilter()];
        }

        render(renderer) {
            let pool = renderer.filter.texturePool.texturePool;
            renderer.filter.texturePool.texturePool = this.texturePool;
            super.render(renderer);
            renderer.filter.texturePool.texturePool = pool;
        }

        renderWebGL(renderer) {
            let pool = renderer.filterManager.pool;
            renderer.filterManager.pool = this.texturePool;
            super.renderWebGL(renderer);
            renderer.filterManager.pool = pool;
        }

        apply(filterManager, input, output, clear, currentState) {
            let gl = filterManager.renderer.gl;
            let uid = filterManager.renderer.CONTEXT_UID;
            let frame = {}, size = {};
            let texture;
            if (input.filterFrame) {
                frame.x = input.filterFrame.x;
                frame.y = input.filterFrame.y;
                frame.width = input.filterFrame.width;
                frame.height = input.filterFrame.height;
                size.width  = input.width;
                size.height = input.height;
                texture = input.baseTexture._glTextures[uid].texture;
            } else {
                frame.x = input.sourceFrame.x;
                frame.y = input.sourceFrame.y;
                frame.width = input.sourceFrame.width;
                frame.height = input.sourceFrame.height;
                size.width  = input.size.width;
                size.height = input.size.height;
                texture = input.texture.texture;
            }
            this.maskTexture.baseTexture._glTextures[uid] = { dirtyId: 0, texture: texture };
            this.maskTexture.maskInfo = { frame: frame, size: size };
        }

        update() {
            super.update();
            this.children.forEach(child => child.update());
        }
    }

    //==============================================================================
    // MeshMaskFilter
    //==============================================================================

    class MeshMaskFilter extends PIXI.Filter {
        constructor(mask, invert) {
            let vertexSrc = 'attribute vec2 aVertexPosition;attribute vec2 aTextureCoord;uniform mat3 projectionMatrix;uniform mat3 otherMatrix;uniform vec2 offset;varying vec2 vMaskCoord;varying vec2 vTextureCoord;void main(void){gl_Position=vec4((projectionMatrix*vec3(aVertexPosition,1.)).xy,0.,1.);vTextureCoord=aTextureCoord;vMaskCoord=(otherMatrix*vec3(aTextureCoord,1.)).xy+offset;}';
            let fragmentSrc = 'precision mediump float;varying vec2 vMaskCoord;varying vec2 vTextureCoord;uniform sampler2D uSampler;uniform sampler2D mask;uniform vec2 size;uniform float invert;void main(void){float clip=step(3.5,step(0.,vMaskCoord.x)+step(0.,vMaskCoord.y)+step(vMaskCoord.x,size.x)+step(vMaskCoord.y,size.y));vec4 original=texture2D(uSampler,vTextureCoord);vec4 masky=texture2D(mask,vMaskCoord);gl_FragColor=original*abs(1.*invert-masky.a*clip);}';
            super(vertexSrc, fragmentSrc);
            this._mask = mask;
            this.uniforms.invert = invert ? 1 : 0;
        }

        apply(filterManager, input, output, clear, currentState) {
            let texture = this._mask.maskTexture;
            let inputRect = {};
            if (input.filterFrame) {
                inputRect.x = input.filterFrame.x;
                inputRect.y = input.filterFrame.y;
                inputRect.width  = input.width;
                inputRect.height = input.height;
            } else {
                inputRect.x = input.sourceFrame.x;
                inputRect.y = input.sourceFrame.y;
                inputRect.width  = input.size.width;
                inputRect.height = input.size.height;
            }
            let maskInfo = texture.maskInfo;
            this.uniforms.otherMatrix = new PIXI.Matrix(inputRect.width / maskInfo.size.width, 0, 0, inputRect.height / maskInfo.size.height, 0, 0);
            this.uniforms.offset = [(inputRect.x - maskInfo.frame.x) / maskInfo.size.width, (inputRect.y - maskInfo.frame.y) / maskInfo.size.height];
            this.uniforms.mask = texture;
            this.uniforms.size = [maskInfo.frame.width / maskInfo.size.width, maskInfo.frame.height / maskInfo.size.height];
            filterManager.applyFilter(this, input, output, clear);
        }
    }

    //==============================================================================
    // LipSync
    //==============================================================================

    class LipSync {
        constructor(ids, parameters) {
            this._parameters = parameters;
            this._indices = [];
            this._elapsed = 0;
            this._holding = false;
            this._value = 0;
            this.setup(ids);
        }

        get holdTime() { return 0.083; }

        setup(ids) {
            for (let id of ids) {
                let index = this._parameters.ids.indexOf(id);
                this._indices.push(index);
            }
        }

        clear() {
            this._holding = false;
            this._value = 0;
        }

        setValue(value) {
            if (!this._holding) {
                this._value = value;
                this._holding = true;
            }
        }

        apply(delta) {
            this._elapsed += delta;
            if (this._elapsed >= this.holdTime) {
                this._elapsed %= this.holdTime;
                this._holding = false;
            }
            for (let index of this._indices) {
                this._parameters.values[index] += this._value;
            }
        }
    }

    //==============================================================================
    // Expression
    //==============================================================================

    class Expression {
        constructor(expression) {
            this._name = expression.Name;
            this._fadeInTime = expression.Data.FadeInTime;
            this._fadeOutTime = expression.Data.FadeOutTime;
            this._parameters = [];
            for (let parameter of expression.Data.Parameters) {
                this._parameters.push({
                    id:    parameter.Id,
                    value: parameter.Value,
                    blend: parameter.Blend
                });
            }
        }

        get name() { return this._name; }
        get fadeInTime() { return this._fadeInTime; }
        get fadeOutTime() { return this._fadeOutTime; }

        fadeWeight(value) {
            return 0.5 - 0.5 * Math.cos(value * Math.PI);
        }

        values(time) {
            let values = {};
            for (let parameter of this._parameters) {
                let fadeInWeight  = time < 0 ? this.fadeWeight(1 + time / this.fadeInTime) : 1;
                let fadeOutWeight = time > 0 ? this.fadeWeight(1 - time / this.fadeOutTime) : 1;
                let id     = parameter.id;
                let value  = parameter.value;
                let blend  = parameter.blend;
                let weight = fadeInWeight * fadeOutWeight;
                values[id] = { value: value, blend: blend, weight: weight };
            }
            return values;
        }
    }

    //==============================================================================
    // Direction
    //==============================================================================

    class Direction {
        constructor(expressions, parameters) {
            this._expressions = [];
            this._parameters = parameters;
            this.init(expressions);
        }

        get expressions() { return this._expressions; }

        init(expressions = []) {
            for (let i = 0; i < expressions.length; i++) {
                this._expressions.push({
                    entity:  new Expression(expressions[i]),
                    index:   i,
                    enabled: false,
                    time:    null,
                    custom:  null
                });
            }
        }

        setExpression(name) {
            let lastIndex = this._expressions.reduce((a, b) => Math.max(a, b.index), 0);
            for (let expression of this._expressions) {
                let entity = expression.entity;
                if (entity.name == name) {
                    if (expression.time == null) {
                        expression.time = -entity.fadeInTime;
                    } else if (expression.time > 0) {
                        expression.time = -expression.time;
                    }
                    expression.index = lastIndex + 1;
                    expression.enabled = true;
                } else if (expression.enabled) {
                    expression.time = -expression.time;
                    expression.enabled = false;
                }
            }
            this._expressions.sort((a, b) => a.index - b.index);
        }

        setCustomExpression(expression) {
            this.clearExpression();
            let entity = new Expression(expression);
            let lastIndex = this._expressions.reduce((a, b) => Math.max(a, b.index), 0);
            this._expressions.push({
                entity:  entity,
                index:   lastIndex + 1,
                enabled: true,
                time:    -entity.fadeInTime,
                custom:  expression
            });
        }

        clearExpression() {
            for (let expression of this._expressions) {
                if (expression.enabled) {
                    expression.time = -expression.time;
                    expression.enabled = false;
                }
            }
        }

        apply(delta) {
            let parameters = this._parameters;
            let released = [];
            for (let expression of this._expressions) {
                let time = expression.time;
                if (time == null) {
                    continue;
                }
                time += delta;
                if (expression.enabled && time > 0) {
                    time = 0;
                }
                if (time > expression.entity.fadeOutTime) {
                    if (expression.custom) {
                        released.push(expression);
                    } else {
                        expression.time = null;
                    }
                    continue;
                }
                expression.time = time;
                let values = expression.entity.values(time);
                for (let id in values) {
                    let value  = values[id].value;
                    let blend  = values[id].blend;
                    let weight = values[id].weight;
                    let index  = parameters.ids.indexOf(id);
                    let _value = parameters.values[index];
                    switch (blend) {
                        case 'Add':
                            _value += value * weight;
                            break;
                        case 'Multiply':
                            _value *= 1.0 + (value - 1.0) * weight;
                            break;
                        case 'Overwrite':
                            _value = _value * (1 - weight) + value * weight;
                            break;
                    }
                    parameters.values[index] = _value;
                }
            }
            if (released.length > 0) {
                this._expressions = this._expressions.filter(expression => {
                    return !released.includes(expression);
                });
            }
        }
    }

    //==============================================================================
    // Vector2
    //==============================================================================

    class Vector2 {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }

        add(vector2) {
            return new Vector2(this.x + vector2.x, this.y + vector2.y);
        }

        substract(vector2) {
            return new Vector2(this.x - vector2.x, this.y - vector2.y);
        }

        multiplyScalar(scalar) {
            return new Vector2(this.x * scalar, this.y * scalar);
        }

        normalize() {
            let length = Math.pow(this.x * this.x + this.y * this.y, 0.5);
            this.x /= length;
            this.y /= length;
            return this;
        }
    }

    //==============================================================================
    // Physics
    //==============================================================================

    class Physics {
        constructor(physics, parameters) {
            this._settings   = {};
            this._parameters = parameters;
            this.init(physics);
        }

        get settings() { return this._settings; }

        init(physics) {
            let parameters = this._parameters;
            let dictionary = physics.Meta.PhysicsDictionary;
            let settings   = JSON.parse(JSON.stringify(physics.PhysicsSettings).replace(/"[^"]+(?=":)/g, m => '"' + m[1].toLowerCase() + m.slice(2)));
            for (let setting of settings) {
                let id = setting.id;
                delete setting.id;
                setting.name = (dictionary.find(item => item.Id == id) || { Name: '' }).Name;
                for (let input of setting.input) {
                    input.source.index = parameters.ids.indexOf(input.source.id);
                }
                for (let output of setting.output) {
                    output.destination.index = parameters.ids.indexOf(output.destination.id);
                }
                for (let vertex of setting.vertices) {
                    vertex.position    = new Vector2(vertex.position.x, vertex.position.y);
                    vertex.lastGravity = new Vector2(0, 1);
                    vertex.velocity    = new Vector2();
                }
                this._settings[id] = setting;
            }
        }

        apply(delta) {
            let values        = this._parameters.values;
            let minimumValues = this._parameters.minimumValues;
            let maximumValues = this._parameters.maximumValues;
            let defaultValues = this._parameters.defaultValues;
            for (let id in this._settings) {
                let setting       = this._settings[id];
                let vertices      = setting.vertices;
                let normalization = setting.normalization;
                let translation   = { x: 0, y: 0 };
                let angle         = 0;
                for (let input of setting.input) {
                    let index = input.source.index;
                    let type  = input.type;
                    let value = this.normalize(
                        values[index], minimumValues[index], maximumValues[index], defaultValues[index],
                        type == 'Angle' ? normalization.angle : normalization.position, input.reflect
                    );
                    value *= input.weight / 100;
                    switch (type) {
                        case 'X':
                            translation.x += value;
                            break;
                        case 'Y':
                            translation.y += value;
                            break;
                        case 'Angle':
                            angle += value;
                            break;
                    }
                }
                angle = -angle / 180 * Math.PI;
                translation = {
                    x: translation.x * Math.cos(angle) - translation.y * Math.sin(angle),
                    y: translation.x * Math.sin(angle) + translation.y * Math.cos(angle)
                };
                this.updateVertices(vertices, translation, -angle, normalization.position.maximum * 0.001, delta);
                for (let output of setting.output) {
                    let index       = output.destination.index;
                    let vertexIndex = output.vertexIndex;
                    if (vertexIndex < 1 || vertexIndex >= vertices.length) {
                        continue;
                    }
                    translation = {
                        x: vertices[vertexIndex].position.x - vertices[vertexIndex - 1].position.x,
                        y: vertices[vertexIndex].position.y - vertices[vertexIndex - 1].position.y
                    };
                    let gravity   = vertexIndex > 1 ? vertices[vertexIndex - 1].position.substract(vertices[vertexIndex - 2].position) : new Vector2(0, 1);
                    let value     = this.directionToRadian(gravity, translation);
                    let outValues = values.slice(index);
                    this.updateValues(outValues, minimumValues[index], maximumValues[index], value * output.scale, output.weight);
                    for (let i = index, j = 0; i < values.length; i++, j++) {
                        values[i] = outValues[j];
                    }
                }
            }
        }

        normalize(value, minimumValue, maximumValue, defaultValue, normalization, reflect) {
            let result = 0;
            value = Math.min(Math.max(value, minimumValue), maximumValue) - defaultValue;
            if (value != 0) {
                let p = (value > 0 ? maximumValue : minimumValue) - defaultValue;
                if (p != 0) {
                    let n = (value > 0 ? normalization.maximum : normalization.minimum) - normalization.default;
                    result = value * n / p + normalization.default;
                }
            } else {
                result = normalization.default;
            }
            return reflect ? result :-result;
        }

        updateVertices(vertices, translation, angle, shreshold, delta) {
            let gravity = new Vector2(Math.sin(angle), Math.cos(angle)).normalize();
            vertices[0].position = new Vector2(translation.x, translation.y);
            for (let i = 1; i < vertices.length; ++i) {
                let delay     = vertices[i].delay * delta * 30;
                let velocity  = vertices[i].velocity.multiplyScalar(delay);
                let force     = gravity.multiplyScalar(vertices[i].acceleration * delay * delay);
                let direction = vertices[i].position.substract(vertices[i - 1].position);
                let radian    = this.directionToRadian(vertices[i].lastGravity, gravity) / 5;
                direction = new Vector2(
                    Math.cos(radian) * direction.x - direction.y * Math.sin(radian),
                    Math.sin(radian) * direction.x + direction.y * Math.cos(radian)
                );
                let lastPosition = new Vector2(vertices[i].position.x, vertices[i].position.y);
                vertices[i].position = vertices[i - 1].position.add(direction).add(velocity).add(force);
                direction = vertices[i].position.substract(vertices[i - 1].position).normalize();
                vertices[i].position = vertices[i - 1].position.add(direction.multiplyScalar(vertices[i].radius));
                if (Math.abs(vertices[i].position.x) < shreshold) {
                    vertices[i].position.x = 0;
                }
                if (delay != 0) {
                    vertices[i].velocity = vertices[i].position.substract(lastPosition).multiplyScalar(vertices[i].mobility / delay);
                }
                vertices[i].lastGravity = new Vector2(gravity.x, gravity.y);
            }
        }

        updateValues(values, minimum, maximum, value, weight) {
            value = Math.min(Math.max(value, minimum), maximum);
            weight /= 100;
            if (weight >= 1) {
                values[0] = value;
            } else {
                values[0] = values[0] * (1 - weight) + value * weight;
            }
        }

        directionToRadian(from, to) {
            let q1 = Math.atan2(to.y, to.x);
            let q2 = Math.atan2(from.y, from.x);
            let ret = q1 - q2;
            while (ret < -Math.PI) {
                ret += Math.PI * 2;
            }
            while (ret > Math.PI) {
                ret -= Math.PI * 2;
            }
            return ret;
        }
    }

    //==============================================================================
    // Curve
    //==============================================================================

    class Curve {
        constructor(curve, beziersRestricted = false) {
            this._beziersRestricted = beziersRestricted;
            this._target   = '';
            this._id       = '';
            this._segments = [];
            this._points   = [];
            this.create(curve);
        }

        get target() { return this._target; }
        get id() { return this._id; }
        get fadeInTime() { return this._fadeInTime; }
        get fadeOutTime() { return this._fadeOutTime; }

        create(curve) {
            this._target      = curve.Target;
            this._id          = curve.Id;
            this._fadeInTime  = curve.FadeInTime;
            this._fadeOutTime = curve.FadeOutTime;
            this._segments    = [];
            this._points      = [];
            let basePoint     = 0;
            let endPoint      = 0;
            for (let i = 0; i < curve.Segments.length; i++) {
                let evaluate = null;
                if (i > 0) {
                    let type = curve.Segments[i];
                    basePoint = endPoint;
                    this._points.push({ time: curve.Segments[i + 1], value: curve.Segments[i + 2] });
                    if (type == 1) {
                        this._points.push({ time: curve.Segments[i + 3], value: curve.Segments[i + 4] });
                        this._points.push({ time: curve.Segments[i + 5], value: curve.Segments[i + 6] });
                        endPoint = basePoint + 3;
                        evaluate = this.bezier;
                        i += 6;
                    } else {
                        endPoint = basePoint + 1;
                        evaluate = type == 0 ? this.linear
                            : type == 2 ? this.stepped
                                : type == 3 ? this.inverseStepped
                                    : null;
                        i += 2;
                    }
                } else {
                    this._points.push({ time: curve.Segments[0], value: curve.Segments[1] });
                    i++;
                }
                this._segments.push({ basePoint: basePoint, endPoint: endPoint, evaluate: evaluate });
            }
        }

        value(time) {
            let segments = this._segments;
            let points   = this._points;
            for (let i = 0; i < segments.length; i++) {
                if (points[segments[i].endPoint].time > time) {
                    let basePoint = segments[i].basePoint;
                    let endPoint  = segments[i].endPoint;
                    let evaluate  = segments[i].evaluate;
                    if (evaluate) {
                        return evaluate.call(this, points.slice(basePoint, endPoint + 1), time);
                    }
                    break;
                }
            }
            return points.slice(-1)[0].value;
        }

        lerp(a, b, t) {
            let time  = a.time + (b.time - a.time) * t;
            let value = a.value + (b.value - a.value) * t;
            return { time: time, value: value };
        }

        linear(points, time) {
            let t = (time - points[0].time) / (points[1].time - points[0].time);
            return points[0].value + (points[1].value - points[0].value) * Math.max(t, 0);
        }

        bezier(points, time) {
            if (!this._beziersRestricted) {
                return this.cardano(points, time);
            }
            let t  = Math.max((time - points[0].time) / (points[3].time - points[0].time), 0);
            let p0 = this.lerp(points[0], points[1], t);
            let p1 = this.lerp(points[1], points[2], t);
            let p2 = this.lerp(points[2], points[3], t);
            let p3 = this.lerp(p0, p1, t);
            let p4 = this.lerp(p1, p2, t);
            return this.lerp(p3, p4, t).value;
        }

        cardano(points, time) {
            let t0 = points[0].time;
            let t1 = points[1].time;
            let t2 = points[2].time;
            let t3 = points[3].time;
            let t4 = t3 + 3.0 * (t1 - t2) - t0;
            let t5 = 3.0 * (t0 + t2) - 6.0 * t1;
            let t6 = 3.0 * (t1 - t0);
            let t7 = t0 - time;
            let t  = this.cardanoAlgorithm(t4, t5, t6, t7);
            let p0 = this.lerp(points[0], points[1], t);
            let p1 = this.lerp(points[1], points[2], t);
            let p2 = this.lerp(points[2], points[3], t);
            let p3 = this.lerp(p0, p1, t);
            let p4 = this.lerp(p1, p2, t);
            return this.lerp(p3, p4, t).value;
        }

        stepped(points) {
            return points[0].value;
        }

        inverseStepped(points) {
            return points[1].value;
        }

        range(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        cbrt(x) {
            if (x == 0) {
                return x;
            }
            let cx = x;
            let isNegativeNumber = cx < 0;
            if (isNegativeNumber) {
                cx = -cx;
            }
            let ret;
            if (cx == Infinity) {
                ret = Infinity;
            } else {
                ret = Math.exp(Math.log(cx) / 3);
                ret = (cx / (ret * ret) + 2 * ret) / 3;
            }
            return isNegativeNumber ? -ret : ret;
        }

        quadratic(a, b, c) {
            if (Math.abs(a) < 0.00001) {
                if (Math.abs(b) < 0.00001) {
                    return -c;
                }
                return -c / b;
            }
            return -(b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        }

        cardanoAlgorithm(a, b, c, d) {
            if (Math.sqrt(a) < 0.00001) {
                return this.range(this.quadratic(b, c, d), 0, 1);
            }
            let ba = b / a;
            let ca = c / a;
            let da = d / a;
            let p  = (3 * ca - ba * ba) / 3;
            let p3 = p / 3;
            let q  = (2 * ba * ba * ba - 9 * ba * ca + 27 * da) / 27;
            let q2 = q / 2;
            let discriminant = q2 * q2 + p3 * p3 * p3;
            if (discriminant < 0) {
                let mp3    = -p / 3;
                let mp33   = mp3 * mp3 * mp3;
                let r      = Math.sqrt(mp33);
                let t      = -q / (2 * r);
                let cosphi = this.range(t, -1, 1);
                let phi    = Math.acos(cosphi);
                let crtr   = this.cbrt(r);
                let t1     = 2 * crtr;
                let root1_1 = t1 * Math.cos(phi / 3) - ba / 3;
                if (Math.abs(root1_1 - 0.5) < 0.51) {
                    return this.range(root1_1, 0, 1);
                }
                let root2 = t1 * Math.cos((phi + 2 * Math.PI) / 3) - ba / 3;
                if (Math.abs(root2 - 0.5) < 0.51) {
                    return this.range(root2, 0, 1);
                }
                let root3 = t1 * Math.cos((phi + 4 * Math.PI) / 3) - ba / 3;
                return this.range(root3, 0, 1);
            } else if (discriminant == 0) {
                let u1_1;
                if (q2 < 0) {
                    u1_1 = this.cbrt(-q2);
                } else {
                    u1_1 = -this.cbrt(q2);
                }
                let root1_2 = 2 * u1_1 - ba / 3;
                if (Math.abs(root1_2 - 0.5) < 0.51) {
                    return this.range(root1_2, 0, 1);
                }
                let root2 = -u1_1 - ba / 3;
                return this.range(root2, 0, 1);
            }
            let sd = Math.sqrt(discriminant);
            let u1 = this.cbrt(sd - q2);
            let v1 = this.cbrt(sd + q2);
            let root1 = u1 - v1 - ba / 3;
            return this.range(root1, 0, 1);
        }
    }

    //==============================================================================
    // Motion
    //==============================================================================

    class Motion {
        constructor(motion) {
            if (motion) {
                let meta = motion.Data.Meta;
                this._duration          = meta.Duration;
                this._loop              = meta.Loop;
                this._beziersRestricted = meta.AreBeziersRestricted;
                this._group       = motion.Group;
                this._name        = motion.Name;
                this._baseName    = motion.BaseName;
                this._fadeInTime  = motion.FadeInTime;
                this._fadeOutTime = motion.FadeOutTime;
                this._sound       = motion.Sound;
                this._curves = [];
                this.createCurve(motion.Data.Curves, this._beziersRestricted);
            } else {
                this._duration          = 0;
                this._loop              = false;
                this._beziersRestricted = false;
                this._group       = '';
                this._name        = '';
                this._baseName    = '';
                this._fadeInTime  = 0;
                this._fadeOutTime = 0;
                this._sound       = '';
                this._curves = [];
            }
        }

        get duration() { return this._duration; }
        get group() { return this._group; };
        get name() { return this._name; };
        get baseName() { return this._baseName; }
        get fadeInTime() { return this._fadeInTime; }
        get fadeOutTime() { return this._fadeOutTime; }
        get sound() { return this._sound; }

        createCurve(curves, beziersRestricted) {
            this._curves = curves.map(curve => new Curve(curve, beziersRestricted));
        }

        fadeWeight(value) {
            return 0.5 - 0.5 * Math.cos(value * Math.PI);
        }

        calcWeight(time, remain, fadeInTime, fadeOutTime) {
            let fadeInWeight  = time < fadeInTime ? this.fadeWeight(time / fadeInTime) : 1;
            let fadeOutWeight = remain < fadeOutTime ? this.fadeWeight(remain / fadeOutTime) : 1;
            return fadeInWeight * fadeOutWeight;
        }

        values(time, isDoFade) {
            let remain = Math.max(this._duration - time, 0);
            let fadeInTime  = isDoFade.in ? this._fadeInTime : 0;
            let fadeOutTime = isDoFade.out ? this._fadeOutTime : 0;
            let weight = this.calcWeight(time, remain, fadeInTime, fadeOutTime);
            let values = {};
            for (let curve of this._curves) {
                let target = curve.target;
                let id     = curve.id;
                let value  = curve.value(time);
                values[target] = values[target] || {};
                values[target][id] = { value: value, weight: weight };
                if (curve.fadeInTime != null) {
                    let fadeInTime  = isDoFade.in ? curve.fadeInTime : 0;
                    let fadeOutTime = isDoFade.out ? curve.fadeOutTime : 0;
                    values[target][id].weight = this.calcWeight(time, remain, fadeInTime, fadeOutTime);
                }
            }
            return values;
        }
    }

    //==============================================================================
    // Entry
    //==============================================================================

    class Entry {
        constructor(motion, elapsed = 0) {
            this._motion = motion;
            this._elapsed = elapsed;
            this.loop = false;
            this.timeScale = 1;
            this.weight    = 1;
            this.mixTime   = 0;
            this.endTime   = 0;
            this.isDoFade  = { in: true, out: true };
        }

        get name() { return this._motion.name; }
        get duration() { return this.endTime || this._motion.duration; }
        get elapsed() { return this._elapsed; }
        get remain() { return this.duration - this._elapsed; }
        get sound() { return this._motion.sound; }

        values(delta) {
            this._elapsed += (delta * this.timeScale);
            if (this.loop) {
                if (this._elapsed >= this.duration) {
                    this._elapsed %= this.duration;
                    this.isDoFade.in = false;
                }
            }
            let values = this._motion.values(this._elapsed, this.isDoFade);
            for (let target in values) {
                for (let id in values[target]) {
                    values[target][id].weight *= this.weight;
                }
            }
            return values;
        }
    }

    //==============================================================================
    // Track
    //==============================================================================

    class Track {
        constructor(active = false, mixing = false) {
            this._entries = [];
            this._active = active;
            this._mixing = mixing;
            this._history = [];
            this.weight = 1;
        }

        get entries() { return this._entries; }
        get active() { return this._active; }
        get mixing() { return this._mixing; }
        get history() { return this._history.shift(); }

        add(entry) {
            let last = this.entry(-1);
            if (last) {
                last.loop = false;
                last.isDoFade.out = false;
                if (last.endTime > 0) {
                    last.endTime += entry.mixTime;
                }
            }
            entry.isDoFade.in  = !last;
            entry.isDoFade.out = !entry.loop;
            this._entries.push(entry);
        }

        entry(index) {
            return this._entries.slice(index)[0];
        }

        mix(values, nextValues, rate) {
            let r0 = 1 - rate;
            let r1 = rate;
            for (let target in nextValues) {
                for (let id in nextValues[target]) {
                    let value, weight;
                    if (values[target] && values[target][id]) {
                        let v0 = values[target][id];
                        let v1 = nextValues[target][id];
                        value  = v0.value * r0 + v1.value * r1;
                        weight = v0.weight * r0 + v1.weight * r1;
                    } else {
                        let v = nextValues[target][id];
                        value  = v.value;
                        weight = v.weight * r1;
                    }
                    values[target] = values[target] || {};
                    values[target][id] = { value: value, weight: weight };
                }
            }
            for (let target in values) {
                for (let id in values[target]) {
                    if (!nextValues[target] || !nextValues[target][id]) {
                        values[target][id].weight *= r0;
                    }
                }
            }
        }

        suspend() {
            if (!this.active) {
                return;
            }
            let entry = this._entries[0];
            entry.endTime = entry.elapsed;
            entry.loop = false;
            this._entries.splice(1);
        }

        values(delta) {
            let entry = this._entries[0];
            let nextEntry = this._entries[1];
            if (!entry) {
                return null;
            }
            if (!this._active) {
                delta = 0;
                this._history.push({ start: entry });
            }
            let _remain = entry.remain;
            let mixTime = nextEntry ? nextEntry.mixTime : 0;
            let values = entry.values(delta);
            let remain = entry.remain;
            if (remain > 0) {
                if (mixTime >= remain) {
                    delta = Math.min(mixTime - remain, _remain - remain);
                    let nextValues = nextEntry.values(delta);
                    let rate = (mixTime - remain) / mixTime;
                    this.mix(values, nextValues, rate);
                    if (!this._mixing) {
                        this._history.push({ start: nextEntry });
                        this._mixing = true;
                    }
                }
            } else {
                this._entries.shift();
                this._history.push({ end: entry });
                if (nextEntry) {
                    delta = -remain / entry.timeScale;
                    values = nextEntry.values(delta);
                    if (!this._mixing) {
                        this._history.push({ start: nextEntry });
                    }
                }
                this._mixing = false;
            }
            this._active = remain > 0 || !!nextEntry;
            return values;
        }
    }

    //==============================================================================
    // EyeBlink
    //==============================================================================

    class EyeBlink {
        constructor(ids = [], options = {}) {
            this._motionTime = [0, 0.03, 0.01, 0.12];
            this._motionIndex = 0;
            this._baseTime = 0;
            this._baseInterval = 4;
            this._elapsed = 0;
            this._enabled = {};
            this.init(ids, options);
        }

        get interval() { return Math.random() * (2 * this._baseInterval - 1); }

        init(ids, options) {
            this._enabled = {};
            for (let id of ids) {
                this._enabled[id] = true;
            }
            if ('interval' in options) {
                this._baseInterval = options.interval;
            }
            this._motionTime[0] = this.interval;
            let keys = ['closing', 'closed', 'opening'];
            for (let i = 0; i < 3; i++) {
                if (keys[i] in options) {
                    this._motionTime[i + 1] = options[keys[i]];
                }
            }
            this._motionIndex = 0;
            this._baseTime = 0;
            this._elapsed = 0;
        }

        enable(id) {
            for (let key in this._enabled) {
                if (!id || id == key) {
                    this._enabled[key] = true;
                }
            }
        }

        disable(id) {
            for (let key in this._enabled) {
                if (!id || id == key) {
                    this._enabled[key] = false;
                }
            }
        }

        value(timeRate) {
            let value = 1;
            if (this._motionIndex == 1) {
                value = 1 - timeRate;
            } else if (this._motionIndex == 2) {
                value = 0;
            } else if (this._motionIndex == 3) {
                value = timeRate;
            }
            return 0.5 - 0.5 * Math.cos(value * Math.PI);
        }

        values(delta) {
            if (!Object.values(this._enabled).some(value => value)) {
                this._motionIndex = 0;
                this._baseTime = 0;
                this._elapsed = 0;
                return null;
            }
            this._elapsed += delta;
            let motionTime = this._motionTime[this._motionIndex];
            let timeRate = motionTime ? Math.min((this._elapsed - this._baseTime) / motionTime, 1) : 1;
            let value = this.value(timeRate);
            if (timeRate == 1) {
                this._baseTime = this._elapsed;
                this._motionIndex = (this._motionIndex + 1) & 0x3;
                if (this._motionIndex == 0) {
                    this._motionTime[0] = this.interval;
                }
            }
            let values = {};
            for (let id in this._enabled) {
                if (this._enabled[id]) {
                    values[id] = value;
                }
            }
            return values;
        }
    }

    //==============================================================================
    // Animation
    //==============================================================================

    class Animation {
        constructor(motions, parameters, parts, groups) {
            this._motions = [];
            this._parameters = parameters;
            this._parts = parts;
            this._groups = groups;
            this._tracks = [];
            this._eyeBlink = null;
            this._timeScale = 1;
            this._mixTime = {};
            this._listeners = {};
            this._lastValues = [];
            this.createMotion(motions);
            this.init();
        }

        get motions() { return this._motions; }
        get tracks() { return this._tracks; }
        get timeScale() { return this._timeScale; }
        get mixTime() { return this._mixTime; }

        createMotion(motions) {
            this._motions = motions.map(motion => new Motion(motion));
        }

        init() {
            for (let i = 0; i < this._parameters.count; i++) {
                this._lastValues[i] = this._parameters.defaultValues[i];
            }
        }

        track(index) {
            if (!this._tracks[index]) {
                this._tracks[index] = new Track();
            }
            return this._tracks[index];
        }

        setAnimation(index, name, loop) {
            let track = this._tracks[index];
            if (track) {
                track.suspend();
            }
            return this.addAnimation(index, name, loop);
        }

        addAnimation(index, name, loop) {
            let motion = this._motions.find(motion => [motion.name, motion.baseName].includes(name));
            if (!motion) {
                throw Error(`'${name}' is unknown motion.`);
            }
            let entry  = new Entry(motion);
            let track  = this.track(index);
            let last   = track.entry(-1);
            if (last) {
                let key = `${last.name},${name}`;
                entry.mixTime = this._mixTime[key] || this._mixTime.default || 0;
            }
            entry.loop = loop;
            track.add(entry);
            return entry;
        }

        clearAnimation(index, mixTime = 0) {
            let track = this._tracks[index];
            if (!track) {
                return;
            }
            track.suspend();
            let entry = new Entry(new Motion());
            entry.mixTime = mixTime;
            track.add(entry);
        }

        resetParameters(...ids) {
            let parameters = this._parameters;
            let defaultValues = parameters.defaultValues;
            if (ids.length > 0) {
                for (let id of ids) {
                    let index = parameters.ids.indexOf(id);
                    this._lastValues[index] = parameters.values[index] = defaultValues[index];
                }
            } else {
                for (let i = 0; i < parameters.count; i++) {
                    this._lastValues[i] = parameters.values[i] = defaultValues[i];
                }
            }
        }

        setTimeScale(scale) {
            this._timeScale = scale;
        }

        setWeight(index, value) {
            this.track(index).weight = value;
        }

        setMix(from, to, time) {
            if (time > 0) {
                this._mixTime[`${from},${to}`] = time;
            } else {
                delete this._mixTime[`${from},${to}`];
            }
        }

        setDefaultMix(time) {
            if (time > 0) {
                this._mixTime.default = time;
            } else {
                delete this._mixTime.default;
            }
        }

        setAutoEyeBlink(enabled, options) {
            this._eyeBlink = enabled ? new EyeBlink(this._groups.EyeBlink, options) : null;
        }

        addListener(event, callback) {
            this._listeners[event] = this._listeners[event] || [];
            this._listeners[event].push(callback);
        }

        removeListener(event, callback) {
            if (this._listeners[event]) {
                let index = this._listeners[event].indexOf(callback);
                if (index >= 0) {
                    this._listeners[event].splice(index, 1);
                }
            }
        }

        callListener(event, index, track, entry) {
            if (this._listeners[event]) {
                let trackInfo = { index: index, track: track, entry: entry };
                this._listeners[event].forEach(callback => callback(trackInfo));
            }
        }

        apply(delta) {
            delta *= this._timeScale;
            let parameters = this._parameters;
            let parts      = this._parts;
            for (let i = 0; i < parameters.count; i++) {
                parameters.values[i] = this._lastValues[i];
            }
            if (this._eyeBlink) {
                this._eyeBlink.enable();
            }
            for (let track of this._tracks) {
                if (!track) continue;
                let eyeBlink = { value: null, weight: 0, flag: {} };
                let values = track.values(delta);
                if (!values) continue;
                for (let target in values) {
                    for (let id in values[target]) {
                        let v = values[target][id];
                        let value  = v.value;
                        let weight = v.weight * track.weight;
                        if (target == 'Model') {
                            if (id == 'EyeBlink') {
                                eyeBlink.value = value;
                                eyeBlink.weight = weight;
                            }
                        } else if (target == 'Parameter') {
                            let index  = parameters.ids.indexOf(id);
                            let _value = parameters.values[index];
                            if (this._groups.EyeBlink.includes(id)) {
                                eyeBlink.flag[id] = true;
                                if (eyeBlink.value != null) {
                                    value *= eyeBlink.value;
                                }
                                if (this._eyeBlink) {
                                    this._eyeBlink.disable(id);
                                }
                            }
                            parameters.values[index] = _value * (1 - weight) + value * weight;
                        } else if (target == 'PartOpacity') {
                            let index  = parts.ids.indexOf(id);
                            let _value = parts.opacities[index];
                            parts.opacities[index] = _value * (1 - weight) + value * weight;
                        }
                    }
                }
                if (eyeBlink.value != null) {
                    let value = eyeBlink.value;
                    let weight = eyeBlink.weight;
                    for (let id of this._groups.EyeBlink) {
                        if (!eyeBlink.flag[id]) {
                            let index  = parameters.ids.indexOf(id);
                            let _value = parameters.values[index];
                            parameters.values[index] = _value * (1 - weight) + value * weight;
                        }
                    }
                }
                let index = this._tracks.indexOf(track);
                for (let history; history = track.history;) {
                    let event = history.start ? 'start' : 'end';
                    let entry = history.start || history.end;
                    this.callListener(event, index, track, entry);
                }
            }
            if (this._eyeBlink) {
                let values = this._eyeBlink.values(delta);
                if (values) {
                    for (let id in values) {
                        let index = parameters.ids.indexOf(id);
                        parameters.values[index] = values[id];
                    }
                }
            }
            for (let i = 0; i < parameters.count; i++) {
                this._lastValues[i] = parameters.values[i];
            }
        }
    }

    //==============================================================================
    // Live2D
    //==============================================================================

    class Live2D extends PIXI.Container {
        constructor(live2dData) {
            super();
            this._data       = live2dData;
            this._model      = new Live2DCubismCore.Model(this._data.Moc);
            this._meshes     = [];
            this._masks      = {};
            this._lipSync    = null;
            this._physics    = null;
            this._direction  = null;
            this._animation  = null;
            this._updateTime = 0;
            this.createMesh();
            this.createMask();
            this.createAnimation();
            this.createDirection();
            this.createPhysics();
            this.createLipSync();
        }

        get model() { return this._model; }
        get animation() { return this._animation; }
        get direction() { return this._direction; }
        get lipSync() { return this._lipSync; }

        createMesh() {
            let drawables = this._model.drawables;
            for (let i = 0; i < drawables.count; i++) {
                let textureIndex = drawables.textureIndices[i];
                let texture  = this._data.Textures[textureIndex];
                let vertices = this.localVertices(drawables.vertexPositions[i]);
                let uvs      = new Float32Array(drawables.vertexUvs[i]);
                let indices  = new Uint16Array(drawables.indices[i]);
                for (let j = 0; j < drawables.vertexCounts[i]; j++) {
                    uvs[j * 2 + 1] = 1 - uvs[j * 2 + 1];
                }
                let mesh = new Mesh(texture, vertices, uvs, indices, PIXI.DRAW_MODES.TRIANGLES);
                mesh.alpha         = drawables.opacities[i];
                mesh.visible       = drawables.dynamicFlags[i] & 0x1;
                mesh.blendMode     = drawables.constantFlags[i] & 0x3;
                mesh.state.culling = !(drawables.constantFlags[i] & 0x4);
                mesh.orderIndex    = drawables.renderOrders[i];
                if (mesh.state.culling) {
                    mesh.shader.batchable = false;
                }
                mesh.filters = [new MultiplyScreenFilter(
                    drawables.multiplyColors.slice(i * 4, i * 4 + 3),
                    drawables.screenColors.slice(i * 4, i * 4 + 3)
                )];
                this._meshes.push(mesh);
                this.addChild(mesh);
            }
            this.sortMesh();
        }

        createMask() {
            let drawables = this._model.drawables;
            for (let i = 0; i < drawables.count; i++) {
                let mesh = this._meshes[i];
                let invert = !!(drawables.constantFlags[i] & 0x8);
                let masks = [...drawables.masks[i]].sort();
                if (masks.length > 0) {
                    let mask = this._masks[masks];
                    if (!mask) {
                        mask = new MaskMesh(this._meshes[masks[0]]);
                        this.addChildAt(mask, 0);
                        this._masks[masks] = mask;
                        for (let j = 1; j < masks.length; j++) {
                            mask.addChild(new CopyMesh(this._meshes[masks[j]]));
                        }
                    }
                    let filters = mesh.filters || [];
                    filters.push(new MeshMaskFilter(mask, invert));
                    if (mesh.blendMode > 0) {
                        let filter = new PIXI.Filter();
                        filter.blendMode = mesh.blendMode;
                        mesh.blendMode = 0;
                        filters.push(filter);
                    }
                    mesh.filters = filters;
                }
            }
        }

        createLipSync() {
            if (this._data.Groups) {
                for (let group of this._data.Groups) {
                    if (group.Name == 'LipSync') {
                        this._lipSync = new LipSync(group.Ids, this._model.parameters);
                    }
                }
            }
        }

        createPhysics() {
            if (this._data.Physics) {
                this._physics = new Physics(this._data.Physics, this._model.parameters);
            }
        }

        createDirection() {
            if (this._data.Expressions) {
                this._direction = new Direction(this._data.Expressions, this._model.parameters);
            }
        }

        createAnimation() {
            let motions    = [];
            let parameters = this._model.parameters;
            let parts      = this._model.parts;
            let groups     = {};
            if (this._data.Motions) {
                for (let group in this._data.Motions) {
                    motions.push(...this._data.Motions[group]);
                }
            }
            if (this._data.Groups) {
                for (let group of this._data.Groups) {
                    groups[group.Name] = [...group.Ids];
                }
            }
            this._animation = new Animation(motions, parameters, parts, groups);
        }

        sortMesh() {
            this.children.sort((a, b) => a.orderIndex - b.orderIndex);
        }

        localVertices(vertices, container) {
            let canvasinfo = this._model.canvasinfo;
            let cox = canvasinfo.CanvasOriginX;
            let coy = canvasinfo.CanvasOriginY;
            let ppu = canvasinfo.PixelsPerUnit;
            let result = container || new Float32Array(vertices.length);
            for (let i = 0; i < vertices.length; i++) {
                result[i] = i % 2 ?  coy - vertices[i] * ppu : vertices[i] * ppu + cox;
            }
            return result;
        }

        update() {
            let time = performance.now() / 1000;
            if (this._updateTime > 0) {
                let delta = time - this._updateTime;
                this.applyAnimation(delta);
                this.applyDirection(delta);
                this.applyPhysics(delta);
                this.applyLipSync(delta);
            }
            this._model.drawables.resetDynamicFlags();
            this._model.update();
            this.updateMesh();
            this.updateMask();
            this._updateTime = time;
        }

        updateMesh() {
            let drawables = this._model.drawables;
            let vertices     = drawables.vertexPositions;
            let opacities    = drawables.opacities;
            let renderOrders = drawables.renderOrders;
            let dynamicFlags = drawables.dynamicFlags;
            let needsSort = false;
            this._meshes.forEach((mesh, index) => {
                mesh.visible    = !!(dynamicFlags[index] & 0x1);
                mesh.alpha      = opacities[index];
                mesh.orderIndex = renderOrders[index];
                if (dynamicFlags[index] & 0x10) {
                    needsSort = true;
                }
                if (dynamicFlags[index] & 0x20) {
                    this.localVertices(vertices[index], mesh.vertices);
                }
                if (mesh.visible) {
                    let uniforms = mesh.filters.find(filter => filter instanceof MultiplyScreenFilter).uniforms;
                    uniforms.multiplyColor = drawables.multiplyColors.slice(index * 4, index * 4 + 3);
                    uniforms.screenColor   = drawables.screenColors.slice(index * 4, index * 4 + 3);
                }
            });
            if (needsSort) {
                this.sortMesh();
            }
        }

        updateMask() {
            for (let key in this._masks) {
                this._masks[key].update();
            }
        }

        applyLipSync(delta) {
            if (this._lipSync) {
                this._lipSync.apply(delta);
            }
        }

        applyPhysics(delta) {
            if (this._physics) {
                this._physics.apply(delta);
            }
        }

        applyDirection(delta) {
            if (this._direction) {
                this._direction.apply(delta);
            }
        }

        applyAnimation(delta) {
            if (this._animation) {
                this._animation.apply(delta);
            }
        }

        snapshot() {
            if (!this._animation) {
                return null;
            }
            let parameters = {
                ids:    [...this._model.parameters.ids],
                values: [...this._model.parameters.values]
            };
            let parts = {
                ids:       [...this._model.parts.ids],
                opacities: [...this._model.parts.opacities]
            };
            let animation = {
                tracks: [],
                timeScale: this._animation.timeScale,
                mixTime: {},
                lastValues: []
            };
            for (let key in this._animation.mixTime) {
                animation.mixTime[key] = this._animation.mixTime[key];
            }
            this._animation.tracks.forEach((track, index) => {
                let entries = [];
                animation.tracks[index] = {
                    entries: entries,
                    active:  track.active,
                    mixing:  track.mixing,
                    weight:  track.weight
                };
                track.entries.forEach(entry => {
                    entries.push({
                        name:      entry.name,
                        elapsed:   entry.elapsed,
                        loop:      entry.loop,
                        timeScale: entry.timeScale,
                        weight:    entry.weight,
                        mixTime:   entry.mixTime,
                        endTime:   entry.endTime,
                        isDoFade:  entry.isDoFade
                    });
                });
            });
            for (let i = 0; i < this._model.parameters.count; i++) {
                animation.lastValues[i] = this._animation._lastValues[i];
            }
            let physics = {};
            if (this._physics) {
                for (let key in this._physics.settings) {
                    physics[key] = [];
                    for (let vertex of this._physics.settings[key].vertices) {
                        physics[key].push({
                            position:    {...vertex.position},
                            lastGravity: {...vertex.lastGravity},
                            velocity:    {...vertex.velocity}
                        });
                    }
                }
            }
            let direction = {};
            if (this._direction) {
                direction.expressions = [];
                for (let expression of this._direction.expressions) {
                    direction.expressions.push({
                        name:    expression.entity.name,
                        index:   expression.index,
                        enabled: expression.enabled,
                        time:    expression.time,
                        custom:  expression.custom
                    });
                }
            }
            return {
                parameters: parameters,
                parts: parts,
                animation: animation,
                physics: physics,
                direction: direction
            };
        }

        restore(snapshot) {
            if (!snapshot) {
                return;
            }
            let parameters = snapshot.parameters;
            let parts      = snapshot.parts;
            let animation  = snapshot.animation;
            let physics    = snapshot.physics;
            let direction  = snapshot.direction;
            parameters.ids.forEach((id, index) => {
                let _index = this._model.parameters.ids.indexOf(id);
                if (_index >= 0) {
                    this._model.parameters.values[_index] = parameters.values[index];
                }
            });
            parts.ids.forEach((id, index) => {
                let _index = this._model.parts.ids.indexOf(id);
                if (_index >= 0) {
                    this._model.parts.opacities[_index] = parts.opacities[index];
                }
            });
            this._animation.setTimeScale(animation.timeScale);
            for (let key in animation.mixTime) {
                if (key == 'default') {
                    this._animation.setDefaultMix(animation.mixTime[key]);
                } else {
                    let [from, to] = key.split(/,(?=[^,]+$)/);
                    this._animation.setMix(from, to, animation.mixTime[key]);
                }
            }
            let motions = this._animation.motions;
            this._animation.tracks.splice(0);
            animation.tracks.forEach((trackData, index) => {
                if (!trackData) return;
                let track = new Track(trackData.active, trackData.mixing);
                track.weight = trackData.weight;
                for (let entryData of trackData.entries) {
                    let motion = entryData.name ? motions.find(motion => motion.name == entryData.name) : new Motion();
                    let entry = new Entry(motion, entryData.elapsed);
                    entry.loop      = entryData.loop;
                    entry.timeScale = entryData.timeScale;
                    entry.weight    = entryData.weight;
                    entry.mixTime   = entryData.mixTime;
                    entry.endTime   = entryData.endTime;
                    entry.isDoFade  = entryData.isDoFade;
                    track.entries.push(entry);
                }
                this._animation.tracks[index] = track;
            });
            for (let i = 0; i < this._model.parameters.count; i++) {
                this._animation._lastValues[i] = animation.lastValues[i];
            }
            if (this._physics && physics) {
                for (let key in physics) {
                    if (key in this._physics.settings) {
                        let vertices = this._physics.settings[key].vertices;
                        physics[key].forEach((vertex, index) => {
                            if (vertices[index]) {
                                Object.assign(vertices[index].position, vertex.position);
                                Object.assign(vertices[index].lastGravity, vertex.lastGravity);
                                Object.assign(vertices[index].velocity, vertex.velocity);
                            }
                        });
                    }
                }
            }
            if (this._direction && direction) {
                for (let expressionData of direction.expressions) {
                    if (!expressionData.custom) {
                        let expression = this._direction.expressions.find(expression => expression.entity.name == expressionData.name);
                        if (expression) {
                            expression.index   = expressionData.index;
                            expression.enabled = expressionData.enabled;
                            expression.time    = expressionData.time;
                        }
                    } else {
                        this._direction.expressions.push({
                            entity:  new Expression(expressionData.custom),
                            index:   expressionData.index,
                            enabled: expressionData.enabled,
                            time:    expressionData.time,
                            custom:  expressionData.custom
                        });
                    }
                }
                this._direction.expressions.sort((a, b) => a.index - b.index);
            }
        }
    }

    Live2D.Mesh = Mesh;
    Live2D.CopyMesh = CopyMesh;
    Live2D.MaskMesh = MaskMesh;
    Live2D.MeshMaskFilter = MeshMaskFilter;
    Live2D.Expression = Expression;
    Live2D.Direction = Direction;
    Live2D.Vector2 = Vector2;
    Live2D.Physics = Physics;
    Live2D.Curve = Curve;
    Live2D.Motion = Motion;
    Live2D.Entry = Entry;
    Live2D.Track = Track;
    Live2D.EyeBlink = EyeBlink;
    Live2D.Animation = Animation;

    PIXI.Live2D = Live2D;

    //==============================================================================
    // Model3Parser
    //==============================================================================

    let Model3Parser = (function() {
        let LoaderResource = PIXI.LoaderResource || PIXI.loaders.Resource;
        LoaderResource.setExtensionXhrType('moc3', LoaderResource.XHR_RESPONSE_TYPE.BUFFER);

        function isJson(resource) {
            return resource.type == LoaderResource.TYPE.JSON;
        }

        function Model3Parser() {
            return Model3Parser.use;
        }

        Model3Parser.use = function(resource, next) {
            if (!isJson(resource) || !resource.data.FileReferences) {
                return next();
            }
            let data = resource.data;
            let fileReferences = resource.data.FileReferences;
            let baseUrl = resource.url.replace(/[^/]+$/, '');
            let loadOption = { parentResource: resource };
            let live2dData = {
                Version:     data.Version,
                Moc:         null,
                Textures:    [],
                Physics:     null,
                Pose:        null,
                UserData:    null,
                DisplayInfo: null,
                Expressions: null,
                Motions:     null,
                Groups:      data.Groups,
                HitAreas:    data.HitAreas,
                loading:     0
            };
            for (let index in fileReferences) {
                if (!fileReferences[index]) {
                    continue;
                }
                if (index == 'Moc') {
                    let url = baseUrl + fileReferences.Moc;
                    this.add(`${resource.name}/Moc`, url, loadOption, function(resource) {
                        live2dData.Moc = new Live2DCubismCore.Moc(resource.data);
                        live2dData.loading--;
                        next();
                    });
                    live2dData.loading++;
                } else if (index == 'Textures') {
                    for (let i = 0; i < fileReferences.Textures.length; i++) {
                        let url = baseUrl + fileReferences.Textures[i];
                        this.add(`${resource.name}/Texture_${i}`, url, loadOption, function(resource) {
                            live2dData.Textures[i] = resource.texture;
                            live2dData.loading--;
                            next();
                        });
                        live2dData.loading++;
                    }
                } else if (['Physics', 'Pose', 'UserData', 'DisplayInfo'].includes(index)) {
                    let url = baseUrl + fileReferences[index];
                    this.add(`${resource.name}/${index}`, url, loadOption, function(resource) {
                        live2dData[index] = resource.data;
                        live2dData.loading--;
                        next();
                    });
                    live2dData.loading++;
                } else if (index == 'Expressions') {
                    live2dData.Expressions = [];
                    let expressions = fileReferences.Expressions;
                    for (let i = 0; i < expressions.length; i++) {
                        let expression = expressions[i];
                        let name = expression.Name;
                        live2dData.Expressions[i] = { Name: name };
                        let url = baseUrl + expression.File;
                        this.add(`${resource.name}/Expression/${name}`, url, loadOption, function(resource) {
                            live2dData.Expressions[i].Data = resource.data;
                            if ('FadeInTime' in resource.data == false) {
                                live2dData.Expressions[i].Data.FadeInTime = 1;
                            }
                            if ('FadeOutTime' in resource.data == false) {
                                live2dData.Expressions[i].Data.FadeOutTime = 1;
                            }
                            live2dData.loading--;
                            next();
                        });
                        live2dData.loading++;
                    }
                } else if (index == 'Motions') {
                    live2dData.Motions = {};
                    for (let group in fileReferences.Motions) {
                        live2dData.Motions[group] = [];
                        let motion = fileReferences.Motions[group];
                        for (let i = 0; i < motion.length; i++) {
                            live2dData.Motions[group][i] = {
                                FadeInTime:  motion[i].FadeInTime,
                                FadeOutTime: motion[i].FadeOutTime,
                                Sound: motion[i].Sound
                            };
                            let url = baseUrl + motion[i].File;
                            this.add(`${resource.name}/Motion/${group}_${i}`, url, loadOption, function(resource) {
                                live2dData.Motions[group][i].Group    = group;
                                live2dData.Motions[group][i].Name     = motion[i].Name || group + String(i + 1).padStart(2, '0');
                                live2dData.Motions[group][i].BaseName = resource.url.replace(/^.*\/(.+)\.motion3\.json$/, '$1');
                                live2dData.Motions[group][i].Data     = resource.data;
                                if ('FadeInTime' in motion[i] == false) {
                                    live2dData.Motions[group][i].FadeInTime = resource.data.Meta.FadeInTime;
                                }
                                if ('FadeOutTime' in motion[i] == false) {
                                    live2dData.Motions[group][i].FadeOutTime = resource.data.Meta.FadeOutTime;
                                }
                                live2dData.loading--;
                                next();
                            });
                            live2dData.loading++;
                        }
                    }
                }
            }
            resource.live2dData = live2dData;
            next();
        };

        return Model3Parser;
    })();

    if (PIXI.Loader) {
        PIXI.Loader.registerPlugin(Model3Parser);
    } else {
        PIXI.loaders.Loader.addPixiMiddleware(Model3Parser);
    }
}();
