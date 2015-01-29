'use strict';

var systoken_modal = angular.module('systemApp.token', ['ui.bootstrap', 'cgPrompt', 'cgNotify','toggle-switch'])
.controller('SystemTokenController', ['$scope', '$http', '$routeParams', '$rootScope', '$timeout','$modal',  'prompt', 'notify',
     function($scope, $http, $routeParams, $rootScope, $timeout, $modal, prompt, notify){

     	$scope.init = function(){
            $scope.token = $routeParams.token;
     		$scope.chkToken();
     	};

     	$scope.chkToken = function(){
     		$http({
     			url: '/japi/smanage/check/token',
     			method: 'POST',
     			data: $.param({
     				token: $scope.token,
     				status: 1
     			}),
     			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
     		}).success(function(data){
     			if(data.success) {
     				$scope.newToken = {
                        userId: data.userId,
                        token: data.token
                    };
                    console.log($scope.newToken);
     			};
     		})
     	};

        $scope.saveNewPw = function(){
        	$http({
        		method: 'POST',
        		url: '/japi/smanage/add/password',
        		data: $.param({
     				userId: userId,
     				password1: $scope.newPw,
     				password2: $scope.newPw2,
     				token: token,
     				status: 2
        		}),
        		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        	}).success(function(data){
        		$scope.remindInfor(data);
        	})
        };

        //复用提醒框
        $scope.remindInfor = function(data){
            notify.closeAll();
            if(data.success){
                notify({
                    message: '操作成功',
                    classes: 'alert-success'
                })
            }else{
                notify({
                    message: data.message,
                    classes: 'alert-error'
                })
            }

        };
     }
]);