import log from 'electron-log/renderer';
log.transports.console.level = 'info';
log.transports.ipc.level = 'info';
const originalConsoleTransport = log.transports.console;
const ignorePatterns = [
    'Warning: ',
    'Реакт не распознает',
    'Неизвестный реквизит',
    'Недопустимое свойство DOM',
    'Были найдены несериализуемые значения',
];
log.transports.console.level = originalConsoleTransport.level;
log.transports.console.format = originalConsoleTransport.format;
const originalWriteFn = log.transports.console.writeFn;
log.transports.console.writeFn = (messageObj) => {
    const message = messageObj.message || messageObj;
    const msgStr = String((message.data && message.data[0]) || '');
    if (ignorePatterns.some((pattern) => msgStr.includes(pattern))) {
        return;
    }
    originalWriteFn(messageObj);
};
export const Logger = log;