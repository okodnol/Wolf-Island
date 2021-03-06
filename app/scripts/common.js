$(function () {

	var
		field = $('.js-field'), // поле
		fieldSize = 20, // длина и ширина поля в клектах
		wolfInput = $('#wolves'), // поле ввода количества волков
		hareInput = $('#hares'), // поле ввода количества зайцев
		input = $('.set__input'),
		radio = $('.set__radio'),
		defaultWolfCount = wolfInput.val(), // количество волков
		defaultHareCount = hareInput.val(), // количество зайцев
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
			rowCode = ('<tr>' + repeatString('<td class=\'field__cell def\'></td>', fieldSize + 1) + '</tr>'),
			fieldCode = repeatString(rowCode, fieldSize + 1);
		field.html(fieldCode);
	};

	// случайное заполнение поля defaultРareCount зайцами и defaultЦolfCount волками
	randomFillField = function () {
		var
			freeCells = [],
			k = 0;
		// нумерация всех ячеек поля
		for (var i = 1; i < fieldSize + 1; i++) {
			for (var j = 1; j < fieldSize + 1; j++) {
				freeCells[k] = [i, j];
				k++;
			}
		}
		// добавление класса 'hare' hareCount случайным ячейкам
		for (i = 0; i < defaultHareCount; i++) {
			var index = Math.floor(Math.random() * (freeCells.length));
			$('tr:nth-child(' + freeCells[index][0] + ') td:nth-child(' + freeCells[index][1] + ')').removeClass('def').addClass('hare');
			freeCells.splice(index, 1);
		}
		// добавление класса 'wolf' wolfCount случайным ячейкам
		for (i = 0; i < defaultWolfCount; i++) {
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
		wolfCells = field.find('.wolf').attr('hp', 1).attr('parity', 0);
		// все клетки с зайцами
		hareCells = field.find('.hare');

		$('.js-info-content').empty();
		$('.js-wolf-current').text(defaultWolfCount);
		$('.js-wolf-born').text(0);
		$('.js-wolf-dead').text(0);
		$('.js-hare-current').text(defaultHareCount);
		$('.js-hare-born').text(0);
		$('.js-hare-dead').text(0);
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
	// ссылка на случайно выбранную свободную соседнюю cell ячейку или на неё саму
	function randNearCell(cell) {
		var
			nearCells = near(cell).filter('.def').add(cell),
			index = Math.floor(Math.random() * (nearCells.length));
			return (nearCells.eq(index));
	}
	// обновление информации на справочной панели
	function info(classType, eventName) {
		var
			className = $('.js-' + classType + '-current'),
			value = parseInt(className.text()),
			delta = 0;

		if (eventName === 'born') {
			delta = 1;
		}
		if (eventName === 'dead') {
			delta = -1;
		}
		className.text(value + delta);

		className = $('.js-' + classType + '-' + eventName);
		value = parseInt(className.text());
		className.text(value + 1);
	}

	// добавление класса classType одной из соседних клеток cell с вероятностью chance%
	function child(cell, classType, chance) {
		var chance = chance * 100;
		if (Math.floor(Math.random() * 100) < chance - 1) {
			// если число попало в первые chance чисел
			var newCell = randNearCell(cell);
			if (newCell.hasClass('def')) {
				newCell.removeClass('def').addClass(classType);
				info(classType, 'born');
				if (classType === 'wolf') {
					newCell.attr('hp', 1).attr('parity', 0);
				}
			}
		}
	}
	// ссылка на случайную клетку с классом 'hare' соседнюю cell
	// если рядом нет клеток с таким классам, ссылка на саму cell
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
				parity = parseFloat($(this).attr('parity')),
				hunted = hunt($(this));

			$(this).removeClass('wolf').addClass('def').attr('hp', 0).attr('parity', 0);
			// если охота удалась
			if (hunted[0] !== $(this)[0]) {
				hp++;
				parity++;
				hunted.removeClass('hare').addClass('wolf').attr('hp', hp).attr('parity', parity);
				hareCells = field.find('.hare');
				info('hare', 'dead');
			} else {
				if (hp > 0.1) {
					randNearCell($(this)).removeClass('def').addClass('wolf').attr('hp', hp - 0.1);
				} else {
					info('wolf', 'dead');
				}
			}
			// если волк не умер, он может размножиться
			if (hp > 0.1 && parity > 0) {
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

	// вывод информации в список
	function infoList(dwolf, dhare) {
		var
			message = '';

		if (Math.abs(dwolf) > 0) {
			message = message + 'волки:' + repeatString('&nbsp;', 5);
			if (dwolf < 0) {
				message = message + '-';
			} else {
				message = message + '+';
			}
			message = message + Math.abs(dwolf) + repeatString('&nbsp;', 10);
		}
		if (Math.abs(dhare) > 0) {
			message = message + 'зайцы:' + repeatString('&nbsp;', 5);
			if (dhare < 0) {
				message = message + '-';
			} else {
				message = message + '+';
			}
			message = message + Math.abs(dhare);
		}
		if (message !== '') {
			$('.js-info-content').append('<div class="info__message">' + message + '</div>');
		}
		$('.js-info').scrollTop($('.js-info-content').height());
	}

	// запуск действий волков и зайцев с интервалом delay мс
	function action() {
		counter = setInterval(function () {
			var
				wolfs = wolfCells.size(),
				hares = hareCells.size();

			if (paused || speedChanged) {
				clearInterval(counter);
				if (speedChanged) {
					action();
					speedChanged = false;
				}
			}
			wolf();
			eaten = hares - hareCells.size();
			hare();
			infoList(wolfCells.size() - wolfs, hareCells.size() - hares);
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

	input.on('change', function () {
	});

	// изменение значения поля ввода количества волков
	wolfInput.on('change', function () {
		defaultWolfCount = wolfInput.val();
		if (defaultWolfCount < 0) {
			defaultWolfCount = 0;
			wolfInput.val(0);
		}
		if (defaultWolfCount > Math.pow(fieldSize, 2) - defaultHareCount) {
			defaultWolfCount = Math.pow(fieldSize, 2) - defaultHareCount;
			wolfInput.val(defaultWolfCount);
		}
		$('.js-wolf-current').text(defaultWolfCount);
		initField();
	});
	// изменение значения поля ввода количества зайцев
	hareInput.on('change', function () {
		defaultHareCount = hareInput.val();
		if (defaultHareCount < 0) {
			defaultHareCount = 0;
			hareInput.val(0);
		}
		if (defaultHareCount > Math.pow(fieldSize, 2) - defaultWolfCount) {
			defaultHareCount = Math.pow(fieldSize, 2) - defaultWolfCount;
			hareInput.val(defaultHareCount);
		}
		$('.js-hare-current').text(defaultHareCount);
		initField();
	});

	// переключение скорости
	radio.on('click', function () {
		delay = $(this).attr('speed');
		speedChanged = true;
	});

	// переключение режимов блока информации
	$('.js-switch').on('click', function () {
		$('.js-toggle').toggleClass('info__active');
	});

	// первоначальный запуск
	initField();
});
