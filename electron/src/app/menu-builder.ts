import { app, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { config } from '../utils/config';
import AppUpdater from './app-updater';
import WindowManager from './window-manager';
const macOS = process.platform === 'darwin';
export default class MenuBuilder {
    buildMenu() {
        if (config.isDev) {
            this.setupDevelopmentEnvironment();
        }
        const template: any = [
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'pasteandmatchstyle' },
                    { role: 'delete' },
                    { role: 'selectall' },
                ],
            },
            {
                label: 'View',
                submenu: [
                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' },
                    {
                        label: 'Выйти из полноэкранного режима',
                        accelerator: 'Escape',
                        click() {
                            if (WindowManager.mainWindow) {
                                WindowManager.mainWindow.setFullScreen(false);
                            }
                        },
                    },
                ],
            },
            {
                role: 'window',
                submenu: [{ role: 'minimize' }, { role: 'close' }],
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Узнать больше',
                        click() {
                            shell.openExternal('https://github.com/MayGo/tockler');
                        },
                    },
                    {
                        label: 'Проблемы с поиском',
                        click() {
                            shell.openExternal('https://github.com/MayGo/tockler/issues');
                        },
                    },
                ],
            },
        ];
        if (config.isDev) {
            template[1].submenu.unshift(
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
            );
        }
        const PREFERENCES_ITEM = {
            label: 'Preferences',
            accelerator: macOS ? 'Команда+,' : 'Контроль+',
            click() {
                if (WindowManager.mainWindow) {
                    WindowManager.mainWindow.webContents.send('side:preferences');
                }
            },
        };
        const CHECK_UPDATES_ITEM = {
            label: 'Проверьте наличие обновлений...',
            click() {
                AppUpdater.checkForUpdatesManual();
            },
        };
        if (process.platform === 'darwin') {
            template[0].submenu.push(
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
                },
            );
            template[2].submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
            ];
            const about = {
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    PREFERENCES_ITEM,
                    { type: 'separator' },
                    CHECK_UPDATES_ITEM,
                    { type: 'separator' },
                    { role: 'services', submenu: [] },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' },
                ],
            };
            template.unshift(about);
        } else {
            template[2].submenu = [
                PREFERENCES_ITEM,
                { type: 'separator' },
                CHECK_UPDATES_ITEM,
                { type: 'separator' },
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
            ];
        }
        const menu = Menu.buildFromTemplate(template as MenuItemConstructorOptions[]);
        Menu.setApplicationMenu(menu);
        return menu;
    }
    setupDevelopmentEnvironment() {
        if (!WindowManager.mainWindow) {
            console.error('Главное окно не найдено, невозможно настроить среду разработки.');
            return;
        }
    }
}