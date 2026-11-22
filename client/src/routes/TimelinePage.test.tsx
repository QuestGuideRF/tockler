import { vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/реагировать';
import { render, screen, waitFor } from '@testing-library/реагировать';
import { StoreProvider } from 'easy-peasy';
import { Settings } from 'luxon';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { getTimestamp } from '../__tests__/time.testUtils';
import { mainStore } from '../store/mainStore';
import { TimelinePage } from './TimelinePage';
const findAllDayItems = vi.fn();
const mockData = [
    {
        id: 1,
        app: 'Chrome',
        title: 'Название теста',
        beginDate: Date.now() - 3600000,
        endDate: Date.now(),
        taskName: 'AppTrackItem',
    },
];
const invokeIpc = vi.fn().mockImplementation((channel, ...args) => {
    console.warn('MOCK ignoreIpc вызывается с каналом:', channel, 'и аргументы:', JSON.stringify(args));
    if (channel === 'findAllDayItems') {
        return findAllDayItems(...args);
    }
    return Promise.resolve({});
});
const mockElectronBridge = {
    configGet: vi.fn(),
    configSet: vi.fn(),
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
    platform: 'darwin',
    isMas: false,
    appVersion: vi.fn(),
    openUrlInExternalWindow: vi.fn(),
    invokeIpc,
    sendIpc: vi.fn(),
    onIpc: vi.fn(),
    removeListenerIpc: vi.fn(),
};
const NOW = getTimestamp('2023-01-10T12:00:00');
const renderTimelinePage = () => {
    return render(
        <ChakraProvider>
            <MemoryRouter>
                <StoreProvider store={mainStore}>
                    <TimelinePage />
                </StoreProvider>
            </MemoryRouter>
        </ChakraProvider>,
    );
};
describe('Компонент TimelinePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Settings.now = () => NOW;
        vi.stubGlobal('electronBridge', mockElectronBridge);
        findAllDayItems.mockResolvedValue(mockData);
    });
    it('правильно отображает компоненты временной шкалы', async () => {
        renderTimelinePage();
        expect(screen.getByText('Использование приложения')).toBeInTheDocument();
    });
    it('вызывает fetchTimerange при монтировании компонента', async () => {
        renderTimelinePage();
        await waitFor(() => expect(findAllDayItems).toHaveBeenCalled());
    });
});