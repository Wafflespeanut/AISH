function SlowPrinter(delay_ms, style_string) {
    var node = document.createElement('style');
    node.id = 'style-tag';
    document.body.appendChild(node);
    var code = document.createElement('pre');
    code.id = 'style-text';
    document.body.appendChild(code);

    this.delay = delay_ms;
    var idx = 0, idx_state = 0, timer_id = 0;
    var tag_nodes = [code];
    var is_in_comment = false;
    var is_in_keyframes = false;
    var prev_class;     // specifically for comments inside selectors
    var curly_stack = 0;

    var is_waiting_on_input = false;
    var callbacks = {};
    var func_name = '';     // for collecting the name of the callback

    function create_node() {
        var tag = document.createElement('span');
        tag.className = 'selector';     // initially, everything's assumed to be a selector
        tag_nodes[tag_nodes.length - 1].appendChild(tag);
        tag_nodes.push(tag);
    }

    function print_next_char() {
        var char = style_string[idx];
        if (char == undefined) {
            return;
        }

        var replace_last_node = '';

        // optional callback, so that we can initiate something from CSS by enclosing a name between '~'
        // names and callbacks are initialized with the `add_callback` method
        // error prone! (ensure that the names are present in CSS, and callbacks are initialized in JS)
        if (is_waiting_on_input) {
            if (char == '~') {
                idx += 1;       // so that we don't loop on this indefinitely!
                callbacks[func_name]();
                is_waiting_on_input = false;
                func_name = '';
            } else {
                func_name += char;
            }

            return;
        } else if (char == '~') {
            is_waiting_on_input = true;
            return;
        }

        node.innerHTML += char;
        if (is_in_comment) {    // color scheme for code
            if (char == '/' && style_string[idx - 1] == '*') {
                is_in_comment = false;
                tag_nodes[tag_nodes.length - 1].innerHTML += '/';
                replace_last_node = prev_class;
            }
        } else {
            if (char == '/' && style_string[idx + 1] == '*') {
                is_in_comment = true;
                // remember the previous class, so that once we get out of the comment,
                // we should be able to restore it
                prev_class = tag_nodes[tag_nodes.length - 1].className;
                tag_nodes[tag_nodes.length - 1].className = 'comment';
            } else if (char == '@') {
                is_in_keyframes = true;
            } else if (char == '{') {
                code.innerHTML += '{';
                replace_last_node = 'key';

                if (is_in_keyframes) {
                    curly_stack += 1;
                    if (curly_stack == 1) {
                        replace_last_node = 'keyframes';
                    }
                }
            } else if (char == ':') {
                code.innerHTML += ':';
                replace_last_node = 'value';
            } else if (char == ';') {
                code.innerHTML += ';';
                replace_last_node = 'key';
            } else if (char == '}') {
                code.innerHTML += '}';
                replace_last_node = 'selector';

                if (is_in_keyframes) {
                    curly_stack -= 1;
                    if (curly_stack == 1) {
                        replace_last_node = 'keyframes';
                    } else if (curly_stack == 0) {
                        is_in_keyframes = false;
                    }
                }
            }
        }

        if (replace_last_node) {
            tag_nodes.pop();
            create_node();
            tag_nodes[tag_nodes.length - 1].className = replace_last_node;
        } else {
            tag_nodes[tag_nodes.length - 1].innerHTML += char;
        }
    }

    function read_char() {
        if (idx == style_string.length) {
            clearInterval(timer_id);
        } else {
            print_next_char();
            code.scrollTop = code.scrollHeight;     // auto-scroll on overflow
            idx += 1;
        }
    }

    function set_interval(delay_ms) {
        clearInterval(timer_id);
        timer_id = setInterval(read_char, delay_ms);
    }

    // TODO: display message overlay when paused or resumed...
    this.pause = function() {
        this.is_running = 0;
        clearInterval(timer_id);
    };

    this.resume = function() {
        this.is_running = 1;
        set_interval(this.delay);
    };

    this.add_callback = function(name, callback) {
        callbacks[name] = callback;     // as simple as it could be
    }

    // Writes comments to the code area (very useful for writing custom messages along the way)
    // For example, we can `force_stop` printing (we should, whenever we're about to call this),
    // then add a callback which continuously calls this (until some event is fired, say 'click')
    // and finally, `restore` the printer's state and resume printing the remaining stuff...
    this.print_message = function(message) {
        var i = 0;
        var msg = '/* ' + message + ' */\n\n';
        tag_nodes[tag_nodes.length - 1].className = 'comment';

        function print_char() {
            if (i == msg.length) {
                tag_nodes.pop();
                create_node();
                clearInterval(id);
                return;
            }

            node.innerHTML += msg[i];
            tag_nodes[tag_nodes.length - 1].innerHTML += msg[i];
            code.scrollTop = code.scrollHeight;
            i += 1;
        }

        var id = setInterval(print_char, this.delay);
    }

    // force stops the printer (but stores the state), so that we don't listen to
    // click inputs for pausing/resuming
    this.force_stop = function() {
        this.is_running = 2;
        this.pause();
        idx_state = idx;
        idx = style_string.length;
    }

    this.restore = function() {     // restore the state and resume printing!
        this.is_running = 1;
        idx = idx_state;
        idx_state = style_string.length;
        this.resume();
    }

    if (style_string.length > 0) {
        create_node();
        this.resume();
    }
}
