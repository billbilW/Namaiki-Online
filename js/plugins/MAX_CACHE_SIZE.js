// キャッシュの上限を設定
const CACHE_LIMIT = 80000000;

// 画像キャッシュの管理
ImageManager.checkCacheLimit = function() {
    let totalPixels = 0;
    const cache = ImageManager._cache;

    // 現在のキャッシュの総ピクセル数を計算
    for (let key in cache) {
        let bitmap = cache[key];
        if (bitmap && bitmap.width && bitmap.height) {
            totalPixels += bitmap.width * bitmap.height;
        }
    }

    // 上限を超えた場合、古いキャッシュを削除
    while (totalPixels > CACHE_LIMIT && Object.keys(cache).length > 0) {
        let oldestKey = Object.keys(cache)[0];
        let oldestBitmap = cache[oldestKey];
        if (oldestBitmap && oldestBitmap.width && oldestBitmap.height) {
            totalPixels -= oldestBitmap.width * oldestBitmap.height;
        }
        delete cache[oldestKey];
    }
};

// 画像を読み込む際にキャッシュのチェックを行う
const _ImageManager_loadBitmap = ImageManager.loadBitmap;
ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
    this.checkCacheLimit();
    return _ImageManager_loadBitmap.call(this, folder, filename, hue, smooth);
};
