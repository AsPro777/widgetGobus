
var freeCheck=[];
var path = location.pathname.split('/');
var path=path[2];

if(!path||path===undefined) path=130;
var data = {path:path};

var passenger_tarif='';
var passenger_baggage='';
var count=1;
var rowNumber=0;
var dispatchCityId='',arrivalCityId='';
var updatePlace;
var freePlaces=0;
var jsonReserv=new Array();
var baggageCount;
var dialogMsg='';
var timerId;
var flag=0;
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

/*отобразит диалоговое окно в случае если рейс не найден с доп кнопкой*/
var addDialogErrorTrip=function(msg)
{
  var dialogHeight=300;
  $("#dialog-error-info").remove();
  var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="notice">Рейс не обнаружен!</h4><div class="reis-not-found-info">'+msg+'</div>');
  $(".gobusWidget").append(divErrorInfo);

  divErrorInfo.dialog
              ({
                 width: 600,
                 height: dialogHeight,
                 resizable: true,
                 appendTo:".gobusWidget",
                 buttons:
                        [{
                           text: "Закрыть",
                           click: function() {   $( this ).dialog( "close" );    }
                         },
                         {
                           text: "Купить билет",
                           click: function(){ window.parent.location.href="/widget/"+path+"/";}
                         }]
                });
 
  return;
}

/*отобразит диалог с сообщением об ошибке*/
var addDialogErrorInfo=function(data,infoFillDataUser)
{
  infoFillDataUser= (typeof infoFillDataUser!=='undefined') ? infoFillDataUser : -1;
  var dataUser=infoFillDataUser;
  var dialogHeight=300;
  $("#dialog-error-info").remove();
  var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="errorInfo">Ошибка!</h4><div class="reis-not-found-info">'+dataUser+'</div>');
  $(".gobusWidget").append(divErrorInfo);

  if(infoFillDataUser==-1)
  {
    dataUser='';
    dialogHeight=400;
    $('div.reis-not-found-info').html(errorTable);
    $('div.div-error-info').find('p:first').append(data.msg);
    $('div.div-error-info').find('p.p-error-info').append(data.msgController);
    $('div.div-error-info').find('table td#td-error-info').append(data.msgWebService);
    $('div.div-error-info').find('table td#td-msg-error-info').append(errorInfo);
  }
  
  
  /*('.move').css({'top':event.pageY,'left':event.pageX});*/

  divErrorInfo.dialog
              ({
                 width: 600,
                 height: dialogHeight,
                /* position:['right','bottom'],*/
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

//очищает строки из массива Пассажиры и заполняет вспомогат массив только занятыми местами.
var updateRowsPassengers=function()
{
  var passengerRows=$("table.passengers tbody");
  $.each(passengerRows,function(i,obj_)
  {
    obj1=$(obj_);
    obj1.find("input.place-number").val('');
  });
  var j=0;

  if(jsonReserv.length>passengerRows.length) addButton();
  $.each($("table.passengers tbody"),function(i,obj_)
         {
           obj_=$(obj_);
           obj_.find("input.place-number").val(jsonReserv[j]);
           j++;
         });
}

//удаление элемента из массива без дырки
var remove_item = function (arr, value)
{
  var b = '';
  for (b in arr)
  {
    if (arr[b] === value)
    {
      arr.splice(b, 1);
      break;
    }
   }
   return arr;
}

$(function()
{

  var clearPage = function()
  {
    $(".tbody-widget").empty();
  }

  /*var parent_url=document.referrer;
  var parentUrl=parent_url.split('/');
  var protokol=parentUrl[0].slice(0,parentUrl[0].indexOf(':'));
  var host=parentUrl[2];

  jsonPhoneConfig(protokol,host);*/

  var a=emailHelp;
//прорисовать автобус
  var mkSchemaPlaces = function(config)
  {
    var a=$("#bus").mybusview();
    $("#bus").mybusview("setJson", config);
  };

  var showPicker = function()
   {
     setTimeout(function()
     {
       $( "input.dispatchInfo" ).datepicker("show");
     }, 100);
   }

  /*cookie=getCookie('PHPPARENTURL');*/
  /*cookie=document.cookie.split(';')[1].split('=')[1];*/
  
  
  /*var cookie_=document.cookie.split(';');
   cookie_.forEach(function(item,i,arr){
       var cook=item.split('=');
       if(cook[0].replace(/\s/g, '')=='PHPPARENTURL') { cookie=cook[1]; return 1; }
   });*/

   var parent_url=document.referrer;
   var browserArrays=navigator.userAgent.split(' ');
   var browserType=browserArrays[browserArrays.length-1];
   var browserNameArray=browserType.split('/');
   var browserName=browserNameArray[0];
   
   cookie=getCookie('PHPPARENTURL'); 
   if (cookie==null){
       var cookie_=document.cookie.split(';'); 
       cookie=null;
       cookie_.forEach(function(item,i,arr){
       var cook=item.split('='); 
       if(cook[0]=='PHPPARENTURL') { cookie=cook[1]; return 1; }
       });
   }
   /*if(browserName=='Firefox'){
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
   
   
   /*if(browserName=='Firefox'||browserName=='Edg'){
      cookie=getCookie('PHPPARENTURL');
   } 
   else{
     var cookie_=document.cookie.split(';');
     cookie=null;
     cookie_.forEach(function(item,i,arr){
        var cook=item.split('=');
        if(cook[0]=='PHPPARENTURL') { cookie=cook[1]; return 1; }
     });
     }*/
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
/*1*/
  var parentUrl=cookie.split('/');
  var protokol=parentUrl[0].slice(0,parentUrl[0].indexOf(':'));
  var host=parentUrl[2];
  var parent_url=document.referrer;
  
  jsonPhoneConfig(protokol,host);
  
  $('a.returnHomeTwoPage').attr('href','/widget/'+path);
  /*$('a.returnTicketToUserTwoPage').attr('href','/widget-ticket-return/'+path);*/
  $("a.returnTicketToUserTwoPage").attr('href','/widget-ticket-return/'+path+'/'+protokol+'/'+host);

  var ajax_data =
              {
                reisId: reisId,
                from:dispatchStationIdFind,
                to:arrivalStationIdFind,
                protokol:protokol,
                host:host
              };

  $.ajax({
           url: '/widget/'+path+'/get-ticket-pay',
           type: 'post',
           dataType: "json",
           data: ajax_data,

           beforeSend: function(jqXHR, settings)
           {
             $("tfoot#step1-widget").hide();
             $(".gobusWidget").append($('<div />').attr('id', 'load-indicator').show());
           },

           success: function(data)
           {
             if(data.success==true)
             {
               if(data.config) $("span.configPhone").html("Горячая линия "+data.config);
                $("a.returnTicketToUser").attr('href','/widget-ticket-return/'+path+'/'+protokol+'/'+host);

               $("table.tableTicketPay").prepend(add_tr());
               $("tr.tpl").append(tpl(data));
               $("tr.provider").append(provider(data.ticketPay));

               var disp_date=data.ticketPay.Trip.dispatchDate;
               disp_date=disp_date.split('T');
               disp_date=disp_date[0].split('-');
               var reis_date = new Date(disp_date[0],disp_date[1]-1,disp_date[2]);
               var min_d = new Date();
               min_d.setDate(min_d.getDate()+0);

               var min_costs = {};
               var min_costs_key = "0-0";

               $( "input.dispatchInfo" ).datepicker({
                   onSelect:function(a,b,c,d){
                                       var dataReis={
                                                     id_reis: data.ticketPay.Trip.id,
                                                     date: $("input.dispatchInfo").val()+' '+$("span.dispatchInfo").html(),
                                                     id_from: data.ticketPay.Trip.dispatchStationId,
                                                     id_to: data.ticketPay.Trip.arrivalStationId,
                                                     parentUrl: parent_url
                                                    };
                                        var title=$('.ui-datepicker-calendar').find('a.ui-state-hover').parent().attr('title');
                                        /*if(title.trim()=='')return;*/
                                        $.ajax
                                              ({
                                                 url: '/widget/'+path+'/get-other-reis',
                                                 type: 'post',
                                                 dataType: "json",
                                                 data: dataReis,
                                                 success:function(data){

                                                                         window.location='/widget/'+path+'/ticket/pay/'+data.orderNew+'/'+dataReis.id_from+'/'+dataReis.id_to;
                                                 }
                                               });
                                      }
                   });

              $( "input.dispatchInfo" )
              .datepicker($.datepicker.regional[ "ru" ])
              .datepicker("option","beforeShow",
              function(textbox, instance)
              {$('.gobusWidget').append($('#ui-datepicker-div')); } )
              .datepicker("option", "showOn",  "none")
              .datepicker("option", "fromTo",  false)
              .datepicker("option", "autoPopUp",  "focus")
              .datepicker("option", "minDate",  min_d)
              .datepicker("option", "defaultDate",  reis_date)
              .datepicker("option", "beforeShowDay",

              function (date)
                      {
                         
                        var dd = date.getDate();
                        if (dd < 10) dd = '0' + dd;
                        var mm = date.getMonth() + 1;
                        if (mm < 10) mm = '0' + mm;
                        var Y = date.getFullYear();
                        date = dd + '.' + mm + '.' + Y;
                        if(min_costs[date]!=undefined) return[true,'show-date-min-cost',min_costs[date]+'р.'];
                        else return false;
                        /*return [true, 'show-date-min-cost', (min_costs[date]!=undefined) ? min_costs[date]+'р.' : '&nbsp;'];*/
                      }
                     )
              .datepicker("setDate", reis_date)
              /*.beforeShowDay: function(){ return false; }*/
              .on('focus', function ()
              { //get price
                 var self = $(this);
                 var ajax_data =
                    {
                     date: $("input.dispatchInfo").val(),
                     from_name: data.find.dispatchRegionName,
                     to_name: data.find.arrivalRegionName
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
                            $( "input.dispatchInfo" ).before($('<i id="detail-spinner" class="fa fa-spinner fa-pulse fa-fw fa-1x" />'));
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

               $("input.dispatchInfo  + span").on("click", function()
               {
                $(this).prev().trigger("focus");
               });

               if(parse(parse(data.ticketPay,'Bus'),'config')!=='')
               {
                 dispatchCityId=parse(parse(data.ticketPay,'Trip'),'dispatchStationId');
                 arrivalCityId=parse(parse(data.ticketPay,'Trip'),'arrivalStationId');

                 var parse_config=parse(parse(data.ticketPay,'Bus'),'config');
                 var stringfity_config_first=JSON.stringify(parse_config);

                 mkSchemaPlaces(stringfity_config_first);
                 initSchemaPlaces();
                 ajaxUpdatePlaces();
//                           setInterval(ajaxUpdatePlaces,30000);//будем каждые 30 сек получать массив мест и перерисовывать автобус
               }


                $(document).ready(function(){ $('#phone').phoneMask({tag:'div.tarif-contact-price'})});

               $("table.passenger").append(passenger(data.ticketPay));

               var el=$('table#paxes td.placeNumber > div');
               el.unbind('click').bind('click',swing);

               $("span.read-iWill-text").unbind("click").bind("click", dataOferta).css({"cursor":"pointer"});//прикрутим к спану с id=read-iWill-text функцию dataOferta

               $("#iWill-1").on("change", function()
               {
                 var iWill = $("#iWill-1").prop("checked");
                 if(iWill==true) { $("div.submit-button").css("opacity",1); $("a.custom-button > span").css("cursor","pointer"); }
                 if(iWill==false) { $("div.submit-button").css("opacity",0.5); $("a.custom-button > span").css("cursor","not-allowed"); }
               });
   //                      $("div.container").append(passenger(data.ticketPay));
               setCallbacks();
               $(".button.add").unbind("click").on("click",function(){addButton(-1);});
               $('.pax-counter').html('Пассажир 1');

               $(document).ready(function(){ $('table.passengers tbody.passengerData_0 td.docNumber [name=docnum]').mask('0000 000000')});//тк по умолчанию для первой строчки контейнера Пассажиры вид документа стоит паспорт то повесим на поле ввода номера документа маску для паспорта

               if(parse(parse(data.ticketPay,'Bus'),'config')!=='')
               addEvents(0);

               $("a.submit").unbind("click").on("click",function(){checkSubmit(data.ticketPay);});

               $("#phone, #email").unbind("input blur keyup focus").on("blur input keyup", function()
               {
                 if(isValidContacts())
                 {
                   $("tr.paxes").show(300);

                   if(curr_usr) return;
                   if(curr_usr===undefined||curr_usr===false)
                   {
                     var email = $("#email").val();
                     if($("#iWill-account").attr("data-email") == email) return;
                   }
                  }
                });
             }
             else addDialogErrorInfo(data,-1);
           },

           complete: function(jqXHR, textStatus)
           {
             $(".gobusWidget div#load-indicator").remove();
           }
        });

//закрасить места в автобусе
  var initSchemaPlaces = function()
  {
    if($("#bus :checkbox").length>0) return;
    $($("#bus div.bus_place.place_active")[0]).removeClass("place_active"); /* водитель */

    $.each($("#bus div.bus_place.clickable.place_active"), function(i, place)
    {
      $(place)
            .attr("data-name", $(place).text())
            .addClass("raw-place blocked")
            .unbind("click");
    });
  };

//зарезервировать места на 5 мин
  var ajaxTicketReservPlaces=function(placeNumber)
  {
    $.ajax
        ({
           url: '/widget/'+path+'/reserv-places',
           type: 'post',
           dataType: "json",
           data: {
                    reisId:reisId,
                    placeNumber:placeNumber,
                    casherId:path
                 },

           beforeSend: function(jqXHR, settings)
           {
             blockedBus();
             var div='<div class="small progress"></div>';
             $( "div#bus" ).prepend('<div class="bus-overlay"><i id="detail-spinner" class="fa fa-spinner fa-pulse fa-fw fa-1x" /></div>');
           },

           success: function( data )
           {
             if(data.success===true)
             {
               updatePlace=true;
               var msg="Э­то место оформляется другим кассиром!";
               var len=data.reservSeat.Seat.length;
               if(len==undefined)
               {
                 if(data.reservSeat.Seat.my=='undefined') addDialogErrorInfo(0,msg);
               }
               else
               {
                 for (var i=0;i<data.reservSeat.Seat.length;i++)
                 {
                   if(data.reservSeat.Seat[i].my=='undefined') addDialogErrorInfo(0,msg);
                 }
               }
             }
             if(data.success==false)
             {
               updatePlace=false;
               addDialogErrorInfo(data);
             }
           },

           complete: function(jqXHR, textStatus)
           {
     //                   unblockedBus();
             ajaxUpdatePlaces();
            /* $(".gobusWidget div#load-indicator").remove();*/
           }
        });
  }

//снять свою бронь
  var ajaxTicketUnreservPlaces=function(placeNumber)
  {
    $.ajax
         ({
            url: '/widget/'+path+'/unreserv-places',
            type: 'post',
            dataType: "json",
            data: {
                    reisId:reisId,
                    placeNumber:placeNumber,
                    casherId:path
                  },

            beforeSend: function(jqXHR, settings)
            {
               blockedBus();
               $( "div#bus" ).prepend('<div class="bus-overlay"><i id="detail-spinner" class="fa fa-spinner fa-pulse fa-fw fa-1x" /></div>');
            },

            success: function( data )
            {
              if(data.success===true)updatePlace=true;
              if(data.success==false)
              {
                updatePlace=false;
                addDialogErrorInfo(data);
              }
            },
            complete: function()
            {
    //              unblockedBus();
              clearInterval(timerId);
              ajaxUpdatePlaces();
            }
         });
  }

//получить список мест
  var ajaxUpdatePlaces=function()
  {
    $.ajax
         ({
            url: '/widget/'+path+'/get-places',
            type: 'post',
            dataType: "json",
            data: {
                    reisId:reisId,
                    dispatchStationId:dispatchCityId,
                    arrivalStationId:arrivalCityId,
                    casherId:path
                  },
            success: function( data )
            {
              if((data.success)&&(data.ticketPlaces.length!==0))
              {
                var passengerRows=$("table.passengers tbody");
                $.each(passengerRows,function(i,obj_)
                                                    {
                                                      obj1=$(obj_);
                                                      obj1.find("input.place-number").val('');
                                                    });
                var j=0;

                jsonReserv.length=0;

                updatePlaces(data.ticketPlaces) ;

                freePlaces=0;
                $.each(data.ticketPlaces.Seat,function(key,val)
                                              {
                                                if(val.status=='FREE'||val.status=='MY_BLOCKED')freePlaces++;
                                                if(val.status=='MY_BLOCKED') jsonReserv.push(val.num);
                                              });

                var countCel=$('table.passengers tbody:last').attr('class');
                if(countCel)
                {
                  countCel=countCel.split('_');
                  if(+countCel[1]<(jsonReserv.length-1))
                  for(var i=0;i<(jsonReserv.length-1)-countCel[1];i++)
                    addButton(-1);
                }

                $.each($("table.passengers tbody"),function(i,obj_)
                                                   {
                                                       obj_=$(obj_);
                                                       obj_.find("input.place-number").val(jsonReserv[j]);//заполним инпуты с номером мест из контейнера Пассажиры номерами зарезервированных мест
                                                       j++;
                                                   });
              }
              else
              if(data.success&&data.ticketPlaces.length===0)
              {
                $.ajax({
                          url: '/widget/'+path+'/get-ticket-pay',
                          type: 'post',
                          dataType: "json",
                          data: ajax_data,
                          success: function(data)
                          {
                            if(data.success==true&&data.ticketPay.Trip.status!=='ON_SALE')
                            {
                              switch(data.ticketPay.Trip.status)
                              {
                                case 'SUSPENDED': var info="Приостановка продажи.";
                                case 'CANCELED': var info="Рейс отменен.";
                                case 'DISPATCHED': var info="Рейс отправлен.";
                                case 'UNKNOWN': var info="Неопределенный статус. Рейс не доступен для продажи.";
                              }
                            $('div.passenger-tables').empty();
                            addDialogErrorTrip(info);


                                     /*  $('div.passenger-tables').empty();
                                       $("#dialog-error-info").remove();
                                       var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="notice" style="text-align:center;">'+info+'</h4>');
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
                                        },
                                        {
                                           text: "Купить билет",
                                           click: function(path){
                                               window.location.href='/widget/'+path+'/get-index-page-data';
                                           }
                                        }]
                                       });
                                   */

                            }
                            if(data.success==true&&data.ticketPay.Trip.status=='ON_SALE')
                            {
                              $('div.passenger-tables').empty();
                              addDialogErrorInfo(data,'Пустой ответ с сервера:get-places');
                            }
                            if(data.success=false) addDialogErrorInfo(data,-1);
                          }
                      });
              }
              else
              if(data.success==false) addDialogErrorInfo(data);
            },//data.success
            complete: function()
            {
              var i=$('#detail-spinner');
              i.remove();
              if($('div').is('.bus-overlay') ) $('.bus-overlay').remove();
              clearInterval(timerId);
              if(flag==0) timerId=setTimeout(ajaxUpdatePlaces,20000);
            }
          });//ajax
  }

//если не пришел массив с местами или не зарезервиров место или не снялась бронь-заблокировать автобус.
  var blockedBus=function()
  {
    $.each($('#bus div.clickable'),function(key,val)
    {
      $(this).unbind('click').removeClass("vacant reserved blocked my-blocked sold");
    });
  }

//клик на месте во второй и последующие разы
  var showPlaces=function(place)
  {
    if($("#bus :checkbox").length>0) return;
    var container = $("#bus");
    var p = $(container).find("div.raw-place[data-name='"+place+"']");
    if(p.attr('class').indexOf('vacant')!==-1) var placeStatus='FREE';
    if(p.attr('class').indexOf('my-blocked')!==-1) var placeStatus='MY_BLOCKED';
    switch(placeStatus)
    {
      case 'MY_BLOCKED':
                       p.addClass('vacant');
                       if($("#bus").hasClass("disabled")) return;
                       p.removeClass("my-blocked");
                       ajaxTicketUnreservPlaces(place);
                       remove_item(jsonReserv,place);
                       updateRowsPassengers();
                       isValidText("place-number");
                       p.unbind("click").bind('click',function(){showPlaces(place);});
                       break;
      case 'FREE':
                       p.addClass("my-blocked");
                       if($("#bus").hasClass("disabled")) return;
                       p.removeClass("vacant");
                       ajaxTicketReservPlaces(place);
                       jsonReserv.push(place);
                       updateRowsPassengers();
                       isValidText("place-number");
                       p.unbind("click").bind('click',function(){showPlaces(place);});
                       break;
    }

    return;
  }

//выполняется один раз при первом клике на зарезервированном месте
  var updatePlacesClickMyBlocked=function(elem)
  {
    if($("#bus").hasClass("disabled")) return;
    $(elem).removeClass("my-blocked");
    $(elem).addClass("vacant");
    var dataName=$(elem).attr("data-name");
    ajaxTicketUnreservPlaces(dataName);
    remove_item(jsonReserv,dataName);
    updateRowsPassengers();
    isValidText("place-number");
    $(elem).unbind('click');
    $(elem).bind('click',function(){showPlaces(dataName);});
  }

//выполняется один раз при клике на свободном месте
  var updatePlacesClickFree=function(elem)
  {
    if($("#bus").hasClass("disabled")) return;
    $(elem).removeClass("vacant");
    $(elem).addClass("my-blocked");
    var dataName=$(elem).attr("data-name");
    ajaxTicketReservPlaces(dataName);
    jsonReserv.push(dataName);
    updateRowsPassengers();
    isValidText("place-number");
    $(elem).unbind('click');
    $(elem).bind('click',function(){showPlaces(dataName);});
  }

//прорисовка мест в автобусе в зависимости от массива places
  var updatePlaces = function(places)
  {
    if($("#bus :checkbox").length>0) return;
    if(places.Seat.length==0) return;

    var container = $("#bus");
    $.each(places.Seat, function(key, val)
    {
      var p = $(container).find("div.raw-place[data-name='"+val.num+"']");
      p.attr('id',"")
       .unbind("click")
       .removeClass("vacant reserved blocked my-blocked sold");

      switch(val.status)
      {
        case 'MY_BLOCKED'://темно зеленый
                         p.addClass("my-blocked").on('click',function(){ updatePlacesClickMyBlocked(p)});//закрасим див, функция updatePlacesClickMyBlocked(p) будет выполняться при клике на месте
                         break;
        case 'FREE'://светло зеленый
                         p.addClass("vacant").on('click',function(){ updatePlacesClickFree(p)});
                         break;
        case 'RESERVED'://желтый
                         p.addClass('reserved');
                         break;
        case 'SOLD'://красный
                         p.addClass('sold')
                         .on("click", function(){});
                         break;
        case 'BLOCKED'://серый
                         p.addClass('blocked');
                         break;
        case 'UNKNOWN'://белый
                         p.addClass('unknown');
                         break;
      }
    });
  };

  var add_tr=function()
  {
    return ''+
       '      <tr class="tpl">'+
       '      </tr>'+
       '      <tr class="provider">'+
       '      </tr>';
  }

  var parse = function(data, name)
  {
    if(data[name]) return data[name];
    return "";
  }

  var trip = function(data)
  {
    return ''+
       '      <div>'+
       '           <span class="infoTrip">'+
                          parse(data,'name')+': '+
       '            </span>'+
       '            <span>'+
                          parse(data,'val')+
       '            </span>'+
       '      </div>'+
       '';
  }

  var tarifs = function(data)
  {
    if(parse(data,'ticketClass')==='BAGGAGE'&&baggageCount===0) return false;
    return ''+
      '       <tr>'+
      '          <td>'+
                      parse(data,'name')+
      '          </td>'+
      '          <td class="table-price">'+
                      parse(data,'price')+
      '               <i class="fa fa-icon fa-ruble">'+'</i>'+
      '          </td>'+
      '       </tr>'+
      '';

  }

//прорисовывает верхнюю часть страницы оформления пользователя (тег tpl)
  var tpl = function(data)
  {
    var data1=data.ticketPay;
    var data2=data.find;
    var disp=parse(data2,'dispatchDate');
    disp=disp.split('T');
    var time=disp[1].split(':');
    var dat=disp[0].split('-');
    var tpl_data=
       ''+
       '          <td>'+
       '            <div class="dispatch-arrival">'+
       '               <div>'+
       '                  <span class="dispatchTrip">'+
       '                        Посадка:'+
       '                  </span>'+
       '                  <span class="cityStation">'+
       '                    <span class="cityName">'+
                                parse(data2,'dispatchRegionName')+' '+
       '                    </span>'+
       '                  <span class="stationName">'+
                                parse(data2,'dispatchName')+
       '                  </span>'+
       '               </span>'+
       '               </div>'+
       '               <div>'+
       '                   <span class="arrivalTrip">'+
       '                         Высадка:'+
       '                   </span>'+
       '                   <span class="cityStation">'+
       '                     <span class="cityName">'+
                                 parse(data2,'arrivalRegionName')+' '+
       '                   </span>'+
       '                  <span class="stationName">'+
                                parse(data2,'arrivalName')+
       '                  </span>'+
       '                </span>'+
       '               </div>'+
       '               <div class="dispatchDivTrip">'+
       '                  <span class="departureTrip">'+
       '                        Отправление: '+
       '                  </span>'+
       '                  <span class="dispatchCalendar">'+
       '                     <input class="dispatchInfo ui-autocomplete-input" type="text" value="'+dat[2]+'.'+dat[1]+'.'+dat[0]+' '+'"><span title="Изменить дату"></span>'+
       '                     <span class="dispatchInfo">'+time[0]+':'+time[1]+'</span>'+
       '                  </span>'+
       '               </div>'+
       '            </div>'+
       '            <div class="trip-info">';


    var trip_info=parse(parse(data1,'Info'),'Item');
    for(var i=0;i<trip_info.length;i++)
        tpl_data=tpl_data+trip(trip_info[i]);


    tpl_data=tpl_data+

       '           </div>'+
       '           <div class="how-made">'+

       '                   <span>'+
       '                         Как оформить билет'+
       '                   </span>'+
       '                   <i class="fa fa-question">'+
       '                   </i>'+

       '           </div>';+
       '         </td>'+
       '';

    return tpl_data;

  }

//в зависимости от того чему равна переменная  provider в массиве bus будем либо прорисовывать автобус (для наших рейсов) или в чекбоксах указывать места (для чужих рейсов)
  var provider=function(data)
  {

    var provider_data=
       '<td colspan=3>'+
       '   <div class="divProvider">';

    if(parse(parse(data,'Bus'),'config')!=='')
    {
      var placesInBus=
                '  <div class="bus-places">'+
                '      <div id="bus">'+
                '      </div>'+
                '  </div>';
    }


    else
    {
      var placesInBus=
      '              <div class="bus-places">'+
      '                  <table>'+
      '                         <thead>'+
      '                            <tr>'+
      '                              <td>'+
      '                                Свободные места'+
      '                              </td>'+
      '                            </tr>'+
      '                         </thead>'+
      '                         <tbody>'+
      '                               <tr>'+
      '                                   <td>'+
      '                                       <div class="freePlaces">';

      for(var key in parse(data,'places'))
      {
          placesInBus=placesInBus+
      '                                          <div class="bus_place">'+
      '                                             <input type="checkbox" data-id="'+key+'" data-code="'+parse(data,'places')[key]+'">'+
      '                                             <br>'+
      '                                             <span>'+
                                                            key+
      '                                             </span>'+
      '                                         </div>'+
      '                                       </div>'+
      '                                     </td>'+
      '                                 </tr>'+
      '                          </tbody>'+
      '                    </table>'+
      '                </div>';

      }
    }



    baggageCount=parse(parse(data,'Trip'),'maxCargoCount');
    var tarif_=
      '<div class="tarif-contact-price">'+
      '    <table class="tarif-price">'+
      '           <thead class="thead-tarif-price1">'+
      '                   <th>'+'ТАРИФЫ И ЦЕНЫ'+'</th>'+
      '           </thead>'+
      '           <thead class="thead-tarif-price2">'+
      '                   <tr>'+
      '                        <th class="non-mobile-only">'+'Тариф'+'</th>'+
      '                        <th class="table-price non-mobile-only">'+'Цена по тарифу'+'</th>'+
      '                   </tr>'+
      '            </thead>'+
      '            <tbody>';

    var tarif_info=parse(parse(data,'TicketTypes'),'TicketType');
    if(parse(tarif_info,'name'))
    {
      tarif_=tarif_+
      '              <tr>'+
      '                  <td>'+
                            parse(tarif_info,'name')+
      '                  </td>'+
      '                  <td class="table-price">'+
                            parse(tarif_info,'price')+
      '                     <i class="fa fa-icon fa-ruble">'+'</i>'+
      '                  </td>'+
      '             </tr>';
    }
    else
    {
      for(var i=0;i<tarif_info.length;i++)
        tarif_=tarif_+tarifs(tarif_info[i]);
    }
    tarif_=tarif_+
      '          </tbody>'+
      '   </table>';

    var contacts=
      '  <table class="contacts">'+
      '                   <thead class="thead-contacts">'+

      '                              <th>'+'ВАШИ КОНТАКТЫ'+'</th>'+

      '                   </thead>'+
      '                   <tbody>'+
      '                       <tr>'+
      '                          <td>'+
      '                              E-mail'+
      '                          </td>'+
      '                          <td class="tdClose">'+
      '                             <input id="email" class="icon-close error" type="text" placeholder="email@site.ru"><span class="iconClose"></span>'+
      '                          </td>'+
      '                       </tr>'+
      '                       <tr>'+
      '                          <td class="headerContacts">'+
      '                             Телефон'+
      '                          </td>'+
      '                          <td class="tdClose">'+
      '                             <input id="phone" class="icon-close error" type="text" placeholder="7-000-000-00-00" title="Варианты: 7-800-375-22-22, 373-555-787-55, 375-555-588-222, 996-555-788-555, 8-800-375-22-22"  maxlength="15" autocomplite="off"><span class="iconClose"></span></input>'+    
      '                          </td>'+
      '                       </tr>'+
      '                   </tbody>'+
      '  </table>'+
      '</div>';

    provider_data=provider_data+placesInBus+tarif_+contacts+'</div></td>';
      /*provider_data=provider_data+tarif_+contacts;*/

    return provider_data;

  }

    //проверка валидности номера тел
  var isValidPhone = function (phone)
  {
    var twelveNumbers={'380':'','375':'','998':'','995':'','994':'','996':'','992':''};
    var elevenNumbers={'370':'','373':'','371':'','374':'','993':'','372':''};
    if(phone.substr(0,1)=='7'|| phone.substr(0,3) in elevenNumbers||phone.substr(0,1)=='8') return phone.split("-").join("").length == 11;
    if(phone.substr(0,3) in twelveNumbers) return phone.split("-").join("").length == 12;
      /*return true;*/
  }

    //проверка валидности емайла и тел
  var isValidContacts = function()
  {
    var result = true;
    if(isValidMail($("#email").val())) $("#email").removeClass("error"); else { $("#email").addClass("error"); result = false; }
    if(isValidPhone($("#phone").val())) $("#phone").removeClass("error"); else { $("#phone").addClass("error"); result = false; }
    return result;
  }

    //продлить резервирование места в случае если пользователь нажал на Готово но на след стр не прошло (не верные данные ввел)
  var prolongBlocking = function()
  {
    $.ajax({
             url: '/ticket/prolong-places',
             type: 'post',
             dataType: "json",
             data:
                 {
                   id_reis: reisId
                 },
          });
  }

//срабатывает при нажатии на кнопку Готово
  var checkSubmit=function(data)
  {
    $('div.how-made').css('display','none');  
      
    var node = false;
    dialogMsg='';

    var iWill = $("#iWill-1").prop("checked");
    if(iWill===false) return;
    
    var disp=parse(data.Trip,'dispatchDate');
    disp=disp.split('T');
    var time=disp[1].split(':');
    var dat=disp[0].split('-');
    var dateTime=dat[2]+'.'+dat[1]+'.'+dat[0]+' '+time[0]+':'+time[1];
    $('span.dispatchCalendar').replaceWith('<span class=cityName>'+dateTime+'</span>');
    $('span.departureTrip').css('padding-top','0px');
   

    if(!isValidContacts())
    {
      node = $("input.error");
      var msg="Не заполнены или заполнены некорректно Ваши контактные данные!";
      addDialogErrorInfo(0,msg);
    }
    else
    if(!isValidForm(1))
    {
      if(dialogMsg=='')
      {
        node = $("input.error");
        var msg="Не заполнены или заполнены некорректно данные о пассажирах!";
        addDialogErrorInfo(0,msg);
      }
      if(dialogMsg=='error_doc_rf')
      {
        node = $("input.error");
        var msg="Для указанного типа документа должно быть указано гражданство РФ!";
        addDialogErrorInfo(0,msg);
      }
      if(dialogMsg=='error_doc_not_rf')
      {
        node = $("input.error");
        var msg="Для указанного типа документа должно быть указано гражданство не РФ!";
        addDialogErrorInfo(0,msg);
      }
                //alert("Не заполнены или заполнены некорректно данные о пассажирах!");
    }
    if(node && node.offset())
    {
      prolongBlocking();
      node.first().focus();
      return false;
    }
    else if(node) return false;

    var tickets_count = $("select[name=tarif]").length;
    var childs_count = 0;
    $.each($("select[name=tarif]"), function(i,obj)
    {
      if( $(obj).find("option:selected").text().toLowerCase().indexOf('детский')===0 ) childs_count++;
    });

    if(tickets_count <= childs_count)
    {
      $("#dialog-error-info").remove();
      var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="notice">С ребенком должен быть сопровождающий!</h4>');
      $("body").append(divErrorInfo);

      divErrorInfo.dialog
                 ({
                    width: 600,
                    height: 300,
                    resizable: true,
                    appendTo:".gobusWidget",
                    buttons:
                          [{
                            text: "Закрыть",
                            click: function() {   $( this ).dialog( "close" );    }
                          }]
                 });
                //alert("С ребенком должен быть сопровождающий!");
      return false;
    }
    submitTickets(data);
    return false;
  }

//проверить валидность почты
  var isValidMail = function (mail)
  {
    /*return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{1,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);*/
    return /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(mail);
  }

//отобразим нижнюю часть стр-поля с данными о пассажирах
  var passenger=function(data)
  {
    var baggage=0;
    var bus_baggage=parse(data,'Trip');
    var baggage=(parse(bus_baggage,'maxCargoCount')!=='0') ? '<th class="baggage-pas">Багаж</th>' : '';//если компания по перевозки не оформляет багаж то тег не вставлять

    passenger_tarif='<select name="tarif" class="tarif" width="100%">';

    var tarif_info=parse(parse(data,'TicketTypes'),'TicketType');

    if(parse(tarif_info,'name'))
    {
      if(parse(tarif_info,'ticketClass')!=='BAGGAGE')
      {
        passenger_tarif=passenger_tarif+
              '   <option value="'+parse(tarif_info,'id')+'">'+
                           parse(tarif_info,'name')+
              '   </option>';
      }
      else
      {
        if(baggageCount>0)
                 passenger_tarif=passenger_tarif+
                 '   <option value="'+parse(tarif_info,'id')+'">'+
                           parse(tarif_info,'name')+
                 '   </option>';
      }
    }
    else
    {
      for(var i=0;i<tarif_info.length;i++)
      {
        if(parse(tarif_info[i],'ticketClass')==='BAGGAGE') continue;
        else passenger_tarif=passenger_tarif+
              '   <option value="'+parse(tarif_info[i],'id')+'">'+
                    parse(tarif_info[i],'name')+
              '   </option>';
      }
    }
    passenger_tarif=passenger_tarif+'</select>';

    if(baggageCount>0)

    if(baggageCount!=='0')
    {
      passenger_baggage='<select name="bag" class="baggage"><option selected value="No">Нет</option>';
      for(var i=1;i<=baggageCount;i++)
      {
        passenger_baggage=passenger_baggage+
             '   <option value="'+i+'">'+
                   i+
             '   </option>';
      }
      passenger_baggage=passenger_baggage+'</select>';
    }

    var addRowPassenger=addRow(passenger_tarif,passenger_baggage,rowNumber);

    var passenger=
        ' <tr>'+
        '  <td class="passenger-td">'+
        '    <table class="title-passengers">'+
        '      <tr>'+
        '         <td class="title-pas pas-buttom">'+
        '            <div class="pas">ПАССАЖИРЫ</div>'+
        '         </td>'+
        '         <td class="add-pas">'+
        '            <div class="button add">'+
        '               <span>'+
        '                  Добавить пассажира'+
        '               </span>'+
        '               <i class="fa fa-plus">'+'</i>'+
        '            </div>'+
        '         </td>'+
        '      </tr>'+
        '    </table>'+
        '<br>'+
        '    <table class="passengers paxes" id="paxes">'+
        '       <thead width="100%" class="non-mobile-only">'+
        '          <tr>'+
        '             <th class="placeNumber">'+'Место'+'</th>'+
                       baggage+
        '             <th class="tarif-pas">'+'Тариф'+'</th>'+
        '             <th class="surname">'+'Фамилия'+'</th>'+
        '             <th class="name">'+'Имя'+'</th>'+
        '             <th class="secondName">'+'Отчество'+'</th>'+
        '             <th class="gender-pas">'+'Пол'+'</th>'+
        '             <th class="dateCalendar">'+'Дата рождения'+'</th>'+
        '             <th class="grazdanstvo">'+'Гражданство'+'</th>'+
        '             <th class="document">'+'Документ'+'</th>'+
        '             <th docNumber>'+'Серия и номер'+'</th>'+
        '             <th class="button-trash-info"></th>'+
        '          </tr>'+
        '       </thead>'+
                   addRowPassenger+
        '     </table>'+
        '<br>'+
        '     <div class="subscribe hidden">' +
        '       <input type="checkbox" id="iWill-news">  <label for="iWill-news">Я подписываюсь на рассылку новостей</label>' +
        '     </div>' +
        '<br>'+
        '     <div class="subscribe">'+
        '       <input type="checkbox" id="iWill-1">'+
        '       <label>Я даю</label>'+
        '       <span class="read-iWill-text" data-oferta="oferta-obrabotka-pd">согласие на обработку моих персональных данных</span>'+
        '       <br>'+
        '       <label>И принимаю условия</label>'+
        '       <span class="read-iWill-text" data-oferta="oferta-polzovatelskoe-soglashenie">пользовательского соглашения</span>'+
        '       и <span class="read-iWill-text" data-oferta="oferta-politika-konfidencialnosti">политики конфиденциальности</span>'+
        '     </div>'+
        '<br>'+
        '     <div class="subscribe hidden">' +
        '        <input type="checkbox" id="iWill-account" data-email="">  <label for="iWill-account">Создать учетную запись с данными первого пассажира</label>' +
        '     </div>' +
        '<br>'+
        '     <div class="submit-button">'+
        '        <a class="custom-button submit" type="button" disabled="">'+
        '           <span>Готово</span>'+
        '        </a>'+
        '     </div>'+
        '   </td>'+
        ' </tr>';

    return passenger;
  }

});

//прокрутка стриницы к диву с автобусом (привязывается к диву в котором инпут с номером места ) ��спользуется когда размер экрана 992 и поля заполнения данных о пассажирах растягиваются на весь экран
var swing=function()
{
  var el=$('#the_bus_salon');
  if (!$(this).val())
      el[0].scrollIntoView({behavior: "smooth"});
};

//создали с помощью виджета Dialog окно диалога, в котором отображаем текст из дива iWill-text.
var dataOferta=function()
{
  $("#oferta-dlg").remove();
  $(this).parent().after($("<div id=oferta-dlg />").html( $("#iWill-text div."+$(this).attr("data-oferta") ).html() ));
  $( "#oferta-dlg" ).dialog({
                             modal: true,
                             closeOnEscape: true,
                             width: 1100,
                             title: "Просмотр документа",
                             appendTo: ".gobusWidget",
                             dialogClass: "modal-window-dlg",
                             buttons:
                                    {
                                      Ok: function()
                                                   {
                                                     $( this ).dialog( "close" );
                                                   }
                                    }
                            });
}

//отобразить/скрыть информацию о правилах покупки билета при клике на кнопке ?
var setCallbacks = function()
{
  $(".button.question, .button.close , div.how-made").unbind("click").on("click", function()
  {
    $("#help").slideToggle(300);

    stopBrowserAutocomplete();
  });
}

var stopBrowserAutocomplete = function()
{
  $("input#phone").attr("autocomplete", "off");
  return "";
}

var getQueryString = function()
{
  var result = {}, queryString = location.search.slice(1),
  re = /([^&=]+)=([^&]*)/g, m;
  while (m = re.exec(queryString))
  {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  return result;
}

//сбор данных и отправка на сервер
var submitTickets = function(data)
{
  var data =
           {
              id_reis: reisId,
              email: $("#email").val(),
              phone: $("#phone").val(),
              id_from: parse(parse(data,'Trip'),'dispatchStationId') ,
              id_to: parse(parse(data,'Trip'),'arrivalStationId'),
              create_account: $("#iWill-account").closest("div").is(":visible") && $("#iWill-account").prop("checked"),
              subscribe_news: $("#iWill-news").prop("checked"),
              paxes:[],
              date: getQueryString()["date"],
              casherId: path
            };

           //if(provider!='') data.provider = provider;

  $.each($("table#paxes tbody"), function(i, p)
  {
    p = $(p);
    var pax =
            {
               place: p.find("input[name='place-number']").val(),
               tarif: p.find("select[name='tarif']").val(),
               bag: (p.find("select[name='bag'] option:selected").attr("value")==='No')?0:p.find("select[name='bag'] option:selected").attr("value"),
               f: p.find("input[name='f']").val(),
               i: p.find("input[name='i']").val(),
               o: p.find("input[name='o']").val(),
               sex: p.find("select[name='sex']").val(),
               dr: p.find("input[name='dr']").val(),
               grazhd: p.find("input[name='grazd']").attr("data-id"),
               grazhd_txt: p.find("input[name='grazd']").val(),
               doc: p.find("input[name='doc']").attr("data-id"),
               doc_txt: p.find("input[name='doc']").val(),
               doc_num: $.trim(p.find("input[name='docnum']").val()),
            };
    data.paxes.push(pax);
  });

//формирует строки таблицы condensed-информация о пассажире
  var tplTicket = function(data,cookie)
  {
    if(parse(parse(data, 'Passenger'),'gender')==='MALE') var pol='М';
    else var pol='Ж';

    var bag='';
    var go_bag='';
    var dispDate=parse(data, 'dispatchDate').split("T");
    var dat=dispDate[0].split('-');
    var dispTime=dispDate[1].split(':');
    var pasBirthday=parse(parse(data, 'Passenger'),'birthday').split('-');
    if(baggageCount!=='0')
    {
      var bag='<td class=center>'+
                   '<span class="mobile-only mobile-label">Мест багажа: </span>'+
                    parse(data, 'cargoNum')+
              '</td>';
      var go_bag='<td class=center>'+
                          '<span class="mobile-only mobile-label">Провоз багажа: </span>'+parse(data, 'cargoCost')+' <i class="fa fa-icon fa-ruble">'+
                 '</td>';
    }
    return '' +
        '           <tbody>' +
        '               <tr>' +
        '                   <td class=center rowspan=2>'+
        '                      <span class="mobile-only mobile-label">Билет №'+
        '                      </span>' + parse(data, 'number')+ '<br>' +
        '                   </td>' +
        '                   <td class="center" rowspan=2>'+
        '                      <span class="mobile-only mobile-label">Место №'+
        '                      </span>'+parse(data, 'seatNum')+
        '                   </td>' +
        '                   <td>'+
        '                      <li class="ticket-data">'+
        '                          <span class="mobile-only mobile-label">Посадка: </span>'+
        '                          <span>'+parse(data, 'dispatchCityName')+',</span>'+
        '                          <span>'+parse(data, 'dispatchStation')+'</span>'+
        '                     </li>'+
        '                     <li class="ticket-data">'+
        '                          <span class="mobile-only mobile-label">Высадка: </span>'+
        '                          <span>'+parse(data, 'arrivalCityName')+',</span>'+
        '                          <span>'+parse(data, 'arrivalStation')+'</span>'+
        '                      </li>'+
        '                   </td>' +
        '                   <td class="mobile-only">'+
        '                        <span class="mobile-only mobile-label">Пассажир:</span>'+
        '                        <span class="text-muted">' +parse(parse(data, 'Passenger'),'lastName')+' '+
                                    parse(parse(data, 'Passenger'),'firstName')+' '+parse(parse(data, 'Passenger'),'middleName')+', '+pol+', '+
                                    parse(parse(data, 'Passenger'),'birthday')+', '+
                                    parse(parse(data, 'Passenger'),'docTypeText')+
                                    ' № '+parse(parse(data, 'Passenger'),'docNum') + ', ' +
                                       parse(parse(data, 'Passenger'),'citizenshipText')+
        '                        </span>'+
        '                   </td>' +
        '                   <td>'+
        '                       <span class="mobile-only mobile-label">Отправление: </span>'+
                                    dat[2]+'.'+dat[1]+'.'+dat[0]+' '+dispTime[0]+':'+dispTime[1]+
        '                           <br class="non-mobile-only"> '+
        '                   </td>' +
        '                   <td class=center>'+
        '                        <span class="mobile-only mobile-label">Тариф: </span>'+
                                parse(data, 'tarifName')+
        '                   </td>' +
                            bag+
        '                   <td class=center>'+
        '                        <span class="mobile-only mobile-label">Цена билета: </span>'+
                                 parse(data, 'fare')+
        '                        <i class="fa fa-icon fa-ruble">'+
        '                   </td>' +
                            go_bag+
        '               </tr>' +
        '               <tr class="non-mobile-only">' +
        '                   <td colspan=6>'+
        '                        <li class="ticket-data">'+
        '                           <span class=city>Пассажир:</span>'+
        '                           <span>' +
                                       parse(parse(data, 'Passenger'),'lastName')+' '+parse(parse(data, 'Passenger'),'firstName')+' '+
                                       parse(parse(data, 'Passenger'),'middleName')+', '+pol+', '+pasBirthday[2]+'.'+pasBirthday[1]+'.'+pasBirthday[0]+', '+
                                       parse(parse(data, 'Passenger'),'docTypeText')+' № '+parse(parse(data, 'Passenger'),'docNum') + ', ' +
                                       parse(parse(data, 'Passenger'),'citizenshipText')+
        '                           </span>'+
        '                        </li>'+
        '                    </td>' +
        '               </tr>' +
        '           </tbody>' +
        '';
  }
  var indicator = $('<div />').attr('id', 'load-indicator').attr('block-activity', true);
       
//оформляем бронирование билетов
  $.ajax({
            url: '/widget/'+path+'/book-order',
            type: 'post',
            dataType: "json",
            data: { data: data,
                    cookie: cookie},

            beforeSend: function(jqXHR, settings)
            {
              $("tfoot#step1-widget").hide();
              $(".gobusWidget").append($('<div />').attr('id', 'load-indicator').show());
            },

            success: function( data )
            {
                if(data.success)
                {
                  if(data.bookOrder.ourl)
                  {
                    flag=1;
                    var pas_baggage='';
                    var go_baggage='';
                    if(baggageCount!=='0')
                    {
                      var pas_baggage='<th>Мест<br>багажа</th>';
                      var go_baggage='<th>Провоз<br>багажа</th>';
                    }

                    var email = $("#email").val();
                    $("tr.provider, table.passenger").remove();
                     // var container = $("table.tableTicketPay");
                    var container=$("div.passenger-tables");
                    var table = $('<table class="table condensed" width="100%">' +
                        '           <thead><tr>' +
                        '               <td colspan=8><h4 class=center>Оформлена бронь ' + (isNaN(reisId) ? '' : ('на рейс № '+reisId) )+'</h4></td>' +
                        '           </tr></thead>' +
                        '           <thead class="non-mobile-only passengerTableThead">' +
                        '               <tr>' +
                        '                   <th>Билет<br>№</th>' +
                        '                   <th>Место<br>№</th>' +
                        '                   <th>Откуда<br>Куда</th>' +
                        '                   <th>Отправление</th>' +
                        '                   <th>Тариф</th>' +
                                             pas_baggage +
                        '                   <th>Стоимость<br>билета</th>' +
                                             go_baggage +
                        '               </tr>' +
                        '           </thead>' +
                        '       </table>');


                    if(data.bookOrder.Ticket.id)
                    {
                      table.append($(tplTicket(data.bookOrder.Ticket,cookie)));
                    }
                    else
                    {
                      $.each(data.bookOrder.Ticket, function(i,ticket)
                      {
                        table.append($(tplTicket(ticket,cookie)));
                      });
                    }
                    container.append(table);

                    var params={};
                    var orderId=data.bookOrder.orderId;
                    var dateOrder=data.bookOrder.Ticket[0]? data.bookOrder.Ticket[0].created:data.bookOrder.Ticket.created;
                    if(orderId) params.orderId=orderId;
                    if(dateOrder) params.dateOrder=dateOrder;
                    if(reisId) params.reisId=reisId;
                    params = $.param(params);

                    var hrefPay1=data.bookOrder.ourl;
                    hrefPay=hrefPay1.slice('online'.length+hrefPay1.indexOf('online'));
                    hrefPay=hrefPay;
                    $('a.custom-button.credit-card').attr('href',hrefPay);

                    container.find("div.error").unbind("click").on("click", function()
                    {
                        //alert("�­тот билет не удалось оформить!" + ( ($(this).attr("data-msg")!="") ? ("\n\nВозможная причина:\n"+$(this).attr("data-msg")) : "") );
                      var info="Этот билет не удалось оформить!" + ( ($(this).attr("data-msg")!="") ? ("\n\nВозможная причина:\n"+$(this).attr("data-msg")) : "");

                      $("#dialog-error-info").remove();
                      var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="notice">'+info+'</h4>');
                      $("body").append(divErrorInfo);

                      divErrorInfo.dialog
                                         ({
                                           width: 600,
                                           height: 300,
                                           resizable: true,
                                           appendTo:".gobusWidget",
                                           buttons:
                                                   [{
                                                     text: "Закрыть",
                                                     click: function() {   $( this ).dialog( "close" );    }
                                                    }]
                                          });
                    });
                    $("#welcomina").find("span.email").text(' '+email);
                    $("#welcomina").find("a.reload").attr("href", "/ticket/pay/"+reisId).unbind("click");
 //                   if(curr_usr===true)
//                        $("#welcomina .if-not-logged").remove();
//                    else
                    $("#welcomina .if-logged").remove();
                    container.append($("#welcomina").show(300));

                    var div = $("<div id='dialog-add-bookmark' />")
                                .html(
                                "Страница Вашего заказа находится по адресу:<br>" +
                                "<input readonly value='"+hrefPay1+"'><br>" +
                                "Скопируйте и сохраните эту ссылку в надежном месте на случай, если Вам окажется недоступен адрес электронной почты <b>"+email+"</b>, на который отправлена эта же ссылка!<br><br>" +
                                "Вы можете перейти на страницу заказа и добавить ее в закладки, нажав 'Ctrl+D', и произвести оплату заказа в течение 30 минут."
                                );

                    $("body").append(div);
                    $( "#dialog-add-bookmark" ).dialog({
                                                        modal: true,
                                                        width: 500,
                                                        appendTo: ".gobusWidget",
                                                        title: "Очень важная информация о заказе!",
                                                        buttons:
                                                               [{
                                                                  text: "Понятно!",
                                                                  click: function() { $( this ).dialog( "close" );}
                                                                },
                                                                {
                                                                  text: "Перейти на страницу заказа",
                                                                  click: function() { window.location.href = hrefPay; }
                                                                }],
                                                       });
                 }//if ourl
                 else
                 {
                   $("#dialog-error-info").remove();
                   var divErrorInfo = $("<div id='dialog-error-info' />").html('<h4 class="errorInfo">Ошибка!</h4><div class="reis-not-found-info">Ссылка на заказ не найдена.</div>');
                   $("body").append(divErrorInfo);

                   divErrorInfo.dialog
                   ({
                     width: 600,
                     height: 300,
                     resizable: true,
                     appendTo:".gobusWidget",
                     buttons:
                      [{
                        text: "Закрыть",
                        click: function() {   $( this ).dialog( "close" );    }
                      }]
                   });
                 }
                }
                else
                {
                    addDialogErrorInfo(data);
                }
            },//success

            complete: function(jqXHR, textStatus)
            {
              $(".gobusWidget div#load-indicator").remove();
            }

        });//$.ajax
};