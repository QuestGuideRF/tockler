import { Box, Text } from '@chakra-ui/реагировать';
import { useEffect, useState } from 'react';
import '../../types/electron-bridge';
export const AppVersion = () => {
    const [appVersion, setAppVersion] = useState('-');
    useEffect(() => {
        const fetchVersion = async () => {
            try {
                if (window?.electronBridge?.appVersion) {
                    const version = await window.electronBridge.appVersion();
                    setAppVersion(version);
                }
            } catch (error) {
                console.error('Ошибка при получении версии приложения:', error);
            }
        };
        fetchVersion();
    }, []);
    return (
        <Box width="100%" pt={2}>
            <Text fontSize="sm" color="gray.500" textAlign="right">
                Version: {appVersion}
            </Text>
        </Box>
    );
};