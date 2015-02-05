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
                if(simconfigs.clientSuperAdmin){
                    $scope.clientSuperAdmin = true;
                }
            })
        };
        $scope.modalChangeAdmin = function(){
            var showAdmin = $modal.open({
                templateUrl: 'changeAdminList.html',
                controller: 'SystemAdminModalController',
                scope: $scope
            });
            showAdmin.result.then(function(result){
                console.log(result);
                $http({
                    method: 'POST'
                })
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
    .controller('SystemAdminModalController',['$scope', '$http', '$modal','$timeout','$modalInstance','$q','notify',
        function($scope, $http, $modal, $timeout, $modalInstance, $q, notify){


            // 保存管理员临时用
            $scope.newSelectedTags = [];

            // 当删除时增加管理员列表
            $scope.removeAdminTag = function(tag){
                $scope.adminList.push(tag);
                // 第一次缓存到操作的数组
                angular.forEach($scope.clientSuperList,function(v,i){
                    if(v.id == tag.id){
                        tag.changed = 2;
                        $scope.newSelectedTags.push(tag);                        
                    }
                    
                });
                // 过滤去重
                angular.forEach($scope.newSelectedTags,function(v,i){
                    if(v.id == tag.id && tag.changed == 1){
                        $scope.newSelectedTags.splice(i,1);
                    }
                })
            }; 

            $scope.addAdminTag = function(tag){
                tag.changed = 1;
                $scope.newSelectedTags.push(tag);
            }       
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
                    'size' : $scope.maxSize || 8,
                    'active': true
                };
                // 删除已有管理员           
                var url = '/japi/smanage/client/list?' + $.param(param);
                if(!$scope.selectedTags){
                    $scope.selectedTags = angular.copy($scope.clientSuperList);    
                }
                $http.get(url).success(function(data){              
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, 8); 
                    if($scope.selectedTags  !==  data.items){
                            angular.forEach(data.items,function(v,i){
                                ($scope.selectedTags) && 
                                    angular.forEach($scope.selectedTags,function(v2,i2){
                                        if(v.id == v2.id){
                                            data.items.splice(i,1);
                                            console.log(i,$scope.selectedTags,data.items);
                                        }
                                    }) 
                            })
                            $scope.adminList = data.items;                           
                    }                
                });
            };
            $scope.systemAdmin = {
                // 取交集方法
                intersect: function(a,b){
                  var result = new Array();
                  while( a.length > 0 && b.length > 0 )
                  {  
                     if      (a[0] < b[0] ){ a.shift(); }
                     else if (a[0] > b[0] ){ b.shift(); }
                     else /* they're equal */
                     {
                       result.push(a.shift());
                       b.shift();
                     }
                  }

                  return result;
                },
                assembly: function(){
                    var self = this,
                        selectedTags = [],
                        clientSuperList = [];
                    console.log($scope.newSelectedTags);
                    // return;
                    angular.forEach($scope.newSelectedTags,function(v,i){
                        (v.changed == 1) ? self.postSystemAdmin(v.id,true) : self.postSystemAdmin(v.id,false);
                    })
                   
                    notify({
                        message: '操作成功',
                        classes: 'alert-success'
                    });
                    $scope.cancelModal();
                    $scope.getclientSuper();
                },
                postSystemAdmin:function(id,bool){
                    $http({
                        method: 'POST',
                        url: '/japi/smanage/site/systemadmin',
                        data: $.param({
                            userIds: id,
                            systemAdmin: bool
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data){
                    })
                }
            };
            $scope.changeAdminList = function(item,index){      
                var bool,
                    changed;
                angular.forEach($scope.selectedTags,function(v,k){
                    if(v.id == item.id){
                        bool = true;
                    }
                });
                if(!bool){
                    $scope.adminList.splice(index,1);
                    $scope.selectedTags.push(item);
                    angular.forEach($scope.clientSuperList,function(v,i){
                        if(v.id == item.id){
                            changed = true;
                        }
                    })
                    if(!changed){
                        item.changed = 1;
                        $scope.newSelectedTags.push(item);
                    }
                    

                }
                console.info($scope.newSelectedTags);
            };
            // 管理员列表更新
            $scope.loadAdminList = function(query) {
                var deferred = $q.defer();
                $http.get('/japi/admininfo/clientlist?keyword=' + query).success(function(data){
                    deferred.resolve(data.items);
                });
                return deferred.promise;
            };
            // 关闭modal
            $scope.cancelModal = function () {
               $modalInstance.dismiss('cancel');
            }
}])