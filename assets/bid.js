$('#placeBid').click(function () {
	var name = $('#name').val();
	var phone = $('#phone').val();
	var amount = $('#amount').val();

	var success = function success(data) {
		var message = data.message;
		$('#bidModal').modal('hide');
		$('#success').html(
			'<strong>Success! </strong>Your bid has been counted. ' + (message ? 'Message: ' + message : '')
		).fadeIn(100);

		update();
	};
	
	var error = function error(xhr) {
		var message = JSON.parse(xhr.responseText).message;
		$('#bidModal').modal('hide');
		$('#error').html(
			'<strong>Error! </strong>Your bid was rejected. ' + (message ? 'Reason: ' + message : '')
		).fadeIn(100);
	};

	$('#error').fadeOut();
	$('#success').fadeOut();

	$.ajax({
		method: 'PUT',
		url: window.location.pathname.replace(/\/$/g, '') + '/bids/',
		dataType: 'json',
		data: {
			name: name,
			phone: phone,
			amount: amount
		},
		success: success,
		error: error
	});
});

var update = function update() {
	var success = function success(data) {
		if (data.bid) {
			$('#highest').text('$' + (data.bid.highest || data.bid.starting));
		}
	};

	var error = function error(xhr) {
		var message = xhr.responseText;
		console.warn('error', message);
	};

	$.ajax({
		method: 'GET',
		url: window.location.pathname.replace(/\/$/g, ''),
		dataType: 'json',
		success: success,
		error: error
	});	
};

setInterval(update, 1000);

//$('#amount').change(function () {
setInterval(function () {
	var amount = $('#amount').val();
	$('#bidModal').find('.modal-title').text('Place bid of $' + amount);
}, 500);
//});


