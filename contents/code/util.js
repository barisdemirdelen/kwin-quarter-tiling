function isConfigSet(config) {
    /**
     * Checks if the config value is set to true.
     * @param {string} config - Config value to be checked.
     * @return {boolean}
     */
    return KWin.readConfig(config, false).toString() === "true";
}

function clip(value, min, max) {
    /**
     * Clips the value between min and max values
     * @param {number} value - Value to be clipped.
     * @param {number} min - Min value.
     * @param {number} max - Max value.
     * @return {number} - Clipped value.
     */
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }
    return value;
}

function getDistance2(a, b) {
    /**
     * Calculates the square of distance between points a and b,
     * @param {Qt.point} a
     * @param {Qt.point} b
     * @return {number} - Squared distance between a and b.
     */
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}


function getCenter(rect) {
    /**
     * Calculates the center point of a rect.
     * @param {Qt.rect} rect
     * @return {Qt.point} - Center point.
     */
    return Qt.point(rect.x + rect.width / 2, rect.y + rect.height / 2);
}

function getRectCopy(rect) {
    /**
     * Returns the copy of a rect.
     * @param {Qt.rect} rect
     * @return {Qt.rect} - Copy of rect.
     */
    return Qt.rect(rect.x, rect.y, rect.width, rect.height);
}