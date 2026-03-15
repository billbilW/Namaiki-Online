/*:
 * @target MV MZ
 * @author AceOfAces
 * @plugindesc R1.01 || A plugin that enables additional features related to the RPG Maker Cook Tool Deluxe.
 *
 * @help
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Advanced Save Handler - Version R1.01
 * Developed by AceOfAces
 * Licensed under the Apache 2.0 license. Can be used for both non-commercial
 * and commercial games.
 * Please credit me as AceOfAces when you use this plugin.
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * This plugin enables additional features related to the RPG Maker Cook Tool Deluxe.
 * For example, checking if the Game Master is operational, and if not, close the game.
 * Be warned: Once it's enabled, the checks will activate immediately.
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Installation
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Place the plugin at the highest slot in the plugin manager. Make sure that it's
 * turned off while developping. Once you are ready to publish, turn it on and
 * export.
 * IMPORTANT: It is reccomended that you enable source code compilation
 * (if your project can launch with compiled code) in Cook Tool Deluxe's Project
 * Settings, to prevent users from modifying the game and stop the plugin from
 * loading.
 */
    if (typeof nw === 'undefined' || !Utils.isNwjs()) {
        console.warn('FSDK_CookToolAddOn: NW.js specific checks skipped in non-NW environment.');
    } else {
        var targetProcess = "";
        var targetId = 0;

        const args = nw.App.argv;
        var argSender = args.find(arg => arg.startsWith('--rqTarget='));
        var argSenderId = args.find(arg => arg.startsWith('--rqId='));
        const isWindows = process.platform === 'win32';
        const command = isWindows ? 'tasklist' : 'ps';
        if (argSender){
            var argReceived = argSender.split('=')[1];
            targetProcess = argReceived;
        }
        if (argSenderId){
            var arg2Received = argSenderId.split('=')[1];
            targetId = parseInt(arg2Received);
        }

        const { exec } = require('child_process');
        const EventEmitter = require('events');

        class ProcessMonitor extends EventEmitter {
            constructor(processID, processName, interval = 1000) {
                super();
                this.processID = processID;
                this.processName = processName;
                this.interval = interval;
                this.monitor = null;
            }

            startMonitoring() {
                this.monitor = setInterval(() => {
                    this.checkProcess();
                }, this.interval);
            }

            stopMonitoring() {
                if (this.monitor) {
                    clearInterval(this.monitor);
                }
            }

            checkProcess() {
                var commandArgs = isWindows ? `/FI "PID eq ${targetId}"` : `-p ${targetId}`;
                exec(`${command} ${commandArgs}`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(`Error executing ps: ${stderr}`);
                        this.emit('error', err);
                        return;
                    }

                    if (!stdout.includes(this.processName)) {
                        this.emit('processClosed', { processID: this.processID, processName: this.processName });
                        this.stopMonitoring();
                    }
                });
            }
        }

        const monitor = new ProcessMonitor(targetId, targetProcess);

        monitor.on('processClosed', ({ processID, targetProcess }) => {
            console.log(`Process ${targetProcess} with PID ${processID} has closed.`);
            SceneManager.exit();
        });

        monitor.on('error', (err) => {
            console.error(`An error occurred: ${err.message}`);
        });

        if (targetProcess !== '' && targetId !== 0) {
            monitor.startMonitoring();
        } else {
            alert("Please launch the game from the main executable.");
            SceneManager.exit();
        }
    }
