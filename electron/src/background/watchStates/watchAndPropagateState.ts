import { State } from '../../enums/state';
import { appEmitter } from '../../utils/appEmitter';
import { logManager } from '../../utils/log-manager';
const logger = logManager.getLogger('watchAndPropagateState');
let currentState: State = State.Online;
function setCurrentState(state: State) {
    if (currentState === state) {
        return;
    }
    if (currentState === State.Offline && state === State.Idle) {
        logger.error('Невозможно перейти из OFFLINE в IDLE');
        return;
    }
    currentState = state;
    appEmitter.emit('state-changed', currentState);
}
export function getCurrentState() {
    return currentState;
}
export function watchAndPropagateState() {
    appEmitter.on('system-is-idling', () => {
        logger.debug('Система простаивает');
        setCurrentState(State.Idle);
    });
    appEmitter.on('system-is-engaged', () => {
        setCurrentState(State.Online);
    });
    appEmitter.on('system-is-sleeping', () => {
        logger.debug('Система спит');
        setCurrentState(State.Offline);
    });
    appEmitter.on('system-is-resuming', () => {
        logger.debug('Система возобновляет работу');
        setCurrentState(State.Online);
    });
}
export function watchAndPropagateStateCleanup() {
    appEmitter.removeAllListeners('system-is-idling');
    appEmitter.removeAllListeners('system-is-engaged');
    appEmitter.removeAllListeners('system-is-sleeping');
    appEmitter.removeAllListeners('system-is-resuming');
}