function isConfigSet(config) {
    return KWin.readConfig(config, false).toString() === "true";
}

function clip(value, min, max) {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }
    return value;
}

function getDistance2(a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}