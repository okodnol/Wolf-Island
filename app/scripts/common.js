$(function () {

	repeatString = function (value, count) {
		return (
			(new Array(count + 1)).join(value)
		);
	};

	// построение HTML-кода поля
	buildField = function () {
		var
			rowCode = ('<tr>' + repeatString('<td class=\'field__cell\'></td>', 20) + '</tr>'),
			fieldCode = repeatString(rowCode, 20);
		$('.js-field').html(fieldCode);
	};

	// инициализация поля
	function initField() {
		buildField();
	}

	// первоначальный запуск
	initField();
});
