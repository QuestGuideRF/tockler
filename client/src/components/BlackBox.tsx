import { Box, useColorModeValue, BoxProps } from '@chakra-ui/реагировать';
export const BlackBox = ({ children, ...rest }: BoxProps) => (
    <Box width="100%" borderRadius="lg" p={4} bgColor={useColorModeValue('gray.100', 'gray.900')} {...rest}>
        {children}
    </Box>
);