
var hrefData;
var eHelp;
var tHelp1;
var tHelp2;
var errorTable;
var cookie=null;
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
  /*$('div#form').css('display','block').css('background-color','whitesmoke');
  $('div.passenger-tables').css('background-color','white');
  $('table.search-result-table').css('margin','auto');*/
      $('div.passenger-tables').removeClass('passenger-tables').addClass('error-passenger-tables');
  $('table.search-result-table').removeClass('search-result-table');
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
  $("body").append(divErrorInfo);
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

var jsonPhoneConfig=function(protokol,host){
   $.ajax({
               url: '/widget/'+path+'/json-phone-config',
               type: 'post',
               dataType: "json",
               data: { protokol: protokol,
                       host: host},

               success: function( data )
               {
                 if(data.success==false)addDialogErrorSpanInfo();
                 else{   if(data.config) $("span.configPhone").html("Горячая линия "+data.config);   }
               },
           });//$.ajax
}

$(function ()
{
  var parse = function(data, name)
  {
    if(data[name]) return data[name];
    return "";
  }



   var parent_url=document.referrer;
   var browserArrays=navigator.userAgent.split(' ');
   var browserType=browserArrays[browserArrays.length-1];
   var browserNameArray=browserType.split('/');
   var browserName=browserNameArray[0];

    
   /* if(browserName=='Firefox'){
       cookie=getCookie('PHPPARENTURL');
   }
   if(browserName=='Edg'||browserName=='OPR') {
       cookie=getCookie('PHPPARENTURL');
   }
   
   if(browserName=='Safari'){
       var browserType1=browserArrays[browserArrays.length-2];
       var browserNameArray1=browserType1.split('/');
       var browserName1=browserNameArray1[0];
       
       if(browserName1=='Chrome') {
           var cookie_=document.cookie.split(';');
           cookie=null;
           cookie_.forEach(function(item,i,arr){
           var cook=item.split('=');
           if(cook[0]=='PHPPARENTURL') { cookie=cook[1]; return 1; }
           });
       }
       if(browserName1=='Yowser') {
          cookie=getCookie('PHPPARENTURL'); 
       }
   }*/
    cookie=getCookie('PHPPARENTURL'); 
   if (cookie==null){
       var cookie_=document.cookie.split(';'); 
       cookie=null;
       cookie_.forEach(function(item,i,arr){
       var cook=item.split('='); 
       if(cook[0]=='PHPPARENTURL') { cookie=cook[1]; return 1; }
       });
   }
    
    if(cookie===null){
      $("a.returnTicketToUser").remove();
      $("a.returnHome").remove();

     $("#dialog-error-info").remove();
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
  
  var parentUrl=cookie.split('/');
  var protokol=parentUrl[0].slice(0,parentUrl[0].indexOf(':'));
  var host=parentUrl[2];
  
  jsonPhoneConfig(protokol,host);/*1*/

 $('a.returnHome').attr('href','/widget/'+path);

    //формирует строки таблицы condensed-информация о пассажире
  var tplTicket = function(data)
  {

    var bag='';
    var go_bag='';
    if(data.cargoCost!=='0')
    {
      bag='<td class=center>'+
                                       '    <span class="mobile-only mobile-label">Мест багажа: </span>'+parse(data, 'cargoNum')+
                                       '</td>';
      go_bag='<td class=center>'+
                   '   <span class="mobile-only mobile-label">Провоз багажа: </span>'+(parse(data, 'cargoNum')*parse(data, 'cargoCost'))+' <i class="fa fa-icon fa-ruble">'+
                   '</td>';
    }
    var status = parse(data, 'status');
    var status_text = parse(data, 'status');

    switch(status)
    {
      case 'RESERVED': status_text = "<span class='status reserved'>Ожидает оплаты</span>"; break;
      case 'SOLD': status_text = "<span class='status sold'>Оплачен</span>"; break;
      case 'RETURNED': return;
      default : status_text = "?";
    }

    if(parse(parse(data, 'Passenger'),'gender')==='MALE') var pol='М';
    else var pol='Ж';

    var token=parse(data, 'turl').split('=');
    token=token[1];

    var dispDate=parse(data, 'dispatchDate').split("T");
    var dat=dispDate[0].split('-');
    var dispTime=dispDate[1].split(':');
    var pasBirthday=parse(parse(data, 'Passenger'),'birthday').split('-');

    return '' +
        '           <tbody>' +
        '               <tr>' +
        '                   <td class="center ticketId">'+
        '                       <span class="mobile-only mobile-label">Билет №</span>' +
        '                       <span class="ticketId">'+parse(data, 'number')+'</span>'+
        '                       <span class="mobile-only ticket-num">'+
        '                           <span class="status">'+status_text+
        '                           </span>'+
        '                       </span>'+
        '                   </td>' +
        '                   <td class="center">'+
        '                      <span class="mobile-only mobile-label">Место №</span> '+parse(data, 'seatNum')+
        '                   </td>' +
         '                  <td>'+
         '                     <li class="ticket-data">'+
         '                         <span class="mobile-only mobile-label">Посадка: </span>'+
         '                         <span>'+parse(data, 'dispatchCityName')+',</span>'+
         '                         <span>'+parse(data, 'dispatchStation')+'</span>'+
         '                     </li>'+
         '                     <li class="ticket-data">'+
         '                         <span class="mobile-only mobile-label">Высадка: </span>'+
         '                         <span>'+parse(data, 'arrivalCityName')+',</span>'+
         '                         <span>'+parse(data, 'arrivalStation')+'</span>'+
         '                     </li>'+
         '                  </td>' +
        '                   <td class="mobile-only">'+
        '                      <span class="mobile-only mobile-label">Пассажир:</span>'+
        '                      <span class="text-muted">'+
                                 parse(parse(data, 'Passenger'),'lastName')+' '+parse(parse(data, 'Passenger'),'firstName')+' '+parse(parse(data, 'Passenger'),'middleName')+', '+pol+', '+pasBirthday[2]+'.'+pasBirthday[1]+'.'+pasBirthday[0]+', '+
                                 parse(parse(data, 'Passenger'),'docTypeText')+
                                 ' № '+parse(parse(data, 'Passenger'),'docNum') + ', ' +
                                 parse(parse(data, 'Passenger'),'citizenshipText')+
        '                      </span>'+
        '                   </td>'+
        '                   <td>'+
        '                       <span class="mobile-only mobile-label">Отправление: </span>'+dat[2]+'.'+dat[1]+'.'+dat[0]+' '+dispTime[0]+':'+dispTime[1]+'<br class="non-mobile-only"> '+
        '                   </td>' +
        '                   <td class=center>'+
        '                       <span class="mobile-only mobile-label">Тариф: </span>'+parse(data, 'tarifName')+
        '                   </td>' +
                             bag+
        '                   <td class=center>'+
        '                       <span class="mobile-only mobile-label">Цена билета: </span>'+parse(data, 'fare')+' <i class="fa fa-icon fa-ruble">'+
        '                   </td>' +
                            go_bag+
        '                   <td class="center">' +

       /* ((status=='SOLD')?'    <div class="button-print-ticket buttons-for-pay-ticket non-mobile-only" title="Распечатать билет"><a href='+parse(data,'turl')+' target=_blank><i class="fa fa-print"></i></a></div>\n\
                               <div class="button-return-money buttons-for-pay-ticket" data-token="'+token+'" title="Подать заявление на возврат билета"> <span class="mobile-only"> Возврат билета </span> <i class="fa fa-usd"></i></div> ':'') +*/
                  ((status=='SOLD')?'    <div class="button-print-ticket buttons-for-pay-ticket non-mobile-only" title="Распечатать билет"><a href='+parse(data,'turl')+' target=_blank>Печать билета</a></div>\n\
                               <div class="button-return-money buttons-for-pay-ticket" data-token="'+token+'" title="Подать заявление на возврат билета"> <span class="mobile-only"> Возврат билета </span> Вернуть билет</div> ':'') +
          
        '                   </td>' +
        '               </tr>' +

        '               <tr class="non-mobile-only">' +
        '                   <td class="center non-mobile-only" colspan=2>'+status_text+'</td>' +
        '                   <td class="non-mobile-only" colspan=7>'+
        '                       <li class="ticket-data">'+
        '                          <span>Пассажир:</span>'+
        '                          <span>' +
                                       parse(parse(data, 'Passenger'),'lastName')+' '+parse(parse(data, 'Passenger'),'firstName')+' '+parse(parse(data, 'Passenger'),'middleName')+', '+pol+', '+ pasBirthday[2]+'.'+pasBirthday[1]+'.'+pasBirthday[0]+', '+
                                        parse(parse(data, 'Passenger'),'docTypeText')+' № '+parse(parse(data, 'Passenger'),'docNum') + ', ' +parse(parse(data, 'Passenger'),'citizenshipText')+
        '                          </span>'+
        '                       </li>'+
        '                   </td>' +
        '               </tr>' +
        '           </tbody>' +
        '';
  }


//получим ссылку на стр сбербанка для оплаты заказа
 var get_href=function(hrefData)
 {
   
   $.ajax({
            url: '/widget/'+path+'/get-href',
            type: 'post',
            dataType: "json",
            data:
                {
                  href: hrefData,
                },
            beforeSend: function(jqXHR, settings)
                     {
                       $("tfoot#step1-widget").hide();
                       $(".gobusWidget").append($('<div />').attr('id', 'load-indicator').show());
                     },
            success: function( data )
            {
              if(data.success==true)
              {
                 if(data.sbrf_link!==''){
                   var div = $("<div id='dialog-sbrf-pay' />")
                   .html(
                      '<div id="dialog-sbrf-pay-first">'+
                       '<div class="dialog-sbrf-pay-text">При затруднении оплаты может помочь нажатие кнопки "Выход" <i class="fa fa-sign-out"></i> (при ее наличии) и далее нажмите "Добавить карту". Отметку "Запомнить карту" оставьте пустой!</div>'+
                      '<iframe id="iframe-pay" src="'+data.sbrf_link+'" frameborder="0"></iframe>'+
                      '</div>'
                     );

                   var wWidth = $(window).width();
                   var dWidth = Math.max(wWidth * 0.8, 700);
                   var wHeight = $(window).height();
                   var dHeight = Math.max(wHeight * 0.95, 400);

                   $("body").append(div);
                   $( "#dialog-sbrf-pay" ).dialog
                   ({
                     modal: true,
                     width: dWidth,
                     height: dHeight,
                     appendTo: ".gobusWidget",
                     resizable: true,
                     title: "Оплата картой через Сбербанк",
                     buttons:
                     [{
                        text: "Закрыть",
                        click: function() {   $( this ).dialog( "close" );    }
                     }],
                     close: function( event, ui )
                          {
                            $("#load-indicator").remove();
                            var div = $('<div />').appendTo('.gobusWidget');
                            div.attr('id', 'load-indicator').show();
                            window.location.reload();
                          }
                 });
                }
                else{
                      $("div.payCancelButtons").empty().append($('<h4 class="center">Заказ отменен</h4><br>'));
                      var table=$('table.condensed');
                      table.find("thead").remove();
                      table.find("tbody").remove();
                }
               }
               else
               {
                 addDialogErrorInfo(data);
               }
              },
              complete: function(jqXHR, textStatus)
                    {
                      $(".gobusWidget div#load-indicator").remove();
                    }
        });
 }

//получим массив для формирования страницы заказа
 if(orderId)
   $.ajax({
            url: '/widget/'+path+'/get-order',
            type: 'post',
            dataType: "json",
            data:
                {
                   orderId: orderId,
                   parentUrl: cookie
                },
            beforeSend: function(jqXHR, settings)
                      {
                      /*  $("table.tableTicketPay tfoot").hide();*/
                       /* $("table.tableTicketPay tbody").remove();*/
                        $(".gobusWidget").append($('<div />').attr('id', 'load-indicator').show());
                      },
            success: function( data )
                   {
                     if(data.success==1)
                     {
                       if(data.config) $("span.configPhone").html("Горячая линия "+data.config);

                       var len=data.getOrder.Ticket.length;
                       if(len==undefined) var bag=data.getOrder.Ticket.cargoCost;
                       else var bag=data.getOrder.Ticket[0].cargoCost;
                       var baggage='';
                       var go_baggage='';
                       if(bag!=='0')
                       {
                         baggage='<th>Провоз<br>багажа</th>';
                         go_baggage='<th>Мест<br>багажа</th>';
                       }
                       else
                       {
                         var baggage='';
                       }
                       if(data.getOrder.orderId==0)return $("table.tableTicketPay tfoot").show();
                       /*else $("table.tableTicketPay tfoot").hide();*/
                       hrefData=
                               {
                                 order_id: orderId,
                                 email:data.getOrder.orderEmail,
                                 link:data.getOrder.ourl,
                                 paxes:[]
                               };
                       if(data.getOrder.Ticket.id)
                       {
                         var pax =
                                 {
                                   place_cost:data.getOrder.Ticket.fare ,
                                   cargo_cost:data.getOrder.Ticket.cargoCost
                                 };
                         hrefData.paxes.push(pax);
                       }
                       else
                       {
                         $.each(data.getOrder.Ticket,function (i,p)
                         {
                           var pax =
                                   {
                                     place_cost:p.fare ,
                                     cargo_cost:p.cargoCost
                                   };
                           hrefData.paxes.push(pax);
                         });
                       }

               /* $.each(data, function(i, item){
                  $("table.search-result-table").append(tpl(item));
                  setCallbacks();
                });*/


                       var container = $("table.tableTicketPay > tbody > tr > td");
                       var table = $('<table class="table condensed" width="100%">' +
                       /* '           <thead><tr>' +
                        '               <td colspan=9><h4 class=center>Ваш билет на рейс ' + (isNaN(reisId) ? '' : (reisId) )+'</h4></td>' +
                        '           </tr></thead>' +*/
                        '           <thead class="non-mobile-only passengerTableThead">' +
                        '               <tr>' +
                        '                   <th>Билет<br>№</th>' +
                        '                   <th>Место<br>№</th>' +
                        '                   <th>Откуда<br>Куда</th>' +
                        '                   <th>Отправление</th>' +
                        '                   <th>Тариф</th>' +
                                             go_baggage+
                        '                   <th>Стоимость<br>билета</th>' +
                                            baggage+
                        '                   <th>Действия</th>' +
                        '               </tr>' +
                        '           </thead>' +
                        '       </table>');

                       if(data.getOrder.Ticket.id)
                       {
                        table.append($(tplTicket(data.getOrder.Ticket)));
                       }
                       else
                       {
                         $.each(data.getOrder.Ticket, function(i,ticket)
                         {
                           table.append($(tplTicket(ticket)));
                         });
                       }
                       container.append(table);

                       var div = $("<div class='payCancelButtons' />").css({"width":"100%"});
                       container.append(div);

                       /*(data.getOrder.Ticket.status)? status=data.getOrder.Ticket.status : status=data.getOrder.Ticket[0].status;*/
                       var len=data.getOrder.Ticket.length;
                       if(len==undefined) var status=data.getOrder.Ticket.status;
                       else var status=data.getOrder.Ticket[0].status;


                       if(status=='RESERVED')
                       div.append(
                                  $('<a class="pay-button cancel-order"><span data-hover="Отменить бронь">Отменить заказ</span></a>')
                                  .attr("href", null)
                                  .unbind("click")
                                  .on("click", function(){
                                                         _cancel_order(orderId);
                                                         return false;
                                                        }));

                       if(status=='RESERVED')
                       div.append(
                                  $('<a class="pay-button pay-credit-card"><span data-hover="Оплатить картой">Оплатить картой</span></a>')
                                  .attr("href", "#")/*data.getOrder.payLink)*/
                                  .unbind("click")
                                  .on("click", function(){ get_href(hrefData);
                                                          return false;
                                                         }));

                      if(data.getOrder.Ticket.status)
                      {
                        if(data.getOrder.Ticket.status=='CANCELED'||data.getOrder.Ticket.status=='RETURNED')
                        {
                          div.append($('<h4 class="center">Заказ отменен</h4><br>'));
                          table.find("thead").remove();
                          table.find("tbody").remove();
                        }
                      }
                      else
                      {
                        var count=data.getOrder.Ticket.length;
                        var kol=0;
                        $.each(data.getOrder.Ticket,function(i)
                        {
                          if(data.getOrder.Ticket[i].status=='CANCELED'||data.getOrder.Ticket[i].status=='RETURNED')
                            kol++;
                        });
                        if(count==kol)
                        {
                          div.append($('<h4 class="center">Заказ отменен</h4><br>'));
                          table.find("thead").remove();
                          table.find("tbody").remove();
                        }
                      }
                      container.find("div.button-return-money").unbind("click").on("click", function()
                      {
                        _cancel($(this).attr("data-token"));
                      });
                     }
                     if(data.success==false)
                     {
                      addDialogErrorInfo(data);
                     }
                    },
                    complete: function(jqXHR, textStatus)
                    {
                      $(".gobusWidget div#load-indicator").remove();
                    }
        });//$.ajax

//отмена бронирования билетов
  _cancel_order = function(orderNum)
  {
    if(!orderNum) return;
    var min = 1000;
    var max = 10000;
    var rand = Math.floor(Math.random() * (max - min)) + min;
    if(rand.toString() != prompt("Для отмены бронирования и заказа введите: "+rand).toString())
    return alert("Введено неверное значение!");

    var data_pax ={
                paxes:[]
              };

           //if(provider!='') data.provider = provider;

    $.each($("table.condensed > tbody > tr > td.ticketId > span.ticketId"), function(i, p)
           {
             p = $(p);
             var pax =
                     {
                       ticketId: p[0].innerHTML
                     };
             data_pax.paxes.push(pax);
          });

    $.ajax({
            url: '/widget/'+path+'/cancel-reserved',
            type: 'post',
            dataType: "json",
            data:
                {
                   data_pax: data_pax
                /*orderId: orderId,*/
                },

            beforeSend: function(jqXHR, settings)
                 {
                   /*$("tfoot#step1-widget").hide();*/
                   $(".gobusWidget").append($('<div />').attr('id', 'load-indicator').show());
                 },

            success: function( data )
                {
                  if(data.success)
                  {
                    window.location.reload();
                  }
                  else
                  {
                    addDialogErrorInfo(data);
                  }
                }, // success
            complete: function(jqXHR, textStatus)
            {
              $("#load-indicator").remove();
            }
          });//$.ajax
    }

//возврат оплаченого билета
  _cancel = function(token)
  {
    if(!token) return;

    $("#dialog-info-message").remove();
    $.ajax({
            url: '/widget/'+path+'/get-cancel-data',
            type: 'post',
            dataType: "json",
            data: {
                    token: token,
                  },

            beforeSend: function(jqXHR, settings)
                      {
                        $("#load-indicator").remove();
                        var div = $('<div />').appendTo('.gobusWidget');
                        div.attr('id', 'load-indicator').show();
                      },

            success: function( data )
                   {
                     $("#load-indicator").remove();
                     if(data.success==true)
                     {
                       var div = $("<div id='dialog-info-message' />")
                            .html(
                            "Установленные перевозчиком удержания при возврате:<br>" +
                            "- более, чем за 2 часа до отправления: " + data.cancelData.Ticket.Comission.refundMoreThan2HoursBefore + "%<br>" +
                            "- менее, чем за 2 часа до отправления: " + data.cancelData.Ticket.Comission.refundWithin2HoursBefore + "%<br>" +
                            "- менее, чем через 3 часа после отправления: " + data.cancelData.Ticket.Comission.refundWithin3HoursAfter + "%<br>" +
                            "- более, чем через 3 часа после отправления: " + data.cancelData.Ticket.Comission.refundMoreThen3HoursAfter + "%<br><br>" +
                            "До отправления осталось: <b>" + data.cancelData.Ticket.delta + "</b><br>" +
                            "Оплаченная стоимость билета: <b>" + data.cancelData.Ticket.sumPayed + " руб.</b><br>" +
                            "Комиссия Гоубас в составе стоимости билета: <b>" + data.cancelData.Ticket.comissionInCost + " руб.</b><br>" +
                            "При возврате билета будет удержано "+ data.cancelData.Ticket.comissionPercent +"% от суммы  " + data.cancelData.Ticket.baseSum + " руб.: <b>" + data.cancelData.Ticket.comissionValue + "руб.</b> <br>" +
                            "На Ваш счет будет перечислен возврат в размере: <b>" + data.cancelData.Ticket.sumRefund + " руб.</b><br><br>" +
                            "Нажимая кнопку <b>'Отправить заявление'</b> Вы соглашаетесь с представленным здесь расчетом возврата, осуществленным в соответствии с <a class=link href=/ticket-return target=_blank>условиями возврата билета</a>.<br>"
                                 );

                       $("body").append(div)

                       $( "#dialog-info-message" ).dialog({
                                                  modal: true,
                                                  width: 500,
                                                  appendTo: ".gobusWidget",
                                                  title: "Условия возврата на данный момент времени",
                                                  buttons:
                                                          [{
                                                             text: "Отправить заявление",
                                                             click: function()
                                                                   {
                                                                    $.ajax({
                                                                           url: '/widget/'+path+'/cancel',
                                                                           type: 'post',
                                                                           dataType: "json",
                                                                           data:
                                                                                {
                                                                                  token: token,
                                                                                 },

                                                                           beforeSend: function(jqXHR, settings)
                                                                                     {
                                                                                       $("#load-indicator").remove();
                                                                                       var div = $('<div />').appendTo('.gobusWidget');
                                                                                       div.attr('id', 'load-indicator').show();
                                                                                      },

                                                                          success: function( data )
                                                                                 {
                                                                                   $("#load-indicator").remove();

                                                                                   if(data.success==1)
                                                                                   {
                                                                                     var div = $("<div id='dialog-result-message' />")
                                                                                     .html(
                                                                                           "На момент подачи заявления до отправления осталось:<br><b>" + data.cancel.Ticket.Refund.delta + "</b><br>" +
                                                                                           "Оплаченная стоимость билета: <b>" + data.cancel.Ticket.Refund.sumPayed + " руб.</b><br>" +
                                                                                           "При возврате билета удержано "+ data.cancel.Ticket.Refund.comissionPercent+"% от суммы  " + data.cancel.Ticket.Refund.baseSum + " руб.: <b>" + data.cancel.Ticket.Refund.comissionValue + "руб.</b> <br>" +
                                                                                           "После обработки заявления диспетчером на Вашу карту будет перечислен возврат в размере: <b>" + data.cancel.Ticket.Refund.sumRefund + " руб.</b><br><br>"
                                                                                          );

                                                                                      $("body").append(div);
                                                                                      $( "#dialog-result-message" ).dialog({
                                                                                                                          modal: true,
                                                                                                                          width: 500,
                                                                                                                          appendTo: ".gobusWidget",
                                                                                                                          title: "Заявление на возврат билета принято успешно!",
                                                                                                                          buttons: [{
                                                                                                                                    text: "Закрыть",
                                                                                                                                    click: function()
                                                                                                                                    {
                                                                                                                                       $( this ).dialog( "close" );
                                                                                                                                    }
                                                                                                                                   }],
                                                                                                                          close: function( event, ui )
                                                                                                                          {
                                                                                                                            $("#load-indicator").remove();
                                                                                                                            var div = $('<div />').appendTo('.gobusWidget');
                                                                                                                            div.attr('id', 'load-indicator').show();
                                                                                                                            window.location.reload();
                                                                                                                          }
                                                                                                                        });
                                                                                   }
                                                                                   else
                                                                                   {
                                                                                     addDialogErrorInfo(data);
                                                                                   }
                                                                                  }, // success

                                                                                  complete: function(jqXHR, textStatus)
                                                                                          {
                                                                                            $("#load-indicator").remove();
                                                                                          }
                                                                           });//$.ajax
                                                                      $( this ).dialog( "close" );
                                                                    }//click function
                                                            },//buttons
                                                            {
                                                              text: "Отмена",
                                                              click: function()
                                                                   {
                                                                     $( this ).dialog( "close" );
                                                                   }
                                                            }
                                                           ]});//dialog
                     }//data.success
                     if(data.success==false)
                     {
                       addDialogErrorInfo(data);
                     }
                   }, // success

                   complete: function(jqXHR, textStatus)
                   {
                     $("#load-indicator").remove();
                   }
           });//$.ajax
  };

//открывает окно по ссылке сбербанка для оплаты заказа
 _sbrf_pay = function(pay_link)
 {
   var div = $("<div id='dialog-sbrf-pay' />")
                .html(
                      '<div id="dialog-sbrf-pay-first">'+
                      'При затруднении оплаты может помочь нажатие кнопки "Выход" <i class="fa fa-sign-out"></i> (при ее наличии) и далее нажмите "Добавить карту". Отметку "Запомнить карту" оставьте пустой!'+
                      '<iframe id="iframe-pay" src="'+pay_link+'" frameborder="0"></iframe><br>'+
                      '</div>'
                     );

   var wWidth = $(window).width();
   var dWidth = Math.max(wWidth * 0.8, 700);
   var wHeight = $(window).height();
   var dHeight = Math.max(wHeight * 0.95, 400);

   $("body").append(div);
   $( "#dialog-sbrf-pay" ).dialog({
                                   modal: true,
                                   width: dWidth,
                                   height: dHeight,
                                   appebdTo: ".gobusWidget",
                                   resizable: true,
                                   title: "Оплата картой через Сбербанк",
                                   buttons: [{
                                             text: "Закрыть",
                                             click: function()
                                             {
                                               $( this ).dialog( "close" );
                                             }
                                            }],
                                            close: function( event, ui )
                                            {
                                              $("#load-indicator").remove();
                                              var div = $('<div />').appendTo('.gobusWidget');
                                              div.attr('id', 'load-indicator').show();
                                              window.location.reload();
                                            }
                                  });//dialog
  }

});
