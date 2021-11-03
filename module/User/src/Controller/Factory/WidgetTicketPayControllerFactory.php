<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
namespace User\Controller\Factory;

use Interop\Container\ContainerInterface;
use Zend\ServiceManager\Factory\FactoryInterface;
use User\Service\UserManager;
use Application\Service\ImageManager;

class WidgetTicketPayControllerFactory implements FactoryInterface
{    
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        
        $entityManager = $container->get('doctrine.entitymanager.orm_default');
        $userManager = $container->get(UserManager::class);
       
        return new \User\Controller\WidgetTicketPayController($entityManager,$userManager/*,$authManager*/);
    }
}
