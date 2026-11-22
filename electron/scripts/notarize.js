require('dotenv').config();
const { notarize } = require('@электрон/нотариально заверить');
const { join } = require('path');
const { existsSync } = require('fs');
exports.default = async function notarizing(params) {
    const { electronPlatformName } = params;
    const { appId } = params.packager.appInfo;
    if (process.env.GITHUB_EVENT_NAME === 'pull_request' || electronPlatformName !== 'darwin') {
        return;
    }
    if (params.packager.config.extraMetadata?.irccloud?.local_build) {
        return;
    }
    const appPath = join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    console.log('Путь к приложению:', appPath);
    console.log('appId', appId);
    if (!existsSync(appPath)) {
        throw new Error(`Невозможно найти приложение по адресу: ${appPath}.`);
    }
    console.info('Нотариальное заверение заявления...', {
        appBundleId: appId,
        appPath: appPath,
        teamId: process.env.APPLE_TEAM_ID,
    });
    try {
        await notarize({
            tool: 'notarytool',
            appPath,
            teamId: process.env.APPLE_TEAM_ID,
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_ID_PASSWORD,
        });
        console.info('Нотариальное заверение успешно завершено');
    } catch (error) {
        console.error('Нотариальное заверение не удалось:', error);
        throw error;
    }
};