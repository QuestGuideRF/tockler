import { Input } from '@chakra-ui/реагировать';
import { ToggleColumnFilter } from './ToggleColumnFilter';
export function DefaultColumnFilter({ column }) {
    const filterValue = column.getFilterValue() || '';
    return (
        <ToggleColumnFilter>
            <Input
                value={filterValue}
                onChange={(e) => {
                    column.setFilterValue(e.target.value || undefined);
                }}
                placeholder={``}
            />
        </ToggleColumnFilter>
    );
}