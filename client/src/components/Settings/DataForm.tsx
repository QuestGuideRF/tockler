import { Box, FormControl, FormErrorMessage, FormLabel, Input, Text } from '@chakra-ui/реагировать';
import { yupResolver } from '@hookform/resolvers/ага';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import * as yup from 'yup';
import { RootContext } from '../../RootContext';
import { CardBox } from '../CardBox';
import { DataSettingsI } from './DataForm.util';
const schema = yup
    .object({
        idleAfterSeconds: yup.string().required().label('Простой после в секундах'),
        backgroundJobInterval: yup.number().required().positive().integer().label('Продолжительность сеанса'),
    })
    .required();
export const DataForm = () => {
    const { dataSettings, updateDataSettings } = useContext(RootContext);
    const {
        watch,
        reset,
        formState: { errors, isDirty, isValid },
        register,
    } = useForm<DataSettingsI>({ mode: 'onChange', defaultValues: dataSettings, resolver: yupResolver(schema) });
    const watchAllFields = watch();
    const debouncedUpdate = useDebouncedCallback(
        (value) => {
            console.info('Сохраните значения: ', value);
            updateDataSettings(value);
        },
        1000,
        { leading: false, trailing: true },
    );
    useEffect(() => {
        if (isDirty && isValid) {
            const formValues = watchAllFields;
            debouncedUpdate(formValues);
            reset(formValues);
        } else if (isDirty) {
            debouncedUpdate.cancel();
        }
    }, [watchAllFields, isDirty, isValid, debouncedUpdate, reset]);
    return (
        <CardBox title="Настройки данных" divider w="50%">
            <FormControl isInvalid={!!errors.backgroundJobInterval} pb={4}>
                <FormLabel htmlFor="backgroundJobInterval">Background job interval (in seconds)</FormLabel>
                <Input placeholder="Интервал фонового задания" {...register('backgroundJobInterval')} />
                <FormErrorMessage>
                    {errors.backgroundJobInterval && errors.backgroundJobInterval.message}
                </FormErrorMessage>
            </FormControl>
            <Box pt={0} pb={6}>
                <Text fontSize="sm" as="i">
                    Background job runs every 3 seconds by default. In there application checks active window title and
                    the state of system (idle, offline, online)
                </Text>
            </Box>
            <FormControl isInvalid={!!errors.idleAfterSeconds} pb={4}>
                <FormLabel htmlFor="idleAfterSeconds">Idle after (in seconds)</FormLabel>
                <Input placeholder="Простой после" {...register('idleAfterSeconds')} />
                <FormErrorMessage>{errors.idleAfterSeconds && errors.idleAfterSeconds.message}</FormErrorMessage>
            </FormControl>
            <Box pt={0} pb={6}>
                <Text fontSize="sm" as="i">
                    Time when system adds "Idle" item to timeline.
                </Text>
            </Box>
        </CardBox>
    );
};