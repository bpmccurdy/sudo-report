//====================
// Storage
//====================
/*global $, chrome*/
var sudo = sudo || {};
var errorr;
sudo.storage = (function () {
    'use strict';
    var storage_ready = $.Deferred(),
        storage_event = {},
        storage_data,
        storage_class = {
            "s": {
                "index": "index_data",
                "data": "data"
            },
            "g": {
                "general": "general"
            },
        },
        storage_group = {
            "index": [
                "w",
                "l",
                "c"
            ],
            "index_data": [
                "wid",
                "label",
                "categories"
            ],
            "data": [
                "object"
            ],
            "general": [
                "value"
            ]
        };

    function copy(object) {
        return JSON.parse(JSON.stringify(object));
    }

    function put(cl, id, obj) {
        var key = cl + "$" + id;
        $.each(storage_class[cl], function (group, map) {
            var object = storage_data[group][key] || {};
            $.each(storage_group[map], function (index, field) {
                if (obj[field]) {
                    object[storage_group[group][index]] = obj[field];
                }
            });
            if (!$.isEmptyObject(object)) {
                storage_data[group][key] = object;
            }
        });
    }

    function get(cl, id) {
        var obj = {};
        $.each(storage_class[cl] || [], function (from, to) {
            $.each(storage_group[from], function (index) {
                try {
                    obj[storage_group[to][index]] = storage_data[from][cl + "$" + id][storage_group[from][index]];
                } catch (e) {
                    console.log("ERROR: Data may be corrupted: " + cl + "$" + id);
                }
            });
        });
        return obj;
    }

    function start() {
        storage_data = {};
        $.each(storage_class, function (name, data) {
            $.each(data, function (group, map) {
                storage_data[group] = {};
            });
        });
        $.each(storage_data, function (group) {
            storage_data[group] = {};
        });
        setTimeout(function () {
            storage_ready.resolve();
        }, 500);
    }
    
    function index() {
        return JSON.stringify(storage_data.index, function (key, val) {
            if (storage_group.index.indexOf(key) > -1) {
                return ((val.toString()).match(/[a-zA-Z0-9]+/g) || []).join("+");
            } else {
                return val;
            }
        }).toLowerCase();
    }
    
    function all(cl) {
        return Object.keys(storage_data[cl]);
    }

    return {
        index: index,
        put: put,
        get: get,
        start: start,
        ready: storage_ready,
        data: function () {return storage_data; },
        all: all
    };
}());
