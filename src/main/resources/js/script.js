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
			clientType: $('.rest-tester [name="client_type"]:checked').val(),
			hostname: window.location.href.replace(/(^\w+:|^)\/\//, '').split('/')[0],
			coreUrlTemplate: '/current-snapshot/platform/modules/nemesis-module-restservices/__entity__/__verb__-example/__client_type__-request.html',
			facadeUrlTemplate: '/current-snapshot/platform/nemesis-platform-facade/__class__/__method__/__client_type__-request.html',

			/**
			 * Initialize rest tester object
			 *
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			init: function() {
				switch(this.hostname) {
					case 'nemesis-new-site.dev':
						this.coreUrlTemplate = '/docs'+this.coreUrlTemplate;
						this.facadeUrlTemplate = '/docs'+this.facadeUrlTemplate;
						break;
					case 'vkuzmov.com':
						this.coreUrlTemplate = '/nemesis-new-site/current/docs'+this.coreUrlTemplate;
						this.facadeUrlTemplate = '/nemesis-new-site/current/docs'+this.facadeUrlTemplate;
						break;
				}

				$('.rest-tester [name="client_type"]').on('change', function(e) {
					nemesis.restTester.clientType = $(this).val();
					$('.rest-tester .response-wrapper .response').remove();
				});

				$('.rest-tester [data-api-trigger="true"]').on('change', function() {
					nemesis.restTester.loadContent($(this).closest('.tab-pane'));
				});

				$('.rest-tester [data-api-object="method"]').chainedTo('.rest-tester [data-api-object="class"]');

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
			 *
			 * @param {object} parent
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			loadContent: function(parent) {
				var endpoint = this.getEndpoint(parent);

				if (endpoint === false) {
					return;
				}

				$.ajax({
					url: endpoint,
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
			 *
			 * @param  {object} parent
			 * @return {string|boolean} boolean when fails
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			getEndpoint: function(parent) {
				var activeTab = parent.attr('id'),
					first = $('[data-api-object]:eq(0)', parent),
					second = $('[data-api-object]:eq(1)', parent);

				if ( ! first.val() || ! second.val()) {
					return false;
				}

				return this[activeTab+'UrlTemplate']
					.replace('__client_type__', this.clientType)
					.replace('__'+first.data('apiObject')+'__', first.val())
					.replace('__'+second.data('apiObject')+'__', second.val());
			},

			/**
			 * Update X-Nemesis-Token
			 *
			 * @param  {object} content
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			updateToken: function(content) {
				var tokenValue = $('#nemesis_token').val(),
					code = $('code', content).text();

				switch(this.clientType) {
					case 'curl':
						code = code.replace(/-H 'X-Nemesis-Token:[^']+'/gi, "-H 'X-Nemesis-Token: "+tokenValue+"'");
						break;
					case 'httpie':
						code = code.replace(/'X-Nemesis-Token:[^']+'/gi, "'X-Nemesis-Token: "+tokenValue+"'");
						break;
					case 'http':
						code = code.replace(/X-Nemesis-Token:[^\n]+/gi, 'X-Nemesis-Token: '+tokenValue);
						break;
					default:
						return;
				}

				code = $('<div>').text(code).html();
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
