/* Copyright (c) 2017-2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors. 
 * Use, reproduction, transfer, publication or disclosure is prohibited except as specifically provided for in your License Agreement with Software AG. 
 */

(function () {

    var paginationOptions = {
        pageNumber: 1,
        pageSize: 10,
        sort: null
    };
    var data_location = "__data";
    var testDescriptionsResult;

    var app = angular.module('app', 
                      ['ngRoute', 'ngAnimate', 'ngTouch', 
                      'ui.grid', 'ui.grid.treeView', 
                      'ui.grid.pagination', 
                      'ui.grid.resizeColumns', 'ui.grid.moveColumns', 
                      'ui.grid.autoResize', 
                      'ui.grid.selection', 'ui.grid.cellNav']);


    app.controller('treeTable-datarouter', [
        '$rootScope', '$scope', '$routeParams', 'uiGridConstants', 
        'pb$dataservice', 'td$dataservice', 'em$dataservice', 'imageproviderservice',  'CommaFormatted', 
        '$interval', '$timeout',
        function (
            $rootScope, $scope, $routeParams, uiGridConstants, 
            pb$dataservice, td$dataservice, em$dataservice, imageproviderservice, CommaFormatted, 
            $timeout, $interval) {

            
            $scope.data_location = data_location;

            imageproviderservice($scope);

            $scope.gridOptions = {
                enableSorting: false,
                enableFiltering: false,
                enableRowSelection: false,
                allowCellFocus : true,
                multiSelect: false,
                enableRowHeaderSelection: false,
                showTreeRowHeader: false,
                showGridFooter: false,
                showTreeExpandNoChildren: false,
                useExternalPagination: true,
                useExternalSorting: false,
                paginationPageSizes: [5, 10, 25, 50, 100],
                paginationPageSize: 10,
                rowHeight: 25,
                columnDefs: [
                    //{ name: 'Elements', width: '46%', cellTemplate: '<div  style="width:100%" ng-click="grid.appScope.toggleRow(row, col)"><displaytext class="ui-grid-cell-contents" title="TOOLTIP" ></displaytext></div>' },
                    //{ name: 'Elements1', width: '40%', field: 'displayText', cellTemplate: "<div class=\"ui-grid-cell-contents\" title=\"TOOLTIP\"><div style=\"float:left;\" class=\"ui-grid-tree-base-row-header-buttons\" ng-class=\"{'ui-grid-tree-base-header': row.treeLevel > -1 }\" ng-click=\"grid.appScope.toggleRow(row,evt)\"><i ng-class=\"{'ui-grid-icon-down-dir': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'expanded', 'ui-grid-icon-right-dir': ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'collapsed', 'ui-grid-icon-blank': ( ( !grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) && !( row.treeNode.children && row.treeNode.children.length > 0 ) )}\" ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\"></i> &nbsp;</div>{{COL_FIELD CUSTOM_FILTERS}}</div>"},
                    { name: 'Elements', width: '40%', field: 'displayText', 
                        cellTemplate: 
                        "<div class=\"ui-grid-cell-contents\" style=\"cursor:default;\" title=\"TOOLTIP\">" + 
                        "<div" + 
                        "style=\"float:left; width:100%\" class=\"ui-grid-tree-base-row-header-buttons\"" + 
                        "ng-class=\"{'ui-grid-tree-base-header': row.treeLevel > -1 }\" ng-click=\"grid.appScope.toggleRow(row,evt)\">"+
                        "<i ng-class=\"{'ui-grid-icon-down-dir':" + 
                        " ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'expanded'," + 
                        " 'ui-grid-icon-right-dir':" + 
                        " ( ( grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) || ( row.treeNode.children && row.treeNode.children.length > 0 ) ) && row.treeNode.state === 'collapsed'," + 
                        " 'ui-grid-icon-blank': ( ( !grid.options.showTreeExpandNoChildren && row.treeLevel > -1 ) && !( row.treeNode.children && row.treeNode.children.length > 0 ) )}\" " + 
                        "ng-style=\"{'padding-left': grid.options.treeIndent * row.treeLevel + 'px'}\">" + 
                        "</i>&nbsp;" + 
                        "<span><displaytext/><displaydecoration/></span>",
                        cellTooltip: true,
                    },
                    { name: 'Coverage (%)', width: '30%', cellTemplate: '<percentageelem class="ui-grid-cell-contents" title="TOOLTIP" row-data = {{row.entity}}></percentageelem>' },
                    //{ name: 'Coverage1 (%)', width: '22%', cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP">{{grid.appScope.coveragepercentage(grid, row)}}</div>' },
                    { name: 'Covered Instructions', width: '10%', field: 'visitedChildCount' },
                    { name: 'Missed Instructions', width: '10%', cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP">{{grid.appScope.missedelem(grid, row)}}</div>' },
                    { name: 'Total Instructions', width: '10%', field: 'childCount' },
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    $scope.initialized = false;
                    $scope.gridApi.core.on.rowsRendered($scope, function () {

                        $scope.$watch('data', function () {

                                var row = $scope.gridApi.grid.rows[0];
                                if (!$scope.initialized) {
                                    //selecting the row
                                    $scope.gridApi.treeBase.toggleRowTreeState(row);
                                    $scope.gridApi.treeBase.expandRow(row);
                                    $scope.initialized = true;
                                }

                        });

                    });




                    $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                        if (sortColumns.length == 0) {
                            paginationOptions.sort = null;
                        } else {
                            paginationOptions.sort = sortColumns[0].sort.direction;
                        }
                        //getPage();
                        $scope.gridApi.grid.api.core.notifyDataChange(uiGridConstants.dataChange.ALL);
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        getPage();
                        $scope.gridApi.grid.api.core.notifyDataChange(uiGridConstants.dataChange.ALL);
                        //$scope.gridApi.grid.api.core.refresh();
                    });

                }
            };
        

            $scope.coveragepercentage = function (grid, myRow) {
                var coveragepercent = (myRow.entity.visitedChildCount * 100) / myRow.entity.childCount;
                return coveragepercent.toFixed(1);
            };


            $scope.missedelem = function (grid, myRow) {
                var missedcount = myRow.entity.childCount - myRow.entity.visitedChildCount;
                return isNaN(missedcount) ? "" : missedcount;
            };

            $scope.expandAll = function () {
                $scope.gridApi.treeBase.expandAllRows();
            };

            $scope.toggleRow = function (rowNum, col) {
                $interval(function () {
                    $scope.gridApi.treeBase.toggleRowTreeState(rowNum);
                    //$scope.gridApi.selection.toggleRowSelection(rowNum);                 
                    //$scope.gridApi.selection.selectRow(rowNum);
                }, 200, 1);
                
                $interval(function () {
                    //$scope.gridApi.selection.toggleRowSelection(rowNum);                 
                    $scope.gridApi.selection.selectRow(rowNum);
                    $scope.gridApi.selection.raise.rowSelectionChanged(rowNum);
                }, 1000, 1);
            };

            $scope.toggleRowIndex = function (rowNum) {
                $scope.gridApi.treeBase.toggleRowTreeState($scope.gridApi.grid.renderContainers.body.visibleRowCache[rowNum]);
            };


            var id = 0;
            var data = [];
            var overallsummary = {};
            $scope.dataloaded = false;

            var getPage = function () {
                var url;
                $rootScope.pagecontext = $routeParams.param;
                switch ($routeParams.param) {
                    case "fullpackageview":
                        getFullPackageViewPage();
                        break;
                    case "executionmodel":
                        getExecutionModelViewPage();
                        break;
                    case "servicelevel":
                        getServiceLevelViewPage();
                        break;
                    default:
                        getFullPackageViewPage();
                        break;
                }
                

            };


            var packagesummary = function () {
                var pkgs_instruction = elementNSCascadedResult.Stats.instruction; 
                
                overallsummary.packagesfilter = elementNSCascadedResult.pckmap;
                overallsummary.flattentests = testDescriptionsResult.fulltests;

                overallsummary.overall_pkg_childcount = pkgs_instruction.childCount - overallsummary.packagesfilter.length -1;
                overallsummary.overall_pkg_visitedchildcount = pkgs_instruction.visitedChildCount - overallsummary.packagesfilter.length;

                overallsummary.overall_pkg_coveragepercent = parseFloat((overallsummary.overall_pkg_visitedchildcount * 100 ) / overallsummary.overall_pkg_childcount);
                overallsummary.overall_pkg_coveragepercent_cs = overallsummary.overall_pkg_coveragepercent.toFixed(2);
                overallsummary.overall_pkg_childcount_cs = CommaFormatted(overallsummary.overall_pkg_childcount);
                overallsummary.overall_pkg_visitedchildcount_cs = CommaFormatted(overallsummary.overall_pkg_visitedchildcount);
                overallsummary.overall_pkg_missedchildcount_cs = CommaFormatted(overallsummary.overall_pkg_childcount - overallsummary.overall_pkg_visitedchildcount);
            }

            var svcsummary = function () {
                packageServiceCoverageData = pb$dataservice(packageServiceCoverageData);
    
                var svc_instruction = packageServiceCoverageData.Stats.instruction;
                overallsummary.overall_svc_coveragepercent = parseFloat((svc_instruction.visitedChildCount * 100 ) / svc_instruction.childCount);
                overallsummary.overall_svc_coveragepercent_cs = overallsummary.overall_svc_coveragepercent.toFixed(2);
                overallsummary.overall_svc_childcount = svc_instruction.childCount;
                overallsummary.overall_svc_childcount_cs = CommaFormatted(svc_instruction.childCount);
                overallsummary.overall_svc_visitedchildcount = svc_instruction.visitedChildCount;
                overallsummary.overall_svc_visitedchildcount_cs = CommaFormatted(svc_instruction.visitedChildCount);
                overallsummary.overall_svc_missedchildcount_cs = CommaFormatted(overallsummary.overall_svc_childcount - overallsummary.overall_svc_visitedchildcount);
                overallsummary.flattentests = testDescriptionsResult.fulltests;
            }

            var testsummary = function () {
                
                overallsummary.testSuites = testDescriptionsResult.data;
                overallsummary.flattentests = testDescriptionsResult.fulltests;
                
                overallsummary.overall_tst_childcount = testDescriptionsResult.totalchildcount - overallsummary.flattentests.length;
                overallsummary.overall_tst_childcount_cs = CommaFormatted(overallsummary.overall_tst_childcount);
                overallsummary.overall_tst_visitedchildcount = testDescriptionsResult.totalvisitedchildcount - overallsummary.flattentests.length;
                overallsummary.overall_tst_visitedchildcount_cs = CommaFormatted(overallsummary.overall_tst_visitedchildcount);
                overallsummary.overall_tst_missedchildcount_cs = CommaFormatted(overallsummary.overall_tst_childcount - overallsummary.overall_tst_visitedchildcount);
                overallsummary.overall_tst_coveragepercent = parseFloat((overallsummary.overall_tst_visitedchildcount * 100 ) / overallsummary.overall_tst_childcount);
                overallsummary.overall_tst_coveragepercent_cs = overallsummary.overall_tst_coveragepercent.toFixed(2);
                
            }


            // Full Package Coverage Load
            var elementNSCascadedResult;
            $.ajax({
                url: data_location + "/eic_nsCascaded.json",
                async: false,
                success: function (result) {
                    elementNSCascadedResult = result;
                    $scope.dataloaded = true;
                    
                },
                error: function (hr,status,error) {
                    $scope.dataloaded = false;
                }
            });
            // $scope.gridOptions.totalItems = elementNSCascadedResult.pckmap.length;

            var getFullPackageViewPage = function () {

                packagesummary();

                {
                    $scope.overallsummary.title_cs = "Overall Package Coverage Summary";
                    $scope.overallsummary.coveragepercent_cs = overallsummary.overall_pkg_coveragepercent_cs;
                    $scope.overallsummary.overall_coveragepercent = overallsummary.overall_pkg_coveragepercent;
                    $scope.overallsummary.overall_childcount_cs = overallsummary.overall_pkg_childcount_cs;
                    $scope.overallsummary.overall_visitedchildcount_cs = overallsummary.overall_pkg_visitedchildcount_cs;
                    $scope.overallsummary.overall_missedchildcount_cs = overallsummary.overall_pkg_missedchildcount_cs;
                }

                $scope.gridOptions.totalItems = elementNSCascadedResult.pckmap.length;

                var elementNSCascadedResultStatsSub = [];
                var itemsPerPage = paginationOptions.pageSize;
                var startIdx = (paginationOptions.pageNumber - 1) * itemsPerPage;
                var endIdx = startIdx + itemsPerPage;
                var totalItems = $scope.gridOptions.totalItems;
                endIdx = endIdx < totalItems ? endIdx : totalItems;

                for (var index = startIdx; index < endIdx; index++) {
                    var element = elementNSCascadedResult.pckmap[index];
                    $.ajax({
                        url: data_location + "/eic_ns_" + element[0] + ".json",
                        async: false,
                        success: function (result) {
                            elementNSCascadedResultStatsSub.push(result);
                        }
                    });
                }

                elementNSCascadedResult.Stats.instruction.SubInstruction = elementNSCascadedResultStatsSub;
                //$scope.overallsummary.packagesfilter = elementNSCascadedResultStatsSub;
                data = pb$dataservice(elementNSCascadedResult).Stats.instruction.SubInstruction;

                var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
                $scope.gridOptions.data = [];
                writeoutNode(data, 0, id, $scope.gridOptions.data);
            };

            
            


           
            



            // Test Descriptions Load
            loadTestDescriptions($scope, td$dataservice);
           
            

            var getExecutionModelViewPage = function () {
                testsummary();

                {
                    $scope.overallsummary.title_cs = "Overall Execution Model based Coverage Summary";
                    $scope.overallsummary.coveragepercent_cs = overallsummary.overall_tst_coveragepercent_cs;
                    $scope.overallsummary.overall_coveragepercent = overallsummary.overall_tst_coveragepercent;
                    $scope.overallsummary.overall_childcount_cs = overallsummary.overall_tst_childcount_cs;
                    $scope.overallsummary.overall_visitedchildcount_cs = overallsummary.overall_tst_visitedchildcount_cs;
                    $scope.overallsummary.overall_missedchildcount_cs = overallsummary.overall_tst_missedchildcount_cs;
                }


                $scope.gridOptions.totalItems = testDescriptionsResult.fulltests.length;

                var elementInstructionCoverage = [];
                var itemsPerPage = paginationOptions.pageSize;
                var startIdx = (paginationOptions.pageNumber - 1) * itemsPerPage;
                var endIdx = startIdx + itemsPerPage;
                var totalItems = $scope.gridOptions.totalItems;
                endIdx = endIdx < totalItems ? endIdx : totalItems;

                for (var index = startIdx; index < endIdx; index++) {
                    var elements = testDescriptionsResult.fulltests[index];
                    $.ajax({
                        url: data_location + "/eic_" + elements[2] + ".json",
                        async: false,
                        success: function (result) {
                            elementInstructionCoverage.push(result);
                        },
                        error: function (result) {
                            var errordata = "{";
                            errordata += "\"instruction\": {";
                            errordata += "\"statusText\": \"" + result.statusText + "\",";
                            errordata += "\"status\": " + result.status;
                            errordata += "}}";
                            elementInstructionCoverage.push(JSON.parse(errordata));
                        }
                    });
                }

               
                data = em$dataservice(elementInstructionCoverage);
                //var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
                //data = data.slice(firstRow, firstRow + paginationOptions.pageSize);
                $scope.gridOptions.data = [];
                writeoutNode(data, 0, id, $scope.gridOptions.data);
            };




            // Full Services Coverage Load
            var packageServiceCoverageData;
            $.ajax({
                url: data_location + "/packageServiceCoverageData.json",
                async: false,
                success: function (result) {
                    packageServiceCoverageData = result;
                    $scope.dataloaded = true;
                    
                },
                error: function (hr,status,error) {
                    $scope.dataloaded = false;
                }
            });

            
           

            var getServiceLevelViewPage = function () {
                svcsummary();

                {
                    $scope.overallsummary.title_cs = "Overall Services Coverage Summary";
                    $scope.overallsummary.coveragepercent_cs = overallsummary.overall_svc_coveragepercent_cs;
                    $scope.overallsummary.overall_coveragepercent = overallsummary.overall_svc_coveragepercent;
                    $scope.overallsummary.overall_childcount_cs = overallsummary.overall_svc_childcount_cs;
                    $scope.overallsummary.overall_visitedchildcount_cs = overallsummary.overall_svc_visitedchildcount_cs;
                    $scope.overallsummary.overall_missedchildcount_cs = overallsummary.overall_svc_missedchildcount_cs;

                    $scope.gridOptions.columnDefs[2].name = "Covered Services";
                    $scope.gridOptions.columnDefs[3].name = "Missed Services";
                    $scope.gridOptions.columnDefs[4].name = "Total Services";
                }


                $scope.gridOptions.totalItems = packageServiceCoverageData.Stats.instruction.SubInstruction.length;
                data = packageServiceCoverageData.Stats.instruction.SubInstruction;
                $scope.overallsummary.packagesfilter = data;

                var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
                data = data.slice(firstRow, firstRow + paginationOptions.pageSize);
                $scope.gridOptions.data = [];
                writeoutNode(data, 0, id, $scope.gridOptions.data);
            };



            var writeoutNode = function (childArray, currentLevel, id, dataArray) {
                childArray.forEach(function (childNode) {
                    childNode.instruction.$$treeLevel = currentLevel;
                    childNode.instruction.parentId = id;
                    childNode.instruction.id = Math.random();
                    dataArray.push(childNode.instruction);
                    var children = childNode.instruction.SubInstruction;
                    if (children != undefined && children.length > 0) {
                        writeoutNode(childNode.instruction.SubInstruction, currentLevel + 1, childNode.instruction.id, dataArray);
                    }
                });
            };


            $scope.overallsummary = overallsummary;
            if ($scope.dataloaded) {
                getPage();
            }

        }
    ]);


    app.controller('treeTable-datarouter-mock', [
        '$rootScope', '$scope', '$routeParams', 'uiGridConstants', 
        'mock$dataservice', 'td$dataservice', 'imageproviderservice',  'CommaFormatted', 
        '$interval', '$timeout',
        function (
            $rootScope, $scope, $routeParams, uiGridConstants, 
            mock$dataservice, td$dataservice, imageproviderservice, CommaFormatted, 
            $timeout, $interval) {

                $rootScope.pagecontext = "mockDetails";
                $scope.data_location = data_location;
                imageproviderservice($scope);

                $scope.gridOptions = {
                    enableSorting: false,
                    enableFiltering: false,
                    enableRowSelection: false,
                    allowCellFocus : true,
                    multiSelect: false,
                    enableRowHeaderSelection: false,
                    showTreeRowHeader: false,
                    showGridFooter: false,
                    showTreeExpandNoChildren: false,
                    useExternalPagination: true,
                    useExternalSorting: false,
                    paginationPageSizes: [5, 10, 25, 50, 100],
                    paginationPageSize: 10,
                    rowHeight: 25,
                    columnDefs: [
                        { name: 'Mock Event', width: '30%', field: '0', cellTemplate: '<mockelemdisplaytxt class="ui-grid-cell-contents" title="TOOLTIP" row-data = {{row.entity}}></mockelemdisplaytxt>' },
                        { name: 'Test Case', width: '30%', field: '1' },
                        { name: 'Test Result', width: '13%', field: '2' },
                        { name: 'Mock Scope', width: '13%', field: '4' },
                        { name: 'Mock Lifetime', width: '13%', field: '5' },
                    ],
                    
                };

                $scope.dataloaded = false;
                var overallsummary = {};

                // Mocked details Load
                var elementMockDetails;
                $.ajax({
                    url: data_location + "/mockedServicesData.json",
                    async: false,
                    success: function (result) {
                        elementMockDetails = result;
                        $scope.dataloaded = true;
                        
                    },
                    error: function (hr,status,error) {
                        $scope.dataloaded = false;
                    }
                });


                loadTestDescriptions($scope, td$dataservice);

                var getPage = function () {

                    var result = mock$dataservice(elementMockDetails);
                    $scope.gridOptions.data = result[0];
                    
                    {
                        $scope.overallsummary.title_cs = "Service Mocking Event Summary";
                        $scope.overallsummary.totalmockevent = result[0].length;
                        $scope.overallsummary.uniqueServiceNameCount = result[1].length;
                        $scope.overallsummary.flattentests = testDescriptionsResult.fulltests;
                        $scope.overallsummary.testSuites = testDescriptionsResult.data;

                        $scope.overallsummary.mocktype_pipeline_count = result[2].pipeline;
                        $scope.overallsummary.mocktype_exception_count= result[2].exception;
                        $scope.overallsummary.mocktype_service_count = result[2].service;
                        $scope.overallsummary.mocktype_factory_count = result[2].factory;
                    }


                }

                if ($scope.dataloaded) {
                    $scope.overallsummary = overallsummary;
                    getPage();
                }

            }
    ]);


    var loadTestDescriptions = function ($scope, td$dataservice) {
        if (testDescriptionsResult == undefined) {
            $.ajax({
                url: data_location + "/testDescriptions.json",
                async: false,
                success: function (result) {
                    testDescriptionsResult = result;
                    $scope.dataloaded = true;
                    
                },
                error: function (hr,status,error) {
                    $scope.dataloaded = false;
                }
            });
        }

        if (testDescriptionsResult != undefined) {
            testDescriptionsResult = td$dataservice(testDescriptionsResult);
        }
    };

}).call(this);