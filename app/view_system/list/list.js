'use strict';

var syslist_modal = angular.module('systemApp.list', ['ui.bootstrap', 'cgPrompt', 'cgNotify','toggle-switch'])
.controller('SystemListController', ['$scope', '$http', '$routeParams', '$rootScope', '$timeout','$modal',  'prompt', 'notify',
        function($scope, $http, $routeParams, $rootScope, $timeout, $modal, prompt, notify) {
        
        $scope.cusRouteParams.appId = $routeParams.appId;

        // 初始化
        $scope.init = function(){
            $scope.appId = $routeParams.appId;
            $scope.sysListClass.initAdminList();

        };

        // 分页
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
            $scope.sysListClass.getAdminList();
        };
        $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
            console.log($scope.currentPage, $scope.maxSize = size);
        };

        $scope.sysListClass = {

            initAdminList: function() {
                var self = this;
                self.getAdminList();
            },

            getAdminList: function(search) {
                var url,
                    self = this;
                if(search){
                    $scope.objPage = {
                        page: $scope.currentPage || 1,
                        size: $scope.maxSize || 10,
                        keyword: search
                     }
                }else{
                    $scope.objPage = {
                        page: $scope.currentPage || 1,
                        size: $scope.maxSize || 10
                     }
                };
                url = '/japi/smanage/client/list?' + $.param($scope.objPage);
                $http.get(url).success(function(data){
                    $scope.adminList = data.items;
                    angular.forEach()
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, 10);
                });
            },

            // switch切换
            chkActive: function(user) {
                console.log(user);
                (user.active) ? $scope.modalAll.disableAdmin(user.id) : $scope.modalAll.activeAdmin(user.id);  
            },

            active: function(userId,bool){
                $http({
                    method: 'POST',
                    url: '/japi/smanage/site/active',
                    data: $.param({
                        userId: userId,
                        active: bool 
                    }),
                    headers:{'Content-Type':'x-www-form-urlencoded'}
                }).success(function(data){
                    $scope.remindInfor(data);
                })
            },  
            // 检查搜索
            chkSearch: function(e,content){
                var self = this;
                (e.keyCode == 13) && (self.getAdminList(content));
            },

            // 弹出层--Ta的权限
            hisPromise: function(id) {
                $http.get('/japi/smanage/user/power?userId=' + id).success(function(data){
                    $scope.powerList = data.items;
                    var editAdmin = $modal.open({
                        templateUrl: 'hispromise.html',
                        scope: $scope,
                        controller: 'SystemListModalController' 
                    })                  
                })
            },

            // 弹出层--添加、编辑管理员
            modalEditAdmin: function(user) {
                if(user){
                    $scope.isEditAdmin = true;
                    $scope.newAdmin = angular.copy(user);
                    
                }else{
                    $scope.isEditAdmin = false;
                    $scope.newAdmin = {};
                }
                var editAdmin = $modal.open({
                    templateUrl: 'editAdmin.html',
                    controller: 'SystemListModalController',
                    scope: $scope
                });
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



        // 提示窗弹出层集合
        $scope.modalAll = {

            addAdminActive: function(){
                prompt({
                    title: '添加管理员',
                    message: '<div><i class="fa fa-warning warning"></i>验证消息将发送至邮箱' + $scope.newAdmin.email + 
                    '用户验证后，将激活管理员身份。确定添加该用户为管理员？</div>',
                    "buttons": [
                        {label:'确认',primary:true},
                        {label:'取消',cancel:true}
                    ]
                }).then(function(result){
                    $scope.publishMenu(data.id);
                })
            },

            resetPw: function(admin){
                prompt({
                    title: '重置密码',
                    message: '<div><i class="fa fa-warning warning"></i>管理员将被禁用，确定重置？</br>系统将发送验证信息至邮箱 ' + admin.email + 
                    '当用户完成密码重置，将再次激活管理员身份。</div>',
                    "buttons": [
                        {label:'确认',primary:true},
                        {label:'取消',cancel:true}
                    ]
                }).then(function(result){
                    $http({
                        method: 'POST',
                        url: '/japi/smanage/send/repassword',
                        data: $.param({
                            'userId': admin.id
                        }),
                       headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data){
                        $scope.remindInfor(data);
                    })
                })
            },

            updateAdmin: function(){
                prompt({
                    title: '修改管理员信息',
                    message: '<div><i class="fa fa-warning warning"></i>密码重置，管理员将被禁用，确定重置？</br>系统将发送验证信息至邮箱 ' + $scope.newAdmin.email + 
                    '当用户完成密码重置，将再次激活管理员身份。</div>',
                    "buttons": [
                        {label:'确认',primary:true},
                        {label:'取消',cancel:true}
                    ]
                }).then(function(result){
                    $scope.publishMenu(data.id);
                })
            },
            activeAdmin: function(userId){
                console.log(userId);
                prompt({
                    title: '提示',
                    message: '<div><i class="fa fa-warning warning"></i>激活后，该管理员将被允许登陆系统，确定激活？</div>',
                    "buttons": [
                        {label:'确认',primary:true},
                        {label:'取消',cancel:true}
                    ]
                }).then(function(result){
                    $scope.sysListClass.active(userId,true);
                })
            },

            disableAdmin: function(userId){
                prompt({
                    title: '提示',
                    message: '<div><i class="fa fa-warning warning"></i>禁用后，该管理员将无法登陆系统，确定禁用？</div>',
                    "buttons": [
                        {label:'确认',primary:true},
                        {label:'取消',cancel:true}
                    ]
                }).then(function(result){
                    $scope.sysListClass.active(userId,false);
                })
            },
        };

}]);

syslist_modal.controller('SystemListModalController',['$scope', '$http', '$modal','$timeout','$modalInstance','notify',
		function($scope, $http, $modal, $timeout, $modalInstance, notify){

            $scope.createAdmin = function(){
                $http({
                    method: 'POST',
                    url: '/japi/smanage/add/admin',
                    data: $.param({
                        name: $scope.newAdmin.nickName,
                        telephone: $scope.newAdmin.cellphone,
                        email: $scope.newAdmin.email,
                        weixin: $scope.newAdmin.weixin
                    }),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    $scope.remindInfor(data);
                    $scope.cancelModal();
                })
            };

            $scope.updateAdmin = function(){
                $scope.modalAll.resetPw($scope.newAdmin);
                $http({
                    method: 'POST',
                    url: '/japi/smanage/update/admin',
                    data: $.param({
                        userId: $scope.newAdmin.id,
                        name: $scope.newAdmin.nickName,
                        telephone: $scope.newAdmin.cellphone,
                        email: $scope.newAdmin.email,
                        weixin: $scope.newAdmin.weixin
                    }),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    $scope.remindInfor(data);
                    $scope.cancelModal();
                })
            };

            // 关闭modal
            $scope.cancelModal = function () {
               $modalInstance.dismiss('cancel');
            }

	}
]);