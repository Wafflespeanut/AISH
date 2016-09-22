function SlowPrinter(delay_ms, style_string) {
    this.delay = delay_ms;
    var idx = 0, timer_id = 0;
    var code = document.getElementById('style-text');
    var node = document.getElementById('style-tag');
    var is_in_comment = false;
    var tag_nodes = [code];
    var prev_class;     // specifically for comments inside selectors

    function create_node() {
        var tag = document.createElement('span');
        tag.className = 'selector';     // initially, everything's assumed to be a selector
        tag_nodes[tag_nodes.length - 1].appendChild(tag);
        tag_nodes.push(tag);
    }

    function print_next_char() {
        var char = style_string[idx];
        var replace_last_node = '';
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
            } else if (char == '{') {
                code.innerHTML += '{';
                replace_last_node = 'key';
            } else if (char == ':') {
                code.innerHTML += ':';
                replace_last_node = 'value';
            } else if (char == ';') {
                code.innerHTML += ';';
                replace_last_node = 'key';
            } else if (char == '}') {
                code.innerHTML += '}';
                replace_last_node = 'selector';
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
        if (idx == style.length) {
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
        this.is_running = false;
        clearInterval(timer_id);
    };

    this.resume = function() {
        this.is_running = true;
        set_interval(this.delay);
    };

    create_node();
    this.resume();
}
