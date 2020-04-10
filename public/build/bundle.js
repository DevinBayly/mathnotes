
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // Client ID and API key from the Developer Console
    var CLIENT_ID = '541857836176-ooorj15vavsg5e0h0c98jodmp5lt39js.apps.googleusercontent.com';
    var API_KEY = 'AIzaSyAIYCyk2KaSfTyX67jJuNKYo-AZAtwwZ-U';

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES = 'https://www.googleapis.com/auth/drive';

    var authorizeButton;
    var signoutButton;

    /**
     *  On load, called to load the auth2 library and API client library.
     */
    function handleClientLoad() {
        authorizeButton = document.getElementById('authorize_button');
        signoutButton = document.getElementById('signout_button');
        gapi.load('client:auth2', initClient);
    }

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    function initClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        }, function (error) {
            appendPre(JSON.stringify(error, null, 2));
        });
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            listFiles();
        } else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
        }
    }

    /**
     *  Sign in the user upon button click.
     */
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    /**
     *  Sign out the user upon button click.
     */
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    /**
     * Append a pre element to the body containing the given message
     * as its text node. Used to display the results of the API call.
     *
     * @param {string} message Text to be placed in pre element.
     */
    function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    }
    let idFound;
    /**
     * Print files.
     */
    function listFiles() {
        gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name)"
        }).then(function (response) {
            appendPre('Files:');
            var files = response.result.files;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    appendPre(file.name + ' (' + file.id + ')');
                    if (file.name == "notes.json") {
                        idFound = file.id;
                    }
                }
            } else {
                appendPre('No files found.');
            }
        });
    }
    // check if there's already a file in the drive

    let brandNew = ()=> {

        let first = `--uploadboundary
Content-Disposition:form-data;name="metadata";filename="first"
Content-Type: application/json; charset=UTF-8

{"name":"notes.json","mimeType":"application/json"}
`;
        let second = `--uploadboundary
Content-Disposition:form-data;name="file";filename="blob"
Content-Type: application/json

${JSON.stringify({starting:"text"})}
--uploadboundary--
    `;
        fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&api=${API_KEY}&fields=id`,{
            method:"POST",
            headers:{
                "Content-type":"multipart/related; boundary=uploadboundary",
                "Content-Length":(first+second).length,
                "Authorization":"Bearer "+gapi.auth.getToken().access_token
            },
            body:first+second
        }).then(res=> res.json()).then(j=> console.log(j));
    };

    let performGet =()=> {
        return fetch(`https://www.googleapis.com/drive/v3/files/${idFound}/?key=${API_KEY}&alt=media`,{
        })
    };
    let performUpdate =(jdata)=> {

        let first = `--uploadboundary
Content-Disposition:form-data;name="metadata";filename="first"
Content-Type: application/json; charset=UTF-8

{"name":"notes.json","mimeType":"application/json"}
`;
        let second = `--uploadboundary
Content-Disposition:form-data;name="file";filename="blob"
Content-Type: application/json

${JSON.stringify(jdata)}
--uploadboundary--`;
    // make the path include the fileID to update
        fetch(`https://www.googleapis.com/upload/drive/v3/files/${idFound}/?uploadType=multipart&key=${API_KEY}&fields=id`,{
            method:"PATCH",
            headers:{
                "Content-type":"multipart/related; boundary=uploadboundary",
                "Content-Length":(first+second).length,
                "Authorization":"Bearer "+gapi.auth.getToken().access_token
            },
            body:first+second
        }).then(res=> res.json()).then(j=> console.log(j));
        // try the gapi.method


    };
    // so you create a multtipart upload, with the metadata first, and the body next
    let performUpload = (jdata)=> {
        if (idFound) {
            // try to update the contents
            console.log("updating");
            performUpdate(jdata);
        } else {
            console.log("creating anew");
            brandNew();
        }
    };

    /* src/App.svelte generated by Svelte v3.19.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let p;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let button3;
    	let t9;
    	let button4;
    	let t11;
    	let pre;
    	let t12;
    	let canvas;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Drive API Quickstart";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "creatfile";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "makenew";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "getfile";
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "Authorize";
    			t9 = space();
    			button4 = element("button");
    			button4.textContent = "Sign Out";
    			t11 = space();
    			pre = element("pre");
    			t12 = space();
    			canvas = element("canvas");
    			add_location(p, file, 4, 4, 97);
    			add_location(button0, file, 7, 4, 192);
    			add_location(button1, file, 8, 4, 248);
    			add_location(button2, file, 9, 4, 297);
    			attr_dev(button3, "id", "authorize_button");
    			set_style(button3, "display", "none");
    			add_location(button3, file, 10, 4, 348);
    			attr_dev(button4, "id", "signout_button");
    			set_style(button4, "display", "none");
    			add_location(button4, file, 11, 4, 424);
    			attr_dev(pre, "id", "content");
    			set_style(pre, "white-space", "pre-wrap");
    			add_location(pre, file, 13, 4, 498);
    			attr_dev(canvas, "id", "canvas");
    			add_location(canvas, file, 15, 4, 559);
    			add_location(div, file, 3, 2, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);
    			append_dev(div, button3);
    			append_dev(div, t9);
    			append_dev(div, button4);
    			append_dev(div, t11);
    			append_dev(div, pre);
    			append_dev(div, t12);
    			append_dev(div, canvas);

    			dispose = [
    				listen_dev(button0, "click", performUpload, false, false, false),
    				listen_dev(button1, "click", brandNew, false, false, false),
    				listen_dev(button2, "click", performGet, false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ performUpload, performGet, brandNew });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import various functions from drive_code

    let output = [];
    let run$1 = () => {
      Notification.requestPermission();
      // background stuff
      let can = document.querySelector("#canvas");
      can.width = window.innerWidth;
      can.height = window.innerHeight;
      let ctx = can.getContext("2d");
      setInterval(() => {
        can = document.querySelector("#canvas");
        ctx = can.getContext("2d");
        let existing = ctx.getImageData(0, 0, can.width, can.height);
        can.width = window.scrollMaxX + window.innerWidth;
        can.height = window.scrollMaxY + window.innerHeight;
        ctx.fillStyle = "#f9d899";
        ctx.fillRect(0, 0, window.scrollMaxX + window.innerWidth, window.innerHeight + window.scrollMaxY);
        ctx.putImageData(existing,0,0);

      }, 3000);
      let expbtn = new ExportBtn();
      let upload = new LoadBtn();
      let spec_load = new loadAllBtn();


      let resize = () => {
        // start with just bottom and sides
        let existing = ctx.getImageData(0, 0, can.width, can.height);
        can.width += 500;
        can.height += 500;
        ctx.fillStyle = "#f9d899";
        ctx.fillRect(0, 0, can.width, can.height);
        ctx.putImageData(existing, 0, 0);
      };
      let oncanvas = false;
      // set it to track under tiny interval
      // handle the pressing of shift to move the c
      let mousePos = [0, 0];
      let shiftdown = (e) => {
        let starting = {
          scrollx: window.scrollX,
          scrolly: window.scrollY,
        };
        let canScroll = (e) => {
          // check if starting has an initial or not
          if (starting.initialx == undefined) {
            starting.initialx = e.clientX;
            starting.initialy = e.clientY;
          }
          window.scrollTo(starting.scrollx + (starting.initialx - e.clientX) * 2.0, starting.scrolly + (starting.initialy - e.clientY) * 4.0);
        };
        if (e.key == "Shift") {
          // add a canvas listener
          can.addEventListener("mousemove", canScroll);
        }
        if (e.key == "p") {
          // try to upload the screenshot that has been saved in the websrc directory
          if (oncanvas) {
            let img = new Image();
            img.onload = () => {
              ctx.drawImage(img, mousePos[0], mousePos[1]);
            };
            fetch("./image.png").then(res => res.blob()).then(blb => {
              img.src = URL.createObjectURL(blb);
            });
          }
        }
        if (e.key == "N") {
          // make a textarea box at the point on the screen
          // are these defined?
          if (oncanvas) {
            oncanvas = false;
            let tb = new NoteElement(mousePos);
            tb.init();
            e.preventDefault();
          }
        }
        // add a listener to remove all this on shift up
        let shiftup = (e) => {
          if (e.key == "Shift") {
            can.removeEventListener("mousemove", canScroll);
            can.removeEventListener("keyup", shiftup);
            if (window.scrollX + 50 > window.scrollMaxX || window.scrollY + 50 > window.scrollMaxY) {
              resize();
            }
          }
        };

        document.body.addEventListener("keyup", shiftup);
      };
      document.body.addEventListener("keydown", shiftdown);

      let updatePos = (e) => {
        mousePos[0] = e.pageX;
        mousePos[1] = e.pageY;
      };
      can.addEventListener("mousemove", updatePos);
      //mouse down
      let positions = [];
      can.addEventListener("mousedown", (e) => {
        can.removeEventListener("mousemove", updatePos);
        oncanvas = true;
        let rect = can.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.topj;
        let moving = (e) => {
          let rect = can.getBoundingClientRect();
          let x = e.clientX - rect.left;
          let y = e.clientY - rect.top;
          positions.push(Math.round(x));
          positions.push(Math.round(y));
          //ctx.lineTo(x, y)
          //ctx.stroke()
          if (x + 50 > can.width || y + 50 > can.height) {
            resize();
          }
        };
        positions.push(Math.round(x));
        positions.push(Math.round(y));
        //ctx.moveTo(x, y)
        //ctx.beginPath()
        // create a moving event
        can.addEventListener("mousemove", moving);
        let up = (e) => {
          // draw the line
          ctx.moveTo(positions[0], positions[1]);
          ctx.beginPath();
          for (let i = 2; i < positions.length; i += 2) {
            ctx.lineTo(positions[i], positions[i + 1]);
          }
          ctx.stroke();
          output = output.concat(positions);
          output.push(0);
          positions = [];
          // remove events
          can.removeEventListener("mousemove", moving);
          can.removeEventListener("mouseup", up);
          can.addEventListener("mousemove", updatePos);
        };
        can.addEventListener("mouseup", up);
      });
      //new ScrollHelper()
      //include the download click
      document.querySelector("#reload").click();

    };

    class NoteElement {
      constructor(pos, value = "") {
        let [x, y] = pos;
        this.element = document.createElement("textarea");
        this.element.style.position = "absolute";
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
        this.element.value = value;
        this.element.style.width = "20px";
        this.element.style.height = "20px";
      }
      init() {
        document.body.append(this.element);
        this.element.focus();
        this.element.selectionEnd += 2;
        // set the timer
        // adjust content provided on tab
        this.keyactions();
        // setup dragging
      }
      mouseup(e) {
        let func = this.func;
        document.body.removeEventListener("mousemove", func);

      }
      mousedown(e) {
        console.log("down ");
        let r = this.element.getBoundingClientRect();
        if (e.pageX - (r.left + window.scrollX) < r.width / 2) {
          this.startx = e.pageX;
          this.starty = e.pageY;
          console.log("down ", this.startx, this.starty);
          let func = (e) => { this.mousemove(e); };
          document.body.addEventListener("mousemove", func);
          this.func = func;


        }
      }
      mousemove(e) {

        let newx = e.pageX;
        let newy = e.pageY;
        let deltax = newx - this.startx;
        let deltay = newy - this.starty;
        this.startx = newx;
        this.starty = newy;
        this.element.style.left = `${parseFloat(this.element.style.left) + deltax}px`;
        this.element.style.top = `${parseFloat(this.element.style.top) + deltay}px`;
      }
      keyactions() {
        // 
        this.element.addEventListener("mousedown", this.mousedown.bind(this));
        this.element.addEventListener("mouseup", this.mouseup.bind(this));

        //
        this.element.addEventListener("keydown", (e) => {
          if (e.key == "Enter") {
            let position = this.element.selectionStart;
            // get last line
            let lastline = this.element.value.slice(0, position).split("\n").slice(-1)[0];
            // get amount of whitespace there
            let white_count = /^\s*/.exec(lastline)[0];
            this.element.value = this.element.value.slice(0, position) + "\n" + white_count + this.element.value.slice(position);
            this.element.selectionStart = position + 1 + white_count.length;
            this.element.selectionEnd = this.element.selectionStart;
            e.preventDefault();



          }

          if (e.key == "Control") {
            this.control = true;
          }
          if (e.key == "Alt") {
            e.preventDefault();
            this.check();
          }
          if (e.key == "Tab") {
            e.preventDefault();
            let initial = this.element.selectionStart;
            this.element.value = this.element.value.slice(0, initial) + "  " + this.element.value.slice(initial);
            this.element.selectionStart = initial + 2;
            this.element.selectionEnd = initial + 2;

          }
          if (e.key == "Delete") ;
          // 
          this.calcHeight();
        });
        this.element.addEventListener("keyup", (e) => {
          if (e.key == "Control") {
            this.control = false;
          }
        });
      }
      calcHeight() {
         // width
         let largestline = Math.max(... this.element.value.split("\n").map(e=> e.length));
         this.element.style.width = `${largestline*8 + 30 > 150? 150: largestline*8 + 30 }px`;
         this.element.style.height = `${this.element.scrollHeight}px`;
      }
      check() {
        console.log("checking");
        if (/-write-/.exec(this.element.value)) {
          // write the file back to the active folder
          // contents gets a line added in front which is the name of the file
          this.element.value = this.element.value.replace(/-write-/, "");
          fetch("http://localhost:8040", {
            method: "POST",
            body: JSON.stringify({
              operation: "-savefile-",
              contents: this.filename + "\n" + this.element.value
            })
          });
        }
        if (/-file-/.exec(this.element.value)) {
          this.element.value = this.element.value.replace(/-file-/, "");
          this.filename = this.element.value;
          fetch("http://localhost:8040", {
            method: "POST",
            body: JSON.stringify({
              operation: "-file-",
              contents: this.element.value
            })
          }).then(res => res.text()).then(t => {
            this.element.value = t;
          });
        }
        if (/-start-/.exec(this.element.value)) {
          this.element.value = this.element.value.replace(/-start-/, "-running-");
          this.begin = new Date();
          this.timeout = setTimeout(() => {
            let notify = new Notification("20 mins passed");
          }, 20 * 60 * 1000);

        }
        if (/-stop-/.exec(this.element.value)) {
          this.end = new Date();
          this.element.value = this.element.value.replace(/-stop-/, "");
          let datestring = `${new Date().toUTCString()}: ${((this.end.getTime() - this.begin.getTime()) / (1000 * 60)).toFixed(3)}`;
          this.element.value = this.element.value.replace(/-running-/, datestring);
          let position = this.element.selectionStart;
          clearTimeout(this.timeout);
        }

        if (/-tex-/.exec(this.element.value)) {
          let ta = this.element;
          fetch("http://localhost:8040/", {
            method: "POST",
            body: JSON.stringify(
              {
                operation: '-latex-',
                contents: this.element.value.replace(/-tex-/, "")
              }
            )
          }).then(res => {
            // perform the image fetch
            let img = new Image();
            img.onload = () => {
              let rect = ta.getBoundingClientRect();
              let can = document.querySelector("canvas");
              let ctx = can.getContext("2d");
              ctx.drawImage(img, rect.x + rect.width, rect.y + rect.height);
            };
            fetch("./image.png").then(res => res.blob()).then(blb => {
              img.src = URL.createObjectURL(blb);
            });

          });
        }
        if (/-date-/.exec(this.element.value)) {
          // remove the command string
          this.element.value = this.element.value.replace(/-date-/, "");
          fetch("http://localhost:8040", {
            method: "POST",
            body: JSON.stringify(
              {
                operation: "-date-",
                contents: this.element.value
              }
            )
          }).then(res => res.text()).then(t => {
            this.element.value = t;
          });
        }
      }
      timer() {
        this.timer = setInterval(() => { this.check(); }, 10000);
      }
    }

    class JSONReader {
      constructor() {
        // look for the active file
        performGet().then(res => res.json()).then(rawText => {
          let jsonArray = JSON.parse(rawText);
          jsonArray.map(j => {
            let noteele = new NoteElement([Math.abs(j.x), Math.abs(j.y)], j.value);
            noteele.init();
          });
        });
      }
    }

    class CanvasLoader {
      constructor() {
        // look for active canvas file
        let can = document.querySelector("canvas");
        let img = new Image();
        img.onload = () => {
          let ctx = can.getContext("2d");
          can.width = img.width;
          can.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        fetch("/retrieve/background").then(res => res.text()).then(t => {
          img.src = t;
        });
      }
    }

    class loadAllBtn {
      constructor() {
        this.btn = document.createElement("button");
        this.btn.innerHTML = "load all";
        document.body.prepend(this.btn);
        this.btn.addEventListener("click", () => {
          this.load();
        });
      }
      load() {
        //setInterval(()=>{let dwnload = document.querySelector("#download")
        //  dwnload.click()
        //  console.log("downloading")
        //}, 60 * 1000)
        fetch("/all").then(res => res.json()).then(j => {
          // create a selector element and append it to the top 
          this.select = document.createElement("select");
          for (let e of j) {
            // make an option
            let opt = document.createElement("option");
            opt.value = `${e.id}`;
            opt.innerHTML = `${e.size},${e.ctime}`;
            this.select.append(opt);
          }
          document.body.prepend(this.select);
          this.select.onchange = () => {
            // send a specific load request for the id given add notes for that file
            let id = this.select.value;
            fetch("/idfetch", {
              method: "POST",
              headers: {
                "Content-Type": "text/plain",
                "Content-Length": this.select.value.length,
              },
              body: this.select.value
            }).then(res => res.json()).then(jsonArray => {
              // make notes from all of it
              jsonArray.map(j => {
                let noteele = new NoteElement([Math.abs(j.x), Math.abs(j.y)], j.value);
                noteele.init();
              });
            });


          };
        });
      }
    }

    class LoadBtn {
      constructor() {
        this.btn = document.createElement("button");
        document.body.prepend(this.btn);
        this.btn.addEventListener("click", () => {
          this.load();
        });
        this.btn.id = "reload";
        this.btn.innerHTML = "Load prev data";
      }
      load() {
        // call the json loader and the canvasloader
        let cl = new CanvasLoader();
        let jl = new JSONReader();
        //setInterval(() => {
        //  let dwnload = document.querySelector("#download")
        //  dwnload.click()
        //  console.log("downloading")
        //}, 60 * 1000)
      }
    }

    class ExportBtn {
      constructor() {
        this.btn = document.createElement("button");
        this.btn.innerHTML = "Download";
        this.btn.id = "download";
        this.btn.addEventListener("click", () => {
          let info = this.retrieveInfo();
          // create a, and use for download
          // use performUpload
          performUpload(JSON.stringify(info));
          // also canvas download
          let canvas = document.querySelector("canvas").toDataURL();
          //fetch("/background", { method: "POST", body: canvas })
        });
        document.body.prepend(this.btn);
        // get a list of the textareas on the screen
      }
      retrieveInfo() {
        let texts = Array(...document.querySelectorAll("textarea"));
        // for each, get the x,y and value
        let info = texts.map(ta => {
          let rect = ta.getBoundingClientRect();
          return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, value: ta.value }
        });
        return info
      }
    }
    //

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    window.onload =()=> {
    	handleClientLoad();
    	run$1();
    };

    return app;

}());
//# sourceMappingURL=bundle.js.map
