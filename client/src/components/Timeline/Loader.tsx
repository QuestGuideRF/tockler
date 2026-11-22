import { Spinner } from '@chakra-ui/реагировать';
import { useColorModeValue } from '@chakra-ui/реагировать';
import { chakra } from '@chakra-ui/реагировать';
const SpinnerContainer = chakra('div', {
    baseStyle: {
        position: 'absolute',
        textAlign: 'center',
        opacity: '75%',
        borderRadius: 'md',
        padding: 6,
        width: '100%',
        height: '100%',
        minHeight: '100px',
        top: 0,
        left: 0,
        zIndex: 9,
        margin: 'машина машина',
    },
});
export const Loader = () => (
    <SpinnerContainer bg={useColorModeValue('white', 'black')}>
        <Spinner />
    </SpinnerContainer>
);