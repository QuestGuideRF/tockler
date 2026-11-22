import { useColorMode } from '@chakra-ui/react';
import { StoreProvider } from 'easy-peasy';
import { Settings } from 'luxon';
import { useCallback, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { TrayLayout } from './components/TrayLayout/TrayLayout';
import { Logger } from './logger';
import { RootProvider } from './RootContext';
import { ChartThemeProvider } from './routes/ChartThemeProvider';
import { MainAppPage } from './routes/MainAppPage';
import { NotificationAppPage } from './routes/NotificationAppPage';
import { TrayAppPage } from './routes/TrayAppPage';
import { ElectronEventEmitter } from './services/ElectronEventEmitter';
import { mainStore } from './store/mainStore';
import { useGoogleAnalytics } from './useGoogleAnalytics';

Settings.defaultLocale = 'en-GB';

export function MainRouter() {
    useGoogleAnalytics();
    const { setColorMode } = useColorMode();

    const changeActiveTheme = useCallback(
        (themeName) => {
            setColorMode(themeName);
        },
        [setColorMode],
    );

    useEffect(() => {
        ElectronEventEmitter.on('activeThemeChanged', changeActiveTheme);

        return () => {
            Logger.debug('Clearing eventEmitter');
            ElectronEventEmitter.off('activeThemeChanged', changeActiveTheme);
        };
    }, [changeActiveTheme]);

    return (
        <ChartThemeProvider>
            <RootProvider>
                <Routes>
                    { }
                    <Route
                        path="/app/*"
                        element={
                            <StoreProvider store={mainStore}>
                                <MainAppPage />
                            </StoreProvider>
                        }
                    />

                    { }
                    <Route path="/" element={<Navigate to="/app" replace />} />

                    { }
                    <Route
                        path="/trayApp"
                        element={
                            <TrayLayout>
                                <ErrorBoundary>
                                    <TrayAppPage />
                                </ErrorBoundary>
                            </TrayLayout>
                        }
                    />

                    <Route path="/notificationApp" element={<NotificationAppPage />} />

                    { }
                    <Route path="*" element={<Navigate to="/app" replace />} />
                </Routes>
            </RootProvider>
        </ChartThemeProvider>
    );
}