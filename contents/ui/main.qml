import QtQuick 2.0
import org.kde.plasma.core 2.0 as PlasmaCore
import org.kde.plasma.components 2.0 as Plasma
import "../code/tiling.js" as Tiling

Item {
    property variant tiling
    Component.onCompleted: {
        tiling = new Tiling.Activity();
    }
}