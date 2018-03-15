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


function getCenter(rect) {
    return Qt.point(rect.x + rect.width / 2, rect.y + rect.height / 2);
}

function getRectCopy(rect) {
    return Qt.rect(rect.x, rect.y, rect.width, rect.height);
}