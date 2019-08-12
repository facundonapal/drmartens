/*global jQuery */
/*!
* FitText.js 1.2
*
* Copyright 2011, Dave Rupert http://daverupert.com | https://github.com/davatron5000/FitText.js
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/

!function(o){o.fn.fitText=function(t,n){var i=t||1,e=o.extend({minFontSize:Number.NEGATIVE_INFINITY,maxFontSize:Number.POSITIVE_INFINITY},n);return this.each(function(){var t=o(this),n=function(){t.css("font-size",Math.max(Math.min(t.width()/(10*i),parseFloat(e.maxFontSize)),parseFloat(e.minFontSize)))};n(),o(window).on("resize.fittext orientationchange.fittext",n)})}}(jQuery);
