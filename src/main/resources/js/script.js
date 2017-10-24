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
			urlTemplate: '__api_object_type__/__class__/__method__/__client_type__-request.html',
			authUrlTemplate: 'repository/authenticate/__client_type__-request.html',

			/**
			 * Initialize rest tester object
			 *
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			init: function() {
				if ( ! $('.rest-tester').length) {
					return;
				}

				$('.rest-tester [name="client_type"]').on('change', function(e) {
					nemesis.restTester.clientType = $(this).val();
					$('.rest-tester .response-wrapper .response').remove();
				});

				$('.rest-tester [data-api-trigger="true"]').on('change', function() {
					var endpoint = nemesis.restTester.getEndpoint($(this).closest('.tab-pane'));
					// console.log(endpoint);
					nemesis.restTester.loadContent(endpoint);
				});

				$.each($('.rest-tester .tab-pane'), function(i, obj) {
					var parent = $(obj);
					$('[data-api-object="method"]', parent).chainedTo($('[data-api-object="class"]', parent));
				});

				// Remove response
				$('.rest-tester').on('click', '.response .remove', function(e) {
					$(this).closest('.response').remove();
				});

				// Update token
				$('.rest-tester #nemesis_token').on('blur', function() {
					$.each($('.rest-tester .response'), function(i, obj) {
						nemesis.restTester.updateToken($(obj));
					});
				});

				// Auth Request
				$('.rest-tester .js-auth-request').on('click', function(e) {
					e.preventDefault();
					var endpoint = nemesis.restTester.authUrlTemplate
						.replace('__client_type__', nemesis.restTester.clientType);
					nemesis.restTester.loadContent(endpoint);
				});
			},

			/**
			 * Load external content
			 *
			 * @param {string} endpoint
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			loadContent: function(endpoint) {
				$.ajax({
					url: endpoint,
					type: 'GET',
					cache: false,
					success: function(response, data) {
						var codeSnippet = $('#preamble .listingblock', $(response));
						nemesis.restTester.updateToken(codeSnippet);

						$('.rest-tester .tab-pane.active .response-wrapper').append(
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

				return this.urlTemplate
					.replace('__api_object_type__', activeTab)
					.replace('__'+first.data('apiObject')+'__', first.val())
					.replace('__'+second.data('apiObject')+'__', second.val())
					.replace('__client_type__', this.clientType);
			},

			/**
			 * Update X-Nemesis-Token
			 *
			 * @param  {object} content
			 * @return {void}
			 * @author Vladimir Kuzmov <me@vkuzmov.com>
			 */
			updateToken: function(content) {
				var tokenValue = $('.rest-tester #nemesis_token').val(),
					code = $('code', content).text();

				switch(this.clientType) {
					case 'curl':
						code = code.replace(/-H 'X-Nemesis-Token:[^']*'/gi, "-H 'X-Nemesis-Token: "+tokenValue+"'");
						break;
					case 'httpie':
						code = code.replace(/'X-Nemesis-Token:[^']*'/gi, "'X-Nemesis-Token: "+tokenValue+"'");
						break;
					case 'http':
						code = code.replace(/X-Nemesis-Token:[^\n]*/gi, 'X-Nemesis-Token: '+tokenValue);
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

    // Expand sidenav submenu containing selected item
	/*if ($('#collapsing-menu-item-selected').length) {
		$('#collapsing-menu-item-selected').closest('.dropdown').toggleClass('open');
		$('#collapsing-menu-item-selected').closest('.collapse').collapse('show');
	}*/

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

	// Show search form in header
	$('.search-btn').on('click', function(e) {
		e.preventDefault();
		$(this).closest('.nav-wrapper').addClass('show-search');
		$('.search-form input[type="search"]').focus();
	});

	// Hide search form in header
	$('.search-form input[type="search"]').on('focusout', function(e) {
		e.preventDefault();
		$(this).closest('.nav-wrapper').removeClass('show-search');
	});

	// Searchable
	$('.js-searchable').on('keyup', function() {
		var self = $(this),
			term = $.trim(self.val().toLowerCase()),
			container = $(self.data('container'));

		if (term) {
			$('[data-searchable]', container).addClass('hidden');
			var visibleItems = $('[data-searchable*="' + term + '"]', container);
			visibleItems.removeClass('hidden');

			if ( ! visibleItems.length) {
				$('.js-searchable-no-result', container).removeClass('hidden');
			}
			else {
				$('.js-searchable-no-result', container).addClass('hidden');
			}
		}
		else {
			$('[data-searchable]', container).removeClass('hidden');
		}
	});

});
