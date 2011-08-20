(function ($) {
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	function findTruncPoint(maxWidth, text, start, end, $workerEl, token, fromEnd) {
		var cache = {};
		return findTruncPointWithCache(maxWidth, text, start, end, $workerEl, token, fromEnd, cache);
	}
	function calcWidth(text, $workerEl, cache) {
		if (!cache[text]) {
			return cache[text] = $workerEl.text(text).width();
		}
		return cache[text];
	}
	function findTruncPointWithCache(maxWidth, text, start, end, $workerEl, token, fromEnd, cache) {
		var opt1,
			opt2,
			mid;

		if (fromEnd) {
			opt1 = start === 0 ? '' : text.slice(-start);
			opt2 = text.slice(-end);
		} else {
			opt1 = text.slice(0, start);
			opt2 = text.slice(0, end);
		}

		var width1 = calcWidth(opt1 + token, $workerEl, cache);
		if (calcWidth(opt2 + token, $workerEl, cache) < width1) {
			return end;
		}

		mid = Math.floor((start + end) / 2);
		if (mid !== start) {
			opt1 = fromEnd ? text.slice(-mid) : text.slice(0, mid);
			width1 = calcWidth(opt1 + token, $workerEl, cache);
		}
		if (width1 === maxWidth) {
			return mid;
		}

		if (width1 > maxWidth) {
			end = mid - 1;
		} else {
			start = mid + 1;
		}

		return findTruncPointWithCache(maxWidth, text, start, end, $workerEl, token, fromEnd, cache);
	}

	$.fn.truncate = function (options) {
		var defaults = {
			width: 'auto',
			token: '\u2026', // HORIZONTAL ELLIPSIS
			center: false,
			addclass: false,
			addtitle: false
		};
		options = $.extend(defaults, options);

		return this.each(function () {
			var $element = $(this),
				fontCSS = {
					'fontFamily': $element.css('fontFamily'),
					'fontSize': $element.css('fontSize'),
					'fontStyle': $element.css('fontStyle'),
					'fontWeight': $element.css('fontWeight'),
					'font-variant': $element.css('font-variant'),
					'text-indent': $element.css('text-indent'),
					'text-transform': $element.css('text-transform'),
					'letter-spacing': $element.css('letter-spacing'),
					'word-spacing': $element.css('word-spacing'),
					'whiteSpace': $element.css('whiteSpace'),
					'display': 'none'
				},
				elementText = $element.text(),
				$truncateWorker = $('<span/>').css(fontCSS).text(elementText).appendTo('body'),
				originalWidth = $truncateWorker.width(),
				truncateWidth = isNumber(options.width) ? options.width : $element.width(),
				truncatedText;

			if (originalWidth > truncateWidth) {
				$truncateWorker.text('');
				if (options.center) {
					var truncateWidthL = Math.ceil(truncateWidth / 2);
					var truncateWidthR = Math.floor(truncateWidth / 2);
					var truncatedTextL = elementText.slice(0, findTruncPoint(truncateWidthL, elementText, 0, elementText.length, $truncateWorker, options.token, false));
					var truncatedTextR = elementText.slice(-1 * findTruncPoint(truncateWidthR, elementText, 0, elementText.length, $truncateWorker, '', true));
					if (fontCSS.whiteSpace.slice(0, 3) !== 'pre') {
						while (truncatedTextR.charAt(0) === ' ') {
							truncatedTextR = truncatedTextR.slice(1);
						}
					}
					truncatedText = truncatedTextL + options.token + truncatedTextR;
				} else {
					truncatedText = elementText.slice(0, findTruncPoint(truncateWidth, elementText, 0, elementText.length, $truncateWorker, options.token, false)) + options.token;
				}

				if (options.addclass) {
					$element.addClass(options.addclass);
				}

				if (options.addtitle) {
					$element.attr('title', elementText);
				}

				$element.text(truncatedText);

			}

			$truncateWorker.remove();
		});
	};
})(jQuery);