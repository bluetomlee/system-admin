'use strict';
// use contacts.js
admin_modal.directive('appSettingAdminList', ['$timeout', '$parse', '$routeParams', 'prompt', '$http', '$log', function($timeout, $parse, $routeParams, prompt, $http, $log) {
    var templateId = 61;
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            apiBase: '@',
            apiRoot: '@',
            selectedNode: '=',
            selectedNodeChanged: '='
        },
        link: function(scope, element, attrs) {
            var appId = $routeParams.appId;
            $(function(){
                var treeElement = $(element);
                var adminListData = {};

                var tree = treeElement.jstree({
                    "core" : {
                        "animation" : 0,
                        "check_callback" : true,
                        "themes" : { "department" : true },
                        "data" : function(obj, cb) {
                            $http.get("/japi/admingroup/list?applicationId=" + appId + "&templateId=" + templateId).success(function(data){
                                var treeData = data.items;
                                function formatJstreeJson(json) {
                                    var jstreeData = [{
                                        id: 0,
                                        teamId: 0,
                                        text: "超级管理员",
                                        parent: "#"
                                    }];

                                    angular.forEach(json, function(value, key) {
                                        this.push({
                                            id          : value.id,
                                            teamId      : value.teamId,
                                            text        : value.name,
                                            parent      : 0
                                        });
                                        adminListData[value.id] = value;
                                    }, jstreeData);

                                    return jstreeData;
                                }

                                var ad = formatJstreeJson(treeData);
                                cb.call(this, ad);
                            });
                            }
                        },
                        "plugins" : [ "contextmenu", "state", "types", "wholerow" ],
                        "contextmenu": {
                            // 具体配置选项请参考jstree源文件 5070行
                            items : function (o, cb) { // Could be an object directly
                                return {
                                    "create" : {
                                        "label"             : "添加管理组",
                                        "action"            : function (data) {
                                            var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                            // alert('data');
                                            //
                                            prompt({
                                                title: '添加管理组',
                                                /*message: '请输入新部门名称?',*/
                                                input: true,
                                                /* label: '名称', */
                                                value: '新管理组名称',
                                                "buttons": [
                                                {label:'取消',cancel:true},
                                                {label:'创建',primary:true}
                                                ]
                                            }).then(function(Newname) {
                                                //the promise is resolved with the user input
                                                //he hit ok and not cancel
                                                // obj.text = Newname;

                                                console.log(obj);
                                                // if(obj.id == "#"){obj.id=0};
                                                $http({
                                                    method: 'POST',
                                                    url: '/japi/admingroup/create',
                                                    data: $.param({
                                                        applicationId: appId,
                                                        templateId: templateId,
                                                        name: Newname
                                                    }),
                                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                                }).success(function(rep) {
                                                    console.info(rep)
                                                    if(rep.success) {
                                                        inst.create_node(obj, {
                                                            "id": rep.data.id,
                                                            "teamId": rep.data.teamId,
                                                            "text": Newname
                                                        }, "last", function (new_node) {
                                                            console.log(new_node);
                                                            /* setTimeout(function () { inst.edit(new_node); },0);*/
                                                        });
                                                    } else {
                                                        alert(rep.message);
                                                    }
                                                });

                                                /* 默认的方法
                                                var inst = $.jstree.reference(data.reference),
                                                obj = inst.get_node(data.reference);
                                                inst.create_node(obj, {}, "last", function (new_node) {
                                                setTimeout(function () { inst.edit(new_node); },0);
                                            });
                                            */
                                        });

                                    }
                                },
                                "rename" : {
                                    "label"             : "重命名",
                                    "action"            : function (data) {

                                        // alert('重命名/删除功能暂无');

                                        var inst = $.jstree.reference(data.reference),
                                        obj = inst.get_node(data.reference);
                                        
                                        prompt({
                                            title: '修改管理组名称',
                                            /*message: '请输入新部门名称?',*/
                                            input: true,
                                            /* label: '名称', */
                                            value: obj.text,
                                            "buttons": [
                                            {label:'取消',cancel:true},
                                            {label:'修改',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            // 重命名
                                            $http({
                                                method: 'POST',
                                                url: '/japi/admingroup/update',
                                                data: $.param({
                                                    name: Newname,
                                                    id: obj.id,
                                                    applicationId: appId
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.rename_node(obj, Newname);
                                                } else {
                                                    alert(data.message);
                                                }
                                            });
                                        });

                                        inst.edit(obj);
                                    }
                                },
                                "remove" : {
                                    "label"             : "删除",
                                    "action"            : function (data) {
                                        // alert('重命名/删除功能暂无');
                                        var inst = $.jstree.reference(data.reference),
                                        obj = inst.get_node(data.reference);
                                        prompt({
                                            title: '请确认',
                                            message: '是否要删除「' + obj.text + '」管理组？',
                                            "buttons": [
                                            {label:'取消',cancel:true},
                                            {label:'确认删除',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            //the promise is resolved with the user input
                                            //he hit ok and not cancel
                                            // obj.text = Newname;
                                        
                                            $http({
                                                method: 'POST',
                                                url: '/japi/admingroup/delete',
                                                data: $.param({
                                                    id: obj.id,
                                                    applicationId: appId
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.delete_node(obj);
                                                } else {
                                                    alert(data.message);
                                                }
                                            });
                                        });

                                        /*
                                        if(inst.is_selected(obj)) {
                                        inst.delete_node(inst.get_selected());
                                    }
                                    else {
                                    inst.delete_node(obj);
                                }
                                */
                            }
                        }
                    };
                }
            }
        });

        // 创建节点回调
        tree.bind('create_node.jstree', function(evt, obj) {
            console.info('create_node after');
        });

        // 重命名回调
        tree.bind('rename_node.jstree', function(evt, obj){
            console.info('rename_node after');
        });

        // 删除节点回调
        tree.bind('delete_node.jstree', function(evt, obj){
            console.info('delete_node after');
        });

        // 选中节点回调（结合scope双向绑定）
        tree.bind('select_node.jstree', function(evt, obj) {
            $timeout(function() {
                scope.selectedNode = {
                    id: treeElement.find('.jstree-clicked').attr('id'),
                    text: treeElement.find('.jstree-clicked').text(),
                    subid: treeElement.jstree('get_selected')[0],
                    item: adminListData[treeElement.jstree('get_selected')[0]]
                };
                if (scope.selectedNodeChanged) {
                    $timeout(function() {
                        scope.selectedNodeChanged(scope.selectedNode);
                    });
                }
            });
        });

        // 显示菜单回调
        tree.bind("show_contextmenu.jstree", function(node, x, y) {
            $log.log("show_contextmenu after");
        });

    });
}
};

}]
);
