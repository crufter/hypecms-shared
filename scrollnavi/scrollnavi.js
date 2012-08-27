// Page navigation script.
// Two drawing modes are available: analog and digital.
// Digital may be used with systems where you can simply specify the "page" as a way of navigation.
// Digital with "resizable" flag on may be used with systems where you can specify the "page" and "results_per_page" variables too.
// Analog may be used with systems where you can specify the offset (ir skip), not a page.
(function( $ ){
	
	function setGetparam(url, key, val) {
		var newAdditionalURL = "";
		var tempArray = url.split("?");
		var baseURL = tempArray[0];
		var aditionalURL = tempArray[1];
		var temp = "";
		if(aditionalURL) {
			var tempArray = aditionalURL.split("&");
			for ( var i in tempArray ) {
				if(tempArray[i].indexOf(key) == -1) {
					newAdditionalURL += temp+tempArray[i];
					temp = "&";
				}
			}
		}
		var rows_txt = temp+key+"="+val;
		var finalURL = baseURL+"?"+newAdditionalURL+rows_txt;
		return finalURL
	}
	
	function f(setup) {
		if (!setup.results) throw "No results number."
		if (!setup.rpp) throw "No results per page number."
		if (!setup.cp) throw "No current page."
		if (!setup.url) throw "No url."
		if (!setup.paging_key) setup.paging_key = "page"
		if (!setup.resizable) setup.resizable = false
		if (!setup.mode) setup.mode = "digital"
		var results = setup.results
		var rpp = setup.rpp
		var cp = setup.cp
		var url = setup.url
		var paging_key = setup.paging_key
		var mode = setup.mode
		var resizable = setup.resizable
		$(this).addClass("scrollnavi")
		var that = this
		function digital() {
			var all_pages = Math.ceil(results/rpp)
			var w = $(that).width()
			var pagingwidth = Math.floor(w/all_pages)
			for (var i = 0; i<all_pages; i++) {
				var link = setGetparam(url, paging_key, i+1)
				$(that).append('<a href="'+link+'" id="paging_link-'+(i+1)+'" class="paging_link" style="width: '+pagingwidth+'px;">&nbsp;</a>')
			}
			$("#paging_link-"+cp).addClass("current_page")
			$(".paging_link").hover(
			function() {
				$(this).addClass("link_over")
			},
			function() {
				$(this).removeClass("link_over")
			})
		}
		function analog() {
			// To be implemented.
		}
		if (mode == "digital") {
			digital()
		} else {
			analog()
		}
	}
	
	$.fn.scrollNavi = f
})( jQuery );