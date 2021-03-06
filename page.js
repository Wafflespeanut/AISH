const PRINT_TIMEOUT = 35;       // push a character every 35ms
const BLOCK_WIDTH = 0.4;
const TIMEOUT = 800;

(function() {
    var start = new Date().getTime();
    var style_string = "\n\n\t/* There's no 'style_string' in the JS file! */";

    if (typeof tags != 'undefined') {
        document.body.innerHTML += tags;
    }

    if (typeof style != 'undefined') {
        style_string = style;
    }

    var init_msg = "\t/* Click (or 'touch') or press 'space'... */";
    var spewer = new Injector(PRINT_TIMEOUT, init_msg);
    spewer.play();

    spewer = new Injector(PRINT_TIMEOUT, style_string);

    spewer.add_callback('bubbles', function() {
        setTimeout(function() {
            setInterval(function() {
                start_bubbling(BLOCK_WIDTH, 0, 1, 1);
            }, 1500);
        }, 1200);
    });

    spewer.add_callback('end', function() {
        var current = new Date().getTime();
        console.log((current - start) / 60000, 'minutes!');
    });

    function global_state_handler() {
        if (spewer.is_running == 1) {
            spewer.pause();
        } else if (spewer.is_running == 0) {
            spewer.play();
        }
    }

    function listen_keys() {
        window.addEventListener('click', global_state_handler, false);
        window.onkeypress = function(e) {
            if (e.keyCode == 32 || e.charCode == 32) {
                e.preventDefault();     // prevent scrolling
                global_state_handler();
            }
        };
    }

    function ignore_keys() {
        window.removeEventListener('click', global_state_handler, false);
        window.onkeypress = function(e) {
            if (e.keyCode == 32 || e.charCode == 32) {
                e.preventDefault();     // prevent scrolling
            }
        }
    }

    screen.orientation.addEventListener('change', function() {
        // 'orientationchange' event wasn't useful
        // `innerWidth > innerHeight` isn't compatible everywhere
        // `window.matchMedia("(orientation:landscape)")` was lagging and unpredictable
        // (meh, the trouble being a web dev)
        var is_landscape = screen.orientation.type.indexOf('landscape') >= 0;
        if (is_landscape) {
            listen_keys();
            setTimeout(function() {
                if (spewer.is_running == 0) {
                    spewer.play();
                }
            }, TIMEOUT);
        } else {
            ignore_keys();
            spewer.pause();
        }
    }, false);

    listen_keys();

}).call(this);
