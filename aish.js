function Injector(delay_ms, style_string) {
    this.delay = delay_ms;
    var idx = 0, idx_state = 0, timer_id = 0;
    var is_in_comment = false;
    var is_in_keyframes = false;
    var prev_class;         // specifically for comments inside selectors
    var curly_stack_count = 0;
    var callbacks = {};

    function get_or_create_node(id, tag) {
        var node = document.getElementById(id);
        if (!node) {
            node = document.createElement(tag);
            document.body.appendChild(node);
            node.id = id;
        }

        return node;
    }

    var node = get_or_create_node('style-tag', 'style');
    var code = get_or_create_node('style-text', 'pre');
    var tag_nodes = [code];

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
        if (char == '~') {
            var next = style_string.slice(idx + 1);
            var i = next.indexOf('~');
            if (i == -1) {
                console.log("Couldn't get the name of callback!");
                return;     // don't stop on this tiny check!
            }

            var func_name = style_string.slice(idx + 1, idx + i + 1);
            idx += i + 2;
            callbacks[func_name]();
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
                    curly_stack_count += 1;
                    if (curly_stack_count == 1) {
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
                    curly_stack_count -= 1;
                    if (curly_stack_count == 1) {
                        replace_last_node = 'keyframes';
                    } else if (curly_stack_count == 0) {
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

    this.pause = function() {
        this.is_running = 0;
        clearInterval(timer_id);
    };

    this.play = function() {
        this.is_running = 1;
        set_interval(this.delay);
    };

    this.add_callback = function(name, callback) {
        callbacks[name] = callback;     // as simple as it could be
    }

    // Writes comments to the code area (useful for writing custom messages along the way)
    // For example, we can `force_stop` printing (we should, whenever we're about to call this),
    // then add a callback which continuously calls this (until some event is fired, say 'click')
    // and finally, `restore` the injector's state and resume printing the remaining stuff...
    this.print_message = function(message) {
        var i = 0;
        var msg = '/* ' + message + ' */\n\n';      // FIXME: handle multi-lines!
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

    // force stops the injector (but stores the state), so that we don't listen to
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
        this.play();
    }

    if (style_string.length > 0) {
        create_node();
        this.is_running = 0;
    }
}
