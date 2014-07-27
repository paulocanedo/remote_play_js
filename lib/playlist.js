/*
 * remote_play
 * https://github.com/paulocanedo/remote_play_js
 *
 * Copyright (c) 2014 Paulo Canedo
 * Licensed under the MIT license.
 */

'use strict';

exports.create = function() {
	var list = [];
	var current = -1;
	var current_metadata = null;
	var repeat = false;

	var get = function(index) {
		var result = list[index];
		
		current_metadata = result;
		return result;
	};

	var indexOf = function(metadata) {
		for(var i=0; i<list.length; i++) {
			if(list[i].id === metadata.id) {
				return i;
			}
		}
		return -1;
	};

	return {
		append: function(metadata) {
			list.push(metadata);
		},
		clear: function() {
			list = [];
		},
		current: function(metadata) {
			if(metadata) {
				current = indexOf(metadata);
			}
			return list[current];
		},
		next: function() {
			if(current >= list.length-1) {
				if(!repeat || this.isEmpty()) {
					return null;
				}
				current = -1;
			}

			return get(++current);
		},
		previous: function() {
			if(this.isEmpty() || current < 0) {
				return null;
			}

			return get(--current);
		},
		isEmpty: function() {
			return list.length === 0;
		},
		setRepeat: function(flag) {
			repeat = flag;
		},
		size: function() {
			return list.length;
		},
		list: function() {
			return list;
		}
	};
};
