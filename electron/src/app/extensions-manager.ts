import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { logManager } from '../utils/log-manager';
let logger = logManager.getLogger('ExtensionsManager');
export async function initExtensions() {
    logger.debug('Инициализировать расширения.');
    return installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], {
        loadExtensionOptions: {
            allowFileAccess: true,
        },
    })
        .then((extensionNames) => logger.info(`Добавлены расширения: ${extensionNames}`))
        .catch((err: Error) => logger.error('Произошла ошибка при загрузке расширений: ', err));
}