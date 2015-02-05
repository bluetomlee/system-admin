'use strict';

var minidetail_modal = angular.module('minisiteApp.detail', ['ui.bootstrap', 'cgPrompt', 'cgNotify','angularFileUpload'])
.controller('MiNiSiteDetailController', ['$scope', '$http', '$location', '$routeParams', '$rootScope', '$timeout','$modal','prompt', 'notify',
        function($scope, $http, $location, $routeParams, $rootScope, $timeout,$modal,prompt,notify) {
            
            // 初始化
            $timeout(function(){
                $scope.miniId = $routeParams;
                $scope.miniId = $routeParams.appId;
                $scope.refreshMiniList();               
            });

            // 获取minisiteList
            $scope.refreshMiniList = function(){
                $scope.objParm = {
                    type: '4'
                };
                var listUrl = '/japi/team/list?' + $.param($scope.objParm),
                    isOffline = simconfigs.webroot.search('sim.dxy.cn');
                $http.get(listUrl).success(function(data){
                    angular.forEach(data.items,function(v,i){
                        if(v.id == $scope.miniId){
                            $scope.vsInfor = v;
                            $http.get('/japi/vs/applications/get?teamId=' + $scope.miniId).success(function(result){
                                $scope.miniList = result.items;
                            })
                        }
                    })
                })
                $scope.vsSysUrl = (isOffline == -1) ? 'http://vs.sim.dxy.net/admin' : 'http://vs.dxy.cn/admin/' ;
            };

            // 共用Notify提醒
            $scope.remindInfor = function(data){
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

            // 保存系统信息
            $scope.saveVsInfor = function(vsInfor){
                var saveUrl = '/japi/vs/update';
                $.ajax({
                    method: 'POST',
                    url: saveUrl,
                    data: vsInfor
                }).success(function(data){
                    $scope.remindInfor(data);
                    $scope.isShowSysInput = false;
                })
                
            };

            // 删除指定Minisite
            $scope.removeMinisite = function(mini){
                prompt({
                    title: '确认删除？',
                    message: '<div><i class="fa fa-warning warning"></i>&nbsp;&nbsp;删除后,该Site的权限管理全面冻结</div>',
                    "buttons": [
                        {label:'删除',primary:true},
                        {label:'取消',cancel:true}
                    ]
                }).then(function(){
                    $.ajax({
                        method: 'POST',
                        url: '/japi/vs/application/delete',
                        data: {
                            id: mini.id,
                            applicationId: mini.applicationId
                        }                        
                    }).success(function(data){
                        $scope.remindInfor(data);
                        $scope.refreshMiniList();
                    })
                })
            };

            // 跳转指定管理页面
            
            $scope.locationAdmin = function(id){
                $location.path('admin/'+id);
            };

            // 上传头像
            $scope.modalUploadImg = function(){
                var modalNewApp = $modal.open({
                    templateUrl: 'materialImageUploadModal.html',
                    controller: 'CreateMiniSiteController',
                    size: 'lg',
                    scope: $scope, // 继承
                    resolve: {
                        items: function () {
                            return $scope.items;
                        }
                    }
                });                
            };

            $scope.modalCreateMinisite = function(){
                var showAdmin = $modal.open({
                    templateUrl: 'createMinisitetpl.html',
                    controller: 'CreateMiniSiteController',
                    scope: $scope
                });
                showAdmin.result.then(function(){
                    $scope.newMini = {};
                })
            }           
}]);

minidetail_modal
    .controller('CreateMiniSiteController',['$scope', '$http', '$modal','$timeout', 'FileUploader', '$modalInstance','notify',
        function($scope, $http, $modal, $timeout, FileUploader, $modalInstance, notify){

            // 创建Minisite
            $scope.createMinisite = function(){
                var createUrl = '/japi/vs/application/create';
                $.ajax({
                    method: 'POST',
                    url: createUrl,
                    data:{
                        homepage: $scope.newMini.homepage,
                        name: $scope.newMini.name,
                        description: $scope.newMini.des
                    }
                }).success(function(data){
                    $scope.remindInfor(data);
                    if(data.success) $scope.newMini = {};
                    $scope.refreshMiniList();
                    $scope.cancelModal();
                })
            };

            // 图片上传控件
            $scope.uploader = new FileUploader({
                url: "/japi/media/uploads",
                alias: "upload_file",
                formData: [{
                    "media_type": "image",
                    "listable": false
                }],
                autoUpload: false,
                filters: [{
                    name: 'imageFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        var isFilters = '|jpg|jpeg|'.indexOf(type) !== -1 && item.size > 0 && item.size <= 1024*1024;

                        if(!isFilters) {
                            prompt({
                                title: '上传失败',
                                message: '<i class="fa fa-times-circle fail"></i> 上传失败，仅支持 jpe/jpeg, 1M 以内？',
                                "buttons": [
                                    {label:'确定',primary:true}
                                ]
                            });
                        }
                        return isFilters;
                    }
                }],
                onWhenAddingFileFailed: function(item /*{File|FileLikeObject}*/, filter, options) {
                    // $log.log('onWhenAddingFileFailed', item, filter, options);
                },
                onAfterAddingFile: function(fileItem) {
                    // $log.log('onAfterAddingFile', fileItem);
                },
                onAfterAddingAll: function(addedFileItems) {
                    // $log.log('onAfterAddingAll', addedFileItems);
                },
                onBeforeUploadItem: function(item) {
                    // $log.log('onBeforeUploadItem', item);
                },
                onProgressItem: function(fileItem, progress) {
                    // $log.log('onProgressItem', fileItem, progress);
                },
                onProgressAll: function(progress) {
                    // $log.log('onProgressAll', progress);
                    $scope.uploadProgress = progress;
                    $scope.isUploading = true;
                },
                onSuccessItem: function(item, response, status, headers) {
                    if(response.success) {
                        console.info(item, response, status, headers);
                        $scope.postData = angular.copy($scope.vsInfor);
                        $scope.postData.logo = response.id;
                        var saveUrl = '/japi/vs/update';
                        $.ajax({
                            method: 'POST',
                            url: saveUrl,
                            data: $scope.postData
                        }).success(function(data){
                            $scope.remindInfor(data);
                            $scope.postData = {};
                            $scope.vsInfor.avatar = response.uri;
                        })

                    } else {
                        alert(response.message);
                    }

                },
                onErrorItem: function(fileItem, response, status, headers) {
                    // $log.log('onErrorItem', fileItem, response, status, headers);
                },
                onCancelItem: function(fileItem, response, status, headers) {
                    // $log.log('onCancelItem', fileItem, response, status, headers);
                },
                onCompleteItem: function(fileItem, response, status, headers) {
                    // $log.log('onCompleteItem', fileItem, response, status, headers);
                },
                onCompleteAll: function() {
                    // 刷新页面图片
                    $scope.refreshMiniList();
                    // 关闭窗口
                    $scope.cancelModal();

                    // $log.log('onCompleteAll');
                }
            });

            // 关闭modal
            $scope.cancelModal = function () {
                $modalInstance.close();
            }
    }])