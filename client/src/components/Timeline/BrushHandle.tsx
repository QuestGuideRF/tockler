export const BrushHandle = ({ smaller = false, ...rest }) => {
    const handleHeight = smaller ? 20 : 25;
    const handleWidth = 8;
    const y = smaller ? 1 : 2;
    const handlePointerDown = (e) => {
        e.target.setPointerCapture(e.pointerId);
    };
    return (
        <g>
            {}
            <rect
                {...rest}
                width={handleWidth}
                height={handleHeight}
                y={y}
                rx={2}
                ry={2}
                fill="#A78BFA"
                stroke="#5B21B6"
                strokeWidth={1}
                style={{
                    cursor: 'ew-resize',
                }}
                onPointerDown={handlePointerDown}
            />
            {}
            <rect
                {...rest}
                width={24}
                height={handleHeight + 10}
                y={y}
                fill="transparent"
                stroke="transparent"
                style={{
                    cursor: 'ew-resize',
                }}
                onPointerDown={handlePointerDown}
            />
        </g>
    );
};