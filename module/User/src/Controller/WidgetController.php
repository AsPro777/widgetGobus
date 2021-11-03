<?php

namespace User\Controller;

use Zend\Mvc\MvcEvent;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use User\Entity\Usr;
/*use User\Form\ReturnTicketForm;*/

class WidgetController extends AbstractActionController
{
    private $entityManager;
    private $userManager;
    private $user;
    private $dataAccess=array();
    private $conn;//эта переменная-объект. Используется для связи с БД
    private $lastError;//Для хранения сообщения об ошибке
    private $errorInfo;

//конструктор класса
  public function __construct($entityManager, $userManager)
  {
    $this->entityManager = $entityManager;
    $this->userManager = $userManager;
    $this->user = null;
    $this->lastError='';
    $this->errorInfo='Мы будем благодарны, если Вы сделаете скриншот (screenshot) этой страницы <br>'
                       . ' и отправите его по адресу электронной почты или сообщите нам по телефону.';
    $this->conn=$entityManager->getConnection();//инициализируем эту переменную. Теперь в ней у нас есть соединение с бд
  } // of __construct()

//прорисовка шаблона
  public function onDispatch(MvcEvent $e)
  {
    $response = parent::onDispatch($e);
    $this->layout()->setTemplate('layout/widget');
    return $response;
  }

//главный action
  public function widgetAction()
  { 
    if(isset($_SERVER['HTTP_COOKIE'])){
       $ref= explode(';', $_SERVER['HTTP_COOKIE']);
       foreach ($ref as $value) {
           $refer=explode('=',$value);
           if(trim($refer[0])=='PHPPARENTURL'){
               $referer= explode('/',$refer[1]);
               $css= $referer[0].'//'.$referer[2].'/gobus_widget.css';
               $getCssFile=@file_get_contents($css);
               break;
           }
       }
    }
    else{
        $css='';
        $getCssFile='';
    }

    $paramsFromRoute=$this->params()->fromRoute();

    if(isset($paramsFromRoute['id'])&&!empty($paramsFromRoute['id'])){$this->dataAccess=$this->getLoginPasswordAccess($paramsFromRoute['id']);}
    else
    {
      $this->dataAccess=FALSE;
      $this->lastError="Доступ ограничен.";
    }
    if ($this->getRequest()->isPost())
    {
      if($this->dataAccess==FALSE)
      { die($this->getLastError());}

      $post = $this->params()->fromPost();
      switch ($paramsFromRoute['cmd'])
      {
        case 'get-trip':  return $this->getTrip($post['from_name'],$post['to_name'],$post['date']);
        case 'get-ticket-pay': return $this->getTicketPay($post['reisId'],$post['from'],$post['to'],$post['protokol'],$post['host']);
        case 'get-places':return $this->getTicketPlaces($post['reisId'],$post['dispatchStationId'],$post['arrivalStationId'],$post['casherId']);
        case 'reserv-places': return $this->reservTicketPlaces($post['reisId'],$post['placeNumber'],$post['casherId']);
        case 'unreserv-places': return $this->unreservTicketPlaces($post['reisId'],$post['placeNumber'],$post['casherId']);
        case 'get-account': return $this->getAccount($post['email'],$post['phone']);
        case 'book-order': return $this->bookOrder($post);
        case 'get-order': return $this->getOrder($post);
        case 'get-href':return $this->getHref($post['href']);
        case 'cancel-reserved': return $this->cancelReserved($post['data_pax']);
        case 'get-cancel-data': return $this->getCancelData($post['token']);
        case 'cancel': return $this->cancel($post['token']);
        case 'check-span': return $this->checkSpan($post['parentUrl']);
        case 'get-other-reis': return $this->getOtherReis($paramsFromRoute['id'],$post);
        case 'json-phone-config': return $this->jsonPhoneConfig($post['protokol'], $post['host']);

        default : return $this->getIndexPageData();
      }
    }
    if($this->getRequest()->isGet())
    {
      if($this->dataAccess==FALSE)
        die($this->getLastError());
      return new ViewModel(["errorInfo"=> $this->errorInfo,
                            "cssParam"=>$css,
                            "getCssFile"=>$getCssFile,
                            "path"=>$paramsFromRoute['id']]);
    }
  }


 //если пользователь поставил галочку Создать аккаунт то с помощью этой функции создадим его. Используется в bookOrder
  private function createAccount($data)
  {
    $register_data = array_merge([], $data["paxes"][0], ["email"=>$data["email"], "idUsrType"=>2]);
    $user = $this->userManager->registerUser($register_data);

    if (empty($user)) return false;
    $this->userManager->generateRegisterConfirm($user);

    $dvf = new \Application\Filter\DataValueFilter();
    $user_data = $user->getData();

    $user_data = $dvf->set("profile.user.grazhd", $register_data["grazhd"], $user_data);
    $user_data = $dvf->set("profile.user.grazhd_txt", $register_data["grazhd_txt"], $user_data);
    $user_data = $dvf->set("profile.user.passport_type", $register_data["doc"], $user_data);
    $user_data = $dvf->set("profile.user.passport_type_txt", $register_data["doc_txt"], $user_data);
    $user_data = $dvf->set("profile.user.passport", $register_data["doc_num"], $user_data);
    $user_data = $dvf->set("profile.user.dr", $register_data["dr"], $user_data);
    $user_data = $dvf->set("profile.contact.phone2", $data["phone"], $user_data);

    $user->setIsDeletable(false);
    $user->setData($user_data);

    $this->entityManager->flush();

    return $user;
  }

  /*вернет новый номер рейса в случае если пользователь на стр оформления в календаре выбрал другую дату*/
  private function getOtherReis($path,$data)
  {
    $id_reis= $data['id_reis'];
    $qb = $this->conn->createQueryBuilder();/*по номеру рейса узнаем номер маршрута-schedule*/
    $qb->select("id_reis_schedule")
         ->from("reis")
         ->where("id=".intval($id_reis)."");
    $stmt = $qb->execute();
    $order = $stmt->fetch(\PDO::FETCH_ASSOC, \PDO::FETCH_ORI_NEXT);
    $idReisSchedule=$order['id_reis_schedule'];

    $date=strval($data['date']);
    $qb = $this->conn->createQueryBuilder();/*по номеру маршрута и выбранной дате узнаем новый номер рейса*/
    $qb->select("id")
         ->from("reis")
         ->where("id_reis_schedule=".intval($idReisSchedule))
         ->andWhere("to_char(date_start, 'DD.MM.YYYY HH24:MI')='".$date."'");
    $stmt = $qb->execute();
    $orderNew = $stmt->fetch(\PDO::FETCH_ASSOC, \PDO::FETCH_ORI_NEXT);

    header('Content-type: text/javascript');
    $response = $this->getResponse();
    return $response->setContent(json_encode(["success" =>true,
                                              "orderNew"=>$orderNew['id']]));
  }

 //проверка наличия на родительской странице span-а с ссылкой на гоубас
  private function checkSpan($parentUrl)
  {
    /*$json = file_get_contents('http://gobus.local/gobus_widget_cfg.txt');*/
    header('Content-type: text/javascript');
    $response = $this->getResponse();

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$parentUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/xml'));

    try
    {
      $result = curl_exec($ch);  sleep(1);
    }
    catch(\SoapFault $ex)
    {
      return '';
    }
    catch (Exception $ex)
    {
      return '';
    }

    curl_close($ch);

    if(empty($result)) return $response->setContent(json_encode(["success" =>false,
                                                                 "result" =>false]));

    $dom = new \DOMDocument();
    $dom->preserveWhiteSpace = FALSE;
    $dom->loadHTML($result);
    $dom->formatOutput = TRUE;
    $span=$dom->getElementById('widget_span');//получим тег span из родительской страницы

    if($result==FALSE) return $response->setContent(json_encode(["success" =>false,
                                                                     "result" =>false]));

    if(empty($span)) return $response->setContent(json_encode(["success" =>true,
                                                               "result" =>$result]));
        /*return $response->setContent(json_encode(["success" =>false]));*/

    $getBodySpan=$span->nodeValue;//получим содержимое тега span
    $a=$span->getElementsByTagName('a');//получим тег а из спана
    if($a->length!==0)$aHref=$a[0]->getAttribute('href');//получим href-атрибут из тега а
    else $aHref='';

    if(trim($getBodySpan)=='Виджет предоставлен gobus.online'&&$a->length!==0&&$aHref=='https://gobus.online')
    {
      return $response->setContent(json_encode(["success" =>true,
                                                "result"=>$result]));//если чел пользующийся виджетом вставил спан без изменений в свой сайт то возвращаем true и загрузим виджет в ифрейме
    }
    else
    {
      return $response->setContent(json_encode(["success" =>false]));//в ином случае будем в ифрейме грузить страницу gobus.online
    }
  }

//возврат денег за отмененнный билет пользователю
  private function cancel($token)
  {
    $tokenParts=explode("-",$token);
    if(isset($tokenParts[1]))
    {
      if(empty($tokenParts[1]))//токен должен состоять из 2 частей-номер билета и контрольная сумма
      {
        $this->lastError='Не удается найти билет.'.__FUNCTION__;
        header('Content-type: text/javascript');
        $response = $this->getResponse();
        return $response->setContent(json_encode(["success" =>false,
                                                  "msg"=>$this.getLastError(),
                                                  "msgController"=>'Не совпадает номер билета']
                                                 ));
      }
    }
    else
    {
      $this->lastError='Не удается найти токен.'.__FUNCTION__;
      header('Content-type: text/javascript');
      $response = $this->getResponse();
      return $response->setContent(json_encode(["success" =>false,
                                                "msg"=>$this.getLastError(),
                                                "msgController"=>'Токен не найден']
                                               ));
    }

    $tokenSum = \Application\Filter\TokenFilter::getParseToken($token);
    if(empty($tokenSum["id"]))
    {
      $this->lastError='Номер билета отсутствует.';
      header('Content-type: text/javascript');
      $response = $this->getResponse();
      return $response->setContent(json_encode(["success" =>false,
                                                "msg"=>$this.getLastError(),
                                                "msgController"=>'Не совпадает контрольная сумма']
                                              ));
    }

    if(empty($tokenSum["hash"]))
    {
      $this->lastError='Токен отсутствует.'.__FUNCTION__;
      header('Content-type: text/javascript');
      $response = $this->getResponse();
      return $response->setContent(json_encode(["success" =>false,
                                                "msg"=>$this.getLastError()]
                                               ));
    }

    $xmlCancel='<?xml version="1.0" encoding="UTF-8"?>
                <ReturnTicketRequest>
                  <ticketId>'.doubleval($tokenParts[0]).'</ticketId>
                </ReturnTicketRequest>';

    header('Content-type: text/javascript');
    $response = $this->getResponse();

    try
    {
      $jsonArray=["success" =>false,
                  "msg"=>'Билет не отменен.',
                  "msgController"=>'Информация для техподдержки',
                  "cancel"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
      $responseFromServer=$this->widgetSendPost( $this->dataAccess['login'],$this->dataAccess['password'], $xmlCancel);//вернет строку
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }

    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonCancel=@json_decode(@json_encode((array)$tagsValue), TRUE);//преобразуем объект типа simplexmlelement в массив php

/*если ответ с сервера в виде xml получен но в нем есть тег Error то ошибку вывести по тегу message*/
    if(isset($jsonCancel['Error']))
    {
      $jsonArray["msgWebService"]=$jsonCancel['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }

    if(isset($jsonCancel['Body'])) $jsonCancel=$jsonCancel['Body'];
    else $jsonCancel='';
    return $response->setContent(json_encode(["success" =>true,
                                              "cancel"=>$jsonCancel]
                                            ));
  }

//предоставление пользователю информации о комиссии за возврат, удержаниях и сумме которая ему будет возвращена
  private function getCancelData($token)
  {
    $tokenParts=explode("-",$token);

    if(isset($tokenParts[1]))
    {
      if(empty($tokenParts[1]))//токен должен состоять из 2 частей-номер билета и контрольная сумма
      {
        $this->lastError='Не удается найти билет.'.__FUNCTION__;
        header('Content-type: text/javascript');
        $response = $this->getResponse();
        return $response->setContent(json_encode(["success" =>false,
                                                  "msg"=>$this.getLastError(),
                                                  "msgController"=>'Не совпадает номер билета']
                                                 ));
      }
    }
    else
    {
      $this->lastError='Не удается найти токен.'.__FUNCTION__;
      header('Content-type: text/javascript');
      $response = $this->getResponse();
      return $response->setContent(json_encode(["success" =>false,
                                                "msg"=>$this.getLastError(),
                                                "msgController"=>'Токен не найден']
                                               ));
    }

    header('Content-type: text/javascript');
    $response = $this->getResponse();

    $tokenSum = \Application\Filter\TokenFilter::getParseToken($token);
    if(empty($tokenSum["id"]))
    {
      $this->lastError='Номер билета отсутствует.'.__FUNCTION__;
      return $response->setContent(json_encode(["success" =>false,
                                                "msg"=>$this.getLastError(),
                                                "msgController"=>'Не совпадает контрольная сумма']
                                               ));
    }

    if(empty($tokenSum["hash"]))
    {
      $this->lastError='Токен отсутствует.'.__FUNCTION__;
      return $response->setContent(json_encode(["success" =>false,
                                                "msg"=>$this.getLastError()]
                                              ));
    }
//           $getLogPasswdAccess=$this->getLoginPasswordAccess($user_id);
    $xmlCancelData='<?xml version="1.0" encoding="UTF-8"?>
                    <WidgetGetCancelTicketDataRequest>
                      <ticketId>'.doubleval($tokenParts[0]).'</ticketId>
                    </WidgetGetCancelTicketDataRequest>';

    try
    {
      $jsonArray=["success" =>false,
                  "msg"=>'Билет не отменен.',
                  "msgController"=>'Информация для техподдержки',
                  "cancel"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlCancelData);
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }

    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonCancelData=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonCancelData['Error']))
    {
      $jsonArray["msgWebService"]=$jsonCancelData['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }

    if(isset($jsonCancelData['Body']))$jsonCancelData=$jsonCancelData['Body'];
    else $jsonCancelData='';

    return $response->setContent(json_encode(["success" =>true,
                                                      "cancelData"=>$jsonCancelData]));
  }

  //отмена бронирования (до того как оплата произведена)
  //private function cancelReserved($orderId)
  private function cancelReserved($data)
  {
    header('Content-type: text/javascript');
    $response = $this->getResponse();

    $xmlCancelReserved='<?xml version="1.0" encoding="UTF-8"?>
                        <CancelTicketRequest>';
    for($i=0;$i<count($data['paxes']);$i++)
    {
      $xmlCancelReserved=$xmlCancelReserved.'<ticketId>'. doubleval($data['paxes'][$i]['ticketId']).'</ticketId>';
    }
    $xmlCancelReserved=$xmlCancelReserved.'</CancelTicketRequest>';

    try
    {
      $jsonArray=["success" =>false,
                  "msg"=>'Сведения о заказе отсутствуют.'.__FUNCTION__,
                  "msgController"=>'Информация для техподдержки',
                  "cancelReserved"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка

      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlCancelReserved);//вернет строку
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }

    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonCancelReserved=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonCancelReserved['Error']))
    {
      $jsonArray["msgWebService"]=$jsonCancelReserved['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonCancelReserved['Body'])) $jsonGetOrder=$jsonCancelReserved['Body'];
    else $jsonCancelReserved='';
    return $response->setContent(json_encode(["success" =>true,
                                              "cancelReserved"=>$jsonCancelReserved]));
       

  }

//получение ссылки для оплаты в сбербанке
  private function getHref($data)
  {
    header('Content-type: text/javascript');
    $resp = $this->getResponse();
    $success=false;
    $sbrf_link='';
    header('Content-type: text/javascript');
    $response = $this->getResponse();

    try
    {
    /*  $order_id= doubleval(@$data['order_id']);*/
      $order_id= $data['order_id'];
      $qb = $this->conn->createQueryBuilder();
      $qb->select("status, data")
         ->from("web_order")
         ->where("id_order=:q1")->setParameter(":q1", $order_id, \PDO::PARAM_INT);
      $stmt = $qb->execute();//объект-результат выборки (строки из таблицы web_order по номеру заказа)

      while($order = $stmt->fetch(\PDO::FETCH_ASSOC, \PDO::FETCH_ORI_NEXT))//перебираем построчно. В order-одна строка
      {
         /* var_dump($order);die(554);*/
        if($order["status"]==0)//проверим действительно ли данный заказ зарезервирован
        {
          $dvf = new \Application\Filter\DataValueFilter();
          $webOrderId=$dvf->get("sbrfrest.orderId", json_decode($order['data'],true)); 
          $webFormUrl=$dvf->get("sbrfrest.formUrl", json_decode($order['data'],true));

          if(!empty($webOrderId)) 
          {
            if(!empty($webFormUrl))
            {
              return $resp->setContent(json_encode(["success" =>true,
                                                    "sbrf_link"=>$webFormUrl] ));
            }
            else
            {
              $result = ["success" => 0,
                         "msg" => "Ошибка регистрации заказа ".$order_id];
              return $resp->setContent(json_encode($result));
            }
          }
          else
          {
            $ammount=0;
            for($i=0;$i<count($data['paxes']);$i++)
            $ammount+= $data['paxes'][$i]['place_cost']+$data['paxes'][$i]['cargo_cost'];
            $sbrfRestEmail=$data['email'];

            $domain = \Application\Service\Utils::getDomainLink();

            $sb_params = [
                         "orderNumber" => $order_id,
                         "amount" => $ammount * 100,
                         "currency" => 643,
                         "returnUrl" =>$domain.'/widget/sberpay/sber?ourl='.$data['link'].'&err=0',
                         "failUrl" => $domain.'/widget/sberpay/sber?ourl='.$data['link'].'&err=1',
                         "description" => "Оплата заказа №".$order_id,
                         "language" => "ru",
                         "sessionTimeoutSecs" => 30 * 60 - 15,
                         "jsonParams" => "{\"email\":\"$sbrfRestEmail\"}"
                         ];//собираем параметры которые мы перешлем банку
            $sb_result = \Application\Service\Utils::sberbankRest("register.do", $sb_params, $err); //используя стандартный метод фреймворка для общения со сбербанком register.do перешлем банку данные о покупателе

            if($sb_result !== false)
            {
              $sbrf_link=$sb_result["formUrl"];
              if(isset($sb_result["errorCode"]))
              {
                $result = ["success" => 0,
                           "msg" => "Ошибка регистрации заказа ({$order_id}) в платежном шлюзе: ".($sb_result["errorMessage"]?$sb_result["errorMessage"]:"")];
                return $resp->setContent(json_encode($result));
              }
              if(empty($sbrf_link))
              {
                  $result=["success" => 0,
                           "msg" => "Отсутствует информация о заказе"];
                  return $resp->setContent(json_encode($result));
              }
              $this->conn->beginTransaction();
              try
              {
                $this->conn->executeQuery("LOCK TABLE web_order IN ACCESS EXCLUSIVE MODE");
                $qb = $this->conn->createQueryBuilder();
                $qb->select('id, data')->from('web_order')->where("id_order=".doubleval($order_id)."");
                $stmt = $qb->execute();

                while($row = $stmt->fetch(\PDO::FETCH_ASSOC, \PDO::FETCH_ORI_NEXT))
                {
                  $wo_data = json_decode($row["data"], true);
                  $wo_data["sbrfrest"] = //в $sb_result будет из сбербанка ссылки и номер заказа
                                        [
                                         "orderId" => $sb_result["orderId"],
                                         "formUrl" => $sb_result["formUrl"]
                                        ];

                  $qb = $this->conn->createQueryBuilder();
                  $qb->update('web_order')
                     ->set('data', ':data')->setParameter(':data', json_encode($wo_data), \PDO::PARAM_STR)
                     ->where('id=:id')->setParameter(':id', $row["id"], \PDO::PARAM_INT);
                  $qb->execute();

                $this->conn->commit();
                $success=true;
              }
              catch (\Exception $e)
              {
                $this->lastError='Заказ не может быть корректно зарезервирован';
                $this->conn->rollback();
              }
            } // sb_result
            else $this->lastError='Банк не может сформировать заказ';
          }
        }
        else $this->lastError='Данный заказ не удалось зарезервировать';
      }
      $this->lastError='Строка заказа пуста';
      return $response->setContent(json_encode(["success" =>true,
                                                "sbrf_link"=>$sbrf_link]
                                                                 ));
    }
    catch (\Exception $e)
    {
      $this->lastError='Не удалось осуществить поиск заказа по заданным критериям!';
// $this->utils->toLog("DB ERROR  => ". $e->getMessage(), __FILE__.", ".__FUNCTION__.", ".__LINE__, $stmt);
            //return $this->model($this->errorAnswer($tag, "РћС€РёР±РєР° Р‘Р”!", "РќРµ СѓРґР°Р»РѕСЃСЊ РѕСЃСѓС‰РµСЃС‚РІРёС‚СЊ РїРѕРёСЃРє Р·Р°РєР°Р·Р° РїРѕ Р·Р°РґР°РЅРЅС‹Рј РєСЂРёС‚РµСЂРёСЏРј!"));
    }

    /*var_dump($success.' link=  '.$sbrf_link);die(2112);*/

    if($success==true) return $response->setContent(json_encode(["success" =>$success,
                                                                  "sbrf_link"=>$sbrf_link]
                                                                 ));
    /*if(isset($success)) return $response->setContent(json_encode(["success" =>$success,
                                                                  "sbrf_link"=>$sbrf_link]
                                                                 ));*/

    else return $response->setContent(json_encode(["success" =>$success,
                                                   "msgWebService"=> $this->getLastError(),
                                                   "sbrf_link"=>NULL]
                                                  ));
  }

  //получить информацию о заказе для формирования страницы заказа
  private function getOrder($data)
  {
    header('Content-type: text/javascript');
    $response = $this->getResponse();

    $parts=explode('/', $data['parentUrl']);
    $phoneConfig=$this->getConfig($parts[0],$parts[2],'phoneNumber');

    $xmlGetOrder='<?xml version="1.0" encoding="UTF-8"?>
                  <GetOrderRequest>
                    <orderId>'.doubleval($data['orderId']).'</orderId>
                  </GetOrderRequest>';
    try
    {
      $jsonArray=["success" =>false,
                  "msg"=>'Сведения о заказе отсутствуют.',
                  "msgController"=>'Информация для техподдержки',
                  "cancel"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlGetOrder);//вернет строку
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonGetOrder=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonGetOrder['Error']))
    {
      $jsonArray["msgWebService"]=$jsonGetOrder['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonGetOrder['Body'])) $jsonGetOrder=$jsonGetOrder['Body'];
    else $jsonGetOrder='';
    return $response->setContent(json_encode(["success" =>true,
                                              "getOrder"=>$jsonGetOrder,
                                              "config"=>$phoneConfig]));
  }

//оформить заказ-нажатие кнопки "Готово"
  private function bookOrder($data)
  {
    $cookie=$data['cookie'];
    $data=$data['data'];

    $ff = new \Application\Filter\PhoneFilter();
    $phone = $ff->filter(htmlentities($data["phone"]));

    $phv = new \Application\Validator\PhoneValidator();
    if(! $phv->isValidNew($phone)) {

        return $response->setContent(json_encode(["success"=>false, "msg"=>$phv->getErrorMessage()]));
    }

//       $getLogPasswdAccess=$this->getLoginPasswordAccess($user_id);
    $xmlBookOrder='<?xml version="1.0" encoding="UTF-8"?>
                   <WidgetBookOrderRequest>
                     <tripId>'.doubleval($data['id_reis']).'</tripId>
                     <dispatchStationId>'. htmlentities($data['id_from']).'</dispatchStationId>
                     <arrivalStationId>'. htmlentities($data['id_to']).'</arrivalStationId>
                     <orderEmail>'.htmlentities($data['email']).'</orderEmail>
                     <orderPhone>'.htmlentities($data['phone']).'</orderPhone>';

    for($i=0;$i<count($data['paxes']);$i++)
    {
//          $numberSeriesDoc=explode(' ',$data['paxes'][$i]['doc_num']);
      $series= strstr($data['paxes'][$i]['doc_num'], ' ',true);
      $number= strstr($data['paxes'][$i]['doc_num'], ' ');
      if($series==''||$number=='')
      {
        $series= substr($data['paxes'][$i]['doc_num'],0,4);
        $number= substr($data['paxes'][$i]['doc_num'],4,strlen($data['paxes'][$i]['doc_num']));
      }
      $dr= explode('.', $data['paxes'][$i]['dr']);
      $birthday=$dr[2].'-'.$dr[1].'-'.$dr[0];
      if($data['paxes'][$i]['sex']==0)$gender='FEMALE';
      if($data['paxes'][$i]['sex']==1)$gender='MALE';
      if(isset($data['paxes'][$i]['bag'])) $bag=$data['paxes'][$i]['bag'];
      else $bag='';

          /* <cargoNum>'.$data['paxes'][$i]['bag'].'</cargoNum> */
      $xmlBookOrder=$xmlBookOrder.''.
                    ' <Sale>
                        <seatId>'.doubleval($data['paxes'][$i]['place']).'</seatId>
                        <ticketTypeId>'.doubleval($data['paxes'][$i]['tarif']).'</ticketTypeId>
                        <cargoNum>'.doubleval($bag).'</cargoNum>
                        <Passenger>
                          <lastName>'.htmlentities($data['paxes'][$i]['f']).'</lastName>
                          <firstName>'.htmlentities($data['paxes'][$i]['i']).'</firstName>
                          <middleName>'.htmlentities($data['paxes'][$i]['o']).'</middleName>
                          <docNum>'. htmlentities($number).'</docNum>
                          <docSeries>'.htmlentities($series).'</docSeries>
                          <docTypeId>'.htmlentities($data['paxes'][$i]['doc']).'</docTypeId>
                          <birthday>'.htmlentities($birthday).'</birthday>
                          <citizenshipISO2>'.htmlentities($data['paxes'][$i]['grazhd']).'</citizenshipISO2>
                          <gender>'.htmlentities($gender).'</gender>
                        </Passenger>
                      </Sale>';
    }
    $xmlBookOrder=$xmlBookOrder.''.'<casherId>'.doubleval($data['casherId']).'</casherId>
                    </WidgetBookOrderRequest>';

    header('Content-type: text/javascript');
    $response = $this->getResponse();
        /*если стояла галочка Создать аккаунт*/
    if( isset($data["create_account"]) && ($data["create_account"]==true) ) $current_user = $this->createAccount($data);
    if(empty($current_user)) $current_user = $this->entityManager->getRepository(\User\Entity\Usr::class)->getCurrentUser("id", $this->identity());
        /*если стояла галочка Подписаться на новости*/
    if(!empty($data["subscribe_news"]))
    {
      $subscribe = new \Application\Filter\Subscribe(["em"=>$this->entityManager]);
      $subscribe->addMail($data["email"], $current_user);
      $subscribe->addPhone($data["phone"], $current_user);
    }

    try
    {
     $jsonArray=["success" =>false,
                  "msg"=>'Не удается оформить заказ.',
                  "msgController"=>'Информация для техподдержки',
                  "cancel"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlBookOrder);//вернет строку
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonBookOrder=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonBookOrder['Error']))
    {
      $jsonArray["msgWebService"]=$jsonBookOrder['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonBookOrder['Body']))$jsonBookOrder=$jsonBookOrder['Body'];
    else $jsonBookOrder='';

     $tickets[]=$jsonBookOrder['Ticket'];

    $this->getWidgetMail(htmlentities($data['email']), $jsonBookOrder['orderId'], htmlentities($data['id_reis']), $tickets, $cookie);

    return $response->setContent(json_encode(["success" =>true,
                                              "bookOrder"=>$jsonBookOrder]));
  }

//снять бронь с места, зарезервированного на 5 мин. (стр оформления билетов)
  private function unreservTicketPlaces($reisId,$placeNumber,$casherId)
  {
//        $getLogPasswdAccess=$this->getLoginPasswordAccess($user_id);
    $xmlUnreservTicketPlaces= '<?xml version="1.0" encoding="UTF-8"?>
                               <UnreserveSeatsRequest>
                                 <tripId>'.doubleval($reisId).'</tripId>
                                 <seatId>'.doubleval($placeNumber).'</seatId>
                                 <casherId>'.doubleval($casherId).'</casherId>
                               </UnreserveSeatsRequest>';

    header('Content-type: text/javascript');
    $response = $this->getResponse();

    try
    {
     $jsonArray=["success" =>false,
                  "msg"=>'Не удается снять бронь с места.',
                  "msgController"=>'Информация для техподдержки',
                  "cancel"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlUnreservTicketPlaces);//вернет строку
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonUnreservTicketPlaces=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonUnreservTicketPlaces['Error']))
    {
      $jsonArray["msgWebService"]=$jsonUnreservTicketPlaces['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonUnreservTicketPlaces['Body']))$jsonUnreservTicketPlaces=$jsonUnreservTicketPlaces['Body'];
    else $jsonUnreservTicketPlaces='';

    return $response->setContent(json_encode(["success" =>true,
                                              "unreservSeat"=>$jsonUnreservTicketPlaces]));
  }

//зарезервировать место на 5 мин(стр оформления билетов)
  private function reservTicketPlaces($reisId,$placeNumber,$casherId)
  {
//       $getLogPasswdAccess=$this->getLoginPasswordAccess($user_id);
    $xmlReservTicketPlaces= '<?xml version="1.0" encoding="UTF-8"?>
                             <ReserveSeatsRequest>
                               <tripId>'.doubleval($reisId).'</tripId>
                               <seatId>'.doubleval($placeNumber).'</seatId>
                               <casherId>'.doubleval($casherId).'</casherId>
                             </ReserveSeatsRequest>';
    header('Content-type: text/javascript');
    $response = $this->getResponse();

    try
    {
      $jsonArray=["success" =>false,
                  "msg"=>'Не удается забронировать место.',
                  "msgController"=>'Информация для техподдержки',
                  "cancel"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlReservTicketPlaces);//вернет строку
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonReservTicketPlaces=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonReservTicketPlaces['Error']))
    {
      $jsonArray["msgWebService"]=$jsonReservTicketPlaces['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonReservTicketPlaces['Body'])) $jsonReservTicketPlaces=$jsonReservTicketPlaces['Body'];
    else $jsonReservTicketPlaces='';

    return $response->setContent(json_encode(["success" =>true,
                                              "reservSeat"=>$jsonReservTicketPlaces]));
  }

//получить список мест для правильной прорисовки автобуса
  private function getTicketPlaces($reisId,$dispatchStationId,$arrivalStationId,$casherId)
  {
//       $getLogPasswdAccess=$this->getLoginPasswordAccess($user_id);
    $xmlTicketPlaces= '<?xml version="1.0" encoding="UTF-8"?>
                       <WidgetGetSeatsRequest>
                         <tripId>'.doubleval($reisId).'</tripId>
                         <dispatchStationId>'.htmlentities($dispatchStationId).'</dispatchStationId>
                         <arrivalStationId>'.htmlentities($arrivalStationId).'</arrivalStationId>
                         <casherId>'.doubleval($casherId).'</casherId>
                       </WidgetGetSeatsRequest>';

    header('Content-type: text/javascript');
    $response = $this->getResponse();
    $jsonArray=["success" =>false,
                "msg"=>'Ошибка при получении списка мест.',
                "msgController"=>'Информация для техподдержки',
                "ticketPlaces"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка

    try
    {
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlTicketPlaces);
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonTicketPlaces=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonTicketPlaces['Error']))
    {
      $jsonArray["msgWebService"]=$jsonTicketPlaces['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonTicketPlaces['Body']))$jsonTicketPlaces=$jsonTicketPlaces['Body'];
           /* else
            {
                $jsonTicketPlaces='';
                return $response->setContent(json_encode(["success" =>true,
                                                          "ticketPlaces"=>NULL]));
            }*/
    else  $jsonTicketPlaces='';

    return $response->setContent(json_encode(["success" =>true,
                                              "ticketPlaces"=>$jsonTicketPlaces,
                                              "cas="=>$casherId ]));
  }

//получить всю информацию о рейсе, которая отобразится вверху на странице оформления билетов
  private function getTicketPay($reisId,$dispatchStationId,$arrivalStationId,$protokol,$host)
  {
    $phoneConfig=$this->getConfig($protokol,$host,'phoneNumber');

    $xmlTicketPay='<?xml version="1.0" encoding="UTF-8"?>
                   <WidgetTripRequest>
                     <tripId>'.doubleval($reisId).'</tripId>
                     <dispatchStationId>'. htmlentities($dispatchStationId).'</dispatchStationId>
                     <arrivalStationId>'.htmlentities($arrivalStationId).'</arrivalStationId>
                   </WidgetTripRequest>';

    header('Content-type: text/javascript');
    $response = $this->getResponse();
    $jsonArray=["success" =>false,
                "msg"=>'Невозможно получить сведения о рейсе.',
                "msgController"=>'Информация для техподдержки',
                "ticketPay"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка

    try
    {
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlTicketPay);
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }

    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonTicketPay=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonTicketPay['Error']))
    {
      $jsonArray["msgWebService"]=$jsonTicketPay['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonTicketPay['Body']))$jsonTicketPay=$jsonTicketPay['Body'];
    else $jsonTicketPay='';

    for($i=0;$i<count($jsonTicketPay['Stops']['Stop']);$i++)
    {
      if($jsonTicketPay['Stops']['Stop'][$i]['id']==$dispatchStationId)
      {
         $find['dispatchName']=$jsonTicketPay['Stops']['Stop'][$i]['name'];
         $find['dispatchRegionName']=$jsonTicketPay['Stops']['Stop'][$i]['regionName'];
         $find['dispatchDate']=$jsonTicketPay['Stops']['Stop'][$i]['dispatchDate'];
      }
      if($jsonTicketPay['Stops']['Stop'][$i]['id']==$arrivalStationId)
      {
         $find['arrivalName']=$jsonTicketPay['Stops']['Stop'][$i]['name'];
         $find['arrivalRegionName']=$jsonTicketPay['Stops']['Stop'][$i]['regionName'];
         $find['price']=$jsonTicketPay['Stops']['Stop'][$i]['price'];
      }
    }

    return $response->setContent(json_encode(["success" =>true,
                                              "ticketPay"=>$jsonTicketPay,
                                              "find"=>$find]));
  }

//вернет рейсы на сегодня для данного агента
  private function getTripData()
  {
    //    $getLogPasswdAccess=$this->getLoginPasswordAccess($user_id);
    $xmlTrip='<?xml version="1.0" encoding="UTF-8"?>
              <WidgetDefaultPageRequest>
              </WidgetDefaultPageRequest>';

    try
    {
      $jsonArray=["success" =>false,
                  "Error"=>true,
                  "msg"=>'Невозможно получить информацию о рейсах агента.',
                  "msgController"=>'Информация для техподдержки',
                  "tripData"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlTrip);//вернет строку
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $jsonArray;
    }
    $tagsValue=array();
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    return $tagsValue;
  }

//из списка рейсов, которые вернула getTripData сформируем json ответ
  private function getIndexPageData()
  {
    $jsonResponse=$this->init();
    header('Content-type: text/javascript');
    $response = $this->getResponse();
    $jsonArray=["success" =>false,
                "msg"=>'Невозможно получить информацию о рейсах агента.',
                "msgController"=>'Информация для техподдержки',
                "tripData"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
    $jsonTrip= $this->getTripData();
    $jsonTrip=json_decode(json_encode((array)$jsonTrip), TRUE);

    if(isset($jsonTrip["Error"]))
    {
      $jsonError = $jsonTrip["Error"];
      $jsonArray["msgWebService"]=$jsonError['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    else $jsonArray['msgWebService']='';

    if(isset($jsonTrip['Body']['Trip']))$jsonTrip=$jsonTrip['Body']['Trip'];
    else $jsonTrip='';

/*РїРѕР№РґРµС‚ РІ widget.js РІ success*/
    return $response->setContent(json_encode(["success" =>$jsonResponse,
                                              "msg"=> $this->getLastError(),
                                              "trips"=>$jsonTrip]
                                             ));
  }

//вернет true в случае если пользователь прошел проверку на метод echo и false в обратном случае. Проверка проводится один раз во время загрузки стартовой страницы
  private function init()
  {
    $positionRequest='Check out it '.rand(1,10);

    $xmlEcho='<?xml version="1.0" encoding="UTF-8"?>
              <EchoRequest>
                <message>'.htmlentities($positionRequest).'</message>
              </EchoRequest>';

    $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlEcho);

    if(empty($responseFromServer))
    {
      $this->lastError='Пустой ответ с сервера'.' :'.__FUNCTION__;
      return false;
    }

    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonMessage=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonMessage["Error"]))
    {
      $jsonError = $jsonMessage["Error"];
      $this->lastError=$jsonError['message'].' :'.__FUNCTION__;

      return FALSE;
    }

    $jsonMessage=$jsonMessage['Body']['message'];

    if(!empty($jsonMessage))
    {
      if (trim($positionRequest)==$jsonMessage)
      {
        return TRUE;
      }
      else
      {
        $this->lastError='Ответ и запрос не совпадают'.' :'.__FUNCTION__;
        return FALSE;
      }
    }
    if($jsonError!=='')
    {
      $this->lastError=$jsonError['message'].' :'.__FUNCTION__;
      return FALSE;
    }
  }

//получаем массив из элементов-логин, пароль, доступ
  private function getLoginPasswordAccess($user_id)
  {
    $dataAccess=array();

    if(is_int($user_id+0)===FALSE)
    {
      $this->lastError='Некорректный параметр.';
      return FALSE;
    }


    $this->user = $this->entityManager->getRepository(\User\Entity\Usr::class)->getCurrentUser("id", $user_id);

    if(empty($this->user))
    {
      $this->lastError='Доступ_ограничен!!!';
      return FALSE;
    }

    $dvf=new \Application\Filter\DataValueFilter();
    $data=$this->user->getData();
    $webAccess=$dvf->get('profile.webaccess.access',$data);
    $waLogin=$dvf->get('profile.webaccess.walogin',$data);
    $waPassword=$dvf->get('profile.webaccess.wapassword',$data);
    if ($webAccess !== 'true')
    {
      $this->lastError='Доступ запрещен'; /* $dataAccess['access']=FALSE;*/
      return FALSE;
    }
    if(empty($waLogin))
    {
      $this->lastError='Отсутствует логин'; /*$dataAccess['login']=FALSE;*/
      return FALSE;
    }
    if(empty($waPassword))
    {
      $this->lastError='Отсутствует пароль'; /*$dataAccess['password']=FALSE;*/
      return FALSE;
    }
    $dataAccess=['login'=>$waLogin,
                 'password'=>$waPassword,
                 'access'=>TRUE];

    return $dataAccess;
  }

//получим массив из списка рейсов. Для случая когда пользователь воспользовался поиском нужного ему рейса
  private function getTrip($dispatchCity,$arrivalCity,$date)
  {
//       $getLogPasswdAccess=$this->getLoginPasswordAccess($user_id);
    $xmlTrip='<?xml version="1.0" encoding="UTF-8"?>
              <WidgetSearchTripsRequest>
                <dispatchCityName>'.htmlentities($dispatchCity).'</dispatchCityName>
                <arrivalCityName>'.htmlentities($arrivalCity).'</arrivalCityName>
                <date>'.htmlentities($date).'</date>
              </WidgetSearchTripsRequest>';

   $jsonArray=["success" =>false,
                "msg"=>'Невозможно получить список рейсов.',
                "msgController"=>'Информация для техподдержки',
                "getTrip"=>NULL];  //объявим массив jsonArray для случая если возникла ошибка
    header('Content-type: text/javascript');
    $response = $this->getResponse();

    try
    {
      $responseFromServer=$this->widgetSendPost($this->dataAccess['login'], $this->dataAccess['password'], $xmlTrip);
    }
    catch (\Exception $e)
    {
      $jsonArray["msgWebService"]=$e->getMessage().':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    $tagsValue=array();
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $jsonTrip=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($jsonTrip['Error']))
    {
      $jsonArray["msgWebService"]=$jsonTrip['Error']['message'].':'.__FUNCTION__;
      return $response->setContent(json_encode($jsonArray));
    }
    if(isset($jsonTrip['Body']['Trip']))$jsonTrip=$jsonTrip['Body']['Trip'];//получим массив тегов trip*/
    else $jsonTrip='';

    return $response->setContent(json_encode(["success" =>true,
                                              "trips"=>$jsonTrip]));
  }

//получаем ответ от сервера в виде строки, в зависимости от запроса из переменной $xml_data
  private function widgetSendPost($login,$password,$xml_data)
  {
    preg_match_all('/\?\>\s*?\<([^>].*?)\>/im', $xml_data, $matches);

    $method = (isset($matches[1]) && isset($matches[1][0])) ? lcfirst(implode("", explode("Request", $matches[1][0]))) : "";
    $proto = ( isset($_SERVER['HTTPS']) || !empty($_SERVER['HTTPS']) )?'https':'http';
    //$url = $proto.'://'.$_SERVER['HTTP_HOST'].'/sales/xml/sales/'.$method;
    //$url='http://test.gobus.online/sales/xml/'.$method;
    //$url='http://gobus.local/sales/xml/'.$method;
    $url = $proto.'://'.$_SERVER['HTTP_HOST'].'/sales/xml/'.$method;

    $ch = curl_init();                            /*создает новый сеанс CURL*/
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD, "$login:$password");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/xml'));
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml_data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Gobus-Access-Type: widget')); // Если работа ведется с виджета, то ставить этот заголовок

      //  curl_setopt($ch, CURLOPT_VERBOSE, true); // информативный вывод отладочной информации
      //  curl_setopt($ch, CURLOPT_STDERR, fopen(realpath($_SERVER["DOCUMENT_ROOT"]."/../data/log/") . '/webservice.curl.log', 'a+'));  // куда выводить отладочную информацию*/
    try
    {
      $result = curl_exec($ch);  sleep(1);
    }
    catch(\SoapFault $ex)
    {
      return '';
    }
    catch (Exception $ex)
    {
      return '';
    }

    curl_close($ch);
    return $result ;
  }

//получить сообщение об ошибке
  private function getLastError()
  {
    return $this->lastError;
  }

 //вернуть список билетов на странице заказа. �­тот action активируется при переходе по ссылке ourl из метода getOrder протокола.
  public function TicketTokenAction()
  {
     /*if(isset($_SERVER['HTTP_REFERER'])){*/
    if(isset($_SERVER['HTTP_COOKIE'])){
       $ref= explode(';', $_SERVER['HTTP_COOKIE']);
       foreach ($ref as $value) {
           $refer=explode('=',$value);
           if(trim($refer[0])=='PHPPARENTURL'){
               $referer= explode('/',$refer[1]);
               $css= $referer[0].'//'.$referer[2].'/gobus_widget.css';
               $getCssFile=@file_get_contents($css);
               break;
           }
       }
    }
     else {
            $css='';
            $getCssFile='';
     }

    $paramsFromRoute=$this->params()->fromRoute();

    $data = $this->params()->fromRoute();
    $token = explode("-",$data["id"]); 
    if(isset($token[0])&&isset($token[1]))
    {
      if(empty($token[0]))
      {
        $this->lastError='Не удается найти номер заказа.'.__FUNCTION__;
        header('Content-type: text/javascript');
        $response = $this->getResponse();
        return $response->setContent(json_encode(["success" =>false,
                                                  "msg"=>$this.getLastError(),
                                                  "msgController"=>'Нет номера заказа']
                                                 ));
      }
      if(empty($token[1]))
      {
        $this->lastError='Не удается найти контрольную сумму.'.__FUNCTION__;
        header('Content-type: text/javascript');
        $response = $this->getResponse();
        return $response->setContent(json_encode(["success" =>false,
                                                  "msg"=>$this.getLastError(),
                                                  "msgController"=>'Нет контрольной суммы']
                                                 ));
      }
    }
    else
    {
      $this->lastError='Не удается найти токен.'.__FUNCTION__;
      header('Content-type: text/javascript');
      $response = $this->getResponse();
      return $response->setContent(json_encode(["success" =>false,
                                                "msg"=>$this.getLastError(),
                                                "msgController"=>'Токен не найден']
                                              ));
    }
    $order_id = $token[0];
    $check_sum = $token[1];
    $conn = $this->entityManager->getConnection();
    $qb = $conn->createQueryBuilder();
    $qb
      ->select('id, id_seller')
      ->from('web_order')
      ->where("id_order=".doubleval($order_id)."")
      ;
    $stmt = $qb->execute();

    while($row = $stmt->fetch(\PDO::FETCH_ASSOC, \PDO::FETCH_ORI_NEXT))
    {
      $seller_id=$row['id_seller'];
      $ids[] = $row["id"];
    }
    $qb = $conn->createQueryBuilder();
    $qb
       ->update('ticket')
       ->set("token", "right(token, length(token)-strpos(token,'-'))")
       ->where("id in (".implode(",",$ids).")")
       ->andWhere("status=0 AND length(token)=32");
    $stmt = $qb->execute();
    $getLogPasswdAccess=$this->getLoginPasswordAccess($seller_id);

    $xmlGetOrder='<?xml version="1.0" encoding="UTF-8"?>
                  <GetOrderRequest>
                    <orderId>'.doubleval($order_id).'</orderId>
                  </GetOrderRequest>';
    $responseFromServer=$this->widgetSendPost($getLogPasswdAccess['login'], $getLogPasswdAccess['password'], $xmlGetOrder);

    if(empty($responseFromServer))
    {
      $this->lastError='Пустой ответ с сервера';
    }
    $tagsValue=simplexml_load_string($responseFromServer, "SimpleXMLElement", LIBXML_NOCDATA);
    $getOrder=@json_decode(@json_encode((array)$tagsValue), TRUE);

    if(isset($getOrder['Body']['Ticket']['created'])) $dateGetOrder=$getOrder['Body']['Ticket']['created'];
    else $dateGetOrder=$getOrder['Body']['Ticket'][0]['created'];

    if(isset($getOrder['Body']))
    {
      $reisGetOrder=$getOrder['Body']['tripId'];
      $reisGetOurl=$getOrder['Body']['ourl'];
    }
    else
    {
      $getOrder['Body']='';
    }

    $check_crc = abs(crc32("A".$order_id."B". $reisGetOrder."C"));
    if($check_crc != $check_sum)
    {
      $this->getResponse()->setStatusCode(404);
      return;
    }
    return new ViewModel(["order_id" => $order_id,
                          "dat" => $dateGetOrder,
                          "reis_id" => $reisGetOrder,
                          "ourl" =>$reisGetOurl,
                          "path"=>$seller_id,
                          "errorInfo"=> $this->errorInfo,
                          "getCssFile"=>$getCssFile]);
  }

//формирует сообщение в окне оплаты сбербанка после завершения оплаты.
  public function SberAction()
  {
    /*if(isset($_SERVER['HTTP_REFERER'])){*/
   if(isset($_SERVER['HTTP_COOKIE'])){
       $ref= explode(';', $_SERVER['HTTP_COOKIE']);
       foreach ($ref as $value) {
           $refer=explode('=',$value);
           if(trim($refer[0])=='PHPPARENTURL'){
               $referer= explode('/',$refer[1]);
               $css= $referer[0].'//'.$referer[2].'/gobus_widget.css';
               $getCssFile=@file_get_contents($css);
               break;
           }
       }
    }
    else {
          $css='';
          $getCssFile='';
    }

    return new ViewModel(["ourl" => $this->params()->fromQuery("ourl"),
                          "err" => $this->params()->fromQuery("err"),
                          "errorInfo"=> $this->errorInfo,
                          "cssParam"=>$css,
                          "getCssFile"=>$getCssFile]);
  }

  /*станица поиска и возврата билетов*/
    public function widgetTicketReturnAction()
    {
        $isError = false;

        $paramsFromRoute=$this->params()->fromRoute();
        $path= $paramsFromRoute['id'];
        $protokol=$paramsFromRoute['protokol'];
        $host=$paramsFromRoute['host'];

        $phoneConfig= $this->getConfig($protokol,$host,'phoneNumber');

        $css= $protokol.'://'.$host.'/gobus_widget.css';
        $cssParam='//'.$host.'/gobus_widget.css';
        $getCssFile=@file_get_contents($css);

        if ($this->getRequest()->isPost())
        {
            $error = true;
            $secret = '**';
            $data = $this->params()->fromPost();
            if (!empty($data['g-recaptcha-response'])) {
               $ticket = $this->entityManager->getRepository(\User\Entity\Ticket::class)->findOneBy([
                       "id"=>$data["id_ticket"],
                       "status" => 1
                   ]);

               if(empty($ticket))
                  return new   ViewModel([  "msg" => "Указанный билет не оплачивался онлайн или уже сдан!",
                                            'msgCap' => "",
                                            'path'=>$path,
                                            'phoneConfig'=>$phoneConfig,
                                            'getCssFile'=>$getCssFile,
                                            'cssParam'=>$cssParam]);

               $web_order = $this->entityManager->getRepository(\User\Entity\WebOrder::class)->findOneBy([
                            "idTicket" => $data["id_ticket"],
                            "status" => 1
                           ]);
               if(empty($web_order)) return new   ViewModel(["msg" => "Указанный билет не оплачивался онлайн!",
                                                             'msgCap' => "",
                                                             'path'=>$path,
                                                             'phoneConfig'=>$phoneConfig,
                                                             'getCssFile'=>$getCssFile,
                                                             'cssParam'=>$cssParam]);

               $dvf = new \Application\Filter\DataValueFilter();

               $doc_num = $dvf->get("doc_num", $ticket->getPax());
               $doc_num = trim(implode("", explode(" ", $doc_num)));

               $data["doc_num"] = trim(implode("", explode(" ", $data["doc_num"])));
               if($data["doc_num"] != $doc_num)
                        return new   ViewModel(["msg" => "Билет с искомой комбинацией не найден!",
                                                'msgCap' => "",
                                                'path'=>$path,
                                                'phoneConfig'=>$phoneConfig,
                                                'getCssFile'=>$getCssFile,
                                                'cssParam'=>$cssParam]);

               $id_order = $web_order->getIdOrder();
               $id_reis = $ticket->getIdReis();

               $link = \Application\Filter\TicketFilter::ourl($id_order, $id_reis );

               $hash= explode('/', $link);
               return $this->redirect()->toUrl('/widget/ticket-token/'.$hash[count($hash)-1]);
            }
            else return new ViewModel([
                                   'msgCap' => 'Ошибка при вводе защитного кода!',
                                   'msg'=>"",
                                   'path'=>$path,
                                   'phoneConfig'=>$phoneConfig,
                                   'getCssFile'=>$getCssFile,
                                   'cssParam'=>$cssParam
                                  ]);
        }

        return new ViewModel([
                              'msgCap' => "",
                              "msg" => "",
                              'path'=>$path,
                              'phoneConfig'=>$phoneConfig,
                              'getCssFile'=>$getCssFile,
                              'cssParam'=>$cssParam]);
    }

/*получить номер тел горячей линии по протоколу и хосту Используется в контроллере*/
    private function getConfig($protokol,$host,$param)
    {
      $json = @file_get_contents($protokol.'://'.$host.'/gobus_widget_cfg.txt');
        if($json!==FALSE)
         $config= @json_decode($json)->$param;
        else $config='';

      return $config;
    }

/*Получить номер тел горячей линии в аякс-запросе*/
    public function jsonPhoneConfig($protokol,$host)
    {
       header('Content-type: text/javascript');
       $response = $this->getResponse();
       $phoneConfig=$this->getConfig($protokol, $host,'phoneNumber');
       if(isset($phoneConfig))  return $response->setContent(json_encode(["success" =>true,
                                                                          "config"=>$phoneConfig]
                                                                        ));
       else{ return $response->setContent(json_encode(["success" =>true,
                                                       "config"=>'']
                                              ));
       }
    }

/*отправка письма пользователю после того как он заполнит на стр 2 данные о себе и др пассажирах. Вызывается в bookOrder в конце*/
    private function getWidgetMail($email, $id_order, $id_reis, $tickets, $cookie)
    {
        if(empty($tickets[0][0]))$userTickets=$tickets;
        else $userTickets=$tickets[0];

        $date=explode('T',$userTickets[0]["dispatchDate"]);

        $body = "Здравствуйте!<br>";
        $body .= "На Ваш адрес электронной почты $email <br>";
        $body .= ( (sizeof($userTickets)>1) ? "забронированы билеты" : "забронирован билет" ) ;
        if( !empty($id_reis) && is_int($id_reis) )
            $body .= " на <b>рейс № {$id_reis}</b>";
        $body .= "<br><b>от остановки</b> {$userTickets[0]["dispatchCityName"]}, {$userTickets[0]["dispatchStation"]} <br>";
        $body .= "<b>до остановки</b> {$userTickets[0]["arrivalCityName"]}, {$userTickets[0]["arrivalStation"]} <br>";
        $body .= "<b>отправление</b> {$date[0]} г. в {$date[1]}<br>";
        $body .= "<b>Номер заказа:</b> ". $id_order;
        $body .= "<hr>";

        // Исправил инициализацию переменной $tokens( было $tokens = "" ), так как в php7.4 вылетает ошибка - [] operator not supported for strings
       // $tokens = [];
        foreach ($userTickets as $ticket)
        {
           // $tokens[] = $ticket["token"];
            $id = empty($ticket["id"])?"?":$ticket["id"];

            $body .= "<b>Билет №</b>: {$id}<br>";
            $body .= "<b>Место №</b>: {$ticket["seatNum"]}<br>";
            $body .= "<b>Тариф</b>: {$ticket["tarifName"]}<br>";
            $body .= "<b>Багаж</b>: {$ticket["cargoNum"]}<br>";
            $body .= "<b>Пассажир</b>: {$ticket["Passenger"]["lastName"]} {$ticket["Passenger"]["firstName"]} {$ticket["Passenger"]["middleName"]}";
            $body .= "<hr>";
        }

        $body .= "<br>";
        $body .= "Если Вы не делали этого, то просто проигнорируйте данное письмо.<br><br>";
        $body .= "Перейти на страницу заказа можно по данной ссылке: ";

        $link = \Application\Filter\TicketFilter::ourlWidget($id_order, $id_reis );

        $body .= "<a href='{$link}'>{$link}</a>.<br>";
        $body .= "На странице заказа Вы можете оплатить или отменить заказ, распечатать билеты, а также осуществить возврат оплаченных билетов.<br>";
        $body .= "Неоплаченный заказ отменяется автоматически через 30 минут после оформления!<br><br>";
        $body .= "Данная ссылка является уникальной и находится только в этом письме!<br>";
        $body .= "Не удаляйте это письмо, т.к. при отсутствии ссылки доступ к странице заказа невозможен!<br><br>";
        $body .= "<br><br>Спасибо, что Вы с нами!";

       $referer= explode('/',$cookie);

       $protokol=trim(str_replace(":"," ",$referer[0]));
       $host=$referer[2];

        $emailFromTo=( ($this->getConfig($protokol,$host,'email')!=='') && ($this->getConfig($protokol,$host,'email')!==null))? $this->getConfig($protokol,$host,'email'):'robot@gobus.online';
        $webAgentName=( ($this->getConfig($protokol,$host,'webAgentName')!=='') && ($this->getConfig($protokol,$host,'webAgentName')!==null))? $this->getConfig($protokol,$host,'webAgentName'):'ООО Гоубас';
        $picture=( ($this->getConfig($protokol,$host,'picture')!=='')&& ($this->getConfig($protokol,$host,'picture')!==NULL) )? $protokol.'://'.$host.'/img/'.$this->getConfig($protokol,$host,'picture'):'https://gobus.online/img/logo.png';
        $signature=( ($this->getConfig($protokol,$host,'signature')!=='')&&($this->getConfig($protokol,$host,'signature')!==null)  )? $this->getConfig($protokol,$host,'signature'):'Всегда ваша, команда Гоубас';
        $pathToContact=( ($this->getConfig($protokol,$host,'pathToContact')!=='')&& ($this->getConfig($protokol,$host,'pathToContact')!==null) )? $this->getConfig($protokol,$host,'pathToContact') :'https://gobus.online/contact';

        $subject = "Ваши билеты оформлены!";
        $mbf = new \Application\Filter\MailBlankFilter();
        $body = $mbf->widgetGet(["body"=>$body, "title"=>$subject, "picture"=>$picture, "signature"=>$signature, "pathToContact"=>$pathToContact]);

        $html = new \Zend\Mime\Part($body);
        $html->type = \Zend\Mime\Mime::TYPE_HTML;
        $html->charset = 'utf-8';
        $html->encoding = \Zend\Mime\Mime::ENCODING_QUOTEDPRINTABLE;

        $body = new \Zend\Mime\Message();
        $body->setParts([$html]);

        $message = new \Zend\Mail\Message();
        $message->setBody($body);

        $message->addTo($email);
        /*$message->addFrom($emailFromTo, "=?utf-8?b?".base64_encode($webAgentName)."?=");*/
        $message->addFrom('widget@gobus.online', "=?utf-8?b?".base64_encode($webAgentName)."?=");
        $message->addReplyTo($emailFromTo, "=?utf-8?b?".base64_encode($webAgentName)."?=");
        $message->setSubject($subject);
        $transport = new \Zend\Mail\Transport\Sendmail();
        $transport->send($message);
    }
}
