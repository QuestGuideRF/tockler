import { useColorMode, useColorModeValue, IconButton, IconButtonProps, Tooltip } from '@chakra-ui/реагировать';
import { FaMoon, FaSun } from 'react-icons/fa';
import { saveThemeToStorage } from '../services/settings.api';
import { THEMES } from '../store/theme.util';
type ColorModeSwitcherProps = Omit<IconButtonProps, 'aria-label'>;
export const ColorModeSwitcher = (props: ColorModeSwitcherProps) => {
    const { colorMode, setColorMode } = useColorMode();
    const text = useColorModeValue('dark', 'light');
    const SwitchIcon = useColorModeValue(FaMoon, FaSun);
    const setColorModeAndSave = () => {
        const theme = colorMode === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setColorMode(theme);
        saveThemeToStorage(theme);
    };
    const label = `Переключиться в режим ${text}`;
    return (
        <Tooltip label={label}>
            <IconButton
                size="md"
                fontSize="lg"
                variant="ghost"
                color="current"
                marginLeft="2"
                onClick={setColorModeAndSave}
                icon={<SwitchIcon />}
                aria-label={label}
                {...props}
            />
        </Tooltip>
    );
};