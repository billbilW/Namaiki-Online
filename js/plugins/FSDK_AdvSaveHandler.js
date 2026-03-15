//==============================================
// New Save Location
// Version R1.00
// Developed by Dragonhouse Software (AceOfAces)
// Licensed under the Apache 2.0 License
//==============================================

/*:
 * @target MV MZ
 * @author AceOfAces
 * @plugindesc R1.00B || Changes the save location. Recommended for users of RPG maker Cook Tool Deluxe.
 *
 * @param preferredLocation
 * @text Preferred Location
 * @type select
 * @option Exe location
 * @value 0
 * @option App Data
 * @value 1
 * @option User folder
 * @value 2
 * @default 0
 * @desc What's the preferred location for the save files?
 *
 * @param windowsPath
 * @text Folder Location (Windows)
 * @default Saved Games/Game Name
 * @desc Select the folder location for Windows builds.
 *
 * @param unixPath
 * @text Folder Location (Linux and Mac)
 * @default Game Dev/Game Name
 * @desc Select the folder location for Linux and Mac builds.
 *
 * @param saveFolderName
 * @text Game Data sub-folder
 * @default userdata/
 * @desc The name of the save folder. Must end with '/'.
 *
 * @help
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Advanced Save Handler - Version R1.00
 * Developed by AceOfAces
 * Licensed under the Apache 2.0 license. Can be used for both non-commercial
 * and commercial games.
 * Please credit me as AceOfAces when you use this plugin.
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * This cross-engine plugin re-works parts of the save mechanism so it can be
 * customizable and more robust. This is an essential plugin for both users
 * that want to change the location and those who use RPG Maker Cook Tool
 * Deluxe (and it's predecessor, RPG maker MV/MZ Cook Tool). For RPG Maker
 * users, it also fixes a bug where games packed with Enigma Virtual Box
 * cannot save properly.
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Installation
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * RPG Maker MV:
 * Put this below plugins that affect the save system (such as Yanfly's Save Core).
 * Then, open the plugin settings and adjust them accordingly.
 *
 * RPG Maker MZ:
 * This is the same as on MV: Put this below any plugins that affect the save system.
 * Then, open the settings and adjust accordingly.
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Configuration
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Preferred Location: Selects which base folder should be used. Selecting "Exe
 * location", it will use the game's parent folder (same as default). Selecting
 * "App Data" will set the location to a folder Nwjs reserves. Selecting "User
 * folder", will put the files to the user's folder (recommended).
 *
 * Folder Location: These two versions adjust the save folder's location in
 * the user folder (you can safely ignore these, if you don't use the User
 * folder). You must write the location with "/" as the path separator. The
 * location is set up as follows (with the default settings):
 * Linux & Mac : /home/myusrname/MyGameName/Game Dev/Game Name/userdata/
 * Windows: C:/Users/MyUserName/Saved Games/Game Dev/Game Name/userdata/
 * Game Data sub-folder: This adjusts the name of the folder that will hold
 * the game's data within the selected location (Global, Settings and saves).
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Compatibility
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * RPG Maker MV: Compatible with version 1.6.0 and newer. Older versions may not
 * work properly. Compatible with most plugins. If Yanfly's Save Core is present,
 * it will use its settings for file names.
 * RPG Maker MZ: Compatible with version 1.5.0 and newer. Older versions may not
 * work properly. Compatible with most plugins.
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Extra Notes
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * In RPG Maker MV, save files are placed into a folder named "Saves". This is
 * to better organize the files within the save location. This behaviour isn't
 * present on RPG Maker MZ.
 * Advanced users can override the selected save location by pushing the
 * following argument for the executable: "--save="path/to/save/folder"".
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
*/

(function () {
    if (typeof nw === 'undefined' || !Utils.isNwjs()) {
        console.warn('FSDK_AdvSaveHandler: NW.js specific save path logic skipped in non-NW environment.');
        return;
    }
    if (Utils.isNwjs()) {
        var FirehawkADK = FirehawkADK || {};
        FirehawkADK.ParamDeck = FirehawkADK.ParamDeck || {};
        // Reference the Plugin Manager's parameters.
        var paramdeck = PluginManager.parameters('FSDK_AdvSaveHandler');
        FirehawkADK.ParamDeck.PreferredLocationId = parseInt(paramdeck['preferredLocation']);
        FirehawkADK.ParamDeck.WinSaveLocation = String(paramdeck['windowsPath']);
        FirehawkADK.ParamDeck.UnixLocation = String(paramdeck['unixPath']);
        FirehawkADK.ParamDeck.SaveFolderName = String(paramdeck['saveFolderName']);

        var path = require('path');
        var systeminternals = require('os');
        var home = systeminternals.homedir();
        var base = path.dirname(process.mainModule.filename);
        var exec = path.dirname(process.execPath);

        StorageManager.ReadSaveArgument = function () {

            // Access command line arguments
            const args = nw.App.argv;

            // Find the "--save" argument
            const saveArg = args.find(arg => arg.startsWith('--save='));

            if (saveArg) {
                // Extract the folder location
                const folderPath = saveArg.split('=')[1];

                // Use the folderPath as needed in your application
                return folderPath;
            } else {
                return null;
            }

        }

        StorageManager.DetermineUserProfileLocation = function () {
            var fs = require('fs');
            var profilePath = "";
            if (process.platform == "win32")
                profilePath = path.join(home, FirehawkADK.ParamDeck.WinSaveLocation, FirehawkADK.ParamDeck.SaveFolderName);
            else profilePath = path.join(home, FirehawkADK.ParamDeck.UnixLocation, FirehawkADK.ParamDeck.SaveFolderName);
            if (!fs.existsSync(profilePath)) fs.mkdirSync(profilePath, { recursive: true });
            return profilePath;
        }

        StorageManager.DetermineSavePath = function () {
            var selectedPath = this.ReadSaveArgument();
            if (selectedPath != null && selectedPath != "") return selectedPath;
            else switch (FirehawkADK.ParamDeck.PreferredLocationId) {
                case 2:
                    return this.DetermineUserProfileLocation();
                case 1:
                    const nw = require('nw.gui');
                    return path.join(nw.App.dataPath, FirehawkADK.ParamDeck.SaveFolderName);
                case 0:
                default:
                    if (Utils.isOptionValid('test')) {
                        return path.join(base, FirehawkADK.ParamDeck.SaveFolderName);
                    } else {
                        return path.join(path.dirname(exec), FirehawkADK.ParamDeck.SaveFolderName);
                    }
            }
        }


        // RMMV Specific patch.
        if (StorageManager.localFileDirectoryPath) {
            StorageManager.localFileDirectoryPath = function () {
                return StorageManager.DetermineSavePath();
            };

            StorageManager.saveToLocalFile = function (savefileId, json) {
                var data = LZString.compressToBase64(json);
                var fs = require('fs');
                var dirPath = path.join(this.localFileDirectoryPath(), "Saves/");
                var filePath = this.localFilePath(savefileId);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, {recursive: true});
                }
                fs.writeFileSync(filePath, data);
            };

            StorageManager.localFilePath = function (savefileId) {
                var name;
                var mover = "";
                if (savefileId < 0) {
                    name = (typeof Yanfly !== "undefined" && typeof Yanfly.Param !== "undefined" && typeof Yanfly.Param.SaveTechLocalConfig != "undefined") ? Yanfly.Param.SaveTechLocalConfig : 'config.rpgsave';
                } else if (savefileId === 0) {
                    name = (typeof Yanfly !== "undefined" && typeof Yanfly.Param !== "undefined" && typeof Yanfly.Param.SaveTechLocalGlobal !== "undefined") ? Yanfly.Param.SaveTechLocalGlobal : 'global.rpgsave';
                } else {
                    name = (typeof Yanfly !== "undefined" && typeof Yanfly.Param !== "undefined" && typeof Yanfly.Param.SaveTechLocalSave !== "undefined") ? Yanfly.Param.SaveTechLocalSave.format(savefileId) : 'file%1.rpgsave'.format(savefileId);
                    mover = "Saves"
                }
                return path.join(this.localFileDirectoryPath(), mover, name);
            };
        }

        //RMMZ specific patch
        if (StorageManager.fileDirectoryPath) {
            StorageManager.fileDirectoryPath = function () {
                return StorageManager.DetermineSavePath();
            }
        }
    }
})();

//A copy of the license is included here. DO NOT REMOVE!

// Apache License
// Version 2.0, January 2004
// http://www.apache.org/licenses/

// TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

// 1. Definitions.

// "License" shall mean the terms and conditions for use, reproduction,
// and distribution as defined by Sections 1 through 9 of this document.

// "Licensor" shall mean the copyright owner or entity authorized by
// the copyright owner that is granting the License.

// "Legal Entity" shall mean the union of the acting entity and all
// other entities that control, are controlled by, or are under common
// control with that entity. For the purposes of this definition,
// "control" means (i) the power, direct or indirect, to cause the
// direction or management of such entity, whether by contract or
// otherwise, or (ii) ownership of fifty percent (50%) or more of the
// outstanding shares, or (iii) beneficial ownership of such entity.

// "You" (or "Your") shall mean an individual or Legal Entity
// exercising permissions granted by this License.

// "Source" form shall mean the preferred form for making modifications,
// including but not limited to software source code, documentation
// source, and configuration files.

// "Object" form shall mean any form resulting from mechanical
// transformation or translation of a Source form, including but
// not limited to compiled object code, generated documentation,
// and conversions to other media types.

// "Work" shall mean the work of authorship, whether in Source or
// Object form, made available under the License, as indicated by a
// copyright notice that is included in or attached to the work
// (an example is provided in the Appendix below).

// "Derivative Works" shall mean any work, whether in Source or Object
// form, that is based on (or derived from) the Work and for which the
// editorial revisions, annotations, elaborations, or other modifications
// represent, as a whole, an original work of authorship. For the purposes
// of this License, Derivative Works shall not include works that remain
// separable from, or merely link (or bind by name) to the interfaces of,
// the Work and Derivative Works thereof.

// "Contribution" shall mean any work of authorship, including
// the original version of the Work and any modifications or additions
// to that Work or Derivative Works thereof, that is intentionally
// submitted to Licensor for inclusion in the Work by the copyright owner
// or by an individual or Legal Entity authorized to submit on behalf of
// the copyright owner. For the purposes of this definition, "submitted"
// means any form of electronic, verbal, or written communication sent
// to the Licensor or its representatives, including but not limited to
// communication on electronic mailing lists, source code control systems,
// and issue tracking systems that are managed by, or on behalf of, the
// Licensor for the purpose of discussing and improving the Work, but
// excluding communication that is conspicuously marked or otherwise
// designated in writing by the copyright owner as "Not a Contribution."

// "Contributor" shall mean Licensor and any individual or Legal Entity
// on behalf of whom a Contribution has been received by Licensor and
// subsequently incorporated within the Work.

// 2. Grant of Copyright License. Subject to the terms and conditions of
// this License, each Contributor hereby grants to You a perpetual,
// worldwide, non-exclusive, no-charge, royalty-free, irrevocable
// copyright license to reproduce, prepare Derivative Works of,
// publicly display, publicly perform, sublicense, and distribute the
// Work and such Derivative Works in Source or Object form.

// 3. Grant of Patent License. Subject to the terms and conditions of
// this License, each Contributor hereby grants to You a perpetual,
// worldwide, non-exclusive, no-charge, royalty-free, irrevocable
// (except as stated in this section) patent license to make, have made,
// use, offer to sell, sell, import, and otherwise transfer the Work,
// where such license applies only to those patent claims licensable
// by such Contributor that are necessarily infringed by their
// Contribution(s) alone or by combination of their Contribution(s)
// with the Work to which such Contribution(s) was submitted. If You
// institute patent litigation against any entity (including a
// cross-claim or counterclaim in a lawsuit) alleging that the Work
// or a Contribution incorporated within the Work constitutes direct
// or contributory patent infringement, then any patent licenses
// granted to You under this License for that Work shall terminate
// as of the date such litigation is filed.

// 4. Redistribution. You may reproduce and distribute copies of the
// Work or Derivative Works thereof in any medium, with or without
// modifications, and in Source or Object form, provided that You
// meet the following conditions:

// (a) You must give any other recipients of the Work or
// Derivative Works a copy of this License; and

// (b) You must cause any modified files to carry prominent notices
// stating that You changed the files; and

// (c) You must retain, in the Source form of any Derivative Works
// that You distribute, all copyright, patent, trademark, and
// attribution notices from the Source form of the Work,
// excluding those notices that do not pertain to any part of
// the Derivative Works; and

// (d) If the Work includes a "NOTICE" text file as part of its
// distribution, then any Derivative Works that You distribute must
// include a readable copy of the attribution notices contained
// within such NOTICE file, excluding those notices that do not
// pertain to any part of the Derivative Works, in at least one
// of the following places: within a NOTICE text file distributed
// as part of the Derivative Works; within the Source form or
// documentation, if provided along with the Derivative Works; or,
// within a display generated by the Derivative Works, if and
// wherever such third-party notices normally appear. The contents
// of the NOTICE file are for informational purposes only and
// do not modify the License. You may add Your own attribution
// notices within Derivative Works that You distribute, alongside
// or as an addendum to the NOTICE text from the Work, provided
// that such additional attribution notices cannot be construed
// as modifying the License.

// You may add Your own copyright statement to Your modifications and
// may provide additional or different license terms and conditions
// for use, reproduction, or distribution of Your modifications, or
// for any such Derivative Works as a whole, provided Your use,
// reproduction, and distribution of the Work otherwise complies with
// the conditions stated in this License.

// 5. Submission of Contributions. Unless You explicitly state otherwise,
// any Contribution intentionally submitted for inclusion in the Work
// by You to the Licensor shall be under the terms and conditions of
// this License, without any additional terms or conditions.
// Notwithstanding the above, nothing herein shall supersede or modify
// the terms of any separate license agreement you may have executed
// with Licensor regarding such Contributions.

// 6. Trademarks. This License does not grant permission to use the trade
// names, trademarks, service marks, or product names of the Licensor,
// except as required for reasonable and customary use in describing the
// origin of the Work and reproducing the content of the NOTICE file.

// 7. Disclaimer of Warranty. Unless required by applicable law or
// agreed to in writing, Licensor provides the Work (and each
// Contributor provides its Contributions) on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied, including, without limitation, any warranties or conditions
// of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
// PARTICULAR PURPOSE. You are solely responsible for determining the
// appropriateness of using or redistributing the Work and assume any
// risks associated with Your exercise of permissions under this License.

// 8. Limitation of Liability. In no event and under no legal theory,
// whether in tort (including negligence), contract, or otherwise,
// unless required by applicable law (such as deliberate and grossly
// negligent acts) or agreed to in writing, shall any Contributor be
// liable to You for damages, including any direct, indirect, special,
// incidental, or consequential damages of any character arising as a
// result of this License or out of the use or inability to use the
// Work (including but not limited to damages for loss of goodwill,
// work stoppage, computer failure or malfunction, or any and all
// other commercial damages or losses), even if such Contributor
// has been advised of the possibility of such damages.

// 9. Accepting Warranty or Additional Liability. While redistributing
// the Work or Derivative Works thereof, You may choose to offer,
// and charge a fee for, acceptance of support, warranty, indemnity,
// or other liability obligations and/or rights consistent with this
// License. However, in accepting such obligations, You may act only
// on Your own behalf and on Your sole responsibility, not on behalf
// of any other Contributor, and only if You agree to indemnify,
// defend, and hold each Contributor harmless for any liability
// incurred by, or claims asserted against, such Contributor by reason
// of your accepting any such warranty or additional liability.

// END OF TERMS AND CONDITIONS
