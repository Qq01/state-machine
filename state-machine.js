const defaultOptions = {
    immutableActions: true,
    immutableGetState: true
};
//git test


class StateMachine {
    constructor(state = {}, options = {}) {
        /**
         * @type {{}}
         */
        this._state = state;
        this._actions = {};
        this._options = Object.assign({}, defaultOptions, options);
        /**
         * @type {Object<string, function[]>}
         * @type {{_always: function[]}}
         */
        this._listeners = {
            _always: []
        };
    }

    /**
     * Returns state of the state machine
     * @returns {{}}
     */
    getState = () => {
        if (this._options.immutableGetState) {
            return Object.assign({}, this._state);
        } else {
            return this._state;
        }
    }

    /**
     * Adds action that will operate on current state
     * @param {string} actionName
     * @param {function({}, any)} action
     */
    addAction = (actionName, action) => {
        this._actions[actionName] = action;
    }

    /**
     * Removes action by name that would operate on current state
     * @param {string} actionName
     */
    removeAction = (actionName) => {
        this._actions[actionName] = null;
    }

    /**
     * Add function that will be invoked after specific action will be completed
     * @param {string} actionName
     * @param {function(string, StateMachine, boolean)} callback
     */
    on = (actionName, callback) => {
        if (this._listeners[actionName] == null) {
            this._listeners[actionName] = [];
        }
        if (this._listeners[actionName].find(val => {
            return callback == val;
        }) == null) {
            this._listeners[actionName].push(callback);
        }
    }
    
    /**
     * Remove function for specific action (inverse of StateMachine.on)
     * @param {string} actionName
     * @param {function(string, StateMachine, boolean)} callback
     */
    off = (actionName, callback) => {
        if (this._listeners[actionName] != null) {
            let i = this._listeners[actionName].findIndex(cb => {
                return callback == cb;
            });
            if (i > -1) {
                this._listeners[actionName].splice(i, 1);
            }
        }
    }

    /**
     * Adds function that will be invoked after any action is comleted
     * @param {function(string, StateMachine, boolean)}
     */
    always = (callback) => {
        this._listeners._always.push(callback);
    }

    /**
     * Removes function from "always" stack (inverse of StateMachine.always)
     * @param {function(string, StateMachine, boolean)}
     */
    never = (callback) => {
        let i = this._listeners._always.findIndex(cb => {
            return callback == cb;
        });
        if (i > -1) {
            this._listeners._always.splice(i, 1);
        }
    }

    /**
     * Triggers specific action
     * @param {string} actionName
     * @param {any} params
     */
    do = (actionName, params) => {
        let actionInvoked = false;
        if (typeof this._actions[actionName] == 'function') {
            if (this._options.immutableActions) {
                let state = this._actions[actionName](this._state, params);
                this._state = state;
            } else {
                this._actions[actionName](this._state, params);
            }
            actionInvoked - true;
        }
        this._listeners._always.forEach(listener => {
            listener(actionName, this, actionInvoked);
        });
        if (this._listeners[actionName] != null) {
            this._listeners[actionName].forEach(listener => {
                listener(actionName, this, actionInvoked);
            });
        }
    }
}