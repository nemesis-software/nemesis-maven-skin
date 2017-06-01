/**
 * May 2017
 * @author Vladimir Kuzmov <me@vkuzmov.com>
 */

$(function(){

	$.extend(nemesis, {
		scrollToElement: function(element, navheight){
			var offset = element.offset();
			var offsetTop = offset.top;
			var totalScroll = offsetTop-navheight;

			$('body, html').animate({
				scrollTop: totalScroll
			}, 500);
		}
	});

	// Show/Hide sidenav
	$('.sidenav-trigger').on('click', function(e) {
		e.preventDefault();
		$('body').toggleClass('open-sidenav');
	});

	// Open/Close sidenav subnavingation
	$('.sidenav .nav > ul > li > [data-toggle="collapse"]').on('click', function(e) {
		e.preventDefault();
		$(this).closest('li').toggleClass('open');
	});

	// Scroll to element when click the toc link or anchor link
	// according the fixed header height
	$('#toc a, .anchor').on('click', function(){
		var el = $(this).attr('href'),
			elWrapped = $(el),
			header_height = $('header').height() + 10;

		nemesis.scrollToElement(elWrapped, header_height);
	});

	// Scroll to element when page is loaded with hash
	// according the fixed header height
	if (window.location.hash) {
		var elWrapped = $(window.location.hash),
			header_height = $('header').height() + 10;

		nemesis.scrollToElement(elWrapped, header_height);
	}
});
