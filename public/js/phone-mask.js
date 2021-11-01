/*
    Виджет для телефонов с динамическим изменением маски.
    Зависимость: jquery.mask.js
    Вызов плагина:
    $('#some-input').phoneMask({tag:'any-conteiner-for-injection-span'});
 */

// Исключение повторных подключений jquery.mask.js
var jsScript = [];
function includeJS (path)
{
    for (var i=0; i<jsScript.length; i++)
      if(path == jsScript[i])
          return false;

    jsScript.push(path);

    $.ajax({
        url: '/js/jquery.mask.js',
        dataType: "script",
        async: false,
        error: function()
        {
             jsScript.pop();
        }
    }); // ajax*/
}
includeJS('jquery.mask.js');

(function($) {

    $.widget("ui.phoneMask", {

        _twentyNumbers: {'380':'','375':'','998':'','995':'','994':'','996':'','992':''},
        _elevenNumbers: {'370':'','373':'','371':'','374':'','993':'','372':''},
        _countries: [],
        _infoLabelName: '',
        // Конструктор
        _create: function(params)
       {
            this._countries.push({kod:'380',country:'Страна:  Украина (12 цифр)'});
            this._countries.push({kod:'375',country:'Страна:  Белоруссия (12 цифр)'});
            this._countries.push({kod:'998',country:'Страна:  Узбекистан (12 цифр)'});
            this._countries.push({kod:'995',country:'Страна:  Грузия (12 цифр)'});
            this._countries.push({kod:'994',country:'Страна:  Азербайджан (12 цифр)'});
            this._countries.push({kod:'370',country:'Страна:  Литва (11 цифр)'});
            this._countries.push({kod:'373',country:'Страна:  Молдавия (11 цифр)'});
            this._countries.push({kod:'371',country:'Страна:  Латвия (11 цифр)'});
            this._countries.push({kod:'996',country:'Страна:  Киргизия (12 цифр)'});
            this._countries.push({kod:'992',country:'Страна:  Таджикистан (12 цифр)'});
            this._countries.push({kod:'374',country:'Страна:  Армения (11 цифр)'});
            this._countries.push({kod:'993',country:'Страна:  Туркмения (11 цифр)'});
            this._countries.push({kod:'372',country:'Страна:  Эстония (11 цифр)'});

           this.element.data("is_8_800", 1);

           this._infoLabelName = "infoLabel" + this.eventNamespace.split('.').join('-');
           this.element.on('keyPress', this._elementKeyPress)
           this.element.on('input',function(e) {
              $(this).data('oldVal',e.currentTarget.value);
           });
           this.element.mask('z00000000000000000000',{
                selectOnFocus: false,
                onKeyPress: this._keyPressExecute,
                translation:
                {
                     'z':{pattern:/[7389]/},
                     'a':{pattern:/[8]/},
                     'b':{pattern:/[0]/}
                }
           });
          return this;
       },
       // Задание новой позиции курсора
        _setCursor: function(el, position)
        {
            el = el[0];
            if(isNaN(position)) position = 20;
            setTimeout(function(){
                el.focus();
                el.setSelectionRange(position,position);
            }, 10);
        },
        // Получение текущей позиции курсора
        _getCursor: function(el)
        {
            var e = el[0];
            return parseInt(e.selectionStart);
        },
        // Расчет адекватной позиции курсора
        _updateCursor: function(el, oldLength)
        {
            var e = el[0];
            var delta = -1, test = 0;

            // сколько дефисов перед позицией. Считать именно так: по сумме длины!!!
            $.each(e.value.split("-"), function(i, val){
                if(test + val.toString().length > oldLength) return false;
                test += val.toString().length;
                delta++;
            });

            this._setCursor(el, oldLength + delta);
        },
        // Расчет маски
       _setMask: function(newVal, field,options) {
            var mask='';
            var char = newVal.charAt(0);
            var is_8_800 = $(field).data("is_8_800");
            $(field).data("is_8_800",1);

            switch(newVal.length)
            {
                  case 0:
                         break;
                  case 1:if(  char == '7') mask = 'z-000-000-00-00';
                         else
                         if( (char == '3') || (char=='9') ) mask = 'z00-';
                         else
                         if( (char == '8') && (is_8_800==1) )
                         {
                           mask ='z-abb-000-00-00';
                           $(field).val('8-800-');
                           $(field).data("is_8_800",0);
                         }
                         else
                             mask = 'z-000-000-00-00';
                         break;
                  case 2:break;
                  case 3: if(newVal in this._twentyNumbers) mask = 'z00-000-000-000';
                         else
                         if(newVal in this._elevenNumbers) mask = 'z00-000-000-00';
                         else
                             mask = 'z-000-000-00-00';
                         break;

                  case 4:

                  default:

                         var repl = newVal.replace(/[^\d]/g, '');
                         var value = repl.slice(0,3);

                         if(  char == '7') mask = 'z-000-000-00-00';
                         else
                         if( (char == '3') || (char=='9') )
                         {
                            if(value in this._twentyNumbers) mask = 'z00-000-000-000';
                            if(value in this._elevenNumbers) mask = 'z00-000-000-00';
                         }
                         else
                         if(char == '8')
                         {
                            if(repl.slice(1,4)!='800')
                            {
                                 var v=repl.slice(1,(repl.length));
                                 field.val('7'+v);
                            }
                            mask = 'z-000-000-00-00';
                          }
                          else
                            mask = 'z-000-000-00-00';
            }  // of switch
            return mask;
       },
       // Расчет того, что показывать в подсказке города
       _setLabel: function(field) {

            this._setSpanInfo('');
            var val = $(field).val();
            var char = val.charAt(0);

            switch(val.length)
            {
                  case 3:
                         if(val.charAt(0)=='7')
                         {
                           if( (val.charAt(2)=='6') || (val.charAt(2)=='7') )
                               this._setSpanInfo('Страна:  Казахстан (11 цифр)');
                           else
                               this._setSpanInfo('Страна:  Россия (11 цифр)');
                         }

                         if(val.charAt(0)=='3')
                         {
                             for(var i=0;i<this._countries.length;i++)
                            {
                              if(this._countries[i].kod==val)
                                 this._setSpanInfo(this._countries[i].country);
                            }
                         }
                         break;
                  case 4:
                         /*for(var i=0;i<this._countries.length;i++)
                         {
                           if(this._countries[i].kod==val)
                               this._setSpanInfo(this._countries[i].country);
                         }*/

                         break;
                  case 4:
                         for(var i=0;i<this._countries.length;i++)
                         {
                           if(this._countries[i].kod==val)
                               this._setSpanInfo(this._countries[i].country);
                         }


                         break;
                  default:
                         if(char == '7')
                         {
                            if( (val.charAt(2)=='6') || (val.charAt(2)=='7') )
                                this._setSpanInfo('Страна:  Казахстан (11 цифр)');
                            else
                                this._setSpanInfo('Страна:  Россия (11 цифр)');
                         }

                         if( (char == '3') || (char=='9') )
                         {
                            var repl = val.replace(/[^\d]/g, '');
                            value = repl.slice(0,3);
                            if((value in this._twentyNumbers)||(value in this._elevenNumbers))
                            {
                               for(var i=0;i<this._countries.length;i++)
                               {
                                 if(this._countries[i].kod==value)
                                    this._setSpanInfo(this._countries[i].country);
                               }
                            }
                         }
                         if(char == '8')this._setSpanInfo('Введите бесплатный номер 8-800 или начните ввод с 7');
            }  // of switch
       },
       // Унификация работы с подсказкой о стране
       _setSpanInfo: function(text) {
            var span = this.options.tag;
            $(span).find('span[name="'+this._infoLabelName+'"]').remove();
            if($(span).find('span#country').length==0)
                $(span).append('<span name="'+this._infoLabelName+'">'+text+'</span>');
       },
       // !!! обработчик, переданный внутрь mask, где теряется его this
       _keyPressExecute: function(newValue, e, field, options)
       {
            // Получаем контекст виджета вместо потерянного this
            var widget = $(field).data("ui-phoneMask");
            var oldValue=$(field).data('oldVal');

            // задание маски
            var mask = widget._setMask(newValue, field,options);

            // Обновление позиции курсора в инпуте
            var oldCursor = widget._getCursor(field);
            field.mask('z0000000000000000000',options);
            if((mask!=='z-abb-000-00-00')&&(oldValue.charAt(0)!=='8')) $(field).val(oldValue);
            if(mask!=="")
            {
               field.unmask();
               field.mask(mask,options);
            }
            else {
                field.unmask();
               field.mask('z0000000000000000000',options);
            }
            widget._updateCursor(field, oldCursor);

            // Определение страны
            setTimeout(function(){
                widget._setLabel(field);
            }, 20);
       },
       // !!! обработчик, повешенный непосредственно на инпут, а не переданный внутрь mask
       _elementKeyPress: function(event) {
           if(event.charCode) {
               this.value += String.fromCharCode(event.charCode);
               return false
           };
           return true;
       }

    }) // widget
})(jQuery);

