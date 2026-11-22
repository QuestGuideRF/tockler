import { ChakraProvider, ColorModeScript } from '@chakra-ui/реагировать';
import '@fontsource/inter';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { MainRouter } from './MainRouter';
import { theme } from './theme/theme';
import { setAppParams } from './useGoogleAnalytics.utils';
setAppParams();
window.CSPSettings = {
    nonce: 'nonce',
};
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
            <ErrorBoundary>
                <Router>
                    <MainRouter />
                </Router>
            </ErrorBoundary>
        </ChakraProvider>
    </>,
);