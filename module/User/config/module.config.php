<?php

namespace User;

use Zend\Router\Http\Literal;
use Zend\Router\Http\Segment;
use Doctrine\ORM\Mapping\Driver\AnnotationDriver;
use Zend\ServiceManager\Factory\InvokableFactory;

return [
    'router' => [
        'routes' => [
           
          
            'widgetTicketPay' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/widget/:path/ticket/pay[/[:id/:from/:to]]',
                    'constraints' => [ 'id' => '[0-9]*',
                                       'from'=>'[a-zA-Z][a-zA-Z0-9_-]*',
                                       'to'=>'[a-zA-Z][a-zA-Z0-9_-]*',
                                       'path'=>'[0-9]*'],
                    'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                    'defaults' => [
                        'controller' => Controller\WidgetTicketPayController::class,
                        'action' => 'widgetTicketPay',
                    ],
                ],
            ],

            'widget-sbrf' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/widget/sberpay/:action',
                    'constraints' => [ 'id' => '[0-9]*',
                                       'action' => '[a-zA-Z][a-zA-Z0-9_-]*'],
                    'defaults' => [
                        'controller' => Controller\WidgetController::class,
                        'action' => 'widget',
                    ],
                ],
            ],


            'widget' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/widget[/[:id[/[:cmd]]]]',
                    'constraints' => [ 'id' => '[0-9]*',
                                       'action' => '[a-zA-Z][a-zA-Z0-9_-]*'],
                    'defaults' => [
                        'controller' => Controller\WidgetController::class,
                        'action' => 'widget',
                    ],
                ],
            ],

            'widget-token' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/widget/:action/:id',
                    'constraints' => [ 'id' => '[0-9-]*',
                                       'action' => '[a-zA-Z][a-zA-Z0-9_-]*'],
                    'defaults' => [
                        'controller' => Controller\WidgetController::class,
                        'action' => 'widget',
                    ],
                ],
            ],

            'widget-ticket-return' => [
                'type' => Segment::class,
                'options' => [
                    'route'    => '/widget-ticket-return/:id/:protokol/:host',
                    'constraints' => [ 'id' => '[0-9-]*',
                                       'protokol' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                       'host'=>'[a-zA-Z][a-zA-Z0-9_.-]*' ],
                    'defaults' => [
                        'controller' => Controller\WidgetController::class,
                        'action'     => 'widgetTicketReturn',
                    ],
                ],
            ],
        ],
    ],
    'controllers' => [
        'factories' => [
            
            Controller\WidgetController::class    => Controller\Factory\WidgetControllerFactory::class,
            Controller\WidgetTicketPayController::class => Controller\Factory\WidgetTicketPayControllerFactory::class,
        ],
    ],
    // The 'access_filter' key is used by the User module to restrict or permit
    // access to certain controller actions for unauthorized visitors.
    'access_filter' => [
        'controllers' => [
           
           
            Controller\WidgetController::class => [
                ['actions' => '*', 'allow' => '*'],
            ],
            Controller\WidgetTicketPayController::class =>[
                ['actions' => '*', 'allow' => '*'],
            ],
        ],
    ],
    'service_manager' => [
        'factories' => [
           
            Service\ResponsesManager::class => Service\Factory\ResponsesManagerFactory::class,
           
        ],
    ],
//    'view_manager' => [
//        'template_path_stack' => [
//            __DIR__ . '/../view',
//        ],
//    ],
    'doctrine' => [
        'driver' => [
            __NAMESPACE__ . '_driver' => [
                'class' => AnnotationDriver::class,
                'cache' => 'array',
                'paths' => [__DIR__ . '/../src/**']
            ],
            'orm_default' => array(
                'drivers' => [
                    __NAMESPACE__ . '\Entity' => __NAMESPACE__ . '_driver'
                ]
            )
        ],
    ],

    'view_helpers' => [
        'factories' => [
           
        ],
        'aliases' => [
            
        ]
    ],

    'view_manager' => [
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'not_found_template'       => 'error/404',
        'exception_template'       => 'error/index',
        'template_map' => [
           
        ],
        'strategies' => [
            'ViewJsonStrategy',
        ],
        'template_path_stack' => [
            __DIR__ . '/../view',
        ],
    ],

];

