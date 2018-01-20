/**
 * Manages client-related signals and functions
 * @class
 */
function ClientManager(tilingManager) {
    var self = this;

    this.clientAdded = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        if (view.clients.length > 3) {
            return;
        }
    
        client.index = view.clients.length;
        client.startGeo = client.geometry;
        client.oldGeo = client.geometry;
    
        client.clientStartUserMovedResized.connect(self.startMove);
        client.clientStepUserMovedResized.connect(self.stepMove);
        client.clientFinishUserMovedResized.connect(self.finishMove);
    
        view.clients.push(client);
    
        tilingManager.tile();
    };
    
    this.clientRemoved = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        client.index = null;
        client.startGeo = null;
        client.oldGeo = null;
    
        client.clientStartUserMovedResized.disconnect(self.startMove);
        client.clientStepUserMovedResized.disconnect(self.stepMove);
        client.clientFinishUserMovedResized.disconnect(self.finishMove);
    
        view.clients.splice(view.cIndex(client), 1);
    
        tilingManager.tile();
    };
    
    this.startMove = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        client.startGeo = client.geometry;
        client.index = view.cIndex(client);
    };
    
    this.stepMove = function(client) {
    
    };
    
    this.finishMove = function(client) {
        var view = tilingManager.views[client.desktop][client.screen];
    
        view.pane.x += (client.index === 0 || client.index === 3) ? client.geometry.width - client.startGeo.width : client.startGeo.width - client.geometry.width;
        view.pane.y += (client.index === 0 || client.index === 1) ? client.geometry.height - client.startGeo.height : client.startGeo.height - client.geometry.height;
    
        tilingManager.tile();
    };


    workspace.clientAdded.connect(this.clientAdded);
    workspace.clientRemoved.connect(this.clientRemoved);

}