function listAllNumbers(){
	console.log("listAllNumber!");
	$(document).ready(function(){
		console.log("Inhere!");
	    $('#suggestBtn').magnificPopup({
		  items: {
		      src: '<div class="white-popup">Dynamically created popup</div>',
		      type: 'inline'
		  },
		  closeBtnInside: true
		});
	});
}