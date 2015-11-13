//====================
// Search
//====================
/*jslint browser: true , unparam:true*/
/*global $ */
var sudo = window.sudo || {};
sudo.search = (function () {
    'use strict';
    var config = {
        'd': ['w', 'l', 'c'],
        'w': 'exact',
        'l': 'fuzzy',
        'c': 'fuzzy'
    };

    function fuzzy(fields, words) {
        var conditions = [];
        $.each(words, function (key, word) {
            conditions.push([
                '(["][a-z]+["][:]["][a-z0-9+]+["][,])*["](([',
                fields.join("])|(["),
                ']))["][:]["]',
                "([a-z0-9]+[+])*[a-z0-9]*",
                word.match(/([a-z])|([0-9]+)/g).join("[a-z0-9]*"),
                "[a-z0-9]*([+][a-z0-9]+)*",
                '["]'
            ].join(""));
        });
        return "((?=" + conditions.join(")(?=") + "))";
    }

    function exact(fields, words) {
        return [
            '(?=(["][a-z]+["][:]["][a-z0-9+]+["][,])*["]((',
            fields.join(")|("),
            '))["][:]["]',
            words.join("[+]"),
            '["])'
        ].join("");
    }

    function condition(prefix, words) {
        var prefixes = [],
            conditions = [];
        if (prefix === "d") {
            prefixes = [];
            $.each(config[prefix], function (key, val) {
                if (config[val] === "fuzzy") {
                    prefixes.push(val);
                }
            });
            conditions.push(fuzzy(prefixes, words));
            prefixes = [];
            $.each(config[prefix], function (key, val) {
                if (config[val] === "exact") {
                    prefixes.push(val);
                }
            });
            conditions.push(fuzzy(prefixes, words));
        } else if (config[prefix] === "fuzzy") {
            conditions.push(fuzzy([prefix], words));
        } else if (config[prefix] === "exact") {
            conditions.push(exact([prefix], words));
        }
        return "(" + conditions.join("|") + ")";
    }

    function search(data) {
        var conditions = [];
        $.each(data, function (prefix, words) {
            conditions.push(condition(prefix, words));
        });

        var regex = new RegExp([
            '["][a-z0-9]+[$][a-z0-9]+["](?=', // key
            '[:]', // separator
            '[{]', // object start
            conditions.join(""),
            '((["][a-z]+["][:]["][a-z0-9+]+["][,])*', // Fields
            '(["][a-z]+["][:]["][a-z0-9+]+["]))?', // End Field
            '[}])' // object end
        ].join(""), "g");
        var index = sudo.storage.index();
        return (index.match(regex) || []).join("").replace(/["]+/g, "|").slice(1, -1).split("|");
    }

    function query(string) {
        var query, parameters;
        query = "d"
        parameters = string.toLowerCase().match(/[a-z0-9]+:?/g) || [];
        $.each(parameters, function (k, v) {
            if (v.match(/[a-z0-9]+(?=[:])/g)) {
                query = query + "+" + v.match(/[a-z0-9]+(?=[:])/g)[0];
            } else {
                query = query + "-" + v.match(/[a-z0-9]+/g)[0];
            }
        });
        query = query.match(/^[d][+]/g) ? query.substr(2) : query;
        //console.log(query);
        if (query.length > 5) {
            var next = "p";
            var prefix;
            var data = {};
            $.each(query.match(/([a-z0-9]+)|([\+\-])/g), function (key, val) {
                if (val === "+") {
                    next = "p";
                } else if (val === "-") {
                    next = "w"
                } else if (next === "p") {
                    prefix = val;
                } else if (next === "w") {
                    data[prefix] = data[prefix] || [];
                    data[prefix].push(val);
                }
            });
            //console.log(data);
            return search(data)
        }
        else return [];
    }


    return {
        search: search,
        query: query
    };
}());
