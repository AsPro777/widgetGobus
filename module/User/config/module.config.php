<?php

namespace User;

use Zend\Router\Http\Literal;
use Zend\Router\Http\Segment;
use Doctrine\ORM\Mapping\Driver\AnnotationDriver;
use Zend\ServiceManager\Factory\InvokableFactory;

return [
    'router' => [
        'routes' => [
            'login' => [
                'type' => Literal::class,
                'options' => [
                    'route' => '/login',
                    'defaults' => [
                        'controller' => Controller\AuthController::class,
                        'action' => 'login',
                    ],
                ],
            ],
            'logout' => [
                'type' => Literal::class,
                'options' => [
                    'route' => '/logout',
                    'defaults' => [
                        'controller' => Controller\AuthController::class,
                        'action' => 'logout',
                    ],
                ],
            ],
            'register' => [
                'type' => Literal::class,
                'options' => [
                    'route'    => '/register',
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action'     => 'register',
                    ],
                ],
            ],
            'reset-password' => [
                'type' => Literal::class,
                'options' => [
                    'route' => '/reset-password',
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action' => 'resetPassword',
                    ],
                ],
            ],
            'set-password' => [
                'type' => Literal::class,
                'options' => [
                    'route' => '/set-password',
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action' => 'setPassword',
                    ],
                ],
            ],
            'register-confirm' => [
                'type' => Literal::class,
                'options' => [
                    'route' => '/register-confirm',
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action' => 'registerConfirm',
                    ],
                ],
            ],
            'users' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/users[/:action[/:id[/:reason]]]',
                    'constraints' => [
                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                        'id' => '[a-zA-Z0-9_-]*',
                        'reason' => '[a-zA-Z0-9_-]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action' => 'index',
                    ],
                ],
            ],
            'img' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/img[/:tag[/:table[/:id]]]',
                    'constraints' => [
                        'tag' => '[a-zA-Z][a-zA-Z0-9_-]*',
                        'table' => '[a-zA-Z0-9_-]*',
                        'id' => '[0-9]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action' => 'img',
                    ],
                ],
            ],
            'document' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/document/:id/:crc',
                    'constraints' => [
                        'id' => '[0-9]*',
                        'crc' => '[0-9]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action' => 'document',
                    ],
                ],
            ],
            'bus-photo' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/bus-photo/:id',
                    'constraints' => [
                        'id' => '[0-9]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\UserController::class,
                        'action' => 'busPhoto',
                    ],
                ],
            ],
            'ticket' => [
                'type' => Segment::class,
                'options' => [
                    'route'    => '/ticket[/:action[/:id]]',
                    'constraints' => [
                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                        'id' => '[a-zA-Z0-9:_-]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\PubTicketController::class,
                        'action'     => 'index',
                    ],
                ],
            ],
            'fraht' => [
                'type' => Segment::class,
                'options' => [
                    'route'    => '/fraht[/:action[/:id]]',
                    'constraints' => [
                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                        'id' => '\d{1,11}-[a-zA-Z0-9]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\PubZakazController::class,
                        'action'     => 'invite',
                    ],
                ],
            ],
            'ajax' => [
                'type' => Segment::class,
                'options' => [
                    'route'    => '/ajax[/:action[/:id]]',
                    'constraints' => [
                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                        'id' => '[a-zA-Z0-9_-]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\AjaxController::class,
                        'action'     => 'index',
                    ],
                ],
            ],
            'schedule-costs' => [
                'type' => Segment::class,
                'options' => [
                    'route' => '/account[/:action[/:id[/:time[/:day]]]]',
                    'constraints' => [
                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                        'id' => '[0-9]*',
                        'time' => '[0-9]*:[0-9]*',
                        'day' => '[0-9]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\AccountController::class,
                        'action' => 'scheduleCosts',
                    ],
                ],
            ],
            'account' => [
                'type' => Segment::class,
                'options' => [
                    'route'    => '/account[/:action[/:id[/:node]]]',
                    'constraints' => [
                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                        'id' => '[a-zA-Z0-9_-]*',
                        //'node' => '[а-яА-Яa-zA-Z0-9_-]*',
                    ],
                    'defaults' => [
                        'controller' => Controller\AccountController::class,
                        'action'     => 'index',
                    ],
                ],
            ],

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
            Controller\AuthController::class      => Controller\Factory\AuthControllerFactory::class,
            Controller\UserController::class      => Controller\Factory\UserControllerFactory::class,
            Controller\PubTicketController::class => Controller\Factory\PubTicketControllerFactory::class,
            Controller\PubZakazController::class  => Controller\Factory\PubZakazControllerFactory::class,
            Controller\AccountController::class   => Controller\Factory\AccountControllerFactory::class,
            Controller\AjaxController::class      => Controller\Factory\AjaxControllerFactory::class,
            Controller\WidgetController::class    => Controller\Factory\WidgetControllerFactory::class,
            Controller\WidgetTicketPayController::class => Controller\Factory\WidgetTicketPayControllerFactory::class,
        ],
    ],
    // The 'access_filter' key is used by the User module to restrict or permit
    // access to certain controller actions for unauthorized visitors.
    'access_filter' => [
        'controllers' => [
            Controller\PubTicketController::class => [
                ['actions' => '*', 'allow' => '*'],
                // Allow authorized users to visit action
                ['actions' => '*', 'allow' => '1'],
                ['actions' => '*', 'allow' => '2'],
                ['actions' => '*', 'allow' => '3'],
                ['actions' => '*', 'allow' => '4'],
                ['actions' => '*', 'allow' => '5'],
                ['actions' => '*', 'allow' => '6'],
                ['actions' => '*', 'allow' => '7'],
                ['actions' => '*', 'allow' => '8'],
                ['actions' => '*', 'allow' => '9'],
                ['actions' => '*', 'allow' => '10'],
                ['actions' => '*', 'allow' => '11'],
                ['actions' => '*', 'allow' => '12'],
                ['actions' => '*', 'allow' => '13'],
                ['actions' => '*', 'allow' => '14'],
                ['actions' => '*', 'allow' => '15'],
            ],
            Controller\PubZakazController::class => [
                ['actions' => '*', 'allow' => '*'],
                // Allow authorized users to visit action
                ['actions' => '*', 'allow' => '1'],
                ['actions' => '*', 'allow' => '2'],
                ['actions' => '*', 'allow' => '3'],
                ['actions' => '*', 'allow' => '4'],
                ['actions' => '*', 'allow' => '5'],
                ['actions' => '*', 'allow' => '6'],
                ['actions' => '*', 'allow' => '7'],
                ['actions' => '*', 'allow' => '8'],
                ['actions' => '*', 'allow' => '9'],
                ['actions' => '*', 'allow' => '10'],
                ['actions' => '*', 'allow' => '11'],
                ['actions' => '*', 'allow' => '12'],
                ['actions' => '*', 'allow' => '13'],
                ['actions' => '*', 'allow' => '14'],
                ['actions' => '*', 'allow' => '15'],
            ],
            Controller\UserController::class => [
                ['actions' => ['login', 'register', 'registerConfirm', 'resetPassword', 'setPassword', 'message', 'img', 'document', 'busPhoto', 'gotoUser'], 'allow' => '*'],
                ['actions' => ['changeUser'], 'allow' => '1'],
                ['actions' => [], 'allow' => '2'],
                ['actions' => ['changeUser'], 'allow' => '3'],
                ['actions' => [], 'allow' => '4'],
                ['actions' => ['changeUser'], 'allow' => '5'],
                ['actions' => [], 'allow' => '6'],
                ['actions' => [], 'allow' => '7'],
                ['actions' => ['changeUser'], 'allow' => '8'],
                ['actions' => [], 'allow' => '9'],
                ['actions' => [], 'allow' => '10'],
                ['actions' => ['changeUser'], 'allow' => '11'],
                ['actions' => ['changeUser'], 'allow' => '12'],
                ['actions' => ['changeUser'], 'allow' => '13'],
                ['actions' => [], 'allow' => '14'],
                ['actions' => [], 'allow' => '15'],
            ],
            Controller\AjaxController::class => [
                // Allow anyone to visit all actions
                ['actions' => ['mainPageCitysList', 'mainPageSearch', 'mainPageMinPrices', 'mainPageSearchById', 'mainPageSearchProviderAnother', 'mainPageSearchNearestTime', 'mainPageReisDetail', 'mainPageReisDetailProviderAnother','getCountry', 'getDocType', 'isHasAccount', 'partner', 'orgList', 'frahtBusByCity', 'frahtBusRequest'], 'allow' => '*'],
                // Allow authorized users to visit action
                ['actions' => '*', 'allow' => '1'],
                ['actions' => '*', 'allow' => '2'],
                ['actions' => '*', 'allow' => '3'],
                ['actions' => '*', 'allow' => '4'],
                ['actions' => '*', 'allow' => '5'],
                ['actions' => '*', 'allow' => '6'],
                ['actions' => '*', 'allow' => '7'],
                ['actions' => '*', 'allow' => '8'],
                ['actions' => '*', 'allow' => '9'],
                ['actions' => '*', 'allow' => '10'],
                ['actions' => '*', 'allow' => '11'],
                ['actions' => '*', 'allow' => '12'],
                ['actions' => '*', 'allow' => '13'],
                ['actions' => '*', 'allow' => '14'],
                ['actions' => '*', 'allow' => '15'],
            ],
            Controller\AccountController::class => [
                // Allow anyone to visit all actions
                ['actions' => [], 'allow' => '*'],
                // Allow authorized users to visit action
                ['actions' => '*', 'allow' => '1'],
                ['actions' => '*', 'allow' => '2'],
                ['actions' => '*', 'allow' => '3'],
                ['actions' => '*', 'allow' => '4'],
                ['actions' => '*', 'allow' => '5'],
                ['actions' => '*', 'allow' => '6'],
                ['actions' => '*', 'allow' => '7'],
                ['actions' => '*', 'allow' => '8'],
                ['actions' => '*', 'allow' => '9'],
                ['actions' => '*', 'allow' => '10'],
                ['actions' => '*', 'allow' => '11'],
                ['actions' => '*', 'allow' => '12'],
                ['actions' => '*', 'allow' => '13'],
                ['actions' => '*', 'allow' => '14'],
                ['actions' => '*', 'allow' => '15'],
            ],
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
            \Zend\Authentication\AuthenticationService::class => Service\Factory\AuthenticationServiceFactory::class,
            Service\AuthAdapter::class  => Service\Factory\AuthAdapterFactory::class,
            Service\AuthManager::class  => Service\Factory\AuthManagerFactory::class,
            Service\UserManager::class  => Service\Factory\UserManagerFactory::class,
            Service\ZakazManager::class => Service\Factory\ZakazManagerFactory::class,
            Service\ResponsesManager::class => Service\Factory\ResponsesManagerFactory::class,
            Service\TicketManager::class => Service\Factory\TicketManagerFactory::class,
            Service\CharterPaxManager::class => Service\Factory\CharterPaxManagerFactory::class
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
                'paths' => [__DIR__ . '/../src/Entity']
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
            View\Helper\Bus::class => InvokableFactory::class,
            View\Helper\Passengers::class => InvokableFactory::class
        ],
        'aliases' => [
            'bus' => View\Helper\Bus::class,
            'passengers' => View\Helper\Passengers::class
        ]
    ],

    'view_manager' => [
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'not_found_template'       => 'error/404',
        'exception_template'       => 'error/index',
        'template_map' => [
            'error/404'               => __DIR__ . '/../view/error/404.phtml',
            'error/index'             => __DIR__ . '/../view/error/index.phtml',
        ],
        'strategies' => [
            'ViewJsonStrategy',
        ],
        'template_path_stack' => [
            __DIR__ . '/../view',
        ],
    ],

];

