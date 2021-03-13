// ==UserScript==
// @name         Inc-Renamer
// @description      Die Staemme: Umbenennen von Angriffen
// @author         SlowTarget, angepasst von RokKeT, Harpstennah und Get Drunk
// @icon         http://help.die-staemme.de/images/4/46/Att.png
// @include         https://de*.die-staemme.de/game.php*&screen=info_command*
// @exclude         https://*/game.php*type=own*&screen=info_command
// ==/UserScript==

win = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;

win.theFormat = '{unit} - Start: {origin} - {player} - Ank: {arrival} - Zurueck: {return}';
win.theFormatII = '{unit} - {origin} {player} s:{sent}';
// win.arrUnitNames=['Sp\u00e4h','LKAV','SKAV','Axt','Schwert','Rammbock', 'Kata', '**AG**', 'UNBK'];
// win.arrKeys=[49,50,51,52,53,54,55,56,57];
// win.insertSymbol=".";

var win = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;
win.ScriptAPI.register('51-Inc-Renamer', true, 'Get Drunk', 'support-nur-im-forum@arcor.de');

function labelAttack() {
  var $ = win.$;
  var ir_forum =
    'https://forum.die-staemme.de/showthread.php?116511-LZR-Inc-Renamer&p=3551587&viewfull=1#post3551587';
  var ir_version = '4.0';
  var oGD = win.game_data;
  var world_id = oGD.world;

  function gid(id) {
    return document.getElementById(id);
  }

  function myGetCoords(theString) {
    return /(.*?)\s\(((\d+)\|(\d+))\)\sK(\d+)/i.exec(theString);
  }

  function fnInt(txtInt) {
    return parseInt(txtInt, 10);
  }

  function fnDate(txtDate) {
    var arrMs = txtDate.match(/:(\d{3})$/i);
    if (arrMs) txtDate = txtDate.replace(/:(\d{3})$/i, '');
    var dtNew = new Date(txtDate);
    if (dtNew == 'Invalid Date') {
      var arrDate = txtDate.match(/\b(\d+)\b/gi);
      arrDate = arrDate.map(fnInt);
      if (arrDate[2] < 2000) arrDate[2] += 2000;
      dtNew = new Date(arrDate[2], arrDate[1] - 1, arrDate[0], arrDate[3], arrDate[4], arrDate[5]);
    }
    if (arrMs) dtNew.setMilliseconds(arrMs[1]);
    return dtNew;
  }

  function fnDateFormat(dtDate) {
    var intMs = dtDate.getMilliseconds();
    var zeigeMs = oStorage.irSettings.mitMS ?
      '.' + (intMs > 99 ? intMs : '0' + myZeroPad(intMs)) :
      '';
    return (
      myZeroPad(dtDate.getHours()) +
      ':' +
      myZeroPad(dtDate.getMinutes()) +
      ':' +
      myZeroPad(dtDate.getSeconds()) +
      zeigeMs +
      ' ' +
      myZeroPad(dtDate.getDate()) +
      '/' +
      myZeroPad(dtDate.getMonth() + 1)
    );
  }

  function myTime(theInt) {
    return (
      myZeroPad(theInt / 3600) +
      ':' +
      myZeroPad((theInt % 3600) / 60) +
      ':' +
      myZeroPad(theInt % 60)
    );
  }

  function myZeroPad(theString) {
    var theInt = parseInt(theString, 10);
    return theInt > 9 ? theInt : '0' + theInt;
  }

  if (typeof win.theFormat == 'undefined')
    win.theFormat = '{unit} ({coords}) {origin} {player} {incid} {sent}';
  if (typeof win.theFormatII == 'undefined') win.theFormatII = win.theFormat;
  if (typeof win.arrUnitNames == 'undefined')
    win.arrUnitNames = [
      'Sp\u00e4h',
      'LKAV',
      'SKAV',
      'Axt',
      'Schwert',
      'Rammbock',
      'Kata',
      '**AG**',
      'UNBK',
    ];
  if (typeof win.arrKeys == 'undefined') win.arrKeys = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
  var oTexts = [
    /* 0 */
    {
      val: '',
      name: '{unit}',
      info: 'Truppentyp des Incs'
    },
    /* 1 */
    {
      val: '',
      name: '{coords}',
      info: "'xxx|yyy' Koordinaten von angreifenden Dorf"
    },
    /* 2 */
    {
      val: '',
      name: '{player}',
      info: 'Spieler der angreift'
    },
    /* 3 */
    {
      val: '',
      name: '{duration}',
      info: 'hhh:mm:ss Laufzeit des Incs'
    },
    /* 4 */
    {
      val: '',
      name: '{distance}',
      info: 'Entfernung'
    },
    /* 5 */
    {
      val: '',
      name: '{return}',
      info: 'Datum, Zeit wann die Truppen wieder im Heimatdorf sind',
    },
    /* 6 */
    {
      val: '',
      name: '{incid}',
      info: 'ID des Angriffs'
    },
    /* 7 */
    {
      val: '',
      name: '{sent}',
      info: 'Abschickzeit des Incs(AbhÃ¤ngig vom gewÃ¤hlten Truppentyp)',
    },
    /* 8 */
    {
      val: '',
      name: '{arrival}',
      info: 'Datum & Zeit wann der Inc ankommt'
    },
    /* 9 */
    {
      val: '',
      name: '{origin}',
      info: "'name (xxx|yyy) Knn' Name, Koordinaten und Kontinent des angreifenden Dorf",
    },
    /* 10 */
    {
      val: '',
      name: '{destination}',
      info: "'name (xxx|yyy) Knn' Kontinent des Zieldorf"
    },
    /* 11 */
    {
      val: '',
      name: '{destinationxy}',
      info: "'xxx|yyy' Koordinaten vom Zieldorf"
    },
    /* 12 */
    {
      val: '',
      name: '{date}',
      info: 'Aktuelle Serverzeit und Datum'
    },
  ];
  if (typeof irTexts != 'undefined') $.extend(oTexts, irTexts);
  var unitReplace = {
    de: /Speer|Schwert|Axt|Bogensch\u00fctze|sp\u00e4h|lkav|BBogen|SKAV|Rammbock|Kata|Pala|ag/gi,
    zz: /Spear|Sword|Axe|Archer|Spy|lcav|MArch|HCAV|Ram|Cata|pala|Noble/gi,
    ch: /Speer|Schw\u00e4rt|Axt|Bogesch\u00fctz|Sp\u00e4h|lkav|BBoge|SKAV|Rammbock|Kata|Pala|ag/gi,
  };

  if (typeof iconReplace != 'undefined') $.extend(unitReplace, iconReplace);
  var theDoc = win.document;
  if (win.frames.length > 1) theDoc = win.main.document;

  var nameStorage = 'ds_Inc_Renamer_' + world_id;
  if (oGD.player.sitter != 0) nameStorage = nameStorage + '_UV';

  function fSpeichereEinstellungen(storage) {
    win.localStorage.setItem(nameStorage, JSON.stringify(storage));
  }

  function fLadeEinstellungen() {
    var sa = JSON.parse(win.localStorage.getItem(nameStorage));
    if (sa == null) sa = {
      config: {},
      irSettings: {}
    };
    if (sa.config.PlayerStart == null || sa.config.PlayerStart != oGD.player.date_started) {
      /* Server-Konfiguration ermitteln */
      function fnGetConfig() {
        var oRequest = new XMLHttpRequest();
        var sURL = 'https://' + window.location.hostname + '/interface.php?func=get_config';
        oRequest.open('GET', sURL, 0);
        oRequest.send(null);
        if (oRequest.status == 200) return oRequest.responseXML;
        win.UI.InfoMessage('Error executing XMLHttpRequest call to get Config!', 3000, 'error');
      }
      var xmldocument = fnGetConfig();
      sa.config = {
        PlayerStart: oGD.player.date_started,
        UnitSpeed: $(xmldocument)
          .find('unit_speed:first')
          .text(),
        WorldSpeed: $(xmldocument)
          .find('speed:first')
          .text(),
        AGmaxDist: $(xmldocument)
          .find('max_dist:first')
          .text(),
        Millisec: $(xmldocument)
          .find('millis_arrival:first')
          .text(),
      };
    }
    sa.irSettings = {
      Form: [win.theFormat, win.theFormatII],
      Radio_Form: 0,
      UnitNames: arrUnitNames,
      IconTrenner: typeof win.insertSymbol == 'undefined' ? '' : win.insertSymbol,
      mitMS: parseInt(sa.config.Millisec),
      DS_Links: true,
    };
    fSpeichereEinstellungen(sa);
    return sa;
  }
  var oStorage = fLadeEinstellungen();

  /* player, origin & destination Icon-tauglich machen */
  // iSymbol bei Gelegenheit noch gegen Verwendung von Buchstaben absichern
  function fnIconAnpassung(string) {
    String.prototype.insert = new Function(
      'intPos',
      'strIns',
      'return this.substring(0,intPos) + strIns + this.substring(intPos,this.length);'
    );
    var position = 0;
    var sicherung = 0;
    var ins = oStorage.irSettings.IconTrenner;
    if (ins == '') return string;
    while (position != -1) {
      position = string.search(unitReplace[win.game_data.market]);
      if (position != -1) string = string.insert(position + 1, ins);
      sicherung += 1;
      if (sicherung > 50) break;
    }
    return string;
  }

  /* Einstieg */
  var $irTable_0 = $('#quickedit-rename')
    .parents('table')
    .eq(0);
  oTexts[6].val = $('#quickedit-rename').attr('data-id'); // Inc-ID
  var $Ankunft_in = $irTable_0.find('span:last'); // $irTable_0.find('.timer:first');
  var $Ankunft = $Ankunft_in.parents('tr').prev();
  /* Angreifer */
  var $Angreifer = $irTable_0.find('tr:eq(1)');
  var $AngrStamm = $Angreifer.find('a:first').attr('title');
  oTexts[2].val = fnIconAnpassung($Angreifer.find('a:first').text()); // Angreifer
  var zAngrDorf = myGetCoords($irTable_0.find('tr:eq(2) a:first').html());
  oTexts[1].val = zAngrDorf[2]; // coords
  oTexts[9].val = fnIconAnpassung(zAngrDorf[0]); // orgin
  /* Verteidiger */
  var zVerteiDorf = myGetCoords($irTable_0.find('tr:eq(4) a:first').html());
  oTexts[10].val = fnIconAnpassung(zVerteiDorf[0]); //destination
  oTexts[11].val = zVerteiDorf[2]; //destinationxy
  /* Ankunft */
  oTexts[8].val =
    typeof $Ankunft[0].getElementsByTagName('td')[1].v == 'undefined' ?
    $Ankunft[0].getElementsByTagName('td')[1].textContent :
    $Ankunft[0].getElementsByTagName('td')[1].innerText; // Mar 27, 2014  10:42:03
  var dtArrival = fnDate(oTexts[8].val);
  if (dtArrival == 'Invalid Date') return;
  oTexts[8].val = fnDateFormat(dtArrival); // 10:42:03.000 27/03
  /* Date */
  var renDate = $('#serverDate').text();
  var renTime = $('#serverTime').text();
  oTexts[12].val = renTime + ' ' + renDate;
  /* Distanz */
  $Ankunft_in = $Ankunft_in.html().match(/\d+/gi);
  var msecsArrivalIn = ($Ankunft_in[0] * 3600 + $Ankunft_in[1] * 60 + $Ankunft_in[2] * 1) * 1000;
  var theXdiff = zAngrDorf[3] - zVerteiDorf[3];
  var theYdiff = zAngrDorf[4] - zVerteiDorf[4];
  var dblDistance = Math.sqrt(theXdiff * theXdiff + theYdiff * theYdiff);
  oTexts[4].val = dblDistance.toFixed(2); // 256.05 (Felder)
  var unknownN = 'empty';

  /* Tabelle mit Kopfzeile erzeugen */
  var aTabLZ = document.createElement('table');
  aTabLZ.className = 'vis';
  aTabLZ.id = 'irTabelleLZ';
  var aZeileD =
    '<tr><td colspan="1"></td><td colspan="1">Distanz:</td><td colspan="3">' +
    oTexts[4].val +
    ' Felder</td></tr>';
  var aTogle =
    '<form id="BuSet"><a href="#" title="" > <img alt="IR" src="graphic/buildings/garage.png"></img></a></form>';
  var aZeileK =
    '<tr><th>Einheit</th><th>Abschickzeit</th><th>Laufzeit</th><th>Umbennen in</th></tr>';
  $(aTabLZ)
    .append(aZeileD)
    .append(aZeileK);
  $(aTabLZ)
    .find('td:first')
    .append(aTogle);
  /* Links für VP und Inno-Umbenennung ggf. ausblenden */
  if (!oStorage.irSettings.DS_Links)
    $($irTable_0)
    .find('a:last')
    .parents('tr')
    .eq(0)
    .hide();

  /* Zeilen für die Einheiten erzeugen */
  for (var theIndex in oStorage.irSettings.UnitNames) {
    // AG mit Entfernung > max. Felder ausblenden
    if (theIndex == 7 && dblDistance > parseInt(oStorage.config.AGmaxDist, 10)) continue;

    var secsDuration = Math.round(
      ([9, 10, 11, 18, 22, 30, 30, 35, 0][theIndex] * 60 * dblDistance) /
      oStorage.config.WorldSpeed /
      oStorage.config.UnitSpeed
    );
    var msecsDuration = secsDuration * 1000;
    var secsDiff = (msecsDuration - msecsArrivalIn) / 1000;
    if (secsDiff > 0 || secsDuration == 0) {
      oTexts[0].val = oStorage.irSettings.UnitNames[theIndex];
      oTexts[3].val = myTime(secsDuration);
      var dtSent = new Date(dtArrival - msecsDuration);
      oTexts[7].val = fnDateFormat(dtSent);
      var msecsReturn = Date.parse(dtArrival) + msecsDuration;
      var dtReturn = new Date(msecsReturn);
      oTexts[5].val = fnDateFormat(dtReturn);
      if (unknownN == 'empty') {
        unknownN = 'min' + oStorage.irSettings.UnitNames[theIndex];
        var unknownD = oTexts[3].val;
        var unknownS = oTexts[7].val;
        var unknownR = oTexts[5].val;
      }
      if (secsDuration == 0) {
        oTexts[0].val = unknownN;
        oTexts[3].val = unknownD;
        oTexts[7].val = unknownS;
        oTexts[5].val = unknownR;
      }
      /* Austausch der Platzhalter */
      var name = oStorage.irSettings.Form[oStorage.irSettings.Radio_Form];
      for (var s in oTexts) {
        name = name.split(oTexts[s].name).join(oTexts[s].val);
      }

      var input = document.createElement('input');
      input.id = 'label_input_' + theIndex;
      input.value = name;
      var button = document.createElement('input');
      button.name = theIndex;
      button.type = 'button';
      button.className = 'btn';
      button.value = 'OK';
      // Hotkeys vorbereiten
      if (arrKeys[theIndex] !== -1) button.id = 'unit_button_' + arrKeys[theIndex];
      button.onclick = function () {
        // Ãœbergabe der Werte
        var label = $('#label_input_' + this.name).val();
        var $container = $('#quickedit-rename.quickedit');
        $container.find('.rename-icon').click();
        $container.find('input[type=text]').val(label);
        $container.find('input[type=button]').click();
      };
      var aStart =
        (secsDiff < 60 && 'gerade eben') ||
        ('vor ' + secsDiff < 3600 && Math.floor(secsDiff / 60) + ' min') ||
        'vor ' + myTime(secsDiff);
      var aZeileU =
        '<tr><td>' +
        oStorage.irSettings.UnitNames[theIndex] +
        '</td><td>' +
        aStart +
        '</td><td>' +
        oTexts[3].val +
        '</td><td></td></tr>';
      $(aTabLZ).append(aZeileU);
      $(aTabLZ)
        .find('td:last')
        .append(button)
        .append(input);
    }
  } //z.B.  win.arrKeys=[49,50,51,52,53,54,55,56,57];
  /* Hotkeys */
  win.addEventListener(
    'keydown',
    function (event) {
      for (var i = 0; i != arrKeys.length; ++i) {
        if (event.which == arrKeys[i] && gid('label_input_' + i)) {
          gid('unit_button_' + event.which).click();
        }
      }
    },
    false
  );

  function fTabEinstellungen() {
    /* Tabelle für die Einstellungen (Optionen) erstellen*/
    var aTabOptions = document.createElement('table');
    aTabOptions.id = 'irTabOptionen';
    aTabOptions.width = '570';
    var aZeileOptions = document.createElement('tr');
    var aMsTd = document.createElement('td');
    aMsTd.innerHTML = 'ms zeigen? ';
    var aMsInput = document.createElement('input');
    aMsInput.id = 'irOptMS';
    aMsInput.type = 'checkbox';
    aMsInput.checked = oStorage.irSettings.mitMS;
    var aLinkTd = document.createElement('td');
    aLinkTd.innerHTML = 'Links zeigen? ';
    var aLinkInput = document.createElement('input');
    aLinkInput.id = 'irOptLinks';
    aLinkInput.type = 'checkbox';
    aLinkInput.checked = oStorage.irSettings.DS_Links;
    var aTrennerTd = document.createElement('td');
    aTrennerTd.innerHTML = 'bei Einheit im Namen trennen mit:';
    var aTrennerInput = document.createElement('input');
    aTrennerInput.id = 'irInIconTrenner';
    aTrennerInput.type = 'text';
    aTrennerInput.size = 1;
    aTrennerInput.value = oStorage.irSettings.IconTrenner;
    $(aMsTd).append(aMsInput);
    $(aLinkTd).append(aLinkInput);
    $(aTrennerTd).append(aTrennerInput);
    $(aZeileOptions)
      .append(aMsTd)
      .append(aLinkTd)
      .append(aTrennerTd);
    $(aTabOptions).append(aZeileOptions);

    /* Tabelle für die Einstellungen (Textfelder) erstellen*/
    var aTabText = document.createElement('table');
    aTabText.id = 'irTabText';
    aTabText.width = '570';
    var irInputAktiv = false; // merkt sich welches Inputfeld gerade genutzt wird - absichtlich global
    var aZeileUnitNames =
      '<tr><td><nobr>Namen der</nobr> Einheiten</td><td><input id="irInUnitNames" onfocus="irInputAktiv = false" type="text" size="90" value="' +
      oStorage.irSettings.UnitNames +
      '" </td></tr>';
    var aZeileVersion1 =
      '<tr><td>Variante 1 </td><td><input id="irInVersion1" onfocus="irInputAktiv = this.id" type="text" size="90" value="' +
      oStorage.irSettings.Form[0] +
      '" </td></tr>';
    var aZeileVersion2 =
      '<tr><td>Variante 2</td><td><input id="irInVersion2" onfocus="irInputAktiv = this.id" type="text" size="90" value="' +
      oStorage.irSettings.Form[1] +
      '" </td></tr>';

    /* Bereich der Platzhalter */
    var aZeigePh = fPlatzhalter();
    $(aTabText)
      .append(aZeileUnitNames)
      .append(aZeileVersion1)
      .append(aZeileVersion2);
    $(aTabText)
      .find('tr')
      .eq(parseInt(oStorage.irSettings.Radio_Form) + 1)
      .find('td:first')
      .css('font-weight', 'bold');

    /* Speichern-Button */
    var aTabBtn = document.createElement('table');
    aTabBtn.id = 'irTabBtn';
    var aZeileBtn =
      '<tr><td></td><td>Abbruch mit F5</td><td width="128"> </td><td>Inc-Renamer Version ' +
      ir_version +
      '</td><td><a target="_blank" href=' +
      ir_forum +
      '>zum Forum</a></td></tr>';
    $(aTabBtn).append(aZeileBtn);
    var inButton = document.createElement('input');
    inButton.name = 'InBtn';
    inButton.type = 'button';
    inButton.className = 'btn';
    inButton.value = 'Speichern';
    inButton.onclick = function () {
      /* Reset */
      if ($('#irInUnitNames').val() == 'reset' + world_id) {
        win.localStorage.removeItem(nameStorage);
        win.UI.InfoMessage(nameStorage + ' gelÃ¶scht', 4000, 'success');
        location.reload();
        return;
      }
      /* Ãœbergabe der Werte  */
      var strFehler = '';
      if (
        $('#irInUnitNames')
        .val()
        .split(',').length == 9
      ) {
        oStorage.irSettings.UnitNames = $('#irInUnitNames')
          .val()
          .split(',');
      } else {
        strFehler += '- es m\u00FCssen genau 9 durch Komma getrennte Einheiten sein  ';
      }
      oStorage.irSettings.Form[0] = $('#irInVersion1').val();
      oStorage.irSettings.Form[1] = $('#irInVersion2').val();
      oStorage.irSettings.mitMS = $('#irOptMS').is(':checked');
      oStorage.irSettings.DS_Links = $('#irOptLinks').is(':checked');
      var tre = $('#irInIconTrenner').val();
      if (tre == tre.replace(/[AaGgSsBbLlRrKkPpMmHhCcNnÃ„Ã–ÃœÃŸÃ¤Ã¶Ã¼+"']/g, '')) {
        oStorage.irSettings.IconTrenner = tre;
      } else {
        strFehler += '- ungueltiges Trennzeichen';
      }
      if (strFehler == '') {
        fSpeichereEinstellungen(oStorage);
        location.reload();
      } else {
        win.UI.InfoMessage(strFehler, 4000, 'error');
      }
    };
    $(aTabBtn)
      .find('td:first')
      .append(inButton);
    var aTabInputSum = document.createElement('table');
    $(aTabInputSum)
      .append(aTabOptions)
      .append(aTabText)
      .append(aZeigePh)
      .append(aTabBtn);
    return aTabInputSum;

    function fPlatzhalter() {
      var tab = document.createElement('table');
      var tr1 = document.createElement('tr');
      var tr2 = document.createElement('tr');
      for (var i = 0; i != oTexts.length; ++i) {
        var td = document.createElement('td');
        var a = document.createElement('td');
        a.href = '#';
        a.title = oTexts[i].info;
        a.innerHTML = oTexts[i].name;
        $(td).append(a);
        $(td).click(function () {
          insertPh(
            $(this)
            .text()
            .replace(/\&amp;/g, '&'),
            gid(irInputAktiv)
          );
        });
        if (i <= 6) {
          $(tr1).append(td);
        } else {
          $(tr2).append(td);
        }
      }
      $(tab)
        .append(tr1)
        .append(tr2);
      return tab;
    }

    function insertPh(ph, input) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      input.value = input.value.substr(0, start) + ph + input.value.substr(end);
      var pos = start + ph.length;
      input.selectionStart = pos;
      input.selectionEnd = pos;
      input.focus();
    }
  }
  /* Tabelle für die Schnellwahl erstellen */
  var aTabSet = document.createElement('table');
  aTabSet.id = 'irTabelleSet';
  aTabSet.width = '570';
  var aZeileSchnell_1 =
    '<tr id="irSetZ_01"><td>Variante 1 <input type="radio" name="Form" value="0"></td><td>' +
    oStorage.irSettings.Form[0] +
    '</td></tr>';
  var aZeileSchnell_2 =
    '<tr id="irSetZ_02"><td>Variante 2 <input type="radio" name="Form" value="1"></td><td>' +
    oStorage.irSettings.Form[1] +
    '</td></tr>';
  $(aTabSet)
    .append(aZeileSchnell_1)
    .append(aZeileSchnell_2);
  /* fertige Tabellen einfügen */
  $(aTabLZ)
    .find(':text')
    .attr('size', name.length + 1);
  $irTable_0.after(aTabLZ);

  /* Einstellungen verwalten */
  var clicktexts = {
    v1: 'Inc-Renamer: 1 * Klicken -> Schnellwahl',
    v2: 'Inc-Renamer: noch mal f\u00FCr Einstellungen',
    v3: 'Inc-Renamer: und noch mal zum Ausblenden',
  };
  var clickEinst = $('#BuSet a:first');
  $(clickEinst).attr('title', clicktexts.v1);
  $(clickEinst).bind('click', function (ev) {
    switch ($('#BuSet a:first').attr('title')) {
      case clicktexts.v1: // Schnellauswahl
        $('#irSetZ_01').show();
        $('#content_value').append(createGUI('irFenster_01', aTabSet));
        $('#irFenster_01')
          .find("input[name='Form']")
          .eq(oStorage.irSettings.Radio_Form)
          .attr('checked', true);
        $('#irFenster_01').click(function () {
          oStorage.irSettings.Radio_Form = $("input[name='Form']:checked").val();
          fSpeichereEinstellungen(oStorage);
          location.reload();
        });
        $('#BuSet a:first').attr('title', clicktexts.v2);
        break;
      case clicktexts.v2: // Einstellungen
        $('#irFenster_01').remove();
        $('#content_value').append(createGUI('irFenster_02', fTabEinstellungen()));
        $('#BuSet a:first').attr('title', clicktexts.v3);
        break;
      case clicktexts.v3: // Ausgangsposition
        $('#irFenster_02').remove();
        $('#BuSet a:first').attr('title', clicktexts.v1);
        break;
      default:
        console.log('Fehler in switch/case von clickEinst');
    }
  });

  /* erzeugt ein extra Fenster im Vordergrund */
  function createGUI(id, kind) {
    var divCon = theDoc.createElement('div');
    divCon.id = id;
    divCon.style.display = 'block';
    divCon.style.position = 'fixed';
    divCon.style.zIndex = 5;
    divCon.style.top = '45px';
    divCon.style.left = '425px';
    divCon.style.borderStyle = 'ridge';
    divCon.style.borderColor = 'brown';
    divCon.style.padding = '1px';
    divCon.style.borderWidth = '3px';
    divCon.style.backgroundColor = '#f7eed3';
    divCon.style.width = '575px';
    divCon.className = 'vis';
    divCon.appendChild(kind);
    return divCon;
  }
}
if (win.game_data.screen == 'info_command' && win.game_data.features.Premium.active) labelAttack();