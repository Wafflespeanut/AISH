const BUBBLE_TIME = 1000;
const BUBBLE_SCALE_FACTOR = 30;

function start_bubbling(x_min, y_min, x_max, y_max) {   // values in percent
    var color = 'rgb(' + Math.floor(Math.random() * 255) + ','
                       + Math.floor(Math.random() * 255) + ','
                       + Math.floor(Math.random() * 255) + ')';

    var x = Math.floor((Math.random() * (x_max - x_min) + x_min) * window.innerWidth);
    var y = Math.floor((Math.random() * (y_max - y_min) + y_min) * window.innerHeight);
    var timeout = 200;

    var bubble = document.createElement('div');
    document.body.appendChild(bubble);
    bubble.style.backgroundColor = color;
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';
    bubble.className = 'bubble';

    setTimeout(function() {
        bubble.style.transform = 'scale(' + BUBBLE_SCALE_FACTOR + ')';
    }, timeout);

    timeout += BUBBLE_TIME;
    setTimeout(function() {
        bubble.style.opacity = 0;
    }, timeout);

    timeout += BUBBLE_TIME;
    setTimeout(function() {
        document.body.removeChild(bubble);
    }, timeout);
}
