(function() {
    window.JCEMediaBox = {
        options: {
            popup: {
                width: '',
                height: '',
                legacy: 0,
                lightbox: 0,
                shadowbox: 0,
                overlay: 1,
                overlayopacity: 0.8,
                overlaycolor: '#000000',
                resize: 0,
                icons: 1,
                fadespeed: 500,
                scalespeed: 500,
                hideobjects: 1,
                scrolling: 'fixed',
                close: 2,
                labels: {
                    'close': 'Close',
                    'next': 'Next',
                    'previous': 'Previous',
                    'numbers': '{$current} of {$total}',
                    'cancel': 'Cancel'
                }
            },
            tooltip: {
                speed: 150,
                offsets: {
                    x: 16,
                    y: 16
                },
                position: 'br',
                opacity: 0.8,
                background: '#000000',
                color: '#ffffff'
            },
            base: '/',
            pngfix: false,
            pngfixclass: '',
            theme: 'standard',
            themecustom: '',
            themepath: '/idtLib',
            imgpath: 'plugins/system/jcemediabox/img'
        },
        init: function(options) {
            this.extend(this.options, options);
            if (this.isIE6) try {
                document.execCommand("BackgroundImageCache", false, true)
            } catch (e) {};
            this.ready()
        },
        ready: function() {
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", function() {
                    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                    return JCEMediaBox._init()
                }, false)
            } else if (document.attachEvent) {
                document.attachEvent("onreadystatechange", function() {
                    if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", arguments.callee);
                        return JCEMediaBox._init()
                    }
                });
                if (document.documentElement.doScroll && window == window.top) {
                    (function() {
                        if (JCEMediaBox.domLoaded) return;
                        try {
                            document.documentElement.doScroll("left")
                        } catch (error) {
                            setTimeout(arguments.callee, 0);
                            return
                        }
                        return JCEMediaBox._init()
                    })()
                }
            }
            JCEMediaBox.Event.add(window, "load", function() {
                return JCEMediaBox._init()
            })
        },
        getSite: function() {
            var base = this.options.base;
            if (base) {
                var site = document.location.href;
                var parts = site.split(':\/\/');
                var port = parts[0];
                var url = parts[1];
                if (url.indexOf(base) != -1) {
                    url = url.substr(0, url.indexOf(base))
                } else {
                    url = url.substr(0, url.indexOf('/')) || url
                }
                return port + '://' + url + base
            }
            return null
        },
        _init: function() {
            if (this.domLoaded) return;
            this.domLoaded = true;
            var t = this,
                d = document,
                na = navigator,
                ua = na.userAgent;
            t.isOpera = window.opera && opera.buildNumber;
            t.isWebKit = /WebKit/.test(ua);
            t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName) && !!window.ActiveXObject;
            t.isIE6 = t.isIE && /MSIE [56]/.test(ua) && !window.XMLHttpRequest;
            t.isIE7 = t.isIE && /MSIE [7]/.test(ua) && !!window.XMLHttpRequest && !document.querySelector;
            t.isIDevice = /(iPad|iPhone)/.test(ua);
            this.site = this.getSite();
            if (!this.site) return false;
            this.Popup.init();
            this.ToolTip.init()
        },
        each: function(o, cb, s) {
            var n, l;
            if (!o) return 0;
            s = s || o;
            if (o.length !== undefined) {
                for (n = 0, l = o.length; n < l; n++) {
                    if (cb.call(s, o[n], n, o) === false) return 0
                }
            } else {
                for (n in o) {
                    if (o.hasOwnProperty(n)) {
                        if (cb.call(s, o[n], n, o) === false) return 0
                    }
                }
            }
            return 1
        },
        extend: function(o, e) {
            var t = JCEMediaBox,
                i, l, a = arguments;
            for (i = 1, l = a.length; i < l; i++) {
                e = a[i];
                t.each(e, function(v, n) {
                    if (v !== undefined) o[n] = v
                })
            }
            return o
        },
        trim: function(s) {
            return (s ? '' + s : '').replace(/^\s*|\s*$/g, '')
        },
        DOM: {
            get: function(s) {
                if (typeof(s) == 'string') return document.getElementById(s);
                return s
            },
            select: function(o, p) {
                var t = this,
                    r = [],
                    s, parts, at, tag, each = JCEMediaBox.each;
                p = p || document;
                if (o == '*') {
                    return p.getElementsByTagName(o)
                }
                if (p.querySelectorAll) {
                    return p.querySelectorAll(o)
                }

                function inArray(a, v) {
                    var i, l;
                    if (a) {
                        for (i = 0, l = a.length; i < l; i++) {
                            if (a[i] === v) return true
                        }
                    }
                    return false
                }
                s = o.split(',');
                each(s, function(selectors) {
                    parts = JCEMediaBox.trim(selectors).split('.');
                    tag = parts[0] || '*';
                    cl = parts[1] || '';
                    if (/\[(.*?)\]/.test(tag)) {
                        tag = tag.replace(/(.*?)\[(.*?)\]/, function(a, b, c) {
                            at = c;
                            return b
                        })
                    }
                    var elements = p.getElementsByTagName(tag);
                    if (cl || at) {
                        each(elements, function(el) {
                            if (cl) {
                                if (t.hasClass(el, cl)) {
                                    if (!inArray(r, el)) {
                                        r.push(el)
                                    }
                                }
                            }
                            if (at) {
                                if (el.getAttribute(at)) {
                                    if (!inArray(r, el)) {
                                        r.push(el)
                                    }
                                }
                            }
                        })
                    } else {
                        r = elements
                    }
                });
                return r
            },
            hasClass: function(el, c) {
                return new RegExp(c).test(el.className)
            },
            addClass: function(el, c) {
                if (!this.hasClass(el, c)) {
                    el.className = JCEMediaBox.trim(el.className + ' ' + c)
                }
            },
            removeClass: function(el, c) {
                if (this.hasClass(el, c)) {
                    var s = el.className;
                    var re = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");
                    var v = s.replace(re, ' ');
                    v = v.replace(/^\s|\s$/g, '');
                    el.className = v
                }
            },
            show: function(el) {
                el.style.display = 'block'
            },
            hide: function(el) {
                el.style.display = 'none'
            },
            remove: function(el, attrib) {
                if (attrib) {
                    el.removeAttribute(attrib)
                } else {
                    var p = el.parentNode || document.body;
                    p.removeChild(el)
                }
            },
            style: function(n, na, v) {
                var isIE = JCEMediaBox.isIE,
                    r, s;
                na = na.replace(/-(\D)/g, function(a, b) {
                    return b.toUpperCase()
                });
                s = n.style;
                if (typeof v == 'undefined') {
                    if (na == 'float') na = isIE ? 'styleFloat' : 'cssFloat';
                    r = s[na];
                    if (document.defaultView && !r) {
                        if (/float/i.test(na)) na = 'float';
                        na = na.replace(/[A-Z]/g, function(a) {
                            return '-' + a
                        }).toLowerCase();
                        try {
                            r = document.defaultView.getComputedStyle(n, null).getPropertyValue(na)
                        } catch (e) {}
                    }
                    if (n.currentStyle && !r) r = n.currentStyle[na];
                    return r
                } else {
                    switch (na) {
                        case 'opacity':
                            v = parseFloat(v);
                            if (isIE) {
                                s.filter = v === '' ? '' : "alpha(opacity=" + (v * 100) + ")";
                                if (!n.currentStyle || !n.currentStyle.hasLayout) s.display = 'inline-block'
                            }
                            s[na] = v;
                            break;
                        case 'float':
                            na = isIE ? 'styleFloat' : 'cssFloat';
                            break;
                        default:
                            if (v && /(margin|padding|width|height|top|bottom|left|right)/.test(na)) {
                                v = /^[\-0-9\.]+$/.test(v) ? v + 'px' : v
                            }
                            break
                    }
                    s[na] = v
                }
            },
            styles: function(el, props) {
                var t = this;
                JCEMediaBox.each(props, function(v, s) {
                    return t.style(el, s, v)
                })
            },
            attribute: function(el, s, v) {
                if (typeof v == 'undefined') {
                    if (s == 'class') {
                        return el.className
                    }
                    v = el.getAttribute(s);
                    if (/^on/.test(s)) {
                        v = v.replace(/^function\s+anonymous\(\)\s+\{\s+(.*)\s+\}$/, '$1')
                    }
                    if (s == 'hspace' && v == -1) {
                        v = ''
                    }
                    return v
                }
                if (v === '') {
                    el.removeAttribute(s)
                }
                switch (s) {
                    case 'style':
                        if (typeof v == 'object') {
                            this.styles(el, v)
                        } else {
                            el.style.cssText = v
                        }
                        break;
                    case 'class':
                        el.className = v || '';
                        break;
                    default:
                        el.setAttribute(s, v);
                        break
                }
            },
            attributes: function(el, attribs) {
                var t = this;
                JCEMediaBox.each(attribs, function(v, s) {
                    t.attribute(el, s, v)
                })
            },
            create: function(el, attribs, html) {
                var o = document.createElement(el);
                this.attributes(o, attribs);
                if (typeof html != 'undefined') {
                    o.innerHTML = html
                }
                return o
            },
            add: function(n, o, a, h) {
                if (typeof o == 'string') {
                    a = a || {};
                    o = this.create(o, a, h)
                }
                n.appendChild(o);
                return o
            },
            addBefore: function(n, o, c) {
                if (typeof c == 'undefined') {
                    c = n.firstChild
                }
                n.insertBefore(o, c)
            },
            png: function(el) {
                var s;
                if (el.nodeName == 'IMG') {
                    s = el.src;
                    if (/\.png$/i.test(s)) {
                        this.attribute(el, 'src', JCEMediaBox.site + 'plugins/system/jcemediabox/img/blank.gif');
                        this.style(el, 'filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + s + "')")
                    }
                } else {
                    s = this.style(el, 'background-image');
                    if (/\.png/i.test(s)) {
                        var bg = /url\("(.*)"\)/.exec(s)[1];
                        this.styles(el, {
                            'background-image': 'none',
                            'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "', sizingMethod='image')"
                        })
                    }
                }
            }
        },
        Event: {
            events: [],
            add: function(o, n, f, s) {
                var t = this;
                cb = function(e) {
                    if (t.disabled) return;
                    e = e || window.event;
                    if (e && JCEMediaBox.isIE) {
                        if (!e.target) {
                            e.target = e.srcElement || document
                        }
                        if (!e.relatedTarget && e.fromElement) {
                            e.relatedTarget = e.fromElement == e.target ? e.toElement : e.fromElement
                        }
                        JCEMediaBox.extend(e, {
                            preventDefault: function() {
                                this.returnValue = false
                            },
                            stopPropagation: function() {
                                this.cancelBubble = true
                            }
                        })
                    }
                    if (e && JCEMediaBox.isWebKit) {
                        if (e.target.nodeType == 3) {
                            e.target = e.target.parentNode
                        }
                    }
                    if (!s) return f(e);
                    return f.call(s, e)
                };

                function _add(o, n, f) {
                    if (o.attachEvent) {
                        o.attachEvent('on' + n, f)
                    } else if (o.addEventListener) {
                        o.addEventListener(n, f, false)
                    } else {
                        o['on' + n] = f
                    }
                }
                t.events.push({
                    obj: o,
                    name: n,
                    func: f,
                    cfunc: cb,
                    scope: s
                });
                _add(o, n, cb)
            },
            remove: function(o, n, f) {
                var t = this,
                    a = t.events,
                    s = false,
                    r;
                JCEMediaBox.each(a, function(e, i) {
                    if (e.obj == o && e.name == n && (!f || (e.func == f || e.cfunc == f))) {
                        a.splice(i, 1);
                        t._remove(o, n, e.cfunc);
                        s = true;
                        return false
                    }
                });
                return s
            },
            _remove: function(o, n, f) {
                if (o) {
                    try {
                        if (o.detachEvent) o.detachEvent('on' + n, f);
                        else if (o.removeEventListener) o.removeEventListener(n, f, false);
                        else o['on' + n] = null
                    } catch (ex) {}
                }
            },
            cancel: function(e) {
                if (!e) return false;
                this.stop(e);
                return this.prevent(e)
            },
            stop: function(e) {
                if (e.stopPropagation) e.stopPropagation();
                else e.cancelBubble = true;
                return false
            },
            prevent: function(e) {
                if (e.preventDefault) e.preventDefault();
                else e.returnValue = false;
                return false
            },
            destroy: function() {
                var t = this;
                JCEMediaBox.each(t.events, function(e, i) {
                    t._remove(e.obj, e.name, e.cfunc);
                    e.obj = e.cfunc = null
                });
                t.events = [];
                t = null
            },
            addUnload: function(f, s) {
                var t = this;
                f = {
                    func: f,
                    scope: s || this
                };
                if (!t.unloads) {
                    function unload() {
                        var li = t.unloads,
                            o, n;
                        if (li) {
                            for (n in li) {
                                o = li[n];
                                if (o && o.func) o.func.call(o.scope, 1)
                            }
                            if (window.detachEvent) {
                                window.detachEvent('onbeforeunload', fakeUnload);
                                window.detachEvent('onunload', unload)
                            } else if (window.removeEventListener) window.removeEventListener('unload', unload, false);
                            t.unloads = o = li = w = unload = 0;
                            if (window.CollectGarbage) CollectGarbage()
                        }
                    };

                    function fakeUnload() {
                        var d = document;
                        if (d.readyState == 'interactive') {
                            function stop() {
                                d.detachEvent('onstop', stop);
                                if (unload) unload();
                                d = 0
                            };
                            if (d) d.attachEvent('onstop', stop);
                            window.setTimeout(function() {
                                if (d) d.detachEvent('onstop', stop)
                            }, 0)
                        }
                    };
                    if (window.attachEvent) {
                        window.attachEvent('onunload', unload);
                        window.attachEvent('onbeforeunload', fakeUnload)
                    } else if (window.addEventListener) window.addEventListener('unload', unload, false);
                    t.unloads = [f]
                } else t.unloads.push(f);
                return f
            },
            removeUnload: function(f) {
                var u = this.unloads,
                    r = null;
                JCEMediaBox.each(u, function(o, i) {
                    if (o && o.func == f) {
                        u.splice(i, 1);
                        r = f;
                        return false
                    }
                });
                return r
            }
        },
        Dimensions: {
            getWidth: function() {
                return document.documentElement.clientWidth || document.body.clientWidth || this.innerWidth || 0
            },
            getHeight: function() {
                return document.documentElement.clientHeight || document.body.clientHeight || this.innerHeight || 0
            },
            getScrollHeight: function() {
                return document.documentElement.scrollHeight || document.body.scrollHeight || 0
            },
            getScrollWidth: function() {
                return document.documentElement.scrollWidth || document.body.scrollWidth || 0
            },
            getScrollTop: function() {
                return document.documentElement.scrollTop || this.pageYOffset || document.body.scrollTop || 0
            },
            getScrollbarWidth: function() {
                var each = JCEMediaBox.each,
                    DOM = JCEMediaBox.DOM;
                if (this.scrollbarWidth) {
                    return this.scrollbarWidth
                }
                var outer = DOM.add(document.body, 'div', {
                    'style': {
                        position: 'absolute',
                        visibility: 'hidden',
                        width: 200,
                        height: 200,
                        border: 0,
                        margin: 0,
                        padding: 0,
                        overflow: 'hidden'
                    }
                });
                var inner = DOM.add(outer, 'div', {
                    'style': {
                        width: '100%',
                        height: 200,
                        border: 0,
                        margin: 0,
                        padding: 0
                    }
                });
                var w1 = parseInt(inner.offsetWidth);
                outer.style.overflow = 'scroll';
                var w2 = parseInt(inner.offsetWidth);
                if (w1 == w2) {
                    w2 = parseInt(outer.clientWidth)
                }
                document.body.removeChild(outer);
                this.scrollbarWidth = (w1 - w2);
                return this.scrollbarWidth
            },
            outerWidth: function(n) {
                var v = 0,
                    x = 0;
                x = n.offsetWidth;
                if (!x) {
                    JCEMediaBox.each(['padding-left', 'padding-right', 'border-left', 'border-right', 'width'], function(s) {
                        v = parseFloat(JCEMediaBox.DOM.style(n, s));
                        v = /[0-9]/.test(v) ? v : 0;
                        x = x + v
                    })
                }
                return x
            },
            outerHeight: function(n) {
                var v = 0,
                    x = 0;
                x = n.offsetHeight;
                if (!x) {
                    JCEMediaBox.each(['padding-top', 'padding-bottom', 'border-top', 'border-bottom', 'height'], function(s) {
                        v = parseFloat(JCEMediaBox.DOM.style(n, s));
                        v = /[0-9]/.test(v) ? v : 0;
                        x = x + v
                    })
                }
                return x
            }
        },
        FX: {
            animate: function(el, props, speed, cb) {
                var DOM = JCEMediaBox.DOM;
                var options = {
                    speed: speed || 100,
                    callback: cb || function() {}
                };
                var styles = {};
                JCEMediaBox.each(props, function(v, s) {
                    sv = parseFloat(DOM.style(el, s));
                    styles[s] = [sv, v]
                });
                new JCEMediaBox.fx(el, options).custom(styles);
                return true
            }
        }
    };
    JCEMediaBox.XHR = function(options, scope) {
        this.options = {
            async: true,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
            },
            data: null,
            encoding: 'UTF-8',
            success: function() {},
            error: function() {}
        };
        JCEMediaBox.extend(this.options, options);
        this.scope = scope || this
    };
    JCEMediaBox.XHR.prototype = {
        setTransport: function() {
            function get(s) {
                x = 0;
                try {
                    x = new ActiveXObject(s)
                } catch (ex) {}
                return x
            };
            this.transport = window.XMLHttpRequest ? new XMLHttpRequest() : get('Microsoft.XMLHTTP') || get('Msxml2.XMLHTTP')
        },
        onStateChange: function() {
            if (this.transport.readyState != 4 || !this.running) {
                return
            }
            this.running = false;
            var status = 0;
            if ((this.transport.status >= 200) && (this.transport.status < 300)) {
                var s = this.transport.responseText;
                var x = this.transport.responseXML;
                this.options.success.call(this.scope, s, x)
            } else {
                this.options.error.call(this.scope, this.transport, this.options)
            }
            this.transport.onreadystatechange = function() {};
            this.transport = null
        },
        send: function(url) {
            var t = this,
                extend = JCEMediaBox.extend;
            if (this.running) {
                return this
            }
            this.running = true;
            this.setTransport();
            var method = this.options.data ? 'POST' : 'GET';
            if (this.options.data) {
                var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
                extend(this.options.headers, {
                    'Content-type': 'application/x-www-form-urlencoded' + encoding.toUpperCase()
                })
            }
            this.transport.open(method, url, this.options.async);
            this.transport.onreadystatechange = function() {
                return t.onStateChange()
            };
            for (var type in this.options.headers) {
                try {
                    this.transport.setRequestHeader(type, this.options.headers[type])
                } catch (e) {}
            }
            this.transport.send(this.options.data)
        }
    }, JCEMediaBox.fx = function(el, options) {
        this.element = el;
        this.callback = options.callback;
        this.speed = options.speed;
        this.wait = true;
        this.fps = 50;
        this.now = {}
    };
    JCEMediaBox.fx.prototype = {
        step: function() {
            var time = new Date().getTime();
            if (time < this.time + this.speed) {
                this.cTime = time - this.time;
                this.setNow()
            } else {
                var t = this;
                this.clearTimer();
                this.now = this.to;
                setTimeout(function() {
                    t.callback.call(t.element, t)
                }, 10)
            }
            this.increase()
        },
        setNow: function() {
            for (p in this.from) {
                this.now[p] = this.compute(this.from[p], this.to[p])
            }
        },
        compute: function(from, to) {
            var change = to - from;
            return this.transition(this.cTime, from, change, this.speed)
        },
        clearTimer: function() {
            clearInterval(this.timer);
            this.timer = null;
            return this
        },
        start: function(from, to) {
            var t = this;
            if (!this.wait) this.clearTimer();
            if (this.timer) return;
            this.from = from;
            this.to = to;
            this.time = new Date().getTime();
            this.timer = setInterval(function() {
                return t.step()
            }, Math.round(1000 / this.fps));
            return this
        },
        custom: function(o) {
            if (this.timer && this.wait) return;
            var from = {};
            var to = {};
            for (property in o) {
                from[property] = o[property][0];
                to[property] = o[property][1]
            }
            return this.start(from, to)
        },
        increase: function() {
            for (var p in this.now) {
                this.setStyle(this.element, p, this.now[p])
            }
        },
        transition: function(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
        },
        setStyle: function(e, p, v) {
            JCEMediaBox.DOM.style(e, p, v)
        }
    }, JCEMediaBox.ToolTip = {
        init: function() {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                Event = JCEMediaBox.Event;
            var theme = JCEMediaBox.options.theme == 'custom' ? JCEMediaBox.options.themecustom : JCEMediaBox.options.theme;
            this.tooltiptheme = '';
            new JCEMediaBox.XHR({
                success: function(text, xml) {
                    var re = /<!-- THEME START -->([\s\S]*?)<!-- THEME END -->/;
                    if (re.test(text)) {
                        text = re.exec(text)[1]
                    }
                    t.tooltiptheme = text
                }
            }).send('./idtLib/tooltip.html');
            // .send(JCEMediaBox.site + JCEMediaBox.options.themepath + '/' + theme + '/tooltip.html');

            function _withinElement(el, e, fn) {
                var p = e.relatedTarget;
                while (p && p != el) {
                    try {
                        p = p.parentNode
                    } catch (e) {
                        p = el
                    }
                }
                if (p != el) {
                    return fn.call(this)
                }
                return false
            }
            each(DOM.select('.jcetooltip, .jce_tooltip'), function(el) {
                el.tmpTitle = el.title;
                DOM.remove(el, 'title');
                Event.add(el, 'mouseover', function(e) {
                    _withinElement(el, e, function() {
                        return t.start(el)
                    })
                });
                Event.add(el, 'mouseout', function(e) {
                    _withinElement(el, e, function() {
                        return t.end(el)
                    })
                });
                Event.add(el, 'mousemove', function(e) {
                    return t.locate(e)
                })
            })
        },
        create: function() {
            if (!this.toolTip) {
                var DOM = JCEMediaBox.DOM;
                this.toolTip = DOM.add(document.body, 'div', {
                    'style': {
                        'opacity': 0
                    },
                    'class': 'jcemediabox-tooltip'
                }, this.tooltiptheme)
            }
        },
        start: function(el) {
            var t = this,
                DOM = JCEMediaBox.DOM;
            if (!this.tooltiptheme) return false;
            this.create();
            var text = el.tmpTitle || '',
                title = '';
            if (/::/.test(text)) {
                var parts = text.split('::');
                title = JCEMediaBox.trim(parts[0]);
                text = JCEMediaBox.trim(parts[1])
            }
            var cls = el.className.replace(/(jce_?)tooltip/gi, '');
            var h = '';
            if (title) {
                h += '<h4>' + title + '</h4>'
            }
            if (text) {
                h += '<p>' + text + '</p>'
            }
            var tn = DOM.get('jcemediabox-tooltip-text');
            if (typeof tn == 'undefined') {
                this.toolTip.className = 'jcemediabox-tooltip-simple';
                this.toolTip.innerHTML = h
            } else {
                tn.innerHTML = h
            }
            DOM.style(t.toolTip, 'visibility', 'visible');
            JCEMediaBox.FX.animate(t.toolTip, {
                'opacity': JCEMediaBox.options.tooltip.opacity
            }, JCEMediaBox.options.tooltip.speed)
        },
        end: function(el) {
            var t = this,
                DOM = JCEMediaBox.DOM;
            if (!this.tooltiptheme) return false;
            DOM.styles(this.toolTip, {
                'visibility': 'hidden',
                'opacity': 0
            })
        },
        locate: function(e) {
            if (!this.tooltiptheme) return false;
            this.create();
            var o = JCEMediaBox.options.tooltip.offsets;
            var page = {
                'x': e.pageX || e.clientX + document.documentElement.scrollLeft,
                'y': e.pageY || e.clientY + document.documentElement.scrollTop
            };
            var tip = {
                'x': this.toolTip.offsetWidth,
                'y': this.toolTip.offsetHeight
            };
            var pos = {
                'x': page.x + o.x,
                'y': page.y + o.y
            };
            var ah = 0;
            switch (JCEMediaBox.options.tooltip.position) {
                case 'tl':
                    pos.x = (page.x - tip.x) - o.x;
                    pos.y = (page.y - tip.y) - (ah + o.y);
                    break;
                case 'tr':
                    pos.x = page.x + o.x;
                    pos.y = (page.y - tip.y) - (ah + o.y);
                    break;
                case 'tc':
                    pos.x = (page.x - Math.round((tip.x / 2))) + o.x;
                    pos.y = (page.y - tip.y) - (ah + o.y);
                    break;
                case 'bl':
                    pos.x = (page.x - tip.x) - o.x;
                    pos.y = (page.y + Math.round((tip.y / 2))) - (ah + o.y);
                    break;
                case 'br':
                    pos.x = page.x + o.x;
                    pos.y = page.y + o.y;
                    break;
                case 'bc':
                    pos.x = (page.x - (tip.x / 2)) + o.x;
                    pos.y = page.y + ah + o.y;
                    break
            }
            JCEMediaBox.DOM.styles(this.toolTip, {
                top: pos.y,
                left: pos.x
            })
        },
        position: function(element) {}
    }, JCEMediaBox.Popup = {
        addons: {
            'flash': {},
            'image': {},
            'html': {}
        },
        setAddons: function(n, o) {
            JCEMediaBox.extend(this.addons[n], o)
        },
        getAddons: function(n) {
            if (n) {
                return this.addons[n]
            }
            return this.addons
        },
        getAddon: function(v, n) {
            var t = this,
                cp = false,
                r, each = JCEMediaBox.each;
            addons = this.getAddons(n);
            each(this.addons, function(o, s) {
                each(o, function(fn) {
                    r = fn.call(this, v);
                    if (typeof r != 'undefined') {
                        cp = r
                    }
                })
            });
            return cp
        },
        cleanEvent: function(s) {
            return s.replace(/^function\s+anonymous\(\)\s+\{\s+(.*)\s+\}$/, '$1')
        },
        params: function(s) {
            var a = [],
                x = [];
            if (s instanceof Array) {
                x = s
            } else {
                if (s.indexOf('&') != -1) {
                    x = s.split(/&(amp;)?/g)
                } else {
                    x = s.split(/;/g)
                }
            }
            JCEMediaBox.each(x, function(n, i) {
                if (n) {
                    n = n.replace(/^([^\[]+)(\[|=|:)([^\]]*)(\]?)$/, function(a, b, c, d) {
                        if (d) {
                            if (!/[^0-9]/.test(d)) {
                                return '"' + b + '":' + parseInt(d)
                            }
                            return '"' + b + '":"' + d + '"'
                        }
                        return ''
                    });
                    if (n) {
                        a.push(n)
                    }
                }
            });
            return eval('({' + a.join(',') + '})')
        },
        getCookie: function(n) {
            var c = document.cookie,
                e, p = n + "=",
                b;
            if (!c) return;
            b = c.indexOf("; " + p);
            if (b == -1) {
                b = c.indexOf(p);
                if (b != 0) return null
            } else {
                b += 2
            }
            e = c.indexOf(";", b);
            if (e == -1) e = c.length;
            return unescape(c.substring(b + p.length, e))
        },
        setCookie: function(n, v, e, p, d, s) {
            document.cookie = n + "=" + escape(v) + ((e) ? "; expires=" + e.toGMTString() : "") + ((p) ? "; path=" + escape(p) : "") + ((d) ? "; domain=" + d : "") + ((s) ? "; secure" : "")
        },
        convertLegacy: function() {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM;
            each(DOM.select('a[href]'), function(el) {
                if (/com_jce/.test(el.href)) {
                    var p, s, r = [];
                    var oc = DOM.attribute('onclick');
                    s = oc.replace(/&amp;/g, '&').replace(/&#39;/g, "'").split("'");
                    p = t.params(s[0]);
                    img = p['img'] || '';
                    title = p['title'] || '';
                    if (img) {
                        if (!/http:\/\//.test(img)) {
                            if (img.charAt(0) == '/') {
                                img = img.substr(1)
                            }
                            img = t.site.replace(/http:\/\/([^\/]+)/, '') + img
                        }
                        DOM.attributes(el, {
                            'href': img,
                            'title': title.replace(/_/, ' '),
                            'onclick': ''
                        });
                        DOM.addClass(el, 'jcepopup')
                    }
                }
            })
        },
        convertLightbox: function() {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM;
            each(DOM.select('a[rel*=lightbox]'), function(el) {
                DOM.addClass(el, 'jcepopup');
                r = el.rel.replace(/lightbox\[?([^\]]*)\]?/, function(a, b) {
                    if (b) {
                        return 'group[' + b + ']'
                    }
                    return ''
                });
                DOM.attribute(el, 'rel', r)
            })
        },
        convertShadowbox: function() {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM;
            each(DOM.select('a[rel*=shadowbox]'), function(el) {
                DOM.addClass(el, 'jcepopup');
                r = el.rel.replace(/shadowbox\[?([^\]]*)\]?/, function(a, b) {
                    var attribs = '',
                        group = '';
                    if (b) {
                        group = 'group[' + b + ']'
                    }
                    if (/;=/.test(a)) {
                        attribs = a.replace(/=([^;"]+)/g, function(x, z) {
                            return '[' + z + ']'
                        })
                    }
                    if (group && attribs) {
                        return group + ';' + attribs
                    }
                    return group || attribs || ''
                });
                DOM.attribute(el, 'rel', r)
            })
        },
        translate: function(s) {
            var t = this;
            if (!s) {
                s = this.popup.theme
            }
            s = s.replace(/\{#(\w+?)\}/g, function(a, b) {
                return JCEMediaBox.options.popup.labels[b]
            });
            return s
        },
        styles: function(o) {
            var v, s, x = [];
            if (!o) return {};
            JCEMediaBox.each(o.split(';'), function(s, i) {
                s = s.replace(/(.*):(.*)/, function(a, b, c) {
                    return "'" + b + "':'" + c + "'"
                });
                x.push(s)
            });
            return eval('({' + x.join(',') + '})')
        },
        getType: function(el) {
            var o = {},
                type;
            if (/(director|windowsmedia|mplayer|quicktime|real|divx|flash)/.test(el.type)) {
                type = /(director|windowsmedia|mplayer|quicktime|real|divx|flash)/.exec(el.type)[1]
            }
            o = this.getAddon(el.src);
            if (o && o.type) {
                type = o.type
            }
            return type || el.type || 'iframe'
        },
        mediatype: function(c) {
            var ci, cb, mt;
            c = /(director|windowsmedia|mplayer|quicktime|real|divx|flash)/.exec(c);
            switch (c[1]) {
                case 'director':
                case 'application/x-director':
                    ci = '166b1bca-3f9c-11cf-8075-444553540000';
                    cb = 'http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0';
                    mt = 'application/x-director';
                    break;
                case 'windowsmedia':
                case 'mplayer':
                case 'application/x-mplayer2':
                    ci = '6bf52a52-394a-11d3-b153-00c04f79faa6';
                    cb = 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701';
                    mt = 'application/x-mplayer2';
                    break;
                case 'quicktime':
                case 'video/quicktime':
                    ci = '02bf25d5-8c17-4b23-bc80-d3488abddc6b';
                    cb = 'http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0';
                    mt = 'video/quicktime';
                    break;
                case 'real':
                case 'realaudio':
                case 'audio/x-pn-realaudio-plugin':
                    ci = 'cfcdaa03-8be4-11cf-b84b-0020afbbccfa';
                    cb = '';
                    mt = 'audio/x-pn-realaudio-plugin';
                    break;
                case 'divx':
                case 'video/divx':
                    ci = '67dabfbf-d0ab-41fa-9c46-cc0f21721616';
                    cb = 'http://go.divx.com/plugin/DivXBrowserPlugin.cab';
                    mt = 'video/divx';
                    break;
                default:
                case 'flash':
                case 'application/x-shockwave-flash':
                    ci = 'd27cdb6e-ae6d-11cf-96b8-444553540000';
                    cb = 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,124,0';
                    mt = 'application/x-shockwave-flash';
                    break
            }
            return {
                'classid': ci,
                'codebase': cb,
                'mediatype': mt
            }
        },
        islocal: function(s) {
            if (/^(\w+):\/\//.test(s)) {
                return new RegExp('^(' + JCEMediaBox.site + ')').test(s)
            } else {
                return true
            }
        },
        frameWidth: function() {
            var t = this,
                w = 0,
                el = this.frame;
            JCEMediaBox.each(['left', 'right'], function(s) {
                w = w + parseFloat(JCEMediaBox.DOM.style(el, 'padding-' + s))
            });
            return parseFloat(this.frame.clientWidth - w)
        },
        frameHeight: function() {
            var t = this,
                h = 0,
                el = this.frame,
                DIM = JCEMediaBox.Dimensions;
            JCEMediaBox.each(['top', 'bottom'], function(s) {
                h = h + parseFloat(JCEMediaBox.DOM.style(el, 'padding-' + s))
            });
            h = h + ((JCEMediaBox.isIE6 || JCEMediaBox.isIE7) ? DIM.getScrollbarWidth() : 0);
            return parseInt(DIM.getHeight()) - h
        },
        width: function() {
            return this.frameWidth() - JCEMediaBox.Dimensions.getScrollbarWidth()
        },
        height: function() {
            var h = 0,
                t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                DIM = JCEMediaBox.Dimensions;
            each(['top', 'bottom'], function(s) {
                var el = t['info-' + s];
                if (el) {
                    h = h + parseInt(DIM.outerHeight(el))
                }
            });
            return this.frameHeight() - h
        },
        printPage: function() {
            return false
        },
        zoom: function(el) {
            var t = this,
                DOM = JCEMediaBox.DOM,
                extend = JCEMediaBox.extend,
                each = JCEMediaBox.each,
                s, m, x, y;
            var child = el.firstChild;
            var zoom = DOM.create('span');
            if (child && child.nodeName == 'IMG') {
                var align = child.getAttribute('align');
                var vspace = child.getAttribute('vspace');
                var hspace = child.getAttribute('hspace');
                var w = child.getAttribute('width') || DOM.style(child, 'width') || 0;
                var h = child.getAttribute('height') || DOM.style(child, 'height') || 0;
                var styles = {
                    'width': parseInt(w),
                    'height': parseInt(h)
                };
                each(['top', 'right', 'bottom', 'left'], function(pos) {
                    styles['margin-' + pos] = DOM.style(child, 'margin-' + pos);
                    styles['padding-' + pos] = DOM.style(child, 'padding-' + pos);
                    each(['width', 'style', 'color'], function(prop) {
                        styles['border-' + pos + '-' + prop] = DOM.style(child, 'border-' + pos + '-' + prop)
                    })
                });
                if (/\w+/.test(align)) {
                    extend(styles, {
                        'float': /left|right/.test(align) ? align : '',
                        'text-align': /top|middle|bottom/.test(align) ? align : ''
                    })
                }
                if (vspace > 0) {
                    extend(styles, {
                        'margin-top': parseInt(vspace),
                        'margin-bottom': parseInt(vspace)
                    })
                }
                if (hspace > 0) {
                    extend(styles, {
                        'margin-left': parseInt(hspace),
                        'margin-right': parseInt(hspace)
                    })
                }
                extend(styles, {
                    'float': DOM.style(child, 'float'),
                    'text-align': child.style.textAlign
                });

                function _buildIcon(el, zoom, child, styles) {
                    var pos, w = styles.width || 0,
                        h = styles.height || 0;
                    var span = DOM.add(el, 'span', {
                        'class': 'jcemediabox-zoom-span',
                        'style': child.style.cssText
                    });
                    DOM.styles(span, styles);
                    DOM.add(span, child);
                    DOM.add(span, zoom);
                    each(['style', 'align', 'border', 'hspace', 'vspace'], function(v, i) {
                        child.removeAttribute(v)
                    });
                    DOM.addClass(zoom, 'jcemediabox-zoom-image');
                    pos = el.className.match(/icon-(top-right|top-left|bottom-right|bottom-left|left|right|center|centre)/);
                    if (pos) {
                        pos = pos[1];
                        pos = (/^(left|right)/.test(pos)) ? 'bottom ' + pos : pos.replace(/-/, ' ')
                    } else {
                        pos = 'bottom right'
                    }
                    var top = -h,
                        left = 0;
                    if (JCEMediaBox.isIE6 && /\.png/i.test(DOM.style(zoom, 'background-image'))) {
                        var zw = parseFloat(DOM.style(zoom, 'width'));
                        var zh = parseFloat(DOM.style(zoom, 'height'));
                        if (/(bottom)/.test(pos)) top = -zh;
                        if (/(right)/.test(pos)) left = w - zw;
                        DOM.style(zoom, 'left', left);
                        DOM.style(el, 'position', 'static');
                        DOM.png(zoom)
                    }
                    DOM.styles(zoom, {
                        'top': top,
                        'background-position': pos
                    });
                    DOM.styles(child, {
                        'margin': 0,
                        'padding': 0,
                        'float': 'none',
                        'border': 'none'
                    })
                }
                if (/^(0|auto)/.test(w) || /^(0|auto)/.test(h)) {
                    x = new Image();
                    x.src = child.src;
                    x.onload = function() {
                        extend(styles, {
                            width: parseInt(x.width),
                            height: parseInt(x.height)
                        });
                        _buildIcon(el, zoom, child, styles)
                    }
                } else {
                    _buildIcon(el, zoom, child, styles)
                }
            } else {
                DOM.addClass(zoom, 'jcemediabox-zoom-link');
                if (DOM.hasClass(el, 'icon-left')) {
                    DOM.addBefore(el, zoom)
                } else {
                    DOM.add(el, zoom)
                }
                if (JCEMediaBox.isIE7) {
                    DOM.style(zoom, 'display', 'inline-block')
                }
            }
            return zoom
        },
        auto: function() {
            var t = this;
            JCEMediaBox.each(this.popups, function(el, i) {
                if (el.auto) {
                    if (el.auto == 'autopopup-single') {
                        var cookie = t.getCookie('jceutilities_autopopup_' + el.id);
                        if (!cookie) {
                            t.setCookie('jceutilities_autopopup_' + el.id, 1);
                            t.start(el)
                        }
                    } else if (el.auto == 'autopopup-multiple') {
                        t.start(el)
                    }
                }
            })
        },
        init: function() {
            window.jcepopup = this;
            this.create()
        },
        getPopups: function(s, p) {
            var selector = 'a.jcebox, a.jcelightbox, a.jcepopup, area.jcebox, area.jcelightbox, area.jcepopup';
            return JCEMediaBox.DOM.select(s || selector, p)
        },
        process: function(el) {
            var DOM = JCEMediaBox.DOM,
                o = {},
                p = {},
                group, auto;
            if (/(jcelightbox|jcebox)/.test(el.className)) {
                DOM.removeClass(el, 'jcelightbox');
                DOM.removeClass(el, 'jcebox');
                DOM.addClass(el, 'jcepopup')
            }
            if (JCEMediaBox.options.popup.icons == 1 && el.nodeName == 'A' && !/(noicon|icon-none|noshow)/.test(el.className) && el.style.display != 'none') {
                var zoom = this.zoom(el)
            }
            if (DOM.hasClass(el, 'noshow')) {
                DOM.hide(el)
            }
            var title = el.title || '';
            var rel = el.rel || '';
            if (title && /(\w+\[.*\])/.test(title)) {
                p = this.params(title);
                DOM.attribute(el, 'title', p.title || '');
                group = p.group || ''
            }
            if (rel && /(\w+\[.*\])/.test(rel)) {
                var args = [];
                rel = rel.replace(/\b((\w+)\[(.*?)\])(;?)/g, function(a, b, c) {
                    args.push(b);
                    return ''
                });
                p = this.params(args);
                DOM.attribute(el, 'rel', rel || p.rel || '');
                group = p.group || ''
            } else {
                var rx = 'alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|licence|tag|friend';
                var lb = '(lightbox(\[(.*?)\])?)';
                var lt = '(lyte(box|frame|show)(\[(.*?)\])?)';
                group = JCEMediaBox.trim(rel.replace(new RegExp('\s*(' + rx + '|' + lb + '|' + lt + ')\s*'), '', 'gi'))
            }
            var src = el.href;
            src = src.replace(/b(w|h)=([0-9]+)/g, function(s, k, v) {
                k = (k == 'w') ? 'width' : 'height';
                return k + '=' + v
            });
            if (el.nodeName == 'AREA') {
                if (!p) {
                    p = this.params(src)
                }
                group = group || 'AREA_ELEMENT'
            }
            if (el.id) {
                auto = el.className.match(/autopopup-(single|multiple)/)[0] || false
            }
            JCEMediaBox.extend(o, {
                'src': src,
                'title': p.title || title,
                'group': DOM.hasClass(el, 'nogroup') ? '' : group,
                'type': p.type || el.type || '',
                'params': p || {},
                'id': el.id || '',
                'auto': auto
            });
            el.href = el.href.replace(/&type=(ajax|text\/html|text\/xml)/, '');
            return o
        },
        create: function(elements) {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                Event = JCEMediaBox.Event,
                pageload, auto = false;
            if (!elements) {
                pageload = true;
                this.popups = [];
                if (JCEMediaBox.options.popup.legacy == 1) {
                    t.convertLegacy()
                }
                if (JCEMediaBox.options.popup.lightbox == 1) {
                    t.convertLightbox()
                }
                if (JCEMediaBox.options.popup.shadowbox == 1) {
                    t.convertShadowbox()
                }
            }
            elements = elements || this.getPopups();
            each(elements, function(el, i) {
                var o = t.process(el);
                t.popups.push(o);
                if (!pageload) {
                    i = t.popups.length - 1
                }
                Event.add(el, 'click', function(e) {
                    Event.cancel(e);
                    return t.start(o, i)
                })
            });
            if (pageload) {
                this.popuptheme = '';
                var theme = JCEMediaBox.options.theme == 'custom' ? JCEMediaBox.options.themecustom : JCEMediaBox.options.theme;
                new JCEMediaBox.XHR({
                    success: function(text, xml) {
                        var re = /<!-- THEME START -->([\s\S]*?)<!-- THEME END -->/;
                        if (re.test(text)) {
                            text = re.exec(text)[1]
                        }
                        t.popuptheme = text;
                        if (!auto) {
                            t.auto();
                            auto = true
                        }
                    }
                }).send('./idtLib/popup.html')
                    // .send(JCEMediaBox.site + JCEMediaBox.options.themepath + '/' + theme + '/popup.html')
            }
        },
        open: function(url, title, group, type, params) {
            var link = {
                'src': url,
                'title': title,
                'group': group,
                'type': type,
                'params': params
            };
            return this.start(link)
        },
        start: function(p, i) {
            var t = this,
                n = 0,
                x = 0,
                items = [],
                each = JCEMediaBox.each;
            if (this.build()) {
                if (p.group) {
                    each(this.popups, function(o, x) {
                        if (o.group == p.group) {
                            items.push(o);
                            if (i && x == i) {
                                n = items.indexOf(o)
                            }
                        }
                    });
                    if (!p.auto && typeof i == 'undefined') {
                        items.push(p);
                        n = items.length - 1
                    }
                } else {
                    items.push(p)
                }
                return this.show(items, n)
            }
        },
        build: function() {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                Event = JCEMediaBox.Event;
            if (!this.page) {
                this.page = DOM.add(document.body, 'div', {
                    id: 'jcemediabox-popup-page'
                });
                if (JCEMediaBox.options.popup.overlay == 1) {
                    this.overlay = DOM.add(this.page, 'div', {
                        id: 'jcemediabox-popup-overlay',
                        style: {
                            'opacity': 0,
                            'background-color': JCEMediaBox.options.popup.overlaycolor
                        }
                    })
                }
                if (!this.popuptheme) {
                    return false
                }
                this.popuptheme = this.popuptheme.replace(/<!--(.*?)-->/g, '');
                this.popuptheme = this.translate(this.popuptheme);
                this.frame = DOM.add(this.page, 'div', {
                    id: 'jcemediabox-popup-frame'
                }, '<div id="jcemediabox-popup-body">' + this.popuptheme + '</div>');
                each(DOM.select('*[id]', this.frame), function(el) {
                    var s = el.id.replace('jcemediabox-popup-', '');
                    t[s] = el;
                    DOM.hide(el)
                });
                if (JCEMediaBox.options.popup.close == 2) {
                    Event.add(this.frame, 'click', function(e) {
                        if (e.target && e.target == t.frame) {
                            t.close()
                        }
                    })
                }
                if (this.closelink) {
                    Event.add(this.closelink, 'click', function() {
                        return t.close()
                    })
                }
                if (this.cancellink) {
                    Event.add(this.cancellink, 'click', function() {
                        return t.close()
                    })
                }
                if (this.next) {
                    Event.add(this.next, 'click', function() {
                        return t.nextItem()
                    })
                }
                if (this.prev) {
                    Event.add(this.prev, 'click', function() {
                        return t.previousItem()
                    })
                }
                if (this.numbers) {
                    this.numbers.tmpHTML = this.numbers.innerHTML
                }
                if (this.print) {
                    Event.add(this.print, 'click', function() {
                        return t.printPage()
                    })
                }
                if (JCEMediaBox.isIE6) {
                    DOM.png(this.body);
                    each(DOM.select('*', this.body), function(el) {
                        if (DOM.attribute(el, 'id') == 'jcemediabox-popup-content') {
                            return
                        }
                        DOM.png(el)
                    })
                }
            }
            return true
        },
        show: function(items, n) {
            var t = this,
                DOM = JCEMediaBox.DOM,
                DIM = JCEMediaBox.Dimensions;
            this.items = items;
            this.bind(true);
            DOM.show(this.body);
            var top = (DIM.getHeight() - DIM.outerHeight(this.body)) / 2;
            DOM.style(this.body, 'top', top);
            if (JCEMediaBox.isIE6 || JCEMediaBox.options.popup.scrolling == 'scroll') {
                DOM.style(this.page, 'position', 'absolute');
                DOM.style(this.overlay, 'height', DIM.getScrollHeight());
                DOM.style(this.body, 'top', DIM.getScrollTop() + top)
            }
            if (JCEMediaBox.options.popup.overlay == 1 && this.overlay) {
                DOM.show(this.overlay);
                JCEMediaBox.FX.animate(this.overlay, {
                    'opacity': JCEMediaBox.options.popup.overlayopacity
                }, JCEMediaBox.options.popup.fadespeed)
            }
            return this.change(n)
        },
        bind: function(open) {
            var t = this,
                isIE6 = JCEMediaBox.isIE6,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                Event = JCEMediaBox.Event;
            if (isIE6) {
                each(DOM.select('select'), function(el) {
                    if (open) {
                        el.tmpStyle = el.style.visibility || ''
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle
                })
            }
            if (JCEMediaBox.options.popup.hideobjects) {
                each(DOM.select('object, embed'), function(el) {
                    if (el.id == 'jcemediabox-popup-object') return;
                    if (open) {
                        el.tmpStyle = el.style.visibility || ''
                    }
                    el.style.visibility = open ? 'hidden' : el.tmpStyle
                })
            }
            var scroll = JCEMediaBox.options.popup.scrollpopup;
            if (open) {
                Event.add(document, 'keydown', function(e) {
                    t.listener(e)
                });
                if (isIE6) {
                    Event.add(window, 'scroll', function(e) {
                        DOM.style(t.overlay, 'height', JCEMediaBox.Dimensions.getScrollHeight())
                    });
                    Event.add(window, 'scroll', function(e) {
                        DOM.style(t.overlay, 'width', JCEMediaBox.Dimensions.getScrollWidth())
                    })
                }
            } else {
                if (isIE6 || !scroll) {
                    Event.remove(window, 'scroll');
                    Event.remove(window, 'resize')
                }
                Event.remove(document, 'keydown')
            }
        },
        listener: function(e) {
            switch (e.keyCode) {
                case 27:
                    this.close();
                    break;
                case 37:
                    this.previousItem();
                    break;
                case 39:
                    this.nextItem();
                    break
            }
        },
        queue: function(n) {
            var t = this,
                s = JCEMediaBox.options.popup.fadespeed,
                ss = JCEMediaBox.options.popup.scalespeed;
            var changed = false;
            JCEMediaBox.each(['top', 'bottom'], function(s) {
                var el = t['info-' + s];
                if (el) {
                    var v = JCEMediaBox.Dimensions.outerHeight(el);
                    var style = {};
                    style['top'] = s == 'top' ? v : -v;
                    JCEMediaBox.DOM.style(el, 'z-index', -1);
                    JCEMediaBox.FX.animate(el, style, ss, function() {
                        if (!changed) {
                            changed = true;
                            JCEMediaBox.FX.animate(t.content, {
                                'opacity': 0
                            }, JCEMediaBox.options.popup.fadespeed, function() {
                                return t.change(n)
                            })
                        }
                    })
                }
            })
        },
        nextItem: function() {
            if (this.items.length == 1) return false;
            var n = this.index + 1;
            if (n < 0 || n >= this.items.length) {
                return false
            }
            return this.queue(n)
        },
        previousItem: function() {
            if (this.items.length == 1) return false;
            var n = this.index - 1;
            if (n < 0 || n >= this.items.length) {
                return false
            }
            return this.queue(n)
        },
        info: function() {
            var each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                Event = JCEMediaBox.Event;
            if (this.caption) {
                var title = this.active.caption || this.active.title || '',
                    text = '';
                var ex = '([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)';
                var ux = '((news|telnet|nttp|file|http|ftp|https)://[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+)';

                function processRe(h) {
                    h = h.replace(new RegExp(ex, 'g'), '<a href="mailto:$1" target="_blank" title="$1">$1</a>');
                    h = h.replace(new RegExp(ux, 'g'), '<a href="$1" target="_blank" title="$1">$1</a>');
                    return h
                }
                if (/::/.test(title)) {
                    var parts = title.split('::');
                    title = JCEMediaBox.trim(parts[0]);
                    text = JCEMediaBox.trim(parts[1])
                }
                var h = '';
                if (title) {
                    h += '<h4>' + title + '</h4>'
                }
                if (text) {
                    h += '<p>' + text + '</p>'
                }
                this.caption.innerHTML = h || '&nbsp;';
                each(DOM.select('*', this.caption), function(el) {
                    if (el.nodeName != 'A') {
                        each(el.childNodes, function(n, i) {
                            if (n.nodeType == 3) {
                                var s = n.innerText || n.textContent || n.data || null;
                                if (s && /(@|:\/\/)/.test(s)) {
                                    if (s = processRe(s)) {
                                        n.parentNode.innerHTML = s
                                    }
                                }
                            }
                        })
                    }
                })
            }
            var t = this,
                html = '',
                len = this.items.length;
            if (this.numbers && len > 1) {
                var html = this.numbers.tmpHTML || '{$numbers}';
                if (/\{\$numbers\}/.test(html)) {
                    this.numbers.innerHTML = '';
                    for (var i = 0; i < len; i++) {
                        var n = i + 1;
                        var link = DOM.add(this.numbers, 'a', {
                            'href': 'javascript:;',
                            'title': this.items[i].title || n,
                            'class': (this.index == i) ? 'active' : ''
                        }, n);
                        Event.add(link, 'click', function(e) {
                            var x = parseInt(e.target.innerHTML) - 1;
                            if (t.index == x) {
                                return false
                            }
                            return t.queue(x)
                        })
                    }
                }
                if (/\{\$(current|total)\}/.test(html)) {
                    this.numbers.innerHTML = html.replace('{$current}', this.index + 1).replace('{$total}', len)
                }
            } else {
                this.numbers.innerHTML = ''
            }
            each(['top', 'bottom'], function(v, i) {
                var el = t['info-' + v];
                if (el) {
                    el.style.visibility = 'hidden';
                    DOM.show(el);
                    each(DOM.select('*[id]', el), function(s) {
                        DOM.show(s)
                    })
                }
            });
            DOM.hide(this.next);
            DOM.hide(this.prev);
            if (len > 1) {
                if (this.prev) {
                    if (this.index > 0) {
                        DOM.show(this.prev)
                    } else {
                        DOM.hide(this.prev)
                    }
                }
                if (this.next) {
                    if (this.index < len - 1) {
                        DOM.show(this.next)
                    } else {
                        DOM.hide(this.next)
                    }
                }
            }
        },
        change: function(n) {
            var t = this,
                extend = JCEMediaBox.extend,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                Event = JCEMediaBox.Event,
                isIE = JCEMediaBox.isIE;
            var p = {},
                s, o, w, h;
            if (n < 0 || n >= this.items.length) {
                return false
            }
            this.index = n;
            this.active = {};
            DOM.show(this.container);
            if (this.loader) {
                DOM.show(this.loader)
            }
            if (this.cancellink) {
                DOM.show(this.cancellink)
            }
            if (this.object) {
                this.object = null
            }
            this.content.innerHTML = '';
            o = this.items[n];
            extend(p, this.getAddon(o.src, o.type));
            extend(p, o.params);
            extend(this.active, {
                'src': p.src || o.src,
                'title': o.title,
                'caption': p.caption || '',
                'type': p.type || this.getType(o),
                'params': p || {},
                'width': p.width || JCEMediaBox.options.popup.width || 0,
                'height': p.height || JCEMediaBox.options.popup.height || 0
            });
            this.info();
            switch (this.active.type) {
                case 'image':
                    if (this.print && this.options.print) {
                        this.print.style.visibility = 'visible'
                    }
                    this.img = new Image();
                    this.img.onload = function() {
                        return t.setup()
                    };
                    this.img.src = this.active.src;
                    break;
                case 'flash':
                case 'director':
                case 'shockwave':
                case 'mplayer':
                case 'windowsmedia':
                case 'quicktime':
                case 'realaudio':
                case 'real':
                case 'divx':
                    if (this.print) {
                        this.print.style.visibility = 'hidden'
                    }
                    p.src = this.active.src;
                    var base = /:\/\//.test(p.src) ? '' : this.site;
                    this.object = '';
                    w = this.width();
                    h = this.height();
                    var mt = this.mediatype(this.active.type);
                    if (this.active.type == 'flash') {
                        p.wmode = 'transparent';
                        p.base = base
                    }
                    if (/(mplayer|windowsmedia)/i.test(this.active.type)) {
                        p.baseurl = base;
                        if (isIE) {
                            p.url = p.src;
                            delete p.src
                        }
                    }
                    delete p.title;
                    delete p.group;
                    p.width = this.active.width = p.width || w;
                    p.height = this.active.height = p.height || h;
                    var flash = /flash/i.test(this.active.type);
                    if (flash || isIE) {
                        this.object = '<object id="jcemediabox-popup-object"';
                        if (flash && !isIE) {
                            this.object += ' type="' + mt.mediatype + '" data="' + p.src + '"'
                        } else {
                            this.object += ' classid="clsid:' + mt.classid + '"';
                            if (mt.codebase) {
                                this.object += ' codebase="' + mt.codebase + '"'
                            }
                        }
                        for (n in p) {
                            if (p[n] !== '') {
                                if (/(id|name|width|height|style)$/.test(n)) {
                                    t.object += ' ' + n + '="' + decodeURIComponent(p[n]) + '"'
                                }
                            }
                        }
                        this.object += '>';
                        for (n in p) {
                            if (p[n] !== '' && !/(id|name|width|height|style|type)/.test(n)) {
                                t.object += '<param name="' + n + '" value="' + decodeURIComponent(p[n]) + '" />'
                            }
                        }
                        this.object += '</object>'
                    } else {
                        this.object = '<embed type="' + mt.mediatype + '"';
                        for (n in p) {
                            if (p[n] !== '') {
                                t.object += ' ' + n + '="' + decodeURIComponent(p[n]) + '"'
                            }
                        }
                        this.object += '></embed>'
                    }
                    this.active.type = 'media';
                    this.setup();
                    break;
                case 'ajax':
                case 'text/html':
                case 'text/xml':
                    if (this.print && this.options.print) {
                        this.print.style.visibility = 'visible'
                    }
                    this.active.width = this.active.width || this.width();
                    this.active.height = this.active.height || this.height();
                    if (this.islocal(this.active.src)) {
                        if (!/tmpl=component/i.test(this.active.src)) {
                            this.active.src += /\?/.test(this.active.src) ? '&tmpl=component' : '?tmpl=component'
                        }
                        this.active.type = 'ajax'
                    } else {
                        this.active.type = 'iframe';
                        this.setup()
                    }
                    styles = extend(this.styles(p.styles), {
                        display: 'none'
                    });
                    this.ajax = DOM.add(this.content, 'div', {
                        id: 'jcemediabox-popup-ajax',
                        'style': styles
                    });
                    if (JCEMediaBox.isIE6) {
                        DOM.style(this.ajax, 'margin-right', JCEMediaBox.Dimensions.getScrollbarWidth())
                    }
                    if (JCEMediaBox.isIE7) {
                        DOM.style(this.ajax, 'padding-right', JCEMediaBox.Dimensions.getScrollbarWidth())
                    }
                    this.active.src = this.active.src.replace(/\&type=(ajax|text\/html|text\/xml)/, '');
                    new JCEMediaBox.XHR({
                        success: function(text, xml) {
                            var data = text,
                                html = data,
                                re = /<body[^>]*>([\s\S]*?)<\/body>/;
                            if (re.test(data)) {
                                html = re.exec(data)[1]
                            }
                            t.ajax.innerHTML = html;
                            if (t.loader) {
                                DOM.show(t.loader)
                            }
                            t.create(t.getPopups('', t.content));
                            each(DOM.select('a, area', t.content), function(el) {
                                JCEMediaBox.Event.add(el, 'click', function(e) {
                                    if (el.href && el.href.indexOf('#') == -1) {
                                        if (/jce(popup|box|lightbox)/.test(el.className)) {
                                            Event.cancel(e);
                                            t.close(true)
                                        } else {
                                            t.close()
                                        }
                                    }
                                })
                            });
                            return t.setup()
                        }
                    }).send(this.active.src);
                    break;
                case 'iframe':
                default:
                    if (this.print) {
                        this.print.style.visibility = 'hidden'
                    }
                    if (this.islocal(this.active.src)) {
                        if (!/tmpl=component/i.test(this.active.src)) {
                            this.active.src += /\?/.test(this.active.src) ? '&tmpl=component' : '?tmpl=component'
                        }
                    }
                    this.active.width = this.active.width || this.width();
                    this.active.height = this.active.height || this.height();
                    this.active.type = 'iframe';
                    this.setup();
                    break
            }
            return false
        },
        resize: function(w, h, x, y) {
            if (w > x) {
                h = h * (x / w);
                w = x;
                if (h > y) {
                    w = w * (y / h);
                    h = y
                }
            } else if (h > y) {
                w = w * (y / h);
                h = y;
                if (w > x) {
                    h = h * (x / w);
                    w = x
                }
            }
            w = Math.round(w);
            h = Math.round(h);
            return {
                width: Math.round(w),
                height: Math.round(h)
            }
        },
        setup: function() {
            var t = this,
                DOM = JCEMediaBox.DOM,
                Event = JCEMediaBox.Event,
                w, h;
            w = this.active.width;
            h = this.active.height;
            if (this.active.type == 'image') {
                var x = this.img.width;
                var y = this.img.height;
                w = w || x;
                h = h || y;
                if (w != x || h != y) {
                    var dim = this.resize(x, y, w, h);
                    w = dim.width;
                    h = dim.height
                }
            }
            if (JCEMediaBox.options.popup.resize == 1 || JCEMediaBox.options.popup.scrolling == 'fixed') {
                var x = this.width();
                var y = this.height();
                var dim = this.resize(w, h, x, y);
                w = dim.width;
                h = dim.height
            }
            DOM.styles(this.content, {
                width: w,
                height: h
            });
            DOM.hide(this.content);
            if (this.active.type == 'image') {
                this.content.innerHTML = '<img id="jcemediabox-popup-img" src="' + this.active.src + '" title="' + this.active.title + '" width="' + w + '" height="' + h + '" />'
            }
            return this.animate()
        },
        animate: function() {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM,
                FX = JCEMediaBox.FX,
                DIM = JCEMediaBox.Dimensions;
            var ss = JCEMediaBox.options.popup.scalespeed,
                fs = JCEMediaBox.options.popup.fadespeed;
            var cw = DIM.outerWidth(this.content);
            var ch = DIM.outerHeight(this.content);
            var ih = 0;
            each(['top', 'bottom'], function(v, i) {
                var el = t['info-' + v];
                if (el) {
                    ih = ih + DIM.outerHeight(el)
                }
            });
            var st = DOM.style(this.page, 'position') == 'fixed' ? 0 : DIM.getScrollTop();
            var top = st + (this.frameHeight() / 2) - ((ch + ih) / 2);
            DOM.style(this.content, 'opacity', 0);
            FX.animate(this.body, {
                'height': ch,
                'top': top,
                'width': cw
            }, ss, function() {
                if (t.loader) {
                    DOM.hide(t.loader)
                }
                if (t.active.type == 'media' && t.object) {
                    t.content.innerHTML = t.object
                }
                DOM.show(t.content);
                if (t.active.type == 'ajax') {
                    DOM.show(t.ajax)
                }
                t.content.focus();
                if (t.active.type == 'iframe') {
                    t.iframe = DOM.add(t.content, 'iframe', {
                        id: 'jcemediabox-popup-iframe',
                        frameBorder: 0,
                        allowTransparency: true,
                        scrolling: t.active.params.scrolling || 'auto',
                        'style': {
                            width: t.active.width,
                            height: t.active.height
                        }
                    });
                    t.iframe.setAttribute('src', t.active.src)
                }

                function showInfo() {
                    var itop = t['info-top'];
                    if (itop) {
                        each(DOM.select('*[id]', itop), function(el) {
                            if (/jcemediabox-popup-(next|prev)/.test(DOM.attribute(el, 'id'))) {
                                return
                            }
                            DOM.show(el)
                        });
                        var h = DIM.outerHeight(itop);
                        DOM.styles(itop, {
                            'z-index': -1,
                            'top': h,
                            'visibility': 'visible'
                        });
                        FX.animate(itop, {
                            'top': 0
                        }, ss, function() {
                            itop.style.zIndex = 0
                        })
                    }
                    var ibottom = t['info-bottom'];
                    if (ibottom) {
                        each(DOM.select('*[id]', ibottom), function(el) {
                            if (/jcemediabox-popup-(next|prev)/.test(DOM.attribute(el, 'id'))) {
                                return
                            }
                            DOM.show(el)
                        });
                        var h = DIM.outerHeight(ibottom);
                        DOM.styles(ibottom, {
                            'z-index': -1,
                            'top': -h,
                            'visibility': 'visible'
                        });
                        FX.animate(ibottom, {
                            'top': 0
                        }, ss, function() {
                            ibottom.style.zIndex = 0
                        })
                    }
                    if (t.closelink) {
                        DOM.show(t.closelink)
                    }
                }
                if (t.active.type == 'image' && !JCEMediaBox.isIE6) {
                    FX.animate(t.content, {
                        'opacity': 1
                    }, fs, function() {
                        showInfo()
                    })
                } else {
                    DOM.style(t.content, 'opacity', 1);
                    showInfo()
                }
            })
        },
        close: function(keepopen) {
            var t = this,
                each = JCEMediaBox.each,
                DOM = JCEMediaBox.DOM;
            each(['img', 'object', 'iframe', 'ajax'], function(i, v) {
                t[v] = null
            });
            if (this.closelink) {
                DOM.hide(this.closelink)
            }
            this.content.innerHTML = '';
            each(['top', 'bottom'], function(i, v) {
                if (t['info-' + v]) {
                    DOM.hide(t['info-' + v])
                }
            });
            if (!keepopen) {
                var popups = this.getPopups();
                while (this.popups.length > popups.length) {
                    this.popups.pop()
                }
                DOM.remove(this.frame);
                if (this.overlay) {
                    if (JCEMediaBox.isIE6) {
                        this.bind();
                        DOM.remove(this.page)
                    } else {
                        JCEMediaBox.FX.animate(this.overlay, {
                            'opacity': 0
                        }, JCEMediaBox.options.popup.fadespeed, function() {
                            t.bind();
                            DOM.remove(t.page);
                            t.page = null
                        })
                    }
                } else {
                    DOM.remove(this.page);
                    t.page = null
                }
            }
            return false
        }
    }
})();
JCEMediaBox.Event.addUnload(function() {
    JCEMediaBox.Event.destroy()
});