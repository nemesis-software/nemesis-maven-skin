/**
 * May 2017
 * @author Vladimir Kuzmov <me@vkuzmov.com>
 */

$(function(){

	$.extend(nemesis, {
		scrollToElement: function(element, navheight) {
			var offset = element.offset();
			var offsetTop = offset.top;
			var totalScroll = offsetTop-navheight;

			$('body, html').animate({
				scrollTop: totalScroll
			}, 500);
		},
		restTester: {
			requestType: $('.rest-tester [name="client_type"]:checked').val(),
			hostname: window.location.href.replace(/(^\w+:|^)\/\//, '').split('/')[0],
			urlTemplate: '/current-snapshot/platform/modules/nemesis-module-restservices/__entity__/__verb__-example/__client_type__-request.html',

			/**
			 * Initialize rest tester object
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			init: function() {

				switch(this.hostname) {
					case 'nemesis-new-site.dev':
						this.urlTemplate = '/docs'+this.urlTemplate;
						break;
					case 'vkuzmov.com':
						this.urlTemplate = '/nemesis-new-site/current/docs'+this.urlTemplate;
						break;
				}

				$('.rest-tester [name="client_type"]').on('change', function(e) {
					nemesis.restTester.requestType = $(this).val();
					$('.rest-tester .response-wrapper .response').remove();
				});

				$('.rest-tester .entity').on('change', function() {
					nemesis.restTester.loadContent($(this).closest('.tab-pane'));
				});

				// Remove response
				$('.rest-tester').on('click', '.response .remove', function(e) {
					$(this).closest('.response').remove();
				});

				// Update token
				$('#nemesis_token').on('blur', function() {
					$.each($('.rest-tester .response'), function(i, obj) {
						nemesis.restTester.updateToken($(obj));
					});
				});
			},

			/**
			 * Load external content
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			loadContent: function(parent) {
				var verb = $('.verb', parent).val(),
					entity = $('.entity', parent).val();

				if ( ! verb || ! entity) {
					return;
				}

				var url = this.urlTemplate
					.replace('__client_type__', this.requestType)
					.replace('__verb__', verb)
					.replace('__entity__', entity);

				$.ajax({
					url: url,
					type: 'GET',
					cache: false,
					success: function(response, data) {
						var codeSnippet = $('#preamble .listingblock', $(response));
						nemesis.restTester.updateToken(codeSnippet);

						$('.tab-pane.active .response-wrapper').append(
							$('<div>')
								.attr('class', 'response')
								.html(codeSnippet)
								.append('<span class="remove">remove</span>')
						);
					},
					error: function(xhr, err) {
						console.log(xhr, err)
					}
				});
			},

			/**
			 * Get endpoint for external content
			 * @return {string}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			getEndpoint: function() {
				return this.urlTemplate
					.replace('__client_type__', this.requestType)
					.replace('__verb__', this.verb.val())
					.replace('__entity__', this.entity.val());
			},

			updateToken: function(content) {
				var tokenValue = $('#nemesis_token').val(),
					newToken = "-H 'X-Nemesis-Token: "+tokenValue+"'",
					code = $('code', content).text();

				code = code.replace(/-H 'X-Nemesis-Token: (.*)'/gi, newToken);
				$('code', content).html(code);
			}
		}
	});

	nemesis.restTester.init();

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
