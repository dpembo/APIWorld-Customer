/* Copyright (c) 2017-2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors. 
 * Use, reproduction, transfer, publication or disclosure is prohibited except as specifically provided for in your License Agreement with Software AG. 
 */

(function () {
    var app = angular.module('app');

    app.config(function ($routeProvider) {
        $routeProvider
            .when("/view/mockdetails", {
                templateUrl: "partialView/baseRouterPage.html",
                controller: "treeTable-datarouter-mock"
                //controller: "MainCtrl"
            })
            .when("/view/:param", {
                templateUrl: "partialView/baseRouterPage.html",
                controller: "treeTable-datarouter"
                //controller: "MainCtrl"
            })
            .otherwise({
                redirectTo: '/view/fullpackageview',
                controller: "treeTable-datarouter"
                //controller: "MainCtrl"
            });
    });

})();//.call(this);