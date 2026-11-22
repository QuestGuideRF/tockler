import { Box, Button, Flex, HStack, Input, Text, useColorModeValue } from '@chakra-ui/реагировать';
import { memo, useEffect, useMemo, useState } from 'react';
import { TIME_FORMAT_SHORT } from '../../constants';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
export enum RangeType {
    ALL_DAY = 'ALL_DAY',
    AM = 'AM',
    PM = 'PM',
    EVENING = 'EVENING',
    HOUR = 'HOUR',
    CUSTOM = 'CUSTOM',
}
export const VisibleRange = memo(() => {
    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);
    const setVisibleTimerange = useStoreActions((actions) => actions.setVisibleTimerange);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [updatingFromTimerange, setUpdatingFromTimerange] = useState(false);
    useEffect(() => {
        if (visibleTimerange && visibleTimerange.length === 2) {
            setUpdatingFromTimerange(true);
            setStartTime(visibleTimerange[0].toFormat(TIME_FORMAT_SHORT));
            setEndTime(visibleTimerange[1].toFormat(TIME_FORMAT_SHORT));
            setTimeout(() => setUpdatingFromTimerange(false), 0);
        }
    }, [visibleTimerange]);
    const activeRange = useMemo(() => {
        if (!visibleTimerange || visibleTimerange.length !== 2) {
            return null;
        }
        const [start, end] = visibleTimerange;
        const dayStart = timerange[0].startOf('day');
        const dayEnd = timerange[0].endOf('day');
        const noon = dayStart.set({ hour: 12 });
        const evening = dayStart.set({ hour: 17 });
        if (start.hasSame(dayStart, 'minute') && end.hasSame(dayEnd, 'minute')) {
            return RangeType.ALL_DAY;
        }
        if (start.hasSame(dayStart, 'minute') && end.hasSame(noon, 'minute')) {
            return RangeType.AM;
        }
        if (start.hasSame(noon, 'minute') && end.hasSame(dayEnd, 'minute')) {
            return RangeType.PM;
        }
        if (start.hasSame(evening, 'minute') && end.hasSame(dayEnd, 'minute')) {
            return RangeType.EVENING;
        }
        const diff = end.diff(start);
        if (Math.abs(diff.as('hours') - 1) < 0.05) {
            return RangeType.HOUR;
        }
        return RangeType.CUSTOM;
    }, [visibleTimerange, timerange]);
    const showDay = () => {
        const beginDate = timerange[0].startOf('day');
        const endDate = timerange[0].endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };
    const showHour = () => {
        const beginDate = visibleTimerange[0].startOf('hour');
        const endDate = beginDate.plus({ hours: 1 });
        setVisibleTimerange([beginDate, endDate]);
    };
    const showAM = () => {
        const beginDate = timerange[0].startOf('day');
        const endDate = timerange[0].startOf('day').set({ hour: 12 });
        setVisibleTimerange([beginDate, endDate]);
    };
    const showPM = () => {
        const beginDate = timerange[0].startOf('day').set({ hour: 12 });
        const endDate = timerange[0].endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };
    const showEvening = () => {
        const beginDate = visibleTimerange[0].startOf('day').set({ hour: 17 });
        const endDate = visibleTimerange[0].endOf('day');
        setVisibleTimerange([beginDate, endDate]);
    };
    const updateCustomTimeRange = (newStartTime, newEndTime) => {
        if (!newStartTime || !newEndTime) return;
        try {
            const [startHours, startMinutes] = newStartTime.split(':').map(Number);
            const [endHours, endMinutes] = newEndTime.split(':').map(Number);
            if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
                return;
            }
            const beginDate = timerange[0].startOf('day').set({
                hour: startHours,
                minute: startMinutes || 0,
            });
            const endDate = timerange[0].startOf('day').set({
                hour: endHours,
                minute: endMinutes || 0,
            });
            const finalEndDate = endDate < beginDate ? endDate.plus({ days: 1 }) : endDate;
            setVisibleTimerange([beginDate, finalEndDate]);
        } catch (err) {
            console.error('Ошибка анализа входных данных времени:', err);
        }
    };
    const handleTimeChange = (timeType) => (e) => {
        const timeStr = e.target.value;
        if (updatingFromTimerange) return;
        if (timeType === 'start') {
            setStartTime(timeStr);
            updateCustomTimeRange(timeStr, endTime);
        } else {
            setEndTime(timeStr);
            updateCustomTimeRange(startTime, timeStr);
        }
    };
    return (
        <Flex direction="column" gap={3}>
            <Flex alignItems="center" justifyContent="end">
                <HStack spacing={3}>
                    <Box maxWidth="120px">
                        <Input type="time" value={startTime} onChange={handleTimeChange('start')} />
                    </Box>
                    <Text fontSize="md">➜</Text>
                    <Box maxWidth="120px">
                        <Input type="time" value={endTime} onChange={handleTimeChange('end')} />
                    </Box>
                </HStack>
            </Flex>
            <Flex alignItems="center">
                <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.300')} pr={4}>
                    Visible range
                </Text>
                <HStack>
                    <Button
                        onClick={showDay}
                        variant={activeRange === RangeType.ALL_DAY ? 'solid' : 'outline'}
                        colorScheme={activeRange === RangeType.ALL_DAY ? 'green' : undefined}
                    >
                        All Day
                    </Button>
                    <Button
                        onClick={showAM}
                        variant={activeRange === RangeType.AM ? 'solid' : 'outline'}
                        colorScheme={activeRange === RangeType.AM ? 'green' : undefined}
                    >
                        AM
                    </Button>
                    <Button
                        onClick={showPM}
                        variant={activeRange === RangeType.PM ? 'solid' : 'outline'}
                        colorScheme={activeRange === RangeType.PM ? 'green' : undefined}
                    >
                        PM
                    </Button>
                    <Button
                        onClick={showEvening}
                        variant={activeRange === RangeType.EVENING ? 'solid' : 'outline'}
                        colorScheme={activeRange === RangeType.EVENING ? 'green' : undefined}
                    >
                        Evening
                    </Button>
                    <Button
                        onClick={showHour}
                        variant={activeRange === RangeType.HOUR ? 'solid' : 'outline'}
                        colorScheme={activeRange === RangeType.HOUR ? 'green' : undefined}
                    >
                        Hour
                    </Button>
                </HStack>
            </Flex>
        </Flex>
    );
});