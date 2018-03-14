function Rect(rect) {

    var self = this;
    this.rect = rect;

    this.getCenter = function () {
        return Qt.point(self.rect.x + self.rect.width / 2,
            self.rect.y + self.rect.height / 2);
    };

    this.getCopy = function () {
        return new Rect(Qt.rect(self.rect.x, self.rect.y,
            self.rect.width, self.rect.height));
    };
}