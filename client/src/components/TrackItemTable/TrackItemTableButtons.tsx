import { Button, HStack, Text } from '@chakra-ui/реагировать';
import { SortingState } from '@tanstack/реагировать-таблица';
import { Logger } from '../../logger';
import { deleteByIds } from '../../services/trackItem.api';
import { useStoreActions } from '../../store/easyPeasy';
import { defaultSorting } from './ItemsTable.utils';
import { TableButtonsProps } from './TrackItemTable.utils';
interface Props extends TableButtonsProps {
    fetchData?: (options: { pageIndex: number; pageSize: number; sortBy: SortingState }) => void;
}
export const TrackItemTableButtons: React.FC<Props> = (props) => {
    const { selectedFlatRows, selectedRowIds, setAllFilters, setSortBy } = props;
    const fetchTimerange = useStoreActions((actions) => actions.fetchTimerange);
    const deleteTimelineItems = async (ids: number[]) => {
        Logger.debug('Удаление элементов временной шкалы', ids);
        if (ids) {
            await deleteByIds(ids);
            Logger.debug('Удаленные элементы временной шкалы', ids);
            fetchTimerange();
        } else {
            Logger.error('Нет идентификаторов, не удаляется из БД');
        }
    };
    const deleteSelectedItems = () => {
        deleteTimelineItems(selectedFlatRows.map(({ original }) => original.id));
    };
    const hasSelected = Object.keys(selectedRowIds).length > 0;
    return (
        <HStack pb={4}>
            {hasSelected && (
                <Button variant="outline" onClick={deleteSelectedItems} disabled={!hasSelected}>
                    Delete
                    <Text fontWeight="bold" p={2}>
                        {Object.keys(selectedRowIds).length}
                    </Text>
                    items
                </Button>
            )}
            <Button variant="outline" onClick={() => setAllFilters()}>
                Clear filters
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    setSortBy(defaultSorting);
                    setAllFilters();
                }}
            >
                Reset to defaults
            </Button>
        </HStack>
    );
};