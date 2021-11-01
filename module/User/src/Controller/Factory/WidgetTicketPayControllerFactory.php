<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
namespace User\Controller\Factory;//это прописываем всегда

use Interop\Container\ContainerInterface;//это тоже стандартно
use Zend\ServiceManager\Factory\FactoryInterface;//и это тоже стандартно
use User\Service\UserManager;//ниже в $container->get в качестве параметра будем использовать класс из этого пространства имен
//Поэтому его и подключаем.
use Application\Service\ImageManager;//это по тому же принципу что и в предыд строке подключаем

class WidgetTicketPayControllerFactory implements FactoryInterface//это стандартно
{    
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)//это тоже стандартно
    {
        //тут будем создавать столько переменных сколько нужно конструктору класса, который будет создавать эта фабрика.
        $entityManager = $container->get('doctrine.entitymanager.orm_default');
        $userManager = $container->get(UserManager::class);//вообще создаем переменные стандартно с использованием $container->get(имя_класса_из_окружения_подключенного_выше)
       /* $authManager = $container->get(AuthManager::class);   */
        // Instantiate the controller and inject dependencies
        //возвращаем объект класса для которого создавали фабрику, передав в его конструктор выше созданные переменные
        return new \User\Controller\WidgetTicketPayController($entityManager,$userManager/*,$authManager*/);
    }
}