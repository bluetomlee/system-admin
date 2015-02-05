'use strict';

var sysmine_modal = angular.module('systemApp.mine', ['ui.bootstrap', 'cgPrompt', 'cgNotify','toggle-switch'])
.controller('SystemMineController', ['$scope', '$http', '$routeParams', '$rootScope', '$timeout','$modal',  'prompt', 'notify',
     function($scope, $http, $routeParams, $rootScope, $timeout, $modal, prompt, notify){

     	$scope.init = function(){
     		$scope.getProfile().then(function(rep){
                var id = rep.data.userId;
                $scope.userId = id;
                $scope.getPower(id);
            });
     	};


        $scope.getProfile = function(){
            return $http.get('/japi/smanage/admin/list').success(function(data){
                $scope.adminPro = data;
            })
        };
        $scope.getPower = function(id){
            $scope.objPage = {
                userId: id,
                page: $scope.currentPage || 1,
                size: $scope.maxSize || 10
            };
            $http.get('/japi/smanage/user/power?' + $.param($scope.objPage)).success(function(data){
                var tmp = [],
                    bool = (!angular.isArray(data.items));
                bool && (tmp.push(data.items))
                $scope.adminPowers =  bool ? tmp : data.items;
                $scope.setPagination(data.pageBean.count, data.pageBean.current, 10);
            })
        };
        // 分页
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
            $scope.getPower($scope.userId);
        };
        $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
            console.log($scope.currentPage, $scope.maxSize = size);
        };
        $scope.changeUser = {
            saveEditPro : function(){
                $http({
                    method: 'POST',
                    url:'/japi/smanage/update/admininfo',
                    data: $.param({
                        name: $scope.adminEditPro.name,
                        weixin: $scope.adminEditPro.weixin
                    }),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    $scope.remindInfor(data);
                    $scope.isEditProfile = false;
                    $scope.init();
                })
            },
            editPro : function(){
                $scope.adminEditPro = angular.copy($scope.adminPro);
                $scope.isEditProfile = true;
            },
            editContact: function(){
                var showEditContact = $modal.open({
                    templateUrl: 'editContact.html',
                    scope: $scope,
                    controller: 'SystemMineModalController'
                })
            },
            modalChangePassword: function(){
                var showRepassword = $modal.open({
                    templateUrl: 'changePassword.html',
                    scope: $scope,
                    controller: 'SystemMineModalController'
                });
            },
            modalChangeAccount: function(){
                var showChangeAccount = $modal.open({
                    templateUrl: 'ChangeAccount',
                    scope: $scope,
                    controller: 'SystemMineModalController'
                })
            },
            repassword: function(){
                $http({
                    method: 'POST',
                    url: '/japi/smanage/send/repassword',
                    data: $.param({
                        userId: $scope.userId
                    }),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    $scope.remindInfor(data);
                })
            }
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
sysmine_modal.controller('SystemMineModalController',['$scope', '$http', '$modal','$timeout','$modalInstance','notify',
        function($scope, $http, $modal, $timeout, $modalInstance, notify){

            $scope.adminEditProfile = {
                init: function(){
                    $scope.adminEditPro = angular.copy($scope.adminPro);
                },
                next: function(){
                    $http({
                        method: 'POST',
                        url: '/japi/smanage/check/password',
                        data: $.param({
                            password: $scope.adminEditPro.password
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data){
                        if(data.success){
                            $scope.isShowEditPro2 = true;
                        }else{
                            $scope.remindInfor(data);
                        };
                    })
                    
                },
                saveEditContact : function(){
                    console.log($scope.adminEditPro);
                    $http({
                        method: 'POST',
                        url:'/japi/smanage/update/accountinfo',
                        data: $.param({
                            telephone: $scope.adminEditPro.telephone,
                            email: $scope.adminEditPro.email
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data){
                        $scope.remindInfor(data);
                        $scope.cancelModal();
                        $scope.init();
                    })
                }
            }
            $scope.changePassword = {
                chkPassword: function(){
                    console.log($scope.repassword);
                    return $http({
                        method: 'POST',
                        url: '/japi/smanage/check/password',
                        data: $.param({
                            password: $scope.repassword.old
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    })
                },
                postPassword: function(){
                    var self = this;
                    console.log(self);
                    self.chkPassword().then(function(rep){
                        console.log(rep);
                        if(rep.data.success){
                            $http({
                                method: 'POST',
                                url: '/japi/password',
                                data: $.param({
                                    password: $scope.repassword.old,
                                    repasswd1: $scope.repassword.new1,
                                    repasswd2: $scope.repassword.new2
                                }),
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function(data){
                                if(data.success){
                                    $scope.cancelModal();
                                }
                                $scope.remindInfor(data);
                            }) 
                        }else{
                            $scope.isShowErrorPassword = true;
                        }
                    })

                }
            };

            // 关闭modal
            $scope.cancelModal = function () {
               $modalInstance.dismiss('cancel');
            }
        }
]);