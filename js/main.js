// Namaiki-Online Start Js
//[-] NW.js
//[-] Cordova
//EditBy_BillbilW

const scriptUrls = [
    'js/libs/pixi.js',
    'js/libs/pako.min.js',
    'js/libs/vorbisdecoder.js',
    'js/libs/effekseer.min.js',
    'js/libs/localforage.min.js',
    'js/rmmz_core.js',
    'js/rmmz_managers.js',
    'js/rmmz_objects.js',
    'js/rmmz_scenes.js',
    'js/rmmz_sprites.js',
    'js/rmmz_windows.js',
    'js/plugins.js'
];
const effekseerWasmUrl = 'js/libs/effekseer.wasm';

class Main {
    constructor() {
        this.xhrSucceeded = true; // 网页版强制设为true，跳过本地文件检测
        this.loadCount = 0;
        this.numScripts = scriptUrls.length;
        this.error = null;
    }

    // 游戏主入口
    run() {
        this.showLoadingSpinner();
        this.loadMainScripts();
        this.initEffekseerRuntime();
    }

    // 显示加载图标（RPG Maker 标准）
    showLoadingSpinner() {
        const container = document.createElement('div');
        const spinner = document.createElement('div');
        container.id = 'loadingSpinner';
        spinner.id = 'loadingSpinnerImage';
        container.appendChild(spinner);
        document.body.appendChild(container);
    }

    // 移除加载图标
    eraseLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        spinner && document.body.removeChild(spinner);
    }

    // 核心：加载所有游戏脚本
    loadMainScripts() {
        for (const url of scriptUrls) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = false; // 必须同步加载，保证顺序
            script.defer = false;
            script.onload = this.onScriptLoad.bind(this);
            script.onerror = this.onScriptError.bind(this);
            script._url = url;
            document.body.appendChild(script);
        }
        // 监听游戏核心加载完成事件
        window.addEventListener('load', this.onWindowLoad.bind(this));
        window.addEventListener('error', this.onWindowError.bind(this));
    }

    // 单个脚本加载完成
    onScriptLoad() {
        this.loadCount++;
        // 当所有脚本加载完毕，初始化插件
        if (this.loadCount === this.numScripts && typeof PluginManager !== 'undefined') {
            PluginManager.setup($plugins);
        }
    }

    // 脚本加载出错
    onScriptError(event) {
        this.printError('加载失败', `文件: ${event.target._url}`);
    }

    // 页面全局加载完成（游戏启动）
    onWindowLoad() {
        // 网页版跳过 NW.js 路径检查
        if (this.error) {
            this.printError(this.error.name, this.error.message);
        } else {
            this.eraseLoadingSpinner();
            SceneManager.run(Scene_Boot); // 启动游戏
        }
    }

    // 全局错误捕获
    onWindowError(event) {
        if (!this.error) {
            this.error = event.error || {name: '未知错误', message: event.message};
        }
    }

    // 初始化 Effekseer 特效
    initEffekseerRuntime() {
        if (typeof effekseer !== 'undefined') {
            effekseer.initRuntime(effekseerWasmUrl, this.onEffekseerLoad.bind(this), this.onEffekseerError.bind(this));
        }
    }

    onEffekseerLoad() {
        // 特效初始化成功，无需操作
    }

    onEffekseerError() {
        this.printError('特效加载失败', `无法加载: ${effekseerWasmUrl}`);
    }

    // 错误提示界面
    printError(title, message) {
        this.eraseLoadingSpinner();
        if (!document.getElementById('errorPrinter')) {
            const div = document.createElement('div');
            div.id = 'errorPrinter';
            div.innerHTML = this.makeErrorHtml(title, message);
            document.body.appendChild(div);
        }
    }

    // 错误页面HTML
    makeErrorHtml(title, message) {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        div1.id = 'errorName';
        div2.id = 'errorMessage';
        div1.innerHTML = title;
        div2.innerHTML = message;
        return div1.outerHTML + div2.outerHTML;
    }
}

// 实例化并启动
const main = new Main();
document.addEventListener('DOMContentLoaded', () => {
    main.run();
});