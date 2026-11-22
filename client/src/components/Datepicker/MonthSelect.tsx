import { Select } from '@chakra-ui/реагировать';
export const MonthSelect = ({ value, onChange }) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return (
        <Select placeholder="Выберите месяц" value={value} onChange={onChange}>
            {months.map((month, idx) => (
                <option key={month} value={idx}>
                    {month}
                </option>
            ))}
        </Select>
    );
};