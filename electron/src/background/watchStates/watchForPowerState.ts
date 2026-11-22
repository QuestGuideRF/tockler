import { powerMonitor } from 'electron';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
const logger = logManager.getLogger('WatchForPowerState');
export function watchForPowerState() {
    powerMonitor.on('suspend', function () {
        logger.debug('Система уходит в спящий режим');
        appEmitter.emit('system-is-sleeping');
    });
    powerMonitor.on('resume', function () {
        logger.debug('Система собирается возобновить работу');
        appEmitter.emit('system-is-resuming');
    });
}
export function watchForPowerStateCleanup() {
    powerMonitor.removeAllListeners('suspend');
    powerMonitor.removeAllListeners('resume');
}