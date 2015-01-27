'use strict';

var sysback_modal = angular.module('systemApp.back', ['ui.bootstrap', 'cgPrompt', 'cgNotify','toggle-switch'])
.controller('SystemAdminController', ['$scope', '$http', '$routeParams', '$rootScope', '$timeout','$modal',  'prompt', 'notify',
     function($scope, $http, $routeParams, $rootScope, $timeout, $modal, prompt, notify){

     	$scope.init = function(){
     		$scope.getclientSuper();
     	};


        $scope.getclientSuper = function(){
            $http.get('/japi/smanage/clientsuper/list').success(function(data){
                $scope.clientSuperList = data.item;
            })
        };

        $scope.modalChangeAdmin = function(){
            var showAdmin = $modal.open({
                templateUrl: 'changeAdminList.html',
                controller: 'SystemAdminModalController',
                scope: $scope
            });
            showAdmin.result.then(function(result){
                // console.log(result);
                 $scope.selectedTags = result;
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
sysback_modal
    .controller('SystemAdminModalController',['$scope', '$http', '$modal','$timeout','$modalInstance','notify',
        function($scope, $http, $modal, $timeout, $modalInstance, notify){

            $scope.saveTags = function(result){
                $modalInstance.close(result);
            };

            // 当删除时增加管理员列表
            $scope.removeAdminTag = function(tag){
                $scope.adminList.push(tag);
                // console.log(tag,$scope.adminList);
            };        
            // 分页
            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function() {
                console.log('Page changed to: ' + $scope.currentPage);
                $scope.showAdminList();
            };

            $scope.setPagination = function(totalItems, currentPage, size) {
                $scope.totalItems = totalItems;
                $scope.currentPage = currentPage;
                $scope.maxSize = size;
            };           
            $scope.showAdminList = function(){
                var param = {
                    applicationId: $scope.appId,
                    'page' : $scope.currentPage || 1,
                    'size' : $scope.maxSize || 8
                };
                // 删除已有管理员           
                var url = '/japi/vs/admininfo/clientlist?' + $.param(param);        
                $http.get(url).success(function(data){              
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, 8); 
                    if($scope.selectedTags  !==  data.items){
                            angular.forEach(data.items,function(v,i){
                                ($scope.selectedTags) && 
                                    angular.forEach($scope.selectedTags,function(v2,i2){
                                        if(v.email == v2.email){
                                            console.log(data.items);
                                            data.items.splice(i,1);
                                            console.log(i,$scope.selectedTags,data.items);
                                        }
                                    }) 
                            })
                            $scope.adminList = data.items;                           
                    }                
                });
             }
            $scope.changeAdminList = function(item,index){
                
                var bool;
                angular.forEach($scope.selectedTags,function(v,k){
                    if(v.id == item.adminId){
                        bool = true;
                    }
                });
                if(!bool){
                    $scope.adminList.splice(index,1);
                    $scope.selectedTags.push(item);
                }
                console.info(item,index,$scope.adminList,$scope.selectedTags);
            };
            // 关闭modal
            $scope.cancelModal = function () {
               $modalInstance.dismiss('cancel');
            }
}])