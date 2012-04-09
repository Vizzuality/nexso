// Underscore.string
pi/ (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
// Underscore.strings is freely distributable under the terms of the MIT license.
// Documentation: https://github.com/epeli/underscore.string
// Some code is borrowed from MooTools and Alexandru Marasteanu.

// Version 2.0.0

(function(root){
  'use strict';

  // Defining helper functions.

  var nativeTrim = String.prototype.trim;
  var nativeTrimRight = String.prototype.trimRight;
  var nativeTrimLeft = String.prototype.trimLeft;

  var parseNumber = function(source) { return source * 1 || 0; };
  
  var strRepeat = function(str, qty, separator){
    str = ''+str; qty = ~~qty;
    for (var repeat = []; qty > 0; repeat[--qty] = str) {}
    return repeat.join(separator == null ? '' : separator);
  };

  var slice = function(a){
    return Array.prototype.slice.call(a);
  };

  var defaultToWhiteSpace = function(characters){
    if (characters != null) {
      return '[' + _s.escapeRegExp(''+characters) + ']';
    }
    return '\\s';
  };

  // sprintf() for JavaScript 0.7-beta1
  // http://www.diveintojavascript.com/projects/javascript-sprintf
  //
  // Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
  // All rights reserved.

  var sprintf = (function() {
    function get_type(variable) {
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    var str_repeat = strRepeat;

    var str_format = function() {
      if (!str_format.cache.hasOwnProperty(arguments[0])) {
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
      }
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    };

    str_format.format = function(parse_tree, argv) {
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {
        node_type = get_type(parse_tree[i]);
        if (node_type === 'string') {
          output.push(parse_tree[i]);
        }
        else if (node_type === 'array') {
          match = parse_tree[i]; // convenience purposes only
          if (match[2]) { // keyword argument
            arg = argv[cursor];
            for (k = 0; k < match[2].length; k++) {
              if (!arg.hasOwnProperty(match[2][k])) {
                throw new Error(sprintf('[_.sprintf] property "%s" does not exist', match[2][k]));
              }
              arg = arg[match[2][k]];
            }
          } else if (match[1]) { // positional argument (explicit)
            arg = argv[match[1]];
          }
          else { // positional argument (implicit)
            arg = argv[cursor++];
          }

          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
            throw new Error(sprintf('[_.sprintf] expecting number but found %s', get_type(arg)));
          }
          switch (match[8]) {
            case 'b': arg = arg.toString(2); break;
            case 'c': arg = String.fromCharCode(arg); break;
            case 'd': arg = parseInt(arg, 10); break;
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
            case 'o': arg = arg.toString(8); break;
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
            case 'u': arg = Math.abs(arg); break;
            case 'x': arg = arg.toString(16); break;
            case 'X': arg = arg.toString(16).toUpperCase(); break;
          }
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
          pad_length = match[6] - String(arg).length;
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';
          output.push(match[5] ? arg + pad : pad + arg);
        }
      }
      return output.join('');
    };

    str_format.cache = {};

    str_format.parse = function(fmt) {
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
      while (_fmt) {
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
          parse_tree.push(match[0]);
        }
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
          parse_tree.push('%');
        }
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {
            arg_names |= 1;
            var field_list = [], replacement_field = match[2], field_match = [];
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
              field_list.push(field_match[1]);
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else {
                  throw new Error('[_.sprintf] huh?');
                }
              }
            }
            else {
              throw new Error('[_.sprintf] huh?');
            }
            match[2] = field_list;
          }
          else {
            arg_names |= 2;
          }
          if (arg_names === 3) {
            throw new Error('[_.sprintf] mixing positional and named placeholders is not (yet) supported');
          }
          parse_tree.push(match);
        }
        else {
          throw new Error('[_.sprintf] huh?');
        }
        _fmt = _fmt.substring(match[0].length);
      }
      return parse_tree;
    };

    return str_format;
  })();



  // Defining underscore.string

  var _s = {

    VERSION: '2.0.0',

    isBlank: function(str){
      return (/^\s*$/).test(str);
    },

    stripTags: function(str){
      return (''+str).replace(/<\/?[^>]+>/ig, '');
    },

    capitalize : function(str) {
      str = ''+str;
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    },

    chop: function(str, step){
      str = str+'';
      step = ~~step || str.length;
      var arr = [];
      for (var i = 0; i < str.length;) {
        arr.push(str.slice(i,i + step));
        i = i + step;
      }
      return arr;
    },

    clean: function(str){
      return _s.strip((''+str).replace(/\s+/g, ' '));
    },

    count: function(str, substr){
      str = ''+str; substr = ''+substr;
      var count = 0, index;
      for (var i=0; i < str.length;) {
        index = str.indexOf(substr, i);
        index >= 0 && count++;
        i = i + (index >= 0 ? index : 0) + substr.length;
      }
      return count;
    },

    chars: function(str) {
      return (''+str).split('');
    },

    escapeHTML: function(str) {
      return (''+str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                            .replace(/"/g, '&quot;').replace(/'/g, "&apos;");
    },

    unescapeHTML: function(str) {
      return (''+str).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
    },

    escapeRegExp: function(str){
      // From MooTools core 1.2.4
      return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
    },

    insert: function(str, i, substr){
      var arr = (''+str).split('');
      arr.splice(~~i, 0, ''+substr);
      return arr.join('');
    },

    include: function(str, needle){
      return (''+str).indexOf(needle) !== -1;
    },

    join: function(sep) {
      var args = slice(arguments);
      return args.join(args.shift());
    },

    lines: function(str) {
      return (''+str).split("\n");
    },

    reverse: function(str){
        return Array.prototype.reverse.apply(String(str).split('')).join('');
    },

    splice: function(str, i, howmany, substr){
      var arr = (''+str).split('');
      arr.splice(~~i, ~~howmany, substr);
      return arr.join('');
    },

    startsWith: function(str, starts){
      str = ''+str; starts = ''+starts;
      return str.length >= starts.length && str.substring(0, starts.length) === starts;
    },

    endsWith: function(str, ends){
      str = ''+str; ends = ''+ends;
      return str.length >= ends.length && str.substring(str.length - ends.length) === ends;
    },

    succ: function(str){
      str = ''+str;
      var arr = str.split('');
      arr.splice(str.length-1, 1, String.fromCharCode(str.charCodeAt(str.length-1) + 1));
      return arr.join('');
    },

    titleize: function(str){
      return (''+str).replace(/\b./g, function(ch){ return ch.toUpperCase(); });
    },

    camelize: function(str){
      return _s.trim(str).replace(/(\-|_|\s)+(.)?/g, function(match, separator, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    },

    underscored: function(str){
      return _s.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
    },

    dasherize: function(str){
      return _s.trim(str).replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase();
    },

    humanize: function(str){
      return _s.capitalize(this.underscored(str).replace(/_id$/,'').replace(/_/g, ' '));
    },

    trim: function(str, characters){
      str = ''+str;
      if (!characters && nativeTrim) {
        return nativeTrim.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return str.replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');
    },

    ltrim: function(str, characters){
      if (!characters && nativeTrimLeft) {
        return nativeTrimLeft.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return (''+str).replace(new RegExp('\^' + characters + '+', 'g'), '');
    },

    rtrim: function(str, characters){
      if (!characters && nativeTrimRight) {
        return nativeTrimRight.call(str);
      }
      characters = defaultToWhiteSpace(characters);
      return (''+str).replace(new RegExp(characters + '+$', 'g'), '');
    },

    truncate: function(str, length, truncateStr){
      str = ''+str; truncateStr = truncateStr || '...';
      length = ~~length;
      return str.length > length ? str.slice(0, length) + truncateStr : str;
    },

    /**
     * _s.prune: a more elegant version of truncate
     * prune extra chars, never leaving a half-chopped word.
     * @author github.com/sergiokas
     */
    prune: function(str, length, pruneStr){
      str = ''+str; length = ~~length;
      pruneStr = pruneStr != null ? ''+pruneStr : '...';
      
      var pruned, borderChar, template = str.replace(/\W/g, function(ch){
        return (ch.toUpperCase() !== ch.toLowerCase()) ? 'A' : ' ';
      });
      
      borderChar = template[length];
      
      pruned = template.slice(0, length);
      
      // Check if we're in the middle of a word
      if (borderChar && borderChar.match(/\S/))
        pruned = pruned.replace(/\s\S+$/, '');
        
      pruned = _s.rtrim(pruned);
      
      return (pruned+pruneStr).length > str.length ? str : str.substring(0, pruned.length)+pruneStr;
    },

    words: function(str, delimiter) {
      return (''+str).split(delimiter || " ");
    },

    pad: function(str, length, padStr, type) {
      str = ''+str;
      
      var padding = '', padlen  = 0;

      length = ~~length;
      
      if (!padStr) {
        padStr = ' ';
      } else if (padStr.length > 1) {
        padStr = padStr.charAt(0);
      }
      
      switch(type) {
        case 'right':
          padlen = (length - str.length);
          padding = strRepeat(padStr, padlen);
          str = str+padding;
          break;
        case 'both':
          padlen = (length - str.length);
          padding = {
            'left' : strRepeat(padStr, Math.ceil(padlen/2)),
            'right': strRepeat(padStr, Math.floor(padlen/2))
          };
          str = padding.left+str+padding.right;
          break;
        default: // 'left'
          padlen = (length - str.length);
          padding = strRepeat(padStr, padlen);;
          str = padding+str;
        }
      return str;
    },

    lpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr);
    },

    rpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr, 'right');
    },

    lrpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr, 'both');
    },

    sprintf: sprintf,

    vsprintf: function(fmt, argv){
      argv.unshift(fmt);
      return sprintf.apply(null, argv);
    },

    toNumber: function(str, decimals) {
      var num = parseNumber(parseNumber(str).toFixed(~~decimals));
      return num === 0 && ''+str !== '0' ? Number.NaN : num;
    },

    strRight: function(str, sep){
      str = ''+str; sep = sep != null ? ''+sep : sep;
      var pos =  (!sep) ? -1 : str.indexOf(sep);
      return (pos != -1) ? str.slice(pos+sep.length, str.length) : str;
    },

    strRightBack: function(str, sep){
      str = ''+str; sep = sep != null ? ''+sep : sep;
      var pos =  (!sep) ? -1 : str.lastIndexOf(sep);
      return (pos != -1) ? str.slice(pos+sep.length, str.length) : str;
    },

    strLeft: function(str, sep){
      str = ''+str; sep = sep != null ? ''+sep : sep;
      var pos = (!sep) ? -1 : str.indexOf(sep);
      return (pos != -1) ? str.slice(0, pos) : str;
    },

    strLeftBack: function(str, sep){
      str = ''+str; sep = sep != null ? ''+sep : sep;
      var pos = str.lastIndexOf(sep);
      return (pos != -1) ? str.slice(0, pos) : str;
    },

    toSentence: function(array, separator, lastSeparator) {
        separator || (separator = ', ');
        lastSeparator || (lastSeparator = ' and ');
        var length = array.length, str = '';

        for (var i = 0; i < length; i++) {
            str += array[i];
            if (i === (length - 2)) { str += lastSeparator; }
            else if (i < (length - 1)) { str += separator; }
        }

        return str;
    },

    slugify: function(str) {
      var from  = "àáäâèéëêìíïîòóöôùúüûñç·/_:;",
          to    = "aaaaeeeeiiiioooouuuunc",
          regex = new RegExp(defaultToWhiteSpace(from), 'g');

      str = (''+str).toLowerCase();

      str = str.replace(regex, function(ch){ return to[from.indexOf(ch)] || '-'; });

      return _s.trim(str.replace(/[^\w\s-]/g, '').replace(/[-\s]+/g, '-'), '-');
    },

    exports: function() {
      var result = {};

      for (var prop in this) {
        if (!this.hasOwnProperty(prop) || prop == 'include' || prop == 'contains' || prop == 'reverse') continue;
        result[prop] = this[prop];
      }

      return result;
    },
    
    repeat: strRepeat

  };

  // Aliases

  _s.strip    = _s.trim;
  _s.lstrip   = _s.ltrim;
  _s.rstrip   = _s.rtrim;
  _s.center   = _s.lrpad;
  _s.rjust    = _s.lpad;
  _s.ljust    = _s.rpad;
  _s.contains = _s.include;

  // CommonJS module is defined
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      // Export module
      module.exports = _s;
    }
    exports._s = _s;

  } else if (typeof define === 'function' && define.amd) {
    // Register as a named module with AMD.
    define('underscore.string', function() {
      return _s;
    });

  // Integrate with Underscore.js
  } else if (typeof root._ !== 'undefined') {
    // root._.mixin(_s);
    root._.string = _s;
    root._.str = root._.string;

  // Or define it
  } else {
    root._ = {
      string: _s,
      str: _s
    };
  }

(function(k){var o=String.prototype.trim,l=function(a,b){for(var f=[];0<b;f[--b]=a);return f.join("")},c=function(a){return function(){for(var b=Array.prototype.slice.call(arguments),f=0;f<b.length;f++)b[f]=null==b[f]?"":""+b[f];return a.apply(null,b)}},m=function(){function a(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}var b=function(){b.cache.hasOwnProperty(arguments[0])||(b.cache[arguments[0]]=b.parse(arguments[0]));return b.format.call(null,b.cache[arguments[0]],arguments)};
b.format=function(b,n){var h=1,d=b.length,e="",c=[],i,j,g,k;for(i=0;i<d;i++)if(e=a(b[i]),"string"===e)c.push(b[i]);else if("array"===e){g=b[i];if(g[2]){e=n[h];for(j=0;j<g[2].length;j++){if(!e.hasOwnProperty(g[2][j]))throw m('[_.sprintf] property "%s" does not exist',g[2][j]);e=e[g[2][j]]}}else e=g[1]?n[g[1]]:n[h++];if(/[^s]/.test(g[8])&&"number"!=a(e))throw m("[_.sprintf] expecting number but found %s",a(e));switch(g[8]){case "b":e=e.toString(2);break;case "c":e=String.fromCharCode(e);break;case "d":e=
parseInt(e,10);break;case "e":e=g[7]?e.toExponential(g[7]):e.toExponential();break;case "f":e=g[7]?parseFloat(e).toFixed(g[7]):parseFloat(e);break;case "o":e=e.toString(8);break;case "s":e=(e=""+e)&&g[7]?e.substring(0,g[7]):e;break;case "u":e=Math.abs(e);break;case "x":e=e.toString(16);break;case "X":e=e.toString(16).toUpperCase()}e=/[def]/.test(g[8])&&g[3]&&0<=e?"+"+e:e;j=g[4]?"0"==g[4]?"0":g[4].charAt(1):" ";k=g[6]-(""+e).length;j=g[6]?l(j,k):"";c.push(g[5]?e+j:j+e)}return c.join("")};b.cache={};
b.parse=function(a){for(var b=[],h=[],c=0;a;){if(null!==(b=/^[^\x25]+/.exec(a)))h.push(b[0]);else if(null!==(b=/^\x25{2}/.exec(a)))h.push("%");else if(null!==(b=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(a))){if(b[2]){var c=c|1,e=[],d=b[2],i=[];if(null!==(i=/^([a-z_][a-z_\d]*)/i.exec(d)))for(e.push(i[1]);""!==(d=d.substring(i[0].length));)if(null!==(i=/^\.([a-z_][a-z_\d]*)/i.exec(d)))e.push(i[1]);else if(null!==(i=/^\[(\d+)\]/.exec(d)))e.push(i[1]);
else throw"[_.sprintf] huh?";else throw"[_.sprintf] huh?";b[2]=e}else c|=2;if(3===c)throw"[_.sprintf] mixing positional and named placeholders is not (yet) supported";h.push(b)}else throw"[_.sprintf] huh?";a=a.substring(b[0].length)}return h};return b}(),d={VERSION:"2.0.0",isBlank:c(function(a){return/^\s*$/.test(a)}),stripTags:c(function(a){return a.replace(/<\/?[^>]+>/ig,"")}),capitalize:c(function(a){return a.charAt(0).toUpperCase()+a.substring(1).toLowerCase()}),chop:c(function(a,b){for(var b=
1*b||0||a.length,f=[],c=0;c<a.length;)f.push(a.slice(c,c+b)),c+=b;return f}),clean:c(function(a){return d.strip(a.replace(/\s+/g," "))}),count:c(function(a,b){for(var f=0,c,d=0;d<a.length;)c=a.indexOf(b,d),0<=c&&f++,d=d+(0<=c?c:0)+b.length;return f}),chars:c(function(a){return a.split("")}),escapeHTML:c(function(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}),unescapeHTML:c(function(a){return a.replace(/&lt;/g,"<").replace(/&gt;/g,
">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&")}),escapeRegExp:c(function(a){return a.replace(/([-.*+?^${}()|[\]\/\\])/g,"\\$1")}),insert:c(function(a,b,f){a=a.split("");a.splice(1*b||0,0,f);return a.join("")}),include:c(function(a,b){return-1!==a.indexOf(b)}),join:c(function(a){var b=Array.prototype.slice.call(arguments);return b.join(b.shift())}),lines:c(function(a){return a.split("\n")}),reverse:c(function(a){return Array.prototype.reverse.apply((""+a).split("")).join("")}),
splice:c(function(a,b,f,c){a=a.split("");a.splice(1*b||0,1*f||0,c);return a.join("")}),startsWith:c(function(a,b){return a.length>=b.length&&a.substring(0,b.length)===b}),endsWith:c(function(a,b){return a.length>=b.length&&a.substring(a.length-b.length)===b}),succ:c(function(a){var b=a.split("");b.splice(a.length-1,1,String.fromCharCode(a.charCodeAt(a.length-1)+1));return b.join("")}),titleize:c(function(a){for(var a=a.split(" "),b,f=0;f<a.length;f++)b=a[f].split(""),"undefined"!==typeof b[0]&&(b[0]=
b[0].toUpperCase()),f+1===a.length?a[f]=b.join(""):a[f]=b.join("")+" ";return a.join("")}),camelize:c(function(a){return d.trim(a).replace(/(\-|_|\s)+(.)?/g,function(a,f,c){return c?c.toUpperCase():""})}),underscored:function(a){return d.trim(a).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/\-|\s+/g,"_").toLowerCase()},dasherize:function(a){return d.trim(a).replace(/([a-z\d])([A-Z]+)/g,"$1-$2").replace(/^([A-Z]+)/,"-$1").replace(/\_|\s+/g,"-").toLowerCase()},humanize:function(a){return d.capitalize(this.underscored(a).replace(/_id$/,
"").replace(/_/g," "))},trim:c(function(a,b){if(!b&&o)return o.call(a);b=b?d.escapeRegExp(b):"\\s";return a.replace(RegExp("^["+b+"]+|["+b+"]+$","g"),"")}),ltrim:c(function(a,b){b=b?d.escapeRegExp(b):"\\s";return a.replace(RegExp("^["+b+"]+","g"),"")}),rtrim:c(function(a,b){b=b?d.escapeRegExp(b):"\\s";return a.replace(RegExp("["+b+"]+$","g"),"")}),truncate:c(function(a,b,f){b=1*b||0;return a.length>b?a.slice(0,b)+(f||"..."):a}),prune:c(function(a,b,f){var c="",h="",h=0,f=f||"...",b=1*b||0;for(h in a)c+=
a[h].toUpperCase()!=a[h].toLowerCase()||/[-_\d]/.test(a[h])?"A":" ";h=0===c.substring(b-1,b+1).search(/^\w\w$/)?d.rtrim(c.slice(0,b).replace(/([\W][\w]*)$/,"")):d.rtrim(c.slice(0,b));h=h.replace(/\W+$/,"");return h.length+f.length>a.length?a:a.substring(0,h.length)+f}),words:function(a,b){return(""+a).split(b||" ")},pad:c(function(a,b,f,c){var d="",d=0,b=1*b||0;f?1<f.length&&(f=f.charAt(0)):f=" ";switch(c){case "right":d=b-a.length;d=l(f,d);a+=d;break;case "both":d=b-a.length;d={left:l(f,Math.ceil(d/
2)),right:l(f,Math.floor(d/2))};a=d.left+a+d.right;break;default:d=b-a.length,d=l(f,d),a=d+a}return a}),lpad:function(a,b,c){return d.pad(a,b,c)},rpad:function(a,b,c){return d.pad(a,b,c,"right")},lrpad:function(a,b,c){return d.pad(a,b,c,"both")},sprintf:m,vsprintf:function(a,b){b.unshift(a);return m.apply(null,b)},toNumber:function(a,b){var c;c=1*(1*a||0).toFixed(1*b||0)||0;return!(0===c&&"0"!==a&&0!==a)?c:Number.NaN},strRight:c(function(a,b){var c=!b?-1:a.indexOf(b);return-1!=c?a.slice(c+b.length,
a.length):a}),strRightBack:c(function(a,b){var c=!b?-1:a.lastIndexOf(b);return-1!=c?a.slice(c+b.length,a.length):a}),strLeft:c(function(a,b){var c=!b?-1:a.indexOf(b);return-1!=c?a.slice(0,c):a}),strLeftBack:c(function(a,b){var c=a.lastIndexOf(b);return-1!=c?a.slice(0,c):a}),exports:function(){var a={},b;for(b in this)if(this.hasOwnProperty(b)&&!("include"==b||"contains"==b||"reverse"==b))a[b]=this[b];return a}};d.strip=d.trim;d.lstrip=d.ltrim;d.rstrip=d.rtrim;d.center=d.lrpad;d.ljust=d.lpad;d.rjust=
d.rpad;d.contains=d.include;"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(module.exports=d),exports._s=d):"undefined"!==typeof k._?(k._.string=d,k._.str=k._.string):k._={string:d,str:d}})(this||window);}(this || window));
