'use strict';

// Declare app level module which depends on views, and components
var systemApp_module = angular.module('systemApp', [
    'ngRoute',
    'ngSanitize',
    'systemApp.global',
    'systemApp.list',
    'systemApp.token',
    'systemApp.mine',
    'systemApp.back',
    'minisiteApp.list',
    'minisiteApp.admin'
])
.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/vs', {
                templateUrl: '/static/v1/system/app/view_minisite/minisite_list.html',
                controller: 'MiNiSiteListController'
            })
            .when('/admin/:appId',{
                templateUrl: '/static/v1/system/app/view_admin/admin.html',
                controller: 'MiNiAdminController'
            })
            .when('/setting/list',{
                templateUrl: '/static/v1/system/app/view_system/list/list.html',
                controller: 'SystemListController'
            })
            .when('/setting/token',{
                templateUrl: '/static/v1/system/app/view_system/token/token.html',
                controller: 'SystemTokenController'
            })
            .when('/setting/mail',{
                templateUrl: '/static/v1/system/app/view_system/mail/system_list.html',
                controller: 'SystemMailController'
            })
            .when('/setting/mine',{
                templateUrl: '/static/v1/system/app/view_system/mine/mine.html',
                controller: 'SystemMineController'
            })
            .when('/setting/back',{
                templateUrl: '/static/v1/system/app/view_system/back/back.html',
                controller: 'SystemAdminController'
            })
            .when('/nopermission',{
                templateUrl: '/static/v1/system/app/view_nopermission/nopermission.html',
            })
            .otherwise({
                redirectTo: '/nopermission'
            });

    }
    ]);

// 全局模块
angular.module('systemApp.global',['ngRoute','cgPrompt'])
        .controller('SystemController', ['$scope', '$http', '$routeParams', '$timeout', '$modal', '$log', '$location',
            function($scope, $http, $routeParams, $timeout, $modal, $log, $location){

                $scope.init = function(){
                    $scope.cusRouteParams.requestSimconfis().then(function(rep){
                        var data = angular.fromJson(rep.data.substring(15));
                        if(data.clientSuperAdmin) {
                            $scope.clientSuperAdmin = true;
                        } else if(data.teamSuperAdmin){
                            $scope.teamSuperAdmin = true;
                        }else if(data.applicationSuperAdmin){
                            $scope.applicationSuperAdmin = true;
                        }
                        console.log($scope.clientSuperAdmin,$scope.teamSuperAdmin);
                    })
                };

                // 共用模块
                $scope.cusRouteParams = {
                    "appName": $location.path(),
                    "appId": "",
                    "requestSimconfis": function(){
                        $http.get('/japi/team/select?id=136');
                        var url = '/japi/js/configs';
                        return $http.get(url);
                    },
                    "setApplicationPromise": function() {
                        var self = this;
                        var name = $location.path().substring(1,6);
                        var promise = self.requestSimconfis();
                        if(!$scope.clientSuperAdmin && !$scope.teamSuperAdmin && !$scope.applicationSuperAdmin){
                            var name = $location.path().substring(1,6);
                            // (name == 'admin') && self.locateNopermission();                               
                        }
                        console.log($scope.clientSuperAdmin, $scope.teamSuperAdmin, $scope.applicationSuperAdmin);
                        
                    },
                    "locateNopermission" : function() {
                        $location.path("/nopermission");
                    }

                };

                // 监视页面变化
                $scope.$watch('cusRouteParams.appId',function(newValue,oldValue){
                        
                        if(!newValue && oldValue) {
                            console.info('admin改变', newValue, oldValue);
                            $scope.refreshCount += 1;
                            $scope.cusRouteParams.setApplicationPromise();
                        }
                    }, true);  
                
            }
        ]);
