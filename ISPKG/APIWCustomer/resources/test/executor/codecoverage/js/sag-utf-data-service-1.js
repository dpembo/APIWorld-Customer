/* Copyright (c) 2017-2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors. 
 * Use, reproduction, transfer, publication or disclosure is prohibited except as specifically provided for in your License Agreement with Software AG. 
 */

(function () {
    
    var app = angular.module('app')


    app.service('splitfile$dataservice', function () {
        return function (scope, parent) {
            var data_location = parent.data_location;
            var paginationoptions = parent.paginationoptions;
            var itemsPerPage = paginationoptions.itemsPerPage;
            var startIdx = (paginationoptions.currentPage - 1) * itemsPerPage;
            var endIdx = startIdx + itemsPerPage;
            var totalItems = paginationoptions.totalItems;
            endIdx = endIdx < totalItems ? endIdx : totalItems;

            console.log('Page changed to: ' + paginationoptions.currentPage + ' -- view : ' + scope.param);
            console.log('Grid Data changed. itemsPerPage: ' + itemsPerPage + ' >> startIdx: ' + startIdx + ' >> endIdx: ' + endIdx);
            
            if (scope.param == "fullpackageview") {
                var elementNSCascadedResultStatsSub = [];
                var elementNSCascadedResult = parent.elementNSCascadedResult;

                for (var index = startIdx; index < endIdx; index++) {
                    var element = elementNSCascadedResult.pckmap[index];
                    $.ajax({
                        url: data_location + "/eic_ns_" + element[1] + ".json",
                        async: false,
                        success: function (result) {
                            elementNSCascadedResultStatsSub.push(result);
                            console.log(result);
                        }
                    });
                }
            
                elementNSCascadedResult.Stats.instruction.SubInstruction = elementNSCascadedResultStatsSub;
            } else if (scope.param == "executionmodel") {
                // TODO
            }
            return scope;

        }


    });


    app.service('mock$dataservice', function () {
        return function (result) {
            var keyObject = result.key;
            var records = [];
            var uniqueServices = [];
            var mockTypeCount = {pipeline: 0, exception: 0, service: 0, factory: 0};

            if (keyObject != undefined) {
                keyObject.forEach(function(element) {
                    var testName = element[0];
                    var serviceUnderTest = element[1];
                    var testresult = element[2];
                    var mockCount = element.length -3;
                    for (var index = 3; index < element.length; index++) {
                        var mockDetails= [];
                        var mockedServiceName = element[index][0];
                        if (!uniqueServices.includes(mockedServiceName)) {
                            uniqueServices.push(mockedServiceName);
                        }
                        
                        switch (element[index][3]) {
                            case "pipeline":
                                mockTypeCount.pipeline += 1;
                                break;
                            case "exception":
                                mockTypeCount.exception += 1;
                                break;
                            case "service":
                                mockTypeCount.service += 1;
                                break;
                            case "factory":
                                mockTypeCount.factory += 1;
                                break;
                            default:
                                break;
                        }

                        mockDetails.push(element[index][0]);
                        mockDetails.push(testName);
                        mockDetails.push(testresult);
                        mockDetails.push(element[index][3]);
                        mockDetails.push(element[index][2]);
                        mockDetails.push(element[index][1]);
                        records.push(mockDetails);
                    }

                });
            }
            var generatedData = [];
            generatedData.push(records);
            generatedData.push(uniqueServices);
            generatedData.push(mockTypeCount);
            return generatedData;
        }

    });

    app.service('pb$dataservice', function () {
        return function (result) {
            var myfunc = function (instruction) {
                instruction._package_scope = current_package_scope;
                instruction._global_scope = global_scope;
                instruction._max_package_scope = max_package_scope;
                if (instruction.SubInstruction != undefined) {
                    var elements = instruction.SubInstruction;
                    elements.forEach(function(element) {
                        myfunc(element.instruction);
                      });

                }
                return instruction;
            }

            var packageCount = result.packageFilter.length;
            var lo_stats = result.Stats.instruction;
            lo_stats.childCount = lo_stats.childCount - packageCount -1;
            lo_stats.visitedChildCount = lo_stats.visitedChildCount - packageCount;
            var global_scope = lo_stats.childCount;// - packageCount;  // exclude the packages count from the global scope count
            var packages = result.Stats.instruction.SubInstruction;
            var current_package_scope;

            var max_package_scope = 0;

            if (packages != undefined) {
                packages.forEach(function(package) {
                	
                	package.instruction.childCount -= 1;
                    package.instruction.childCount = Math.max(package.instruction.childCount, 0);
                    package.instruction.visitedChildCount -= 1;
                    package.instruction.visitedChildCount = Math.max(package.instruction.visitedChildCount, 0);
                    
                    if (package.instruction.childCount > max_package_scope) {
                        max_package_scope = package.instruction.childCount;
                    }
                });
                packages.forEach(function(package) {
                    //package.instruction.childCount -= 1;
                    //package.instruction.visitedChildCount -= 1;
                    current_package_scope = package.instruction.childCount;// -1 ; // exclude the package from the package scope count
                    myfunc(package.instruction);
                  });
            }

            return result;

        }


    });


    app.service('em$dataservice', function () {
        return function (result) {
            var myfunc = function (instruction) {
                instruction._test_scope = current_test_scope;
                instruction._max_test_scope = max_test_scope;
                if (instruction.SubInstruction != undefined) {
                    var elements = instruction.SubInstruction;
                    elements.forEach(function(element) {
                        myfunc(element.instruction);
                    });
                }
                return instruction;
            }

            var lo_stats = result;
            var current_test_scope;
            var max_test_scope = 0;

            lo_stats.forEach(function(lo_stat) {
                lo_stat.instruction.childCount -= 1;
                lo_stat.instruction.visitedChildCount -= 1;
                if (lo_stat.instruction.childCount > max_test_scope) {
                    max_test_scope = lo_stat.instruction.childCount;
                }
            });
            lo_stats.forEach(function(lo_stat) {
                //lo_stat.instruction.childCount -= 1;
                //lo_stat.instruction.visitedChildCount -= 1;
                current_test_scope = lo_stat.instruction.childCount;
                myfunc(lo_stat.instruction);
            });

            return result;
        }

    });



    app.service('td$dataservice', function () {
        return function (testdescs) {
            var lo_testdescs = testdescs.data;
            var tests = [];
            var suites = [];
            var totalchildcount = 0;
            var totalvisitedchildcount = 0;

            lo_testdescs.forEach(function(element_suite) {
                suites.push(element_suite.testSuiteId);

                element_suite.testCases.forEach(function(element_test) {
                    if (!element_test.includes(element_suite.testSuiteId))
                        element_test.push(element_suite.testSuiteId);
                    
                    try {
                        if (element_test.length > 3 && !isNaN(element_test[3])) {
                            totalchildcount += parseInt(element_test[3]);
                        } else if (element_test.length == 4) {
                            totalchildcount += 1; // add count for empty tests
                        }

                        if (element_test.length > 4 && !isNaN(element_test[4])) {
                            totalvisitedchildcount += parseInt(element_test[4]);
                        }

                    } catch (error) {
                        console.log(error);
                    }
                    
                    tests.push(element_test)
                });
            });

            testdescs.fulltests = tests;
            testdescs.totalchildcount = totalchildcount;
            testdescs.totalvisitedchildcount = totalvisitedchildcount;
            return testdescs;
        }

    });



    app.service('CommaFormatted', function () {
        return function (nStr) {
            nStr += "";
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : "";
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ', ' + '$2');
            }
            return x1 + x2;
        }

    });


    app.service('imageproviderservice', function () {
        return function (scope) {

            scope.images = {
                SEQUENCE: "images/Sequence.gif",
                TRY: "images/FlowTry.png",
                CATCH: "images/FlowCatch.png",
                FINALLY: "images/FlowFinally.png",
                BRANCH: "images/Branch.gif",
                LOOP: "images/Loop.gif",
                RETRY: "images/Repeat.gif",
                MAP: "images/Map.gif",
                EXIT: "images/Exit.gif",
                INVOKE: "images/Invoke.gif",
                ROOT: "images/ns_flow.gif",
                service: "images/ns_flow.gif",

                PACKAGES: "images/ns_package.gif",

                MAPCOPY: "images/map_connect_enabled.gif",
                MAPDELETE: "images/map_drop.gif",
                MAPSET: "images/map_default.gif",
                MAPINVOKE: "images/transformer_small.gif",
                MAPFOREACH: "images/foreach_map_connect_enabled.png",

                TestCase: "images/test.gif",
                Ghost: "images/test.gif",

                java_service: "images/ns_java.gif",

                AdapterService_unknown: "images/adapter_service.gif",
                java_c: "images/ns_c.gif",
                java_error: "images/Service16.gif",

                mock_pipeline: "images/pipeline.gif",
                mock_exception: "images/exception.gif",
                mock_service: "images/altservice.gif",
                mock_factory: "images/factory.gif"

            };

        }


    });


})();//.call(this);