/**
 * Manages client-related signals and functions
 * @class
 */
function ClientManager(tilingManager) {

    // Hack to let the inner connections call this
    var self = this;

    this.clientAdded = function(client) {
        print("ClientManager.clientAdded");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        if (screenManager.clients.length > screenManager.layout.max - 1) {
            return;
        }
    
        client.index = screenManager.clients.length;
        client.startGeo = client.geometry;
        client.oldGeo = client.geometry;
    
        client.clientStartUserMovedResized.connect(self.startMove);
        client.clientStepUserMovedResized.connect(self.stepMove);
        client.clientFinishUserMovedResized.connect(self.finishMove);
    
        screenManager.clients.push(client);
    
        tilingManager.tile();
    };
    
    this.clientRemoved = function(client) {
        print("ClientManager.clientRemoved");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        client.index = null;
        client.startGeo = null;
        client.oldGeo = null;
    
        client.clientStartUserMovedResized.disconnect(self.startMove);
        client.clientStepUserMovedResized.disconnect(self.stepMove);
        client.clientFinishUserMovedResized.disconnect(self.finishMove);
    
        screenManager.clients.splice(screenManager.clientIndex(client), 1);
    
        tilingManager.tile();
    };
    
    this.startMove = function(client) {
        print("ClientManager.startMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        client.startGeo = client.geometry;
        client.index = screenManager.clientIndex(client);
    };
    
    this.stepMove = function(client) {
    
    };
    
    this.finishMove = function(client) {
        print("ClientManager.finishMove");
        var screenManager = tilingManager.screenManagers[client.desktop][client.screen];
    
        screenManager.layout.finishMove(client);
    
        tilingManager.tile();
    };


    workspace.clientAdded.connect(this.clientAdded);
    workspace.clientRemoved.connect(this.clientRemoved);

}
