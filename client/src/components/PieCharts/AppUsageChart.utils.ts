export function getTextWidth(text, fontSize, fontFace) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        console.warn('Нет 2D контекста');
        return 0;
    }
    context.font = `${fontSize}пикселей ${fontFace}`;
    return context.measureText(text).width;
}