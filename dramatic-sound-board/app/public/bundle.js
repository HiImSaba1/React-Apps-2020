
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
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

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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
    }

    const loops=[{file:"Anticipation.mp3",name:"Anticipation"}];const hits=[{file:"Bell Hit.mp3",name:"Bell Hit"},{file:"Dramatic Hit.mp3",name:"Dramatic Hit"},{file:"Far Hit.mp3",name:"Far Hit"},{file:"Glitchy Hit.mp3",name:"Glitchy Hit"},{file:"Lingering Hit.mp3",name:"Lingering Hit"},{file:"Low Hit.mp3",name:"Low Hit"},{file:"Small Hit.mp3",name:"Small Hit"},{file:"Soft Hit.mp3",name:"Soft Hit"}];const music=[{file:"Ambient Hum.mp3",name:"Ambient Hum"},{file:"Cataclysmic Molten Core.mp3",name:"Cataclysmic Molten Core"},{file:"Extinction Level Event.mp3",name:"Extinction Level Event"},{file:"Final Boss.mp3",name:"Final Boss"},{file:"Meteor.mp3",name:"Meteor"}];const stings=[{file:"Dead Reckoning.mp3",name:"Dead Reckoning"},{file:"Hero Theme.mp3",name:"Hero Theme"}];const swells=[{file:"Dramatic Swell.mp3",name:"Dramatic Swell"},{file:"Swell.mp3",name:"Swell"}];const rise=[{file:"Cinematic Rise.mp3",name:"Cinematic Rise"},{file:"Rise.mp3",name:"Rise"}];var sounds = {loops:loops,hits:hits,music:music,stings:stings,swells:swells,rise:rise};

    /* src\App.svelte generated by Svelte v3.6.4 */
    const { Object: Object_1 } = globals;

    const file = "src\\App.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.file = list[i].file;
    	child_ctx.name = list[i].name;
    	child_ctx.key = list[i].key;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.section = list[i].section;
    	child_ctx.title = list[i].title;
    	child_ctx.sounds = list[i].sounds;
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.file = list[i].file;
    	child_ctx.name = list[i].name;
    	child_ctx.key = list[i].key;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.section = list[i].section;
    	child_ctx.title = list[i].title;
    	child_ctx.sounds = list[i].sounds;
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (86:2) {#each sounds as { file, name, key }}
    function create_each_block_3(ctx) {
    	var audio_1, source, source_src_value;

    	return {
    		c: function create() {
    			audio_1 = element("audio");
    			source = element("source");
    			attr(source, "src", source_src_value = `${s3Bucket}/sounds/${ctx.section}/${ctx.file}`);
    			attr(source, "type", "audio/mpeg");
    			add_location(source, file, 87, 3, 2112);
    			attr(audio_1, "preload", "auto");
    			add_location(audio_1, file, 86, 2, 2086);
    		},

    		m: function mount(target, anchor) {
    			insert(target, audio_1, anchor);
    			append(audio_1, source);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.filteredSections) && source_src_value !== (source_src_value = `${s3Bucket}/sounds/${ctx.section}/${ctx.file}`)) {
    				attr(source, "src", source_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(audio_1);
    			}
    		}
    	};
    }

    // (85:0) {#each filteredSections as { section, title, sounds }
    function create_each_block_2(ctx) {
    	var each_1_anchor;

    	var each_value_3 = ctx.sounds;

    	var each_blocks = [];

    	for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block_3(get_each_context_3(ctx, each_value_3, i_1));
    	}

    	return {
    		c: function create() {
    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.s3Bucket || changed.filteredSections) {
    				each_value_3 = ctx.sounds;

    				for (var i_1 = 0; i_1 < each_value_3.length; i_1 += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    					} else {
    						each_blocks[i_1] = create_each_block_3(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i_1 < each_blocks.length; i_1 += 1) {
    					each_blocks[i_1].d(1);
    				}
    				each_blocks.length = each_value_3.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (102:4) {#each sounds as { file, name, key }}
    function create_each_block_1(ctx) {
    	var div, small0, t0_value = ctx.key.toUpperCase(), t0, t1, h4, t2_value = ctx.name, t2, t3, small1, t4_value = ctx.section, t4, t5, div_style_value, dispose;

    	function mousedown_handler() {
    		return ctx.mousedown_handler(ctx);
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			small0 = element("small");
    			t0 = text(t0_value);
    			t1 = space();
    			h4 = element("h4");
    			t2 = text(t2_value);
    			t3 = space();
    			small1 = element("small");
    			t4 = text(t4_value);
    			t5 = space();
    			attr(small0, "class", "key svelte-1m2va55");
    			add_location(small0, file, 107, 8, 2743);
    			add_location(h4, file, 108, 8, 2798);
    			attr(small1, "class", "section-title svelte-1m2va55");
    			add_location(small1, file, 109, 8, 2822);
    			attr(div, "class", "sound-button svelte-1m2va55");
    			attr(div, "style", div_style_value = `color: ${ctx.colors[ctx.i % ctx.colors.length]}`);
    			toggle_class(div, "sound-button-active", ctx.currentSound === ctx.name);
    			add_location(div, file, 102, 6, 2534);
    			dispose = listen(div, "mousedown", mousedown_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, small0);
    			append(small0, t0);
    			append(div, t1);
    			append(div, h4);
    			append(h4, t2);
    			append(div, t3);
    			append(div, small1);
    			append(small1, t4);
    			append(div, t5);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.filteredSections) && t0_value !== (t0_value = ctx.key.toUpperCase())) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.filteredSections) && t2_value !== (t2_value = ctx.name)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.filteredSections) && t4_value !== (t4_value = ctx.section)) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.currentSound || changed.filteredSections)) {
    				toggle_class(div, "sound-button-active", ctx.currentSound === ctx.name);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (101:2) {#each filteredSections as { section, title, sounds }
    function create_each_block(ctx) {
    	var each_1_anchor;

    	var each_value_1 = ctx.sounds;

    	var each_blocks = [];

    	for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block_1(get_each_context_1(ctx, each_value_1, i_1));
    	}

    	return {
    		c: function create() {
    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.colors || changed.currentSound || changed.filteredSections) {
    				each_value_1 = ctx.sounds;

    				for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    					} else {
    						each_blocks[i_1] = create_each_block_1(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i_1 < each_blocks.length; i_1 += 1) {
    					each_blocks[i_1].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var t0, form, input, t1, div, dispose;

    	var each_value_2 = ctx.filteredSections;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	var each_value = ctx.filteredSections;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			form = element("form");
    			input = element("input");
    			t1 = space();
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(input, "placeholder", "filter sounds...");
    			attr(input, "class", "filter-box svelte-1m2va55");
    			add_location(input, file, 92, 2, 2243);
    			attr(form, "class", "filter-form svelte-1m2va55");
    			add_location(form, file, 91, 0, 2214);
    			attr(div, "class", "container svelte-1m2va55");
    			add_location(div, file, 99, 0, 2402);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(input, "keydown", ctx.filterBoxKeyDown)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert(target, t0, anchor);
    			insert(target, form, anchor);
    			append(form, input);

    			input.value = ctx.filter;

    			ctx.input_binding(input);
    			insert(target, t1, anchor);
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.filteredSections || changed.s3Bucket) {
    				each_value_2 = ctx.filteredSections;

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_2.length;
    			}

    			if (changed.filter && (input.value !== ctx.filter)) input.value = ctx.filter;

    			if (changed.filteredSections || changed.colors || changed.currentSound) {
    				each_value = ctx.filteredSections;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			destroy_each(each_blocks_1, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(form);
    			}

    			ctx.input_binding(null);

    			if (detaching) {
    				detach(t1);
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    }

    const s3Bucket = 'https://dramatic-sound-board.s3.amazonaws.com';

    const keyboard = "12345qwertasdfgzxcvb67890yuiop";

    function instance($$self, $$props, $$invalidate) {
    	let filter = "";
      let inputBox;
      let currentSound = null;
      let filteredSections;
      let keys = {};
    	let currentKey = 0;

      const colors = ["#3DDC97", "#FF8C42", "#E87EA1", "#FFD046", "#C45AB3"];

      const audio = new Audio();

      function playSound(section, file) {
        const path = `${s3Bucket}/sounds/${section}/${file}`;
        audio.src = path;    audio.currentTime = 0;    if (section === "loops") {
          audio.loop = true;    } else {
          audio.loop = false;    }
        audio.play();
      }

      function filterBoxKeyDown(e) {
        if (e.key === "Escape") {
          inputBox.blur();
        }
      }

      function documentKeyDown(e) {
        if (e.key === " ") {
          audio.pause();
          audio.currentTime = 0;    }
        if (!keys[e.key] || inputBox === document.activeElement) return;
        const {
          section,
          sound: { file, name }
        } = keys[e.key];
        if (currentSound !== name) {
          playSound(section, file);
          $$invalidate('currentSound', currentSound = name);
        }
      }

      function documentKeyUp(e) {
        $$invalidate('currentSound', currentSound = null);
      }

      audio.addEventListener("ended", () => {
        $$invalidate('currentSound', currentSound = null);
      });
      document.addEventListener("keydown", documentKeyDown);
      document.addEventListener("keyup", documentKeyUp);

    	function input_input_handler() {
    		filter = this.value;
    		$$invalidate('filter', filter);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('inputBox', inputBox = $$value);
    		});
    	}

    	function mousedown_handler({ section, file }) {
    		return playSound(section, file);
    	}

    	$$self.$$.update = ($$dirty = { filter: 1, currentKey: 1 }) => {
    		if ($$dirty.filter || $$dirty.currentKey) { {
            keys = {};
            $$invalidate('currentKey', currentKey = 0);
            $$invalidate('filteredSections', filteredSections = Object.keys(sounds).map(section => {
              const regexp = new RegExp(filter.trim(), "i");
              return {
                section,
                title: section[0].toUpperCase() + section.slice(1),
                sounds: sounds[section].filter(sound => {
                  if (sound.name.match(regexp) || section.match(regexp)) {
                    sound.key = keyboard[currentKey];
                    keys[keyboard[currentKey]] = {
                      section,
                      sound
                    };                currentKey++; $$invalidate('currentKey', currentKey), $$invalidate('filter', filter);
                    return true;
                  }
                })
              };
            }));
          } }
    	};

    	return {
    		filter,
    		inputBox,
    		currentSound,
    		filteredSections,
    		colors,
    		playSound,
    		filterBoxKeyDown,
    		input_input_handler,
    		input_binding,
    		mousedown_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
