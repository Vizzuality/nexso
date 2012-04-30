/* Hides/shows placeholders
*
* @param {Hash} [opt] Optional arguments (speed, timeOut)
*/
jQuery.fn.smartPlaceholder = function(opt){

  this.each(function(){
    var
    speed   = (opt && opt.speed)   || 150,
    timeOut = (opt && opt.timeOut) || 100,
    $span   = $(this).find("span.placeholder"),
    $input  = $(this).find(":input").not("input[type='hidden'], input[type='submit']");

    if ($input.val()) $span.hide();

    $input.keydown(function(e) {

      //TODO: check for ie
      if (e.metaKey && e.keyCode == 88) { // command+x
        setTimeout(function() {
          isEmpty($input.val()) && $span.fadeIn(speed);
        }, timeOut);
      } else if (e.metaKey && e.keyCode == 86) { // command+v
        setTimeout(function() {
          !isEmpty($input.val()) && $span.fadeOut(speed);
        }, timeOut);
      } else {
        setTimeout(function() { ($input.val()) ?  $span.fadeOut(speed) : $span.fadeIn(speed); }, 0);
      }
    });

    $span.on("click", function() { $input.focus(); });

    $input.blur(function() { !$input.val() && $span.fadeIn(speed); });
  });
}

