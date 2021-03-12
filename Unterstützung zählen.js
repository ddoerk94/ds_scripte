/*
Copyright 2013 Ademes
Copyright 2021 Get Drunk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:


The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.


THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRE\u00DF OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNE\u00DF FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

ScriptAPI.register(
	'Unterst\u00fctzung/Verteidigung z\u00e4hlen',
	true,
	'Get Drunk',
	'support-nur-im-forum@die-staemme.de'
);
Scriptversion = '1.1';

if (!document.URL.match('mode=units')) {
	UI.InfoMessage('Du musst dich auf der Verteidigungs-/Unterst\u00FCtzungs-\u00DCbersicht befinden!', 3000, true);
} else {
	ADS_Unterstuetzung_zaehlen();
}

function ADS_Unterstuetzung_zaehlen() {
	var output = '';
	var isArcherWorld = false;

	$('#units_table thead tr th img').each(function() {
		if ($(this).attr('src').indexOf('unit_archer') !== -1) {
			isArcherWorld = true;
		}
	});

	var index_spear = 0;
	var index_sword = 1;
	var index_archer = isArcherWorld ? 3 : null;
	var index_spy = isArcherWorld ? 4 : 3;
	var index_marcher = isArcherWorld ? 6 : null;
	var index_heavy = isArcherWorld ? 7 : 5;
	var index_catapult = isArcherWorld ? 9 : 7;

	var obj = new Object();

	$('#units_table tr.row_a, #units_table tr.row_b').each(function(a) {
		acc = '';

		$(this)
			.find('a')
			.each(function(b) {
				if (
					$(this)
					.attr('href')
					.search(/info_player&/) != -1
				)
					acc = $(this).html();
			});

		if (acc !== '') {
			var count = obj[acc];
			if (obj[acc] === undefined) {
				count = new Object();
				count.spear = 0;
				count.sword = 0;
				count.archer = 0;
				count.spy = 0;
				count.marcher = 0;
				count.heavy = 0;
				count.catapult = 0;
				obj[acc] = count;
			}
			count.spear += parseInt(
				$(this)
				.find('td.unit-item:eq(' + index_spear + ')')
				.html()
			);
			count.sword += parseInt(
				$(this)
				.find('td.unit-item:eq(' + index_sword + ')')
				.html()
			);
			if (isArcherWorld)
				count.archer += parseInt(
					$(this)
					.find('td.unit-item:eq(' + index_archer + ')')
					.html()
				);
			count.spy += parseInt(
				$(this)
				.find('td.unit-item:eq(' + index_spy + ')')
				.html()
			);
			if (isArcherWorld)
				count.marcher += parseInt(
					$(this)
					.find('td.unit-item:eq(' + index_marcher + ')')
					.html()
				);
			count.heavy += parseInt(
				$(this)
				.find('td.unit-item:eq(' + index_heavy + ')')
				.html()
			);
			count.catapult += parseInt(
				$(this)
				.find('td.unit-item:eq(' + index_catapult + ')')
				.html()
			);
			obj[acc] = count;
		}
	});

	if (document.URL.match('away_detail')) {
		output += '<h5>Stammesdeff eingesetzt bei:</h5>';
		word = 'Eingesetzt';
	} else if (document.URL.match('support_detail')) {
		output += '<h5>Unterst\u00fctzungen erhalten von:</h5>';
		word = 'Erhalten';
	}

	var counter = 0;
	var sum = 0;
	troopsPerDeff = typeof Truppenanzahl == 'undefined' ? 20000 : Truppenanzahl;

	$.each(obj, function(acc, count) {
		counter++;
		var weightedSum = 0;
		weightedSum += count.spear;
		weightedSum += count.sword;
		weightedSum += count.archer;
		weightedSum += 2 * count.spy;
		weightedSum += 5 * count.marcher;
		weightedSum += 6 * count.heavy;
		weightedSum += 8 * count.catapult;
		//get the amount of deffs and round the result to one decimal place
		deffs = Math.round((weightedSum / troopsPerDeff) * 10) / 10;
		output += acc + ': ' + deffs + '<br>';
		output +=
			typeof Detail == 'undefined' ?
			'' :
			'<div style="color: grey;">(' +
			count.spear +
			',' +
			count.sword +
			',' +
			count.archer +
			',' +
			count.spy +
			',' +
			count.marcher +
			',' +
			count.heavy +
			',' +
			count.catapult +
			')</div>';
		sum += Math.round(deffs * 10) / 10;
	});

	if (counter === 0) {
		output += '<br><div style="color: green; font-weight: bold;">Keine Stammesdeff!</div><br>';
	} else {
		output +=
			'<br><div style="color: green; font-weight: bold;">' +
			word +
			' Insgesamt: ' +
			Math.round(sum) +
			'</div>' +
			'<span style="color: grey;">(Anzeige pro Seite)</span>';
	}

	if ($('#ADS_Display').length === 0) {
		$('.maincell').append(
			"<div id='ADS_Display' style='position: fixed; top: 51px; left: 20px; border-radius: 8px; border: 2px #804000 solid; background-color: #F1EBDD'>" +
			"<div id='inline_popup_menu' style='cursor: auto; text-align:center;'>" +
			game_data.player.name +
			' (' +
			$('#serverDate').text() +
			')' +
			'</div>' +
			"<div style='padding: 15px 10px 5px 10px;'>" +
			"<table id='ADS_Display_Main' style='vertical-align:middle;'></table>" +
			"<br><a onclick='$(\"#ADS_Display\").remove();' style='cursor: pointer;'>Schlie\u00dfen</a>" +
			'</div>' +
			'</div>'
		);
	} else {
		$('#ADS_Display').show();
	}

	$('#ADS_Display_Main').html(output);
}
