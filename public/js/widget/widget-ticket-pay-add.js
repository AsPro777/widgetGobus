
var parse = function(data, name)
{
  if(data[name]) return data[name];
  return "";
}

//запрещает вносить любые символы в поле номера места
var notinput=function (input)
{
  input.value = input.value.replace(/[^d]/g, '');
}

//добавляет строку в контейнер Пассажиры
var addRow=function(passenger_tarif,passenger_baggage,rowNumber)//добавит строку для ввода пользователем своих данных
{
  if(passenger_baggage) var pas_baggage='<td class="mobile-only">Количество мест багажа</td>'+
                                          '<td class="baggage-pas">'+passenger_baggage+'</td>';
  else var pas_baggage='';

  var addRowPassenger=
        '        <tbody class="passengerData_'+rowNumber+'">'+
        '          <tr>'+
        '             <td class="placeNumber">'+
        '             <span class="mobile-only">'+
        '                  <span class="pax-counter">'+
        '                  </span>'+
        '                  <span class="text-muted mobile-label" >Номер места: '+
        '                  </span>'+
        '             </span>'+
        '             <br class="mobile-only">'+
        '                <div>'+
        '                    <input name="place-number" class="place-number form-control pas-input" onkeyup="return notinput(this)" onchange="return notinput(this)" type="text" title="Нажмите на это поле и выберите место на схеме">'+
        '                    <span class="mobile-only text-muted small">'+
        '                      Нажмите на это поле и выберите место на&nbsp;схеме'+
        '                    </span>'+
        '                </div>'+
        '             </td>'+
                      pas_baggage+
        '             <td class="mobile-only">Тариф</td>'+
        '             <td class="tarif-pas">'+
                         passenger_tarif+
        '             </td>'+
        '             <td class="mobile-only">Фамилия</td>'+
        '             <td class="surname tdClose">'+
        '                 <input type="text" placeholder="Фамилия" class="surname_input icon-close error pas-input" name="f">'+
        '                      <span class="iconClosePas">'+
        '                      </span>'+
        '             </td>'+
        '             <td class="mobile-only">Имя</td>'+
        '             <td class="name tdClose">'+
        '                 <input type="text" placeholder="Имя" class="name_input icon-close error pas-input" name="i">'+
        '                      <span class="iconClosePas">'+
        '                      </span>'+
        '             </td>'+
        '             <td class="mobile-only">Отчество</td>'+
        '             <td class="secondName tdClose">'+
        '                 <input type="text" placeholder="Отчество" class="secondName_input icon-close error pas-input" name="o" >'+
        '                      <span class="iconClosePas">'+
        '                      </span>'+
        '             </td>'+
        '             <td class="mobile-only">Пол</td>'+
        '             <td class="gender-pas">'+
        '                 <select name="sex" class="sex">'+
        '                   <option value="0">Ж</option>'+
        '                   <option value="1">М</option>'+
        '             </td>'+
        '             <td class="mobile-only">Дата рождения</td>'+
        '             <td class="dateCalendar tdClose">'+
        '                 <input name="dr" type="text" placeholder="дд.мм.гггг" maxlength="10" class="dr_input icon-close error pas-input">'+
        '                 <span class="iconClosePas">'+
        '                 </span>'+
        '             </td>'+
        '             <td class="mobile-only">Гражданство</td>'+
        '             <td class="grazdanstvo tdClose">'+
        '                <input name="grazd" type="text" value="Россия" placeholder="страна" title="" class="grazd_input icon-close pas-input" data-id="RU">'+
        '                <span class="iconClosePas">'+
        '                </span>'+
        '             </td>'+
        '             <td class="mobile-only">Удостоверение личности</td>'+
        '             <td class="document tdClose">'+
        '                 <input name="doc" type="text" value="Паспорт гражданина Российской Федерации" placeholder="вид документа" title="" class="doc_input icon-close pas-input" data-id="0">'+
        '                 <span class="iconClosePas">'+
        '                 </span>'+
        '             </td>'+
        '             <td class="mobile-only">Серия и номер удостоверения'+
        '                <td class="mobile-only">'+
        '                  <div class="docnumhelp text-muted mobile-only">'+
        '                  </div>'+
        '                </td>'+
        '             </td>'+
        '             <td class="docNumber tdClose">'+
        '                 <input name="docnum" type="text" placeholder="0000 000000" maxlength="11" class="docnum_input icon-close error pas-input">'+
        '                 <span class="iconClosePas">'+
        '                 </span>'+
        '             </td>'+
        '             <td class="button-trash-info">'+
        '                <div class="button_trash trash" title="Удалить пассажира">'+
        '                   <span class="mobile-only">Удалить пассажира'+
        '                   </span>'+
        '                   <i class="fa fa-close">'+
        '                   </i>'+
        '                </div>'+
        '                <div class="button_info docnumhelp info non-mobile-only">'+
        '                    <i class="fa fa-info"></i>'+
        '                </div>'+
        '                <div class="button add mobile-only">'+
        '                   <span>Добавить пассажира</span>'+
        '                   <i class="fa fa-plus"></i>'+
        '                </div>'+
        '             </td>'+
        '          </tr>'+
        '        </tbody>';

  return addRowPassenger;
};

var passengerNumber=function(){
  var i=1;
  $('.pax-counter').empty();
  $('.pax-counter').each(function(index){
        $(this).html('Пассажир '+i);
        i++;
  });  
};

//удаляет строку из контейнера Пассажиры
var deleteRow=function(i,ch)
{
  ch=(typeof ch!=='undefined')? ch:-1;  
  if (count <= 1)
  {
    $("#dialog-error-info").remove();
    var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="notice">Остался единственный пассажир!</h4>');
    $("body").append(divErrorInfo);
    divErrorInfo.dialog
                       ({
                         width: 600,
                         height: 300,
                         resizable: true,
                         appendTo:".gobusWidget",
                         open: function(event, ui)
                             {
                              $('.gobusWidget div.passenger-tables').css('background-color','whitesmoke');
                             },
                          buttons:
                              [{
                                text: "Закрыть",
                                click: function() {   $( this ).dialog( "close" );    }
                               }]
                        });
  }//alert('Остался единственный пассажир!');
  else
  {
    var tr = $(".passengerData_"+i );
    var tr_info=$("table.passengers tbody.passengerData_"+i+" tr.info");
    $(this).removeClass("my-blocked");
    tr.hide(300);
    tr_info.hide(300);
    setTimeout(function()
    {
      tr.remove()  ;
      tr_info.remove();
      count--;
      if(ch==-1) updateRowsPassengers();
      
     passengerNumber();
    }, 100);
    
    
  }
  return;
}

//вешает события(удалить строку и вывести инфу о том как правильно вводить номер документа) на строку из контейнера Пассажиры.
var addEvents=function(i,ch)
{
  ch=(typeof ch!=='undefined')? ch : -1;
  
  var el=$('table#paxes td.placeNumber > div');
  el.unbind('click').bind('click',swing);

  $("table.passengers tbody.passengerData_"+i+" div.button_trash").unbind('click',deleteRow);
  if(ch==-1)$("table.passengers tbody.passengerData_"+i+" div.button_trash").bind('click',function(){deleteRow(i);});
  else $("table.passengers tbody.passengerData_"+i+" div.button_trash").bind('click',function(){deleteRow(i,ch);});
  $("table.passengers tbody.passengerData_"+i).find("input[name=place-number], input[name=f], input[name=i], input[name=o], input[name=dr], input[name=grazd], input[name=doc], input[name=docnum]")
                            .unbind("input blur keyup focus")
                            .on("input blur keyup focus", isValidForm);
  $(document).ready(function(){ $("table.passengers tbody.passengerData_"+i).find('.dr_input').mask('00.00.0000')});//привяжем маску на ввод даты

  $(document).ready(function(){ $("table.passengers tbody.passengerData_"+i).find('.docnum_input').mask('0000 000000')});

  autocompleteGrazd();
  autocompleteDoc();
  infoRow($('table.passengers tbody.passengerData_'+i),1);
  closeInput();
}

//создает информационное сообщение
var infoRow=function(event,ui,flag)
{
  flag=(typeof flag!=='undefined')? flag : 0;  
    
  if (flag==0)
  {
    var docnumhelp = $(event).find("div.docnumhelp");
    docnumhelp.each(function(a,b)
    {
      if($(this).hasClass('non-mobile-only'))
      $(this).attr("title","Формат номера документа:\n4+6 цифр\nПример 2002 123456");
      if($(this).hasClass('mobile-only')) $(this).html("Формат номера документа:\n4+6 цифр\nПример 2002 123456");
    });

    return;
  }
  else
  {
    var target=$(event.target);
    var docnumhelp = $(target).closest("tr").find("div.docnumhelp");
    docnumhelp.each(function(a,b)
    {
      if($(this).hasClass('non-mobile-only'))
      $(this).attr("title","Формат номера документа:\n"+(ui.item.example?ui.item.example.replace("<br>","").split("<br>").join("\n"):"произвольный, как в документе."));
      if($(this).hasClass('mobile-only')) $(this).html("Формат номера документа:\n"+(ui.item.example?ui.item.example.replace("<br>","").split("<br>").join("\n"):"произвольный, как в документе."));
    });
    return;
  }
}

//нажатие на кнопку Добавить пассажира
var addButton=function(ch)//в случае когда автобус прорисован функция вызывается так-addButton(data) и ch=0 соответственно, если автобус-чекбоксы то функция вызывается так addButton(data,freeCheck) где freeCheck-массив из номеров забронированных пользователем мест
{
  ch=(typeof ch!=='undefined')? ch : -1;  
  count++;//количество добавленных строк
  rowNumber++;//номера добавляемых строк
  var places=0;//количество свободных в автобусе мест

  if(ch===-1)
  {
    if(freePlaces<count)
    {
        //alert('мест нет');
      $("#dialog-error-info").remove();
      var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="notice">Мест нет!</h4>');
      $("body").append(divErrorInfo);
      divErrorInfo.dialog
                       ({
                         width: 600,
                         height: 300,
                         resizable: true,
                         appendTo:".gobusWidget",
                         open: function(event, ui)
                             {
                              $('.gobusWidget div.passenger-tables').css('background-color','whitesmoke');
                             },
                          buttons:
                              [{
                                text: "Закрыть",
                                click: function() {   $( this ).dialog( "close" );    }
                               }]
                        });
      count--;rowNumber--; return false;
    }
    else
    {
      var addR=addRow(passenger_tarif,passenger_baggage,rowNumber);
      addR=$(addR);
      $("table.passengers").append(addR);
      
      passengerNumber();

      $(".button.add.mobile-only").unbind("click").on("click",function(){addButton(-1);});
      addEvents(rowNumber);

      var row=$('table.passengers tbody.passengerData_'+rowNumber);
    }
  }

  return true;
};

//при вводе символов в инпуты с ФИО будет запускаться эта функция. Она проверяет правильность введенных символов в эти инпуты
var isValidForm = function(subm)
{
  subm=(typeof subm!=='undefined') ? subm : 0;
  var result = true;
  if(!isValidText("place-number")) result = false;
  if(!isValidText("f")) result = false;
  if(!isValidText("i")) result = false;
  if(!isValidText("o")) result = false;
  if(!isValidFIO()) result = false;
  if(!isValidDate("dr")) result = false;
  if(subm===0)
  {
    if(!isValidAutocompleter(this,-1)) result = false;
  }
  else
  {
    if(!isValidAutocompleter(undefined,-1,"grazd")) result = false;
    if(!isValidAutocompleter(undefined,-1,"doc")) result = false;

    var rus_docs = [0,2,4,5,7,8,10,11,13];
    var mas_data_id_doc=$('.doc_input');
    var mas_data_id_gr=$('.grazd_input');
    for(var i=0;i<mas_data_id_doc.length;i++)
    {
      var data_id_doc=mas_data_id_doc[i].attributes['data-id'].nodeValue;
      var data_id_gr=mas_data_id_gr[i].attributes['data-id'].nodeValue;
     /* var in_docs_array=rus_docs.includes(+data_id_doc);*/
     var dat=+data_id_doc;
     var in_docs_array=false;
     for(var j=0;j<rus_docs.length;j++)
     {
         if(rus_docs[j]===dat){
             in_docs_array=true;
             break;
         } 
     }
     
     
      if((in_docs_array==true)&&(data_id_gr!=='RU')){ dialogMsg= 'error_doc_rf'; result=false; break;}
      if((in_docs_array==false)&&(data_id_gr=='RU')) { dialogMsg= 'error_doc_not_rf'; result=false; break;}
    }
            /*
            var data_id_doc=$('.doc_input').attr('data-id');
            var data_id_gr=$('.grazd_input').attr('data-id');
            var rus_docs = [0,2,5,7,8,10,11,13];
            var in_docs_array=rus_docs.includes(+data_id_doc);
            if((in_docs_array==true)&&(data_id_gr!=='RU')){ dialogMsg= 'error_doc_rf'; result=false;}
            if((in_docs_array==false)&&(data_id_gr=='RU')) { dialogMsg= 'error_doc_not_rf'; result=false;}*/
  }
  if(!isValidMasker("docnum")) result = false;

  return result;
};


var isValidText = function(name)
{ 
  var result = true;
  var items = $("[name='"+name+"']");
  for(var i=0;i<items.length;i++)
  {
    var item = $(items[i]);
    if(item.val()=="")
    {
      item.addClass("error");
      result = false;
    }
    else
    {
      item.removeClass("error");
    }
  };
  return result;
}

//выбирает набор из tbody в которых есть инпуты с ФИО. Далее проверяет что в них вводится.Если вводим не те символы то в этом же tbody
//под тегом tr со строкой данных о пассажире создаем еще один tr с сообщен об ошибке
var isValidFIO = function()
{
  var result = true;
        //var bodys = $("tr td:has(input[name='f'])");
  var bodys=$("table.passengers tbody:has(input[name='f'])");

  $.each(bodys, function(i, body)
  {
    var err_msg = [];

    var f = $(body).find(":input[name='f']");
    var i = $(body).find(":input[name='i']");
    var o = $(body).find(":input[name='o']");

    if(f.val()!="") f.removeClass("error");
    if(i.val()!="") i.removeClass("error");
    if(o.val()!="") o.removeClass("error");

    $(body).find("tr.error").remove();

    if( /[^a-zA-Zа-яА-ЯЁё `-]+/.test(f.val()) )
    {
      err_msg.push("В Фамилии должны использоваться только буквы, пробелы, тире и апостроф (`)!");
      f.addClass("error");
      result = false;
    }
    if( /[^a-zA-Zа-яА-ЯЁё -]+/.test(i.val()) )
    {
      err_msg.push("В имени должны использоваться только буквы, пробелы и тире!");
      i.addClass("error");
      result = false;
    }
    if( /[^a-zA-Zа-яА-ЯЁё -]+/.test(o.val()) )
    {
      err_msg.push("В отчестве должны использоваться только буквы, пробелы и тире!");
      o.addClass("error");
      result = false;
    }

    var fio = f.val() + i.val() + o.val();
    if( /[a-zA-Z]+/.test(fio) && /[а-яА-ЯЁё]+/.test(fio))
    {
      err_msg.push("В ФИО не должны использоваться одновременно символы разных алфавитов!");
      f.addClass("error");
      i.addClass("error");
      o.addClass("error");
      result = false;
    }

    if(err_msg.length>0)
    {
      err_msg = err_msg.join("<br>");
      $(body).find("tr").first().css({"border-bottom":"none"});
      var colspan = $(body).find("tr").first().find("td").length;
      $(body).append($("<tr class=error>").append($("<td />").attr("colspan", colspan-1).html(err_msg)));
    }
    else
    {
      $(body).find("tr").first().css({"border-bottom":"1px solid #343434"});
    }
  });

  return result;
}

//если инпут с датой пустой или в нем неверная дата введена-добавить класс error
var isValidDate = function (name)
{
  var result = true;
  var items = $("[name='"+name+"']");
  for(var i=0;i<items.length;i++)
  {
    var item = $(items[i]);
    item.removeClass("error");

    date = item.val().split('.');
    if(date.length<3) {item.addClass("error");result = false;};

    var d = date[0], m = date[1], y = date[2];
    var dt = new Date();
    if((y <= 1920) || (y>dt.getUTCFullYear())) {item.addClass("error");result = false;};
    dt.setUTCFullYear(y, m-1, d);
    var correct = ((y == dt.getUTCFullYear()) && ((m-1) == dt.getUTCMonth()) && (d == dt.getUTCDate()));
    if(!correct) {item.addClass("error");result = false;};
    if(new Date() < dt) {item.addClass("error");result = false;};
  };
  return result;
}

//если у инпута с фокусом ввода пустое значение-задать ему класс error,если поле заполнено убрать этот класс
var isValidAutocompleter = function(target,badVal,name)
{
  name=(typeof name!=='undefined')? name : 0;
  var result = true;
//badVal- это признак того что пользоватьль сам вводит текст в поля Гражданство и документ, тогда он будет 0 или -1
  if(badVal == undefined) badVal = 0;
  if(target==undefined)//если проверяем заполнение формы после нажатия на кнопку submit то target=undefined
  {
    var items = $("[name='"+name+"']");
    for(var i=0;i<items.length;i++)
    {
      var item = $(items[i]);
      if(item.attr("data-id")<=badVal||item.val()==='')
      {
        item.addClass("error");
        result = false;
      }
      else
      {
        item.removeClass("error");
      }
    };
   }
   else
   {
     var target=$(target);
     if(target.attr("data-id")<=badVal||target.val()==='')
     {
       target.addClass("error");
       result = false;
     }
     else
       target.removeClass("error");
    };
    return result;
};

//автозаполнение инпута Гражданство
var autocompleteGrazd=function()
{
  $("[name=grazd]").autocomplete
  ({
     source: function( request, response )
     {
       $.ajax({
               url: '/ajax/get-country',
               type: 'post',
               dataType: "json",
               data:
                    {
                      query: request.term,
                    },
               success: function( data )
               {
                 response( data );
               },

              });//$.ajax
     },
     minLength: 0,
     select: function( event, ui )
     {
       var target=$(event.target);
       target.attr("data-id", ui.item.iso).attr("title", ui.item.label).removeClass("error");
     }
   })
   .unbind("blur dblclick input")

   .on("blur", function()
        {
          if(parseInt($(this).attr("data-id"))==-1)
           {

             $(this).val("");
           }
        })
   .on("input",function()
        {
          $(this).attr("data-id",-1);
        })
   .on("dblclick", function()
       {
          $(this).autocomplete("search", "");
       });
}

//автозаполнение инпута документ
var autocompleteDoc=function()
{
  $("[name=doc]").autocomplete
  ({
     minLength: 0,
     source: function( request, response )
     {
        $.ajax({
                 url: '/ajax/get-doc-type',
                 type: 'post',
                 dataType: "json",
                 data:
                     {
                       query: request.term,
                     },
                 success: function( data )
                     {
                        response( data );
                     },
                 beforeSend: function(jqXHR, settings) {},
               });//$.ajax
     },
     select: function( event, ui )
     {
       var target=$(event.target);
       target.attr("data-id", ui.item.id).attr("title", ui.item.label).removeClass("error");

       var docnum = $(target).closest("tr").find("input[name='docnum']");
       docnum.val('');
       $(document).ready(function(){ $(docnum).mask(ui.item.mask)});

       docnum.attr("placeholder",ui.item.mask?ui.item.mask:" ");
       infoRow(event,ui,1);

     },
   })
   .unbind("blur dblclick input")

   .on("blur", function()
   {
     if(parseInt($(this).attr("data-id"))==-1) $(this).val("");
   })
   .on("input",function()
   {
     $(this).attr("data-id",-1);
   })
   .on("dblclick", function()
   {
     $(this).autocomplete("search", "");
   });
}

var isValidMasker = function(name)
{
  var result = true;
  var items = $("[name='"+name+"']");

  for(var i=0;i<items.length;i++)
  {
    var item = $(items[i]);
    item.removeClass("error");
    var value = item.val();
    var mask = $.trim(item.attr("placeholder"));
    var hasMask = mask.split("_").join("") != "";

    if($.trim(value)==""||value.length<6) {item.addClass("error");result = false;};
    if( !hasMask ) continue;
    if(value.length!=mask.length) {item.addClass("error");result = false;};
  };
  return result;
}

var closeInput=function()
{
  $("td.tdClose span.iconClose, span.iconClosePas").unbind("click").on("click", function()
  {
    $(this).prev().addClass('error');
    $(this).prev().val('').blur();

    if($(this).prev().attr("name")=="grazd")
    {
      $(this).prev().attr("data-id", 0).val('').blur();
      $(this).prev().addClass('error');
    }
    if($(this).prev().attr("name")=="doc")
    {
      $(this).prev().attr("data-id", -1).val('').blur();
      $(this).prev().addClass('error');
      $(this).prev().attr("title","Выберите тип документа");
      $(this).prev().attr("placeholder","Документ");
      $(this).closest('tr').find("input[name=docnum]").val('');
    }
    if($("[name^=infoLabel-phoneMask]")) $("[name^=infoLabel-phoneMask]").text("");
    return false;
   });
}

