'use strict';

// Declare app level module which depends on views, and components
var minisiteApp_module = angular.module('minisiteApp', [
    'ngRoute',
    'ngSanitize',
    'minisiteApp.global',
    'minisiteApp.list',
    'minisiteApp.admin'
])
.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/apps', {
                templateUrl: '/static/v1/vs/app/view_minisite/minisite_list.html',
                controller: 'MiNiSiteListController'
            })
            .when('/admin/:appId',{
                templateUrl: '/static/v1/vs/app/view_admin/admin.html',
                controller: 'MiNiAdminController'
            })
            .when('/nopermission',{
                templateUrl: '/static/v1/vs/app/view_nopermission/nopermission.html'
            })
            .otherwise({
                redirectTo: '/apps'
            });

    }
    ]);

// 全局模块
angular.module('minisiteApp.global',['ngRoute','cgPrompt'])
        .controller('MiNiSiteController', ['$scope', '$http', '$routeParams', '$timeout', '$modal', '$log', '$location',
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
                        console.log($scope.teamSuperAdmin);
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
                            (name == 'admin') && self.locateNopermission();                               
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
