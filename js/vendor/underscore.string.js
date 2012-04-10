(function(a){"use strict";var b=String.prototype.trim,c=String.prototype.trimRight,d=String.prototype.trimLeft,e=function(a){return a*1||0},f=function(a,b,c){a+="",b=~~b;for(var d=[];b>0;d[--b]=a);return d.join(c==null?"":c)},g=function(a){return Array.prototype.slice.call(a)},h=function(a){return a!=null?"["+j.escapeRegExp(""+a)+"]":"\\s"},i=function(){function a(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}var b=f,c=function(){return c.cache.hasOwnProperty(arguments[0])||(c.cache[arguments[0]]=c.parse(arguments[0])),c.format.call(null,c.cache[arguments[0]],arguments)};return c.format=function(c,d){var e=1,f=c.length,g="",h,j=[],k,l,m,n,o,p;for(k=0;k<f;k++){g=a(c[k]);if(g==="string")j.push(c[k]);else if(g==="array"){m=c[k];if(m[2]){h=d[e];for(l=0;l<m[2].length;l++){if(!h.hasOwnProperty(m[2][l]))throw new Error(i('[_.sprintf] property "%s" does not exist',m[2][l]));h=h[m[2][l]]}}else m[1]?h=d[m[1]]:h=d[e++];if(/[^s]/.test(m[8])&&a(h)!="number")throw new Error(i("[_.sprintf] expecting number but found %s",a(h)));switch(m[8]){case"b":h=h.toString(2);break;case"c":h=String.fromCharCode(h);break;case"d":h=parseInt(h,10);break;case"e":h=m[7]?h.toExponential(m[7]):h.toExponential();break;case"f":h=m[7]?parseFloat(h).toFixed(m[7]):parseFloat(h);break;case"o":h=h.toString(8);break;case"s":h=(h=String(h))&&m[7]?h.substring(0,m[7]):h;break;case"u":h=Math.abs(h);break;case"x":h=h.toString(16);break;case"X":h=h.toString(16).toUpperCase()}h=/[def]/.test(m[8])&&m[3]&&h>=0?"+"+h:h,o=m[4]?m[4]=="0"?"0":m[4].charAt(1):" ",p=m[6]-String(h).length,n=m[6]?b(o,p):"",j.push(m[5]?h+n:n+h)}}return j.join("")},c.cache={},c.parse=function(a){var b=a,c=[],d=[],e=0;while(b){if((c=/^[^\x25]+/.exec(b))!==null)d.push(c[0]);else if((c=/^\x25{2}/.exec(b))!==null)d.push("%");else{if((c=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(b))===null)throw new Error("[_.sprintf] huh?");if(c[2]){e|=1;var f=[],g=c[2],h=[];if((h=/^([a-z_][a-z_\d]*)/i.exec(g))===null)throw new Error("[_.sprintf] huh?");f.push(h[1]);while((g=g.substring(h[0].length))!=="")if((h=/^\.([a-z_][a-z_\d]*)/i.exec(g))!==null)f.push(h[1]);else{if((h=/^\[(\d+)\]/.exec(g))===null)throw new Error("[_.sprintf] huh?");f.push(h[1])}c[2]=f}else e|=2;if(e===3)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");d.push(c)}b=b.substring(c[0].length)}return d},c}(),j={VERSION:"2.1.1",isBlank:function(a){return/^\s*$/.test(a)},stripTags:function(a){return(""+a).replace(/<\/?[^>]+>/ig,"")},capitalize:function(a){return a+="",a.charAt(0).toUpperCase()+a.substring(1).toLowerCase()},chop:function(a,b){a+="",b=~~b||a.length;var c=[];for(var d=0;d<a.length;)c.push(a.slice(d,d+b)),d+=b;return c},clean:function(a){return j.strip((""+a).replace(/\s+/g," "))},count:function(a,b){return a+="",b+="",a.split(b).length-1},chars:function(a){return(""+a).split("")},escapeHTML:function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")},unescapeHTML:function(a){return(""+a).replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&")},escapeRegExp:function(a){return a.replace(/([-.*+?^${}()|[\]\/\\])/g,"\\$1")},insert:function(a,b,c){var d=(""+a).split("");return d.splice(~~b,0,""+c),d.join("")},include:function(a,b){return(""+a).indexOf(b)!==-1},join:function(a){var b=g(arguments);return b.join(b.shift())},lines:function(a){return(""+a).split("\n")},reverse:function(a){return Array.prototype.reverse.apply(String(a).split("")).join("")},splice:function(a,b,c,d){var e=(""+a).split("");return e.splice(~~b,~~c,d),e.join("")},startsWith:function(a,b){return a+="",b+="",a.length>=b.length&&a.substring(0,b.length)===b},endsWith:function(a,b){return a+="",b+="",a.length>=b.length&&a.substring(a.length-b.length)===b},succ:function(a){a+="";var b=a.split("");return b.splice(a.length-1,1,String.fromCharCode(a.charCodeAt(a.length-1)+1)),b.join("")},titleize:function(a){return(""+a).replace(/\b./g,function(a){return a.toUpperCase()})},camelize:function(a){return j.trim(a).replace(/(\-|_|\s)+(.)?/g,function(a,b,c){return c?c.toUpperCase():""})},underscored:function(a){return j.trim(a).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()},dasherize:function(a){return j.trim(a).replace(/[_\s]+/g,"-").replace(/([A-Z])/g,"-$1").replace(/-+/g,"-").toLowerCase()},classify:function(a){return j.titleize(a.replace(/_/g," ")).replace(/\s/g,"")},humanize:function(a){return j.capitalize(this.underscored(a).replace(/_id$/,"").replace(/_/g," "))},trim:function(a,c){return a+="",!c&&b?b.call(a):(c=h(c),a.replace(new RegExp("^"+c+"+|"+c+"+$","g"),""))},ltrim:function(a,b){return!b&&d?d.call(a):(b=h(b),(""+a).replace(new RegExp("^"+b+"+","g"),""))},rtrim:function(a,b){return!b&&c?c.call(a):(b=h(b),(""+a).replace(new RegExp(b+"+$","g"),""))},truncate:function(a,b,c){return a+="",c=c||"...",b=~~b,a.length>b?a.slice(0,b)+c:a},prune:function(a,b,c){a+="",b=~~b,c=c!=null?""+c:"...";var d,e,f=a.replace(/\W/g,function(a){return a.toUpperCase()!==a.toLowerCase()?"A":" "});return e=f.charAt(b),d=f.slice(0,b),e&&e.match(/\S/)&&(d=d.replace(/\s\S+$/,"")),d=j.rtrim(d),(d+c).length>a.length?a:a.substring(0,d.length)+c},words:function(a,b){return j.trim(a,b).split(b||/\s+/)},pad:function(a,b,c,d){a+="";var e="",g=0;b=~~b,c?c.length>1&&(c=c.charAt(0)):c=" ";switch(d){case"right":g=b-a.length,e=f(c,g),a+=e;break;case"both":g=b-a.length,e={left:f(c,Math.ceil(g/2)),right:f(c,Math.floor(g/2))},a=e.left+a+e.right;break;default:g=b-a.length,e=f(c,g),a=e+a}return a},lpad:function(a,b,c){return j.pad(a,b,c)},rpad:function(a,b,c){return j.pad(a,b,c,"right")},lrpad:function(a,b,c){return j.pad(a,b,c,"both")},sprintf:i,vsprintf:function(a,b){return b.unshift(a),i.apply(null,b)},toNumber:function(a,b){var c=e(e(a).toFixed(~~b));return c===0&&""+a!="0"?Number.NaN:c},strRight:function(a,b){a+="",b=b!=null?""+b:b;var c=b?a.indexOf(b):-1;return c!=-1?a.slice(c+b.length,a.length):a},strRightBack:function(a,b){a+="",b=b!=null?""+b:b;var c=b?a.lastIndexOf(b):-1;return c!=-1?a.slice(c+b.length,a.length):a},strLeft:function(a,b){a+="",b=b!=null?""+b:b;var c=b?a.indexOf(b):-1;return c!=-1?a.slice(0,c):a},strLeftBack:function(a,b){a+="",b=b!=null?""+b:b;var c=a.lastIndexOf(b);return c!=-1?a.slice(0,c):a},toSentence:function(a,b,c){b||(b=", "),c||(c=" and ");var d=a.length,e="";for(var f=0;f<d;f++)e+=a[f],f===d-2?e+=c:f<d-1&&(e+=b);return e},slugify:function(a){var b="ąàáäâãćęèéëêìíïîłńòóöôõùúüûñçżź·/_:;",c="aaaaaaceeeeeiiiilnooooouuuunczz",d=new RegExp(h(b),"g");return a=(""+a).toLowerCase(),a=a.replace(d,function(a){var d=b.indexOf(a);return c.charAt(d)||"-"}),j.trim(a.replace(/[^\w\s-]/g,"").replace(/[-\s]+/g,"-"),"-")},exports:function(){var a={};for(var b in this){if(!this.hasOwnProperty(b)||b=="include"||b=="contains"||b=="reverse")continue;a[b]=this[b]}return a},repeat:f};j.strip=j.trim,j.lstrip=j.ltrim,j.rstrip=j.rtrim,j.center=j.lrpad,j.rjust=j.lpad,j.ljust=j.rpad,j.contains=j.include,typeof exports!="undefined"?(typeof module!="undefined"&&module.exports&&(module.exports=j),exports._s=j):typeof define=="function"&&define.amd?define("underscore.string",function(){return j}):typeof a._!="undefined"?(a._.string=j,a._.str=a._.string):a._={string:j,str:j}})(this||window);