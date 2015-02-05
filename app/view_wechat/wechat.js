'use strict';

var wechat_module = angular.module('systemApp.wechat', ['ui.bootstrap', 'cgPrompt', 'cgNotify'])
.controller('WeChatController', ['$scope', '$http', '$location', '$routeParams', '$rootScope', '$timeout','$modal','prompt', 'notify',
        function($scope, $http, $location, $routeParams, $rootScope, $timeout,$modal,prompt,notify) {
            
            // 初始化
            $scope.init = function(){
                $scope.getWechatList();
            }

            // 获取minisiteList
            $scope.getWechatList = function(){
                var url;
                $scope.objParm = {
                    type: '1,2,3'
                };
                url = '/japi/team/list?' + $.param($scope.objParm);
                $http.get(url).success(function(data){
                    $scope.teamList = data.items;
                })
            };
            $scope.searchList = function(keywords){
                $scope.objParm.keyword = keywords;
                var url = '/japi/team/list?' + $.param($scope.objParm);
                $http.get(url).success(function(data){
                    $scope.teamList = data.items;
                })
            };
            $scope.locateUrl = function(id){
                window.location.href = 'japi/team/select?id=' + id;
            }         
}]);