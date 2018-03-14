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