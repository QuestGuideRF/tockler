import { ReactNode, createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataSettingsI } from './components/Settings/DataForm.util';
import { WorkSettingsI } from './components/Settings/WorkForm.util';
import { Logger } from './logger';
import { ElectronEventEmitter } from './services/ElectronEventEmitter';
import { fetchDataSettings, fetchWorkSettings, saveDataSettings, saveWorkSettings } from './services/settings.api';
const defaultWorkSettings: WorkSettingsI = {
    workDayStartTime: '08:30',
    workDayEndTime: '17:00',
    splitTaskAfterIdlingForMinutes: 3,
    hoursToWork: 8,
    sessionLength: 50,
    minBreakTime: 5,
    notificationDuration: 10,
    reNotifyInterval: 5,
    smallNotificationsEnabled: true,
};
const defaultDataSettings: DataSettingsI = {
    idleAfterSeconds: 60,
    backgroundJobInterval: 3,
    recentDaysCount: 7,
};
interface RootContextType {
    workSettings: WorkSettingsI;
    updateWorkSettings: (settings: WorkSettingsI) => void;
    dataSettings: DataSettingsI;
    updateDataSettings: (settings: DataSettingsI) => void;
}
export const RootContext = createContext<RootContextType>({
    workSettings: defaultWorkSettings,
    updateWorkSettings: () => {},
    dataSettings: defaultDataSettings,
    updateDataSettings: () => {},
});
interface RootProviderProps {
    children: ReactNode;
}
export const RootProvider = ({ children }: RootProviderProps) => {
    const navigate = useNavigate();
    const gotoSettingsPage = useCallback(() => {
        Logger.debug('Переход на страницу настроек');
        navigate('/app/settings');
    }, [navigate]);
    const [workSettings, setWorkSettings] = useState<WorkSettingsI>(defaultWorkSettings);
    const [dataSettings, setDataSettings] = useState<DataSettingsI>(defaultDataSettings);
    const updateWorkSettings = useCallback((newWorkSettings: WorkSettingsI) => {
        setWorkSettings(newWorkSettings);
        saveWorkSettings(newWorkSettings);
    }, []);
    const updateDataSettings = useCallback((newDataSettings: DataSettingsI) => {
        setDataSettings(newDataSettings);
        saveDataSettings(newDataSettings);
    }, []);
    const loadSettings = useCallback(async () => {
        const newWorkSettings = await fetchWorkSettings();
        if (newWorkSettings) {
            setWorkSettings(newWorkSettings);
        }
        const newDataSettings = await fetchDataSettings();
        if (newDataSettings) {
            setDataSettings(newDataSettings);
        }
    }, []);
    useEffect(() => {
        loadSettings();
    }, []);
    useEffect(() => {
        ElectronEventEmitter.on('WORK_SETTINGS_UPDATED', loadSettings);
        return () => {
            ElectronEventEmitter.off('WORK_SETTINGS_UPDATED', loadSettings);
        };
    }, []);
    useEffect(() => {
        ElectronEventEmitter.on('side:preferences', gotoSettingsPage);
        return () => {
            Logger.debug('Очистка eventEmitter');
            ElectronEventEmitter.off('side:preferences', gotoSettingsPage);
        };
    }, [gotoSettingsPage]);
    const defaultContext: RootContextType = {
        workSettings,
        updateWorkSettings,
        dataSettings,
        updateDataSettings,
    };
    return <RootContext.Provider value={defaultContext}>{children}</RootContext.Provider>;
};