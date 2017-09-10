## Abnormally Injecting Style into HTML

> *"The promise of love, the pain of loss, the joy of redemption, then give him a puzzle and watch him dance."*

### How does this work?

There's a tiny parser-like thingy, which *parses* basic tokens, identifies where they should be grouped into (for example, comment, selector, key or value), and puts them into `div` elements, which are then pushed into a `pre` element and a `style` element. As we modify the style, the browser engine repaints the window accordingly, [which is beautiful to watch](https://waffles.space/AISH).

So, we have a `payload.css` and a `js-gen.py`. Calling `python js-gen.py` polls over both the files. Whenever it detects a change to one of the files, it generates a JS file (`gen.js`), which contains the raw style content packed into a variable (along with optional tags or script contents).

As an additional perk, the parser can *callback* JS code (i.e.,) whenever it encounters a tilde (`~`), it calls the corresponding function (if any) declared in the main script. For example, [this](https://github.com/wafflespeanut/AISH/blob/85010ecfcfad177905ac2fb0d4f06565707c43b8/payload.css#L142) ends up calling [this](https://github.com/wafflespeanut/AISH/blob/85010ecfcfad177905ac2fb0d4f06565707c43b8/page.js#L23-L29) function.

### What good is all this?

I've no idea. This was my gift to my SO. I dunno what good this is gonna do, or how this is gonna be helpful to anyone, but I like it, so I decided to maintain a repo for that.
