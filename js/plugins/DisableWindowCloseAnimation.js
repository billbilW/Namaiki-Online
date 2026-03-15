/*:
 * @target MZ
 * @plugindesc Disable the message window opening and closing animation.
 * @help This plugin disables the default animation for opening and closing the message window.
 */

(function() {
    // Overwrite the open method to skip the opening animation
    Window_Message.prototype.open = function() {
        this.visible = true;
        this.openness = 255;
    };

    // Overwrite the close method to skip the closing animation
    Window_Message.prototype.close = function() {
        this.visible = false;
        this.openness = 0;
    };
})();
