$(function () {

	var
		field = $('.js-field'), // поле
		fieldSize = 20, // длина и ширина поля в клектах
		wolfInput = $('#wolves'),
		hareInput = $('#hares'),
		input = $('.set__input'),
		radio = $('.set__radio'),
		wolfCount = wolfInput.val(), // количество волков
		hareCount = hareInput.val(), // количество зайцев
		delay = $('#speed2').attr('speed'), // интервал в мс
		started = false,
		paused = true,
		speedChanged = false;

	repeatString = function (value, count) {
		return (
			(new Array(count)).join(value)
		);
	};

	// построение HTML-кода поля
	buildField = function () {
		var
			rowCode = ('<tr>' + repeatString('<td class=\'field__cell def\'></td>', fieldSize) + '</tr>'),
			fieldCode = repeatString(rowCode, fieldSize);
		field.html(fieldCode);
	};

	// случайное заполнение поля hareCount зайцами и wolfCount волками
	randomFillField = function () {
		var
			freeCells = [],
			k = 0;
		// нумерация всех ячеек поля
		for (var i = 1; i < fieldSize; i++) {
			for (var j = 1; j < fieldSize; j++) {
				freeCells[k] = [i, j];
				k++;
			}
		}
		// добавление класса 'hare' hareCount случайным ячейкам
		for (i = 0; i < hareCount; i++) {
			var index = Math.floor(Math.random() * (freeCells.length));
			$('tr:nth-child(' + freeCells[index][0] + ') td:nth-child(' + freeCells[index][1] + ')').removeClass('def').addClass('hare');
			freeCells.splice(index, 1);
		}
		// добавление класса 'wolf' wolfCount случайным ячейкам
		for (i = 0; i < wolfCount; i++) {
			var index = Math.floor(Math.random() * (freeCells.length));
			$('tr:nth-child(' + freeCells[index][0] + ') td:nth-child(' + freeCells[index][1] + ')').removeClass('def').addClass('wolf');
			freeCells.splice(index, 1);
		}
	};

	// инициализация поля
	function initField() {
		field.empty();
		buildField();
		randomFillField();

		// доступ ко всем клеткам поля через одну переменную
		cells = field.find('td');
		// все клетки с волками
		wolfCells = field.find('.wolf').attr('hp', 1);
		// все клетки с зайцами
		hareCells = field.find('.hare');
	}

	// находит соседние клетки ячейки cell
	function near(cell) {
		var
			row = cell.parent(),
			prevRowCells = row.prev().children(),
			nextRowCells = row.next().children(),
			prevCol = false,
			nextCol = false,
			index = cell.index(),
			nearCells = $([]);

		// добавление клеток справа и слева, если они есть
		if (cell.prev().size()) {
			nearCells = nearCells.add(cell.prev());
			prevCol = true;
		}
		if (cell.next().size()) {
			nearCells = nearCells.add(cell.next());
			nextCol = true;
		}
		// добавление соседних клеток сверху, если они есть
		if (prevRowCells.size()) {
			nearCells = nearCells.add(prevRowCells.eq(index));
			if (prevCol) {
				nearCells = nearCells.add(prevRowCells.eq(index - 1));
			}
			if (nextCol) {
				nearCells = nearCells.add(prevRowCells.eq(index + 1));
			}
		}
		// добавление соседних клеток снизу, если они есть
		if (nextRowCells.size()) {
			nearCells = nearCells.add(nextRowCells.eq(index));
			if (prevCol) {
				nearCells = nearCells.add(nextRowCells.eq(index - 1));
			}
			if (nextCol) {
				nearCells = nearCells.add(nextRowCells.eq(index + 1));
			}
		}

		return (nearCells);
	}
	// ссылка на случайно выбранную соседнюю cell ячейку или на неё саму
	function randNearCell(cell) {
		var
			nearCells = near(cell).filter('.def').add(cell),
			index = Math.floor(Math.random() * (nearCells.length));
			return (nearCells.eq(index));
	}

	// добавляет класс className одной из соседних клеток cell с вероятностью chance%
	function child(cell, className, chance) {
		var
			newCell,
			chance = chance * 100;
		if (Math.floor(Math.random() * 100) < chance - 1) {
			newCell = randNearCell(cell).removeClass('def').addClass(className);
			if (className === 'wolf') {
				newCell.attr('hp', 1);
				console.log('init');
			}
		}
	}

	function hunt(cell) {
		var
			hares = near(cell).filter('.hare');
		// если рядом есть зайцы
		if (hares.size()) {
			var index = Math.floor(Math.random() * hares.size());
			return (hares.eq(index));
		} else {
			return (cell);
		}
	}
	// действия волка на каждом шаге
	function wolf() {
		wolfCells.each(function () {
			var
				hp = parseFloat($(this).attr('hp')),
				hunted = hunt($(this));
			$(this).removeClass('wolf').addClass('def').attr('hp', 0);
			if (hunted[0] !== $(this)[0]) {
				// если охота удалась
				console.log('ate', hp + 1);
				hunted.removeClass('hare').addClass('wolf').attr('hp', hp + 1);
				hareCells = field.find('.hare');
			} else {
				// если охота не удалась
				console.log('starve', hp - 0.1);
				if (hp > 0.1) {
					randNearCell($(this)).removeClass('def').addClass('wolf').attr('hp', hp - 0.1);
				}
			}
			// если волк не умер, он может размножиться
			if (hp > 0.1) {
				child($(this), 'wolf', 0.05);
			}
			wolfCells = field.find('.wolf');
		});
	}
	// действия зайца на каждом шаге
	function hare() {
		hareCells.each(function () {
			$(this).removeClass('hare').addClass('def');
			randNearCell($(this)).removeClass('def').addClass('hare');
			child($(this), 'hare', 0.2);
			hareCells = field.find('.hare');
		});
	}
	// запуск действий волков и зайцев с интервалом delay мс
	function action() {
		counter = setInterval(function () {
			wolf();
			hare();
			if (paused || speedChanged) {
				clearInterval(counter);
				if (speedChanged) {
					action();
					speedChanged = false;
				}
			}
		}, delay);
	}
	// кнопка "пуск"
	$('.js-start').on('click', function () {
		if (!started || paused) {
			started = true;
			paused = false;
			input.prop('disabled', true);
			action();
		}
	});
	// кнопка "пауза"
	$('.js-pause').on('click', function () {
		if (!paused) {
			paused = true;
		}
	});
	// кнопка "заново"
	$('.js-restart').on('click', function () {
		started = false;
		paused = true;
		input.prop('disabled', false);
		initField();
	});
	// изменение значения поля ввода количества волков
	wolfInput.on('change', function () {
		wolfCount = wolfInput.val();
		if (wolfCount > Math.pow(fieldSize, 2) - hareCount) {
			wolfCount = Math.pow(fieldSize, 2) - hareCount;
			wolfInput.val(wolfCount);
		}
		initField();
	});
	// изменение значения поля ввода количества зайцев
	hareInput.on('change', function () {
		hareCount = hareInput.val();
		if (hareCount > Math.pow(fieldSize, 2) - wolfCount) {
			hareCount = Math.pow(fieldSize, 2) - wolfCount;
			hareInput.val(hareCount);
		}
		initField();
	});
	// переключение скорости
	radio.on('click', function () {
		delay = $(this).attr('speed');
		speedChanged = true;
	});

	// первоначальный запуск
	initField();
});
