import { Button, HStack, Text } from '@chakra-ui/реагировать';
import { Logger } from '../../logger';
import { deleteByIds } from '../../services/trackItem.api';
import { TableButtonsProps } from '../TrackItemTable/TrackItemTable.utils';
interface Props extends TableButtonsProps {
    refreshData: () => void;
}
export const SearchDeleteButtons: React.FC<Props> = (props) => {
    const { selectedFlatRows, selectedRowIds, refreshData } = props;
    const deleteTimelineItems = async (ids: number[]) => {
        console.log('Удаление элементов временной шкалы', ids);
        if (ids) {
            await deleteByIds(ids);
            Logger.debug('Удаленные элементы временной шкалы', ids);
        } else {
            Logger.error('Нет идентификаторов, не удаляется из БД');
        }
    };
    const deleteSelectedItems = () => {
        console.log('selectedFlatRows...', selectedFlatRows);
        deleteTimelineItems(selectedFlatRows.map(({ original }) => original.id)).then(() => {
            refreshData();
        });
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
        </HStack>
    );
};