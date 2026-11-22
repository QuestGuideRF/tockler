import { vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/реагировать';
import { fireEvent, render, screen, waitFor } from '@testing-library/реагировать';
import { StoreProvider } from 'easy-peasy';
import { DateTime, Settings } from 'luxon';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { mainStore } from '../store/mainStore';
import { SearchPage } from './SearchPage';
const searchFromItems = vi.fn();
const exportFromItems = vi.fn();
const mockData = {
    data: [
        {
            id: 1,
            app: 'Chrome',
            title: 'Название теста',
            beginDate: Date.now() - 3600000,
            endDate: Date.now(),
            taskName: 'AppTrackItem',
        },
    ],
    total: 1,
};
const invokeIpc = vi.fn().mockImplementation((channel, ...args) => {
    console.warn('MOCK ignoreIpc вызывается с каналом:', channel, 'и аргументы:', JSON.stringify(args));
    if (channel === 'searchFromItems') {
        return searchFromItems(...args);
    }
    if (channel === 'exportFromItems') {
        return exportFromItems(...args);
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
function getTimestamp(dateString: string) {
    return new Date(dateString).getTime();
}
const renderSearchPage = () => {
    return render(
        <ChakraProvider>
            <MemoryRouter>
                <StoreProvider store={mainStore}>
                    <SearchPage />
                </StoreProvider>
            </MemoryRouter>
        </ChakraProvider>,
    );
};
const getLastCall = () => {
    const searchCalls = vi.mocked(searchFromItems).mock.calls;
    const lastCall = searchCalls[searchCalls.length - 1];
    return lastCall ? lastCall[0] : null;
};
describe('Компонент SearchPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Settings.now = () => NOW;
        vi.stubGlobal('electronBridge', mockElectronBridge);
        searchFromItems.mockResolvedValue(mockData);
    });
    it('правильно отображает форму поиска', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));
        expect(screen.getByPlaceholderText('Поиск среди всех товаров')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
    });
    it('ищет элементы при отправке формы', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));
        const searchInput = screen.getByPlaceholderText('Поиск среди всех товаров');
        fireEvent.change(searchInput, { target: { value: 'тестовый поиск' } });
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));
        const lastCall = getLastCall();
        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
            taskName: 'AppTrackItem',
            searchStr: 'тестовый поиск',
            sumTotal: true,
            paging: {
                limit: 10,
                offset: 0,
                sortByKey: 'endDate',
                sortByOrder: 'desc',
            },
        });
    });
    it('экспортирует элементы в CSV и JSON при выборе параметров экспорта', async () => {
        renderSearchPage();
        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);
        const csvExportOption = screen.getByText('Экспорт в CSV');
        fireEvent.click(csvExportOption);
        await waitFor(() => expect(exportFromItems).toHaveBeenCalledTimes(1));
        expect(exportFromItems.mock.calls[0][0].format).toBe('csv');
        exportFromItems.mockClear();
        fireEvent.click(exportButton);
        const jsonExportOption = screen.getByText('Экспорт в JSON');
        fireEvent.click(jsonExportOption);
        await waitFor(() => expect(exportFromItems).toHaveBeenCalledTimes(1));
        expect(exportFromItems.mock.calls[0][0].format).toBe('json');
    });
    it('обновляет тип задачи при изменении селектора типа', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));
        const typeSelect = await screen.findByRole('combobox', { name: 'Тип Выбрать' });
        fireEvent.change(typeSelect, { target: { value: 'LogTrackItem' } });
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));
        const lastCall = getLastCall();
        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
            taskName: 'LogTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'endDate', sortByOrder: 'desc' },
        });
    });
    it('обновляет временной диапазон при изменении выбора диапазона дат', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));
        const monthButton = screen.getByText('Month');
        fireEvent.click(monthButton);
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));
        const lastCall = getLastCall();
        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-10T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
            taskName: 'AppTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'endDate', sortByOrder: 'desc' },
        });
    });
    it('сортирует элементы по BeginDate', async () => {
        renderSearchPage();
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(1));
        const beginHeader = screen.getByText('Begin');
        fireEvent.click(beginHeader);
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);
        await waitFor(() => expect(searchFromItems).toHaveBeenCalledTimes(2));
        const lastCall = getLastCall();
        expect(lastCall).toStrictEqual({
            from: DateTime.fromISO('2022-12-31T00:00:00.000+02:00').valueOf(),
            to: DateTime.fromISO('2023-01-10T23:59:59.999+02:00').valueOf(),
            taskName: 'AppTrackItem',
            searchStr: '',
            sumTotal: true,
            paging: { limit: 10, offset: 0, sortByKey: 'beginDate', sortByOrder: 'desc' },
        });
    });
});