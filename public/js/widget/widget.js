
var user_id = location.pathname.split('/');
var user_id=user_id[2];
if(!user_id||user_id===undefined) user_id=0;
var data = {user_id:user_id};
var eHelp;
var tHelp1;
var tHelp2;
var errorTable;
$(function()
{ 
    eHelp=emailHelp;
    tHelp1=telHelp1;
    tHelp2=telHelp2;
    errorTable='<div class="div-error-info">'+
                 '<p></p>'+
                 '<p class="p-error-info"></p>'+
                 '<table class="error-info-table" width=100%>'+
                   '<tr>'+
                     '<td width=25% class="td-error-info">Описание ошибки:</td>'+
                     '<td class="td-error-info" id="td-error-info"></td>'+
                   '</tr>'+
                   '<tr>'+
                     '<td class="td-error-info">Реквизиты:</td>'+
                     '<td class="td-error-info">'+eHelp+'<br>'+tHelp1+' <br> '+tHelp2+'</td>'+
                   '</tr>'+
                   '<tr>'+
                     '<td id="td-msg-error-info" colspan=2></td>'+
                   '</tr>'+
                 '</table>'+
                '</div>';
});

var addDialogError=function(data)
{

  $('div.reis-not-found-info').html(errorTable);
  $('div.div-error-info').find('p:first').append(data.msg);
  $('div.div-error-info').find('p.p-error-info').append(data.msgController);
  $('div.div-error-info').find('table td#td-error-info').append(data.msgWebService);
  $('div.div-error-info').find('table td#td-msg-error-info').append(errorInfo);
  return;
}

var addDialogErrorInfo=function(data)
{
  $("#dialog-error-info").remove();
  var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="errorInfo">Ошибка!</h4><div class="reis-not-found-info"></div>');
  $(".gobusWidget").append(divErrorInfo);
  addDialogError(data);


  divErrorInfo.dialog
              ({
                width: 600,
                height: 400,
                resizable: true,
                appendTo:".gobusWidget",
                buttons:
                      [{
                        text: "Закрыть",
                        click: function() {   $( this ).dialog( "close" );    }
                      }]
                });
  return;
}

var addDialogErrorSpanInfo=function()
{
  $("#dialog-error-info").remove();
  var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="errorInfo">Код изменен. Необходимо использовать оригинальный код, предоставненный gobus</h4><div class="reis-not-found-info"></div>');
  $(".gobusWidget").append(divErrorInfo);

  divErrorInfo.dialog
              ({
                width: 600,
                height: 400,
                resizable: true,
                appendTo:".gobusWidget",
                buttons:
                      [{
                        text: "Закрыть",
                        click: function() {   $( this ).dialog( "close" );    }
                      }]
                });
  return;
}

var jsonPhoneConfig=function(protokol,host){
   $.ajax({
               url: '/widget/'+user_id+'/json-phone-config',
               type: 'post',
               dataType: "json",
               data: { protokol: protokol,
                       host: host},

               success: function( data )
               {
                 if(data.success==false) addDialogErrorInfo(data);
                 else{   if(data.config) $("span.configPhone").html("Горячая линия "+data.config);   }
               },
           });
}

$(function()
{

   var browserArrays=navigator.userAgent.split(' ');/*массив из имени браузера его версии и тд*/
   var browserType=browserArrays[browserArrays.length-1];/*имя браузера/версия браузера*/
   var browserNameArray=browserType.split('/');
   var browserName=browserNameArray[0];/*только имя браузера*/
   var parent_url=document.referrer;
   var parentUrl=parent_url.split('/');
   var cookie='';

   var setCookie1=function(){
      /*cookie=getCookie('PHPPARENTURL');*/
      if(cookie===null||cookie==='') {
          setCookie('PHPPARENTURL',parent_url, 1);
          cookie=getCookie('PHPPARENTURL');
      }
  }

   var setCookie2=function(){
     var cookie_=document.cookie.split(';');
     cookie=null;
     cookie_.forEach(function(item,i,arr){
        var cook=item.split('=');
        if(cook[0]=='PHPPARENTURL') { cookie=cook[1]; return 1; }
     });
     if(cookie===null||cookie==='') {
       document.cookie="PHPPARENTURL="+parent_url+"; SameSite=None; Secure";
       cookie_=document.cookie.split(';');
       cookie_.forEach(function(item,i,arr){
         var cook=item.split('=');
         if(cook[0].replace(/\s/g, '')=='PHPPARENTURL') { cookie=cook[1]; return 1; }
       });
     }
   }
    /*debugger;*/

    /*if(browserName=='Firefox'){

       setCookie1();
   }

   if(browserName=='Edg'||browserName=='OPR') setCookie2();
   if(browserName=='Safari'){
       var browserType1=browserArrays[browserArrays.length-2];
       var browserNameArray1=browserType1.split('/');
       var browserName1=browserNameArray1[0];

       if(browserName1=='Chrome') setCookie2();
       if(browserName1=='Yowser') setCookie1();
   }*/

    cookie=getCookie('PHPPARENTURL');
    if (cookie==null){setCookie1(); $('div.header').css('opacity','0'); location.reload();}

    cookie=getCookie('PHPPARENTURL');
    if(cookie==null){
        setCookie2(); $('div.header').css('opacity','0'); location.reload();
    }
 /*$('div.gobusWidget').show();*/
   
   
   var parentUrl=cookie.split('/');
   var protokol=parentUrl[0].slice(0,parentUrl[0].indexOf(':'));
   var host=parentUrl[2];
   jsonPhoneConfig(protokol,host); /*получить номер тел перевозчика*/

   $.ajax({
               url: '/widget/'+user_id+'/check-span',
               type: 'post',
               dataType: "json",
               data: { parentUrl:cookie },

               success: function( data )
               {
                 if(data.success==false)/*addDialogErrorSpanInfo();*/ { $("#dialog-error-info").remove();
                                                                         var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="errorInfo">Ошибка при получении cookie. Включите cookie и перезагрузите страницу нажав F5</h4><div class="reis-not-found-info"></div>');
                                                                         $(".gobusWidget").append(divErrorInfo);

                                                                         divErrorInfo.dialog
                                                                                          ({
                                                                                            width: 600,
                                                                                            height: 400,
                                                                                            resizable: true,
                                                                                            appendTo:".gobusWidget",
                                                                                            buttons:
                                                                                                   [{
                                                                                                      text: "Закрыть",
                                                                                                      click: function() {   $( this ).dialog( "close" );    }
                                                                                                    }]
                                                                                           });
                                                                         return;
                                                                      }
               }
           });//$.ajax

   $("a.returnTicketToUser").attr('href','/widget-ticket-return/'+user_id+'/'+protokol+'/'+host);

   var pay_button_title = "Билеты";
   var min_d = new Date();
   min_d.setDate(min_d.getDate()+0);
   var min_costs = {};
   var min_costs_key = "0-0";

   var selectDate = function(dateStr, instance)
   {
     if( !dateStr )
       $(this).siblings("span.geocode").text("Укажите дату!").addClass("warning");
     else
       $(this).siblings("span.geocode").text("").removeClass("warning");
   }

   var showPicker = function()
   {
     setTimeout(function()
     {
       $( "input.icon-calendar, input.widget_calendar" ).datepicker("show");
     }, 100);
   }

   var clearPage = function()
   {
     $(".tbody-widget").empty();
   }
  /* $("input.search-from").menu("option","beforeShow",
   function()
   {$('.gobusWidget').append($('.ui-menu'));});*/

   $( "input.icon-calendar, input.widget_calendar" )
        .datepicker($.datepicker.regional[ "ru" ])
        .datepicker("option","beforeShow",
         function(textbox, instance)
         {$('.gobusWidget').append($('#ui-datepicker-div')); } )
        .datepicker("option", "showOn",  "none")

        .datepicker("option", "fromTo",  false)
        .datepicker("option", "autoPopUp",  "focus")
        .datepicker("option", "numberOfMonths",  2)
        .datepicker("option", "minDate",  min_d)

        .datepicker("option", "defaultDate",  min_d)
        .datepicker("option", "maxDate",  '+4M')
        .datepicker("option", "onClose",  selectDate)
        .datepicker("option", "beforeShowDay",

                      function (date)
                      {
                        var dd = date.getDate();
                        if (dd < 10) dd = '0' + dd;
                        var mm = date.getMonth() + 1;
                        if (mm < 10) mm = '0' + mm;
                        var Y = date.getFullYear();
                        date = dd + '.' + mm + '.' + Y;
                        return [true, 'show-date-min-cost', (min_costs[date]!=undefined) ? min_costs[date]+'СЂ.' : '&nbsp;'];
                      }
                   )
        .datepicker("setDate", min_d)

        .on('focus', function ()


   { //get price

     var self = $(this);

     var ajax_data =
                    {
                     date: $("input.icon-calendar").val(),
                     from: $("input.search-from").siblings(":hidden").val(),
                     from_name: $("input.search-from").val(),
                     to: $("input.search-to").siblings(":hidden").val(),
                     to_name: $("input.search-to").val(),
                    };

     if( (self.attr("completed")=="true") || (ajax_data.from_name=='') || (ajax_data.to_name=='') )
       return showPicker();

     $.ajax({
               url: '/ajax/main-page-min-prices',
               type: 'post',
               dataType: "json",
               data: ajax_data,

               beforeSend: function(jqXHR, settings)
               {
                 $( "input.icon-calendar" ).before($('<i id="detail-spinner" class="fa fa-spinner fa-pulse fa-fw fa-1x" />'));
               },

               complete: function(jqXHR, textStatus)
               {
                 $("#detail-spinner").remove();
               },

               success: function( data )
               {
                 self.attr("completed", true);
                 min_costs = data;
                 showPicker();
               },
            });//$.ajax
   });

   $("input.icon-calendar  + span, input.widget_calendar + span").on("click", function()
   {
     $(this).prev().trigger("focus");
   });

   var resetInput = function(input)
   {
     input = $(input);
     input.siblings(":hidden").val("");
     input.siblings("span.geocode").text("");
     input.next("span").hide();
   };

   $("input.search-from + span, input.search-to + span")
     .on("click", function()
         {
           $(this).prev().autocomplete("close").val('');
           resetInput(this);
         })
      .hide();


   var getSitysList = function( request, response )
   {
     $.ajax({
              url: '/ajax/main-page-citys-list',
              type: 'post',
              dataType: "json",
              data:
                  {
                    query: request.term,
                  },
              beforeSend: function(jqXHR, settings)
                  {
                    resetInput($("input:focus"));
                  },
              success: function( data )
                  {
                    response( data );
                  },
            });//$.ajax
   };

   var onSelectCity = function( event, ui )
   {
     $(this).siblings(":hidden").val(JSON.stringify(ui.item));
     $(this).siblings("span.geocode").text(ui.item.label).removeClass("warning");
     $(this).next('span').show();
   };

   var renderCityLi = function( ul, item )
   {
     return $( "<li>" )
     .addClass("search-autocomplete")
     .append( $("<div />").text(item.value) )
     .append( $("<div />").text(item.label) )
     .appendTo( ul );
   };

   var autocompleteOptions =
    {
      source: getSitysList,
      minLength: 3,
      select: onSelectCity
    };

   $("input.search-from, input.Application_from").autocomplete(autocompleteOptions).autocomplete("instance")._renderItem = renderCityLi;
   $("input.search-to, input.Application_to").autocomplete(autocompleteOptions).autocomplete("instance")._renderItem = renderCityLi;
   $( "input.search-from" ).autocomplete({ appendTo: ".gobusWidget"});
   $( "input.search-to" ).autocomplete({ appendTo: ".gobusWidget"});

   $("input.search-from, input.search-to, input.Application_from, input.Application_to").on("input", function()
   {
     $( "input.icon-calendar, input.Application_calendar" ).attr("completed", null);
   });


   $("button.reverse-button").on("click", function()
   {
     var tmp = $("input.search-from, input.widget_from").val();
     $("input.search-from, input.widget_from").val($("input.search-to, input.widget_to").val());
     $("input.search-to").val(tmp);

     tmp = $("input.search-from, input.widget_from").siblings("span.geocode").text();
     $("input.search-from, input.widget_from").siblings("span.geocode").text($("input.search-to, input.widget_to").siblings("span.geocode").text());
     $("input.search-to, input.widget_to").siblings("span.geocode").text(tmp);

     tmp = $("input.search-from, input.widget_from").siblings(":hidden").val();
     $("input.search-from, input.widget_from").siblings(":hidden").val($("input.search-to, input.widget_to").siblings(":hidden").val());
     $("input.search-to, input.widget_to").siblings(":hidden").val(tmp);

     $("button.reverse-button").blur();
     $( "input.icon-calendar, input.widget_calendar" ).attr("completed", null).datepicker("hide");

     return false;
   });

   $.ajax({
            url: '/widget/'+user_id+'/get-index-page-data',
            type: 'post',
            dataType: "json",
            data: user_id,

            beforeSend: function(jqXHR, settings)
            {
              $("tfoot#step1-widget").hide();
              $(".gobusWidget").append($('<div />').attr('id', 'load-indicator').show());
            },

            success: function( data )
            {
              if(data.success==true)
              {

                     /*       $("tfoot#step1-widget").hide();*/
                $('div.search-result-div-widget').append($('<div />').text("Отправление").addClass('dispatchDiv'))
                                                 .append($('<div />').text("Прибытие").addClass('arrivalDiv'))
                                                 .append($('<div />').text("Рейс").addClass('tripDiv'))
                                                 .append($('<div />').text("Цена").addClass('priceDiv'));



                var tableBodyContent=[];

                for(var i=0;i<data.trips.length;i++)
                {
                  tableBodyContent.push(tpl(data.trips,i));
                }
                $("tbody.tbody-widget").each(function(){$(this).append(tableBodyContent); });
              }
              else addDialogErrorInfo(data);
            },
            error: function(a){ alert('Load was failed.');  },

            complete: function(jqXHR, textStatus)
            {
              $(".gobusWidget div#load-indicator").remove();
            }
          });

   $("button.search-trip-button").unbind("click").on("click", function(event)
   {
     var date=$("input.icon-calendar").val();
     date=date.split('.');
     date=date[2]+'-'+date[1]+'-'+date[0];

     var from_name=$("input.search-from").val();
     var to_name=$("input.search-to").val();
     if(from_name==""||to_name=="") return;
     var ajax_data_search =
              {
                 date: date,
                 from: $("input.search-from").siblings(":hidden").val(),
                 from_name: from_name,
                 to: $("input.search-to").siblings(":hidden").val(),
                 to_name: to_name,
              };

     clearPage();

     $.ajax({
              url: '/widget/'+user_id+'/get-trip',
              type: 'post',
              dataType: "json",
              data: ajax_data_search,

              beforeSend: function(jqXHR, settings)
              {
                $("tfoot#step1-widget").hide();
                $(".gobusWidget").append($('<div />').attr('id', 'load-indicator').show());
              },

              success: function(data)
              {
                var a=data;
                if(data.success==true&&data.trips!==null)
                {

                  $("tfoot#step1-widget").hide();
                            /*$("thead.non-mobile-only-widget").show();*/
                  $('div.search-result-div-widget').show();


                  var tableBodyContent=[];

                  if(parse(data.trips,'id')&&(parse(data.trips,'price')!==0))
                    tableBodyContent.push(tpl(data.trips));
                  else
                    for(var i=0;i<data.trips.length;i++)
                    {
                       if(parse(data.trips[i],'price')!=='0')
                          tableBodyContent.push(tpl(data.trips,i));
                    }

                  $("tbody").each(function(){$(this).append(tableBodyContent); });

                }
                if(data.trips.length==0)
                {
                  $("tfoot#step1-widget").show();
                            /*$("thead.non-mobile-only-widget").hide();*/
                  $('div.search-result-div-widget').hide();
                }
                if(data.success==false) addDialogErrorInfo(data);
              },

              complete: function(jqXHR, textStatus)
              {
                $("body div#load-indicator").remove();
              }
           });
    });

    return;
});

var parse = function(data, name)
{
  if(data[name]) return data[name];
  return "";
}

var tpl = function(data,item)
{
  item = (typeof item !== 'undefined') ?  item : -1;
  if(item==-1) var tData=data;
  else var tData=data[item];

  var start = parse(tData, 'dispatchDate');
  start=start.split('T');
  var d_start = start[0] ? start[0] : '';
  var t_start = start[1] ? start[1] : '';

  var end = parse(tData, 'arrivalDate');
  end=end.split('T');
  var d_end = end[0] ? end[0] : '';
  var t_end = end[1] ? end[1] : '';


  var d_start = d_start.split("-");


  d_start[1] = $.datepicker.regional["ru"].monthNames[d_start[1]-1];

  d_start = d_start[2] + ' ' + d_start[1].toLowerCase();
  t_start=t_start.slice(0,5);

  var d_end = d_end.split("-");
  d_end[1] = $.datepicker.regional["ru"].monthNames[d_end[1]-1];
  d_end = d_end[2] + ' ' + d_end[1].toLowerCase();
  t_end=t_end.slice(0,5);

  /*var name_dispatch_arrival=parse(tData,'name');
  var name_dispatch_arrival=name_dispatch_arrival.split("-");*/

  var empty_places = parse(tData, 'empty_places');
  var reis_num = parse(tData, 'id');
  if(reis_num.length > 10) reis_num = " б/н";

  return ''+
       '         <tr>'+
       '            <td class="dispatchTd">' +
       '                <div class="dispatch_time">' +
                           t_start+
       '                </div>'+
       '                <div class="dispatch_date">'+
                            d_start+
       '                </div>'+
       '                <div class="dispatch_station">'+
                         /*   name_dispatch_arrival[0]+', '+parse(tData,'dispatchStationName')+*/
                            parse(tData,'dispatchCityName')+', '+parse(tData,'dispatchStationName')+
        '               </div>'+
       '            </td>'+
       '            <td class="arrivalTd">' +
       '                <div class="arrival_time">'+
                            t_end+
       '                </div>'+
       '                <div class="arrival_date">'+
                            d_end+
       '                </div>'+
       '                <div class="arrival_station">'+
                           /* name_dispatch_arrival[1]+' '+parse(tData,'arrivalStationName')+*/
                            parse(tData,'arrivalCityName')+', '+parse(tData,'arrivalStationName')+
       '                </div>'+
       '            </td>'+
       '            <td class="tripTd">'+
       '                <div class="route">'+
       '                 <a class="ticket-pay-buy" href="/widget/'+user_id+'/ticket/pay/'+parse(tData, 'id')+'/'+parse(tData,'dispatchStationId')+'/'+parse(tData,'arrivalStationId')+'">'+
                            parse(tData,'name')+' '+t_start+
       '                 </a>'+
       '                </div>'+
       '                <div class="route_discription">'+
                            parse(tData,'busInfo')+', свободноv '+parse(tData,'freeSeatCount')+','+
       '                    <br>'+
       '                    Перевозчик '+ parse(tData,'carrierName')+
       '                </div>'+
       '                <div class="time_route">'+
       '                   Время в пути: '+
                           parse(tData,'pathTime')+
       '                </div>'+
       '            </td>'+
       '            <td class="priceTd">'+
       '                 <div class="price">'+
                              parse(tData,'price')+' руб'+
       '                 </div>'+
       '                 <a class="ticket-pay-buy-button" href="/widget/'+user_id+'/ticket/pay/'+parse(tData, 'id')+'/'+parse(tData,'dispatchStationId')+'/'+parse(tData,'arrivalStationId')+'">'+
       /*'                 <a class="ticket-pay-buy-button" href="/widget/'+user_id+'/ticket/pay/'+parse(data[item], 'id')+'?'+params+'">'+*/

       '                 <div class="buy-button">'+
       '                     <div class="buy-button-name">Купить</div>'+
       '                 </div>'+
       '            </td>'+
       '         </tr>'+
       '';

}


