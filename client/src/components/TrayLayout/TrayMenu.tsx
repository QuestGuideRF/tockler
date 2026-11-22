import { Box, HStack, IconButton, Tooltip } from '@chakra-ui/реагировать';
import { memo } from 'react';
import { AiOutlineArrowsAlt, AiOutlinePoweroff } from 'react-icons/ai';
import { ElectronEventEmitter } from '../../services/ElectronEventEmitter';
import { Header } from '../Header/Header';
export const TrayMenuPlain = () => {
    const exitApp = () => {
        ElectronEventEmitter.send('close-app');
    };
    const toggleMainWindow = () => {
        ElectronEventEmitter.send('toggle-main-window');
    };
    return (
        <Header brandLinkProps={{ onClick: toggleMainWindow }}>
            <Box flex="1"></Box>
            <HStack spacing={3} pr={1}>
                <Tooltip placement="bottom" label="Открыть главное окно">
                    <IconButton
                        onClick={toggleMainWindow}
                        variant="ghost"
                        colorScheme="gray"
                        aria-label="Открыть главное окно"
                        icon={<AiOutlineArrowsAlt />}
                    />
                </Tooltip>
                <Tooltip placement="bottom" label="Выйти из приложения">
                    <IconButton
                        onClick={exitApp}
                        variant="ghost"
                        colorScheme="gray"
                        aria-label="Выйти из приложения"
                        icon={<AiOutlinePoweroff />}
                    />
                </Tooltip>
            </HStack>
        </Header>
    );
};
export const TrayMenu = memo(TrayMenuPlain);