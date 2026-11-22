import { BoxProps, Flex } from '@chakra-ui/реагировать';
import { TileBox } from './TileBox';
export const MetricTile = ({ children, ...rest }: BoxProps) => {
    return (
        <TileBox {...rest}>
            <Flex>{children}</Flex>
        </TileBox>
    );
};