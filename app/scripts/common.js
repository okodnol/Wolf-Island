$(function () {

	var
		field = $('.js-field'), // поле
		fieldSize = 20, // длина и ширина поля в клектах
		wolfCount = $('#wolves').val(), // количество волков
		hareCount = $('#hares').val(), // количество зайцев
		delay = 1000; // интервал в мс

	repeatString = function (value, count) {
		return (
			(new Array(count)).join(value)
		);
	};

	// построение HTML-кода поля
	buildField = function () {
		var
			rowCode = ('<tr>' + repeatString('<td class=\'field__cell\'></td>', 20) + '</tr>'),
			fieldCode = repeatString(rowCode, 20);
		field.html(fieldCode);
	};

	// случайное заполнение поля hireCount зайцами и wolfCount волками
	randomFillField = function () {
		var
			freeCells = [],
			k = 0;
		// нумерация всех ячеек поля
		for (var i = 0; i < fieldSize; i++) {
			for (var j = 0; j < fieldSize; j++) {
				freeCells[k] = [i, j];
				k++;
			}
		}
		// добавление класса 'hire' hireCount случайным ячейкам
		for (i = 0; i < hareCount; i++) {
			var index = Math.floor(Math.random() * (freeCells.length));
			$('tr:nth-child(' + freeCells[index][0] + ') td:nth-child(' + freeCells[index][1] + ')').addClass('hire');
			freeCells.splice(index, 1);
		}
		// добавление класса 'wolf' wolfCount случайным ячейкам
		for (i = 0; i < wolfCount; i++) {
			var index = Math.floor(Math.random() * (freeCells.length));
			$('tr:nth-child(' + freeCells[index][0] + ') td:nth-child(' + freeCells[index][1] + ')').addClass('wolf');
			freeCells.splice(index, 1);
		}
	};

	// инициализация поля
	function initField() {
		buildField();
		randomFillField();

		// доступ ко всем клеткам поля через одну переменную
		cells = field.find('td');
		// все клетки с волками
		wolfCells = field.find('.wolf');
		// все клетки с зайцами
		hareCells = field.find('.hire');
	}

	// первоначальный запуск
	initField();
});
