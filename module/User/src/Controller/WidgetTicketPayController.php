<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
namespace User\Controller;

use Zend\Mvc\MvcEvent;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use User\Entity\Usr;

class WidgetTicketPayController extends AbstractActionController
{
    private $entityManager;
    private $userManager;
    private $errorInfo;
    /*private $authManager;*/

  public function __construct($entityManager, $userManager/*, $authManager*/)
  {
    $this->entityManager = $entityManager;
    $this->userManager = $userManager;
    $this->errorInfo='Мы будем благодарны, если Вы сделаете скриншот (screenshot) этой страницы <br>'
                       . ' и отправите его по адресу электронной почты или сообщите нам по телефону.';
        /*$this->authManager = $authManager;*/
  }

  public function onDispatch(MvcEvent $e)
  {
    $response = parent::onDispatch($e);
    $this->layout()->setTemplate('layout/widget');
    return $response;
  }

  public function widgetAction()
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
    else{
        $css='';
        $getCssFile='';
    }

    return new ViewModel(["errorInfo"=> $this->errorInfo,
                          "cssParam"=>$css,
                          "getCssFile"=>$getCssFile,
                          "path"=>$this->params()->fromRoute("path")]);
  }

  public function widgetTicketPayAction()
  {
    $udata = false;
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
    else{
        $css='';
        $getCssFile='';
    }

    if($user = $this->entityManager->getRepository(Usr::class)->getCurrentUser("id", $this->identity()))
    {
      $dvf = new \Application\Filter\DataValueFilter();
      $udata = [];
//Преобразуйте все объекты HTML в соответствующие символы
      $udata['phone'] = htmlentities($dvf->get("profile.contact.phone1", $user->getData()));
      $udata['email'] = htmlentities($user->getEmail());
      $udata['f'] = htmlentities($user->getF());
      $udata['i'] = htmlentities($user->getI());
      $udata['o'] = htmlentities($user->getO());
      $udata['sex'] = htmlentities($dvf->get("profile.user.sex", $user->getData()));
      if($udata['sex']=="") $udata['sex'] = 1;
      $udata['dr'] = htmlentities($dvf->get("profile.user.dr", $user->getData()));
      $udata['grazhd'] = htmlentities($dvf->get("profile.user.grazhd", $user->getData()));
      $udata['grazhd_txt'] = htmlentities($dvf->get("profile.user.grazhd_txt", $user->getData()));
      $udata['doc'] = htmlentities($dvf->get("profile.user.passport_type", $user->getData()));
      if($udata['doc']=="") $udata['doc'] = 0;
      $udata['doc_txt'] = htmlentities($dvf->get("profile.user.passport_type_txt", $user->getData()));
      $udata['doc_num'] = htmlentities($dvf->get("profile.user.passport", $user->getData()));

      $pt = $this->entityManager->getRepository(\User\Entity\SprDocType::class)->findOneByCode($udata['doc']);
      $udata['doc_mask'] = $pt->getMask();
      $udata['doc_example'] = $pt->getExample();
    }

        // Если все символы в номере рейса цифровые
    if(ctype_digit($this->params()->fromRoute("id")))
      $reis = $this->entityManager->getRepository(\User\Entity\Reis::class)->findOneById($this->params()->fromRoute("id"));
    else
      $reis = false;

    return new ViewModel(["id_reis" => $this->params()->fromRoute("id"),
                          "dispatchStationIdFind"=> $this->params()->fromRoute("from"),
                          "arrivalStationIdFind"=> $this->params()->fromRoute("to"),
                          "id_user" => $this->params()->fromRoute("path"),
                          "user"    => $udata,
                          "errorInfo"=> $this->errorInfo,
                          "cssParam"=>$css,
                          "getCssFile"=>$getCssFile,
                          "path"=>$this->params()->fromRoute("path")]);
  }
}

