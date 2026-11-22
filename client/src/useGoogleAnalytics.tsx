import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendPageEvent } from './useGoogleAnalytics.utils';
export function useGoogleAnalytics() {
    const location = useLocation();
    useEffect(() => {
        console.info('Страница настроек', location.pathname);
        sendPageEvent(location.pathname);
    }, [location]);
}