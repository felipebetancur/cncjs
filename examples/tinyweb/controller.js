(function(root) {

var cnc = root.cnc;
var socket = cnc.socket;

var CNCController = function(port, baudrate) {
    this.port = port;
    this.baudrate = baudrate;
    this.callbacks = {
        'serialport:list': [],
        'serialport:open': [],
        'serialport:close': [],
        'serialport:error': [],
        'serialport:read': [],
        'serialport:write': [],
        'grbl:status': [],
        'grbl:parserstate': [],
        'gcode:statuschange': []
    };

    Object.keys(this.callbacks).forEach(function(eventName) {
        socket.on(eventName, function() {
            var args = Array.prototype.slice.call(arguments);
            this.callbacks[eventName].forEach(function(callback) {
                callback.apply(callback, args);
            });
        }.bind(this));
    }.bind(this));
};

CNCController.prototype.on = function(eventName, callback) {
    var callbacks = this.callbacks[eventName];
    if (!callbacks) {
        console.error('Undefined event name:', eventName);
        return;
    }
    if (typeof callback === 'function') {
        callbacks.push(callback);
    }
};

CNCController.prototype.off = function(eventName, callback) {
    var callbacks = this.callbacks[eventName];
    if (!callbacks) {
        console.error('Undefined event name:', eventName);
        return;
    }
    if (typeof callback === 'function') {
        callbacks.splice(callbacks.indexOf(callback), 1);
    }
};

// @param {string} cmd The command string
// @example Example Usage
// - Load G-code
//   controller.command('load', name, gcode, callback)
// - Unload G-code
//   controller.command('unload')
// - Start sending G-code
//   controller.command('start')
// - Stop sending G-code
//   controller.command('stop')
// - Pause
//   controller.command('pause')
// - Resume
//   controller.command('resume')
// - Feed Hold
//   controller.command('feedhold')
// - Cycle Start
//   controller.command('cyclestart')
// - Reset
//   controller.command('reset')
// - Homing
//   controller.command('homing')
// - Unlock
//   controller.command('unlock')
CNCController.prototype.command = function(cmd) {
    var args = Array.prototype.slice.call(arguments, 1);
    socket.emit.apply(socket, ['command', this.port, cmd].concat(args));
};

CNCController.prototype.write = function(data) {
    socket.emit('write', this.port, data);
};

CNCController.prototype.writeln = function(data) {
    data = ('' + data).trim() + '\n';
    this.write(data);
};

CNCController.prototype.open = function() {
    socket.emit('open', this.port, this.baudrate);
};

CNCController.prototype.close = function() {
    socket.emit('close', this.port);
};

CNCController.prototype.list = function() {
    socket.emit('list');
};

cnc.CNCController = CNCController;

})(this);