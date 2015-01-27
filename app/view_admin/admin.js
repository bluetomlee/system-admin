'use strict';

var admin_modal = angular.module('minisiteApp.admin', ['ui.bootstrap', 'cgPrompt', 'cgNotify','ngTagsInput'])
.controller('MiNiAdminController', ['$scope', '$http', '$routeParams', '$rootScope', '$timeout','$modal', '$q', 'prompt', 'notify',
        function($scope, $http, $routeParams, $rootScope, $timeout, $modal, $q, prompt, notify) {
        
        $scope.cusRouteParams.appId = $routeParams.appId;

        console.log($scope.teamSuperAdmin);

         $timeout(function(){
                $scope.init();
            })


        // 初始化
        $scope.init = function(){
            $scope.appId = $routeParams.appId;
            $scope.refreshMiniAdmin();
            $scope.$watch('permissionsGroup', function(newVal, oldVal) {
                console.info($scope.permissionsGroup)
                var count = 0;
                angular.forEach(newVal, function(value, key) {
                    if(value) {
                        count = count + 1;
                    }
                });

                if(count == 40) {
                    $scope.promiseGroupChecked = true;
                } else {
                    $scope.promiseGroupChecked = false;
                }

            }, true);
        };

        $scope.refreshMiniAdmin = function(){
            var url = '/japi/vs/application/get?applicationId=' + $scope.appId;
            $http.get(url).success(function(data){
                console.log(data);
                data.item = jQuery.makeArray(data.item);
                $scope.miniAdmin = data.item[0];
            });
        };
        var owerFunc = {
            teamadminList: "",
            teamadmin: function() {
                var self = this;
                return $http.get("/japi/teaminfo/teamadmin").success(function(data){
                    if(data.success) {
                        self.teamadminList = data.item;
                    }
                });
            },
            // 序列化数据（[{123:true}, {333:true}] -> "123,333"）
            formatPermiseGroup: function(obj) {
                console.log(obj);
                var tmpArr = [];
                angular.forEach(obj, function(value, key){
                    if(value) {
                        this.push(key);
                    }
                }, tmpArr);

                console.log(tmpArr);
                if(tmpArr.length) {
                    return tmpArr.join(',');
                } else {
                    return '';
                }
            },
            adminAuthorization: function(id, userIds, resourceIds) {
                    return $http({
                        method: 'POST',
                        url: '/japi/admingroup/grant',
                        data: $.param({
                            id: id,
                            userIds: userIds,
                            resourceIds:resourceIds,
                            applicationId: $routeParams.appId
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    });

            },
            // 转换用户列表
            formatAdminList: function(obj) {
                var tmpArr = [],
                    self = this;
                // self.teamadmin();
                angular.forEach(obj, function(value, key) {
                    if(value) {
                        if(value.adminId){
                            this.push(value.adminId);
                        }else{
                            this.push(value.id);
                        }
                        
                    }
                }, tmpArr);

                if(tmpArr.length) {
                    return tmpArr.join(',');
                } else {
                    return false;
                }
            },
            setPermissionsGroup: function(node) {
                $scope.permissionsGroup = {};
                if(node.item) {
                    node.item.resourceIds.forEach(function(value, index){
                        $scope.permissionsGroup[value] = true;
                    });
                }
            },
            setSelectedTags: function(node) {
                $scope.selectedTags = [];
                $scope.isShowAdminRemind = false;
                if(node.item) {
                    $scope.selectedTags = node.item.admins;
                }else if(node.text == '超级管理员'){
                    var url = '/japi/vs/application/get?applicationId=' + $scope.appId;
                    $http.get(url).success(function(data){
                        $scope.selectedTags = data.item.teamAdminBeanSet;
                        $scope.isShowAdminRemind = true;
                    })
                }
            },
            promiseGroupCheck: function(isChecked) {
                // 全选
                $scope.permissionsGroup = {
                    458: isChecked,
                    459: isChecked,
                    460: isChecked,
                    461: isChecked,
                    462: isChecked,
                    463: isChecked,
                    464: isChecked,
                    465: isChecked,
                    466: isChecked,
                    467: isChecked,
                    468: isChecked,
                    469: isChecked,
                    470: isChecked,
                    471: isChecked,
                    472: isChecked,
                    478: isChecked,
                    479: isChecked,
                    480: isChecked,
                    481: isChecked,
                    488: isChecked,
                    489: isChecked,
                    490: isChecked,
                    491: isChecked,
                    492: isChecked,
                    498: isChecked,
                    499: isChecked,
                    500: isChecked,
                    501: isChecked,
                    513: isChecked,
                    514: isChecked,
                    515: isChecked,
                    516: isChecked,
                    517: isChecked,
                    522: isChecked,
                    523: isChecked,
                    524: isChecked,
                    532: isChecked,
                    533: isChecked,
                    534: isChecked,
                    542: isChecked
                }
            }
        }

        var grantData = {
            id: "",
            userIds: "",
            resourceIds: ""
        }

         // 左右管理组更新
        $scope.nodeChangedPromise = function(newNode) {
            grantData.id = parseInt(newNode.subid);
            $scope.newNode = newNode;
            // console.info(grantData)
            console.info(newNode);
            owerFunc.setSelectedTags(newNode);
            owerFunc.setPermissionsGroup(newNode);
            $scope.promiseChk = false;

        }

        // 共用Notify提醒
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
        

        $scope.updateMiniInfor = function(){
            console.log($scope.miniAdmin);
            var url = '/japi/vs/application/update';
            $.ajax({
                method: 'POST',
                url: url,
                data: {
                    id: $scope.miniAdmin.id,
                    homepage: $scope.miniAdmin.homepage,
                    name: $scope.miniAdmin.name,
                    description: $scope.miniAdmin.description
                }
            }).success(function(data){
                (data.success) && ( $scope.isShowSysInput = false)
                $scope.remindInfor(data)
            })
        };

        // 管理员列表更新
        $scope.loadAdminList = function(query) {
            var deferred = $q.defer();
            $http.get('/japi/vs/admininfo/clientlist?keyword=' + query).success(function(data){
                deferred.resolve(data.items);
            });
            return deferred.promise;
        };

        $scope.modalChangeAdmin = function(){
            if($scope.applicationSuperAdmin && $scope.newNode.text == '超级管理员'){
                notify({
                    message: '您没有权限',
                    classes: 'alert-success'                    
                });
                return;
            }
            var showAdmin = $modal.open({
                templateUrl: 'changeAdminList.html',
                controller: 'MiNiAdminModalController',
                scope: $scope
            });
            showAdmin.result.then(function(result){
                // console.log(result);
                 $scope.selectedTags = result;
            })
        };

        $scope.promiseGroupCheck = function(chk){
            owerFunc.promiseGroupCheck(chk);
        }
        //保存权限
        $scope.saveMenu = function() {
            console.info(grantData, $scope.selectedTags)
            grantData.resourceIds = owerFunc.formatPermiseGroup($scope.permissionsGroup);
            grantData.userIds = owerFunc.formatAdminList($scope.selectedTags);
            console.log(grantData.userIds,$scope.selectedTags)
            console.info($scope.teamSuperAdmin,$scope.newNode);
            var superAdmins = owerFunc.formatAdminList($scope.selectedTags),
                teamSuperAjax = function(){
                    return $http({
                        method: 'POST',
                        url: '/japi/vs/application/add/teamadmin',
                        data: $.param({
                            id: $routeParams.appId,
                            superAdmins: superAdmins
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    });
                };
            if($scope.teamSuperAdmin && $scope.newNode.text == '超级管理员'){
                teamSuperAjax().then(function(rep){
                    if(rep.data.success){
                        $http({
                            method: 'POST',
                            url: '/japi/vs/application/edit/superadmin',
                            data: $.param({
                                id: $routeParams.appId,
                                superAdmins: superAdmins
                            }),
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).success(function(data){
                            $scope.remindInfor(data)
                        });                         
                    }
                   
                })

            }else{
                teamSuperAjax().then(function(rep){
                     owerFunc.adminAuthorization(grantData.id, grantData.userIds, grantData.resourceIds).then(function(rep) {
                        if(rep.data) {
                            $scope.remindInfor(rep.data);
                        }
                    });                   
                })
            }
        }

}]);

admin_modal
    .controller('MiNiAdminModalController',['$scope', '$http', '$modal','$timeout','$modalInstance','notify',
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

            // 权限列表
         //    (64 * 7 + 10, "内容类型管理", true);// 458
         //    (64 * 7 + 11, "内容栏目管理", true);
         //    (64 * 7 + 12, "内容菜单管理", true);
         //    (64 * 7 + 13, "热点视频管理", true);
         //    (64 * 7 + 14, "品牌信息管理", true);
         //    (64 * 7 + 15, "内容管理", true);
         //    (64 * 7 + 16, "站点管理", true);
         //    (64 * 7 + 17, "DXY内容栏目管理", true);
         //    (64 * 7 + 18, "DXY内容菜单管理", true);
         //    (64 * 7 + 19, "DXY热点视频管理", true);
         //    (64 * 7 + 20, "DXY品牌信息管理", true);
         //    (64 * 7 + 21, "DXY内容管理", true);
         //    (64 * 7 + 22, "DXY站点管理", true);
         //    (64 * 7 + 23, "推荐内容管理", true);
         //    (64 * 7 + 24, "查看热点内容", true);
            

         //    (64 * 7 + 30, "查看常用报表", true);
         //    (64 * 7 + 31, "查看自定义报表", true);
         //    (64 * 7 + 32, "查看TP Log", true);
         //    (64 * 7 + 33, "DXY查看TP Log", true);

         //    (64 * 7 + 40, "查看互动日志", true);
         //    (64 * 7 + 41, "查看互动数据", true);
         //    (64 * 7 + 42, "互动管理", true);
         //    (64 * 7 + 43, "DXY查看互动数据", true);
         //    (64 * 7 + 44, "DXY互动管理", true);

         //    (64 * 7 + 50, "模板管理", true);
         //    (64 * 7 + 51, "选择模板", true);
         //    (64 * 7 + 52, "查看模板审核记录", true);
         //    (64 * 7 + 53, "模板审核管理", true);

         //    (64 * 8 + 1, "查看HCP互动数据", true);
         //    (64 * 8 + 2, "查看HCP互动数据详细", true);
         //    (64 * 8 + 3, "DXY查看HCP互动数据", true); 
         //    (64 * 8 + 4, "DXY查看HCP互动数据详细", true);
         //    (64 * 8 + 5, "查看HCP登录日志", true);

         //    (64 * 8 + 10, "Engaged Target HCP", true);
         //    (64 * 8 + 11, "Touch Point", true);

         //    (64 * 8 + 12, "评论管理", true);

         //    (64 * 8 + 20, "模式管理", true);
         //    (64 * 8 +21 , "题库管理", true);
         //    (64 * 8 + 22, "答题成绩", true);

         //    (64 * 8 + 30, "成长计划", true);
    }])