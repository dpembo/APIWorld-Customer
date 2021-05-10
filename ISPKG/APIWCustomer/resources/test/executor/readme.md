# webMethods Unit Test Framework Test Executor


For continuous integration you can invoke headless tests through Test Suite Executor build script. The ant script can be driven by specifying necessary property details through properties file or through any supported jvm-arguments. 

WmTestSuite Code coverage tests can be invoked in headless mode through ant target "composite-runner-all-tests". This target is recommended for regular test execution as well.

## Getting Started

```
Creating a Test Suite Executor
```
Software AG Designer allows you to create Test Suite executor projects and execute tests in headless mode.
Perform the following steps to create a sample test suite executor using the default files.
1. Select File>New> Test Suite Executor.
2. On the Test Suite Executor Project screen, enter the project name, folder path that contains the test suite setup files, and the file system. You can choose to use the default values.
3. Click Finish.
Project contains default Ant build targets and properties to drive the tests.


### Prerequisites

```
Setting up Properties for Target Server Definition and Project locations
```

For Continuous Integration or headless executions, specify the following property values as Ant properties or jvm arguments to drive your tests from specified project locations in any target server location and with user defined preferences.



```
Example: Sample Test Suite Executor Properties file:
```

### Integration Server definition

##### Specifies the Integration Server host name. For example: localhost, 27.0.0.1
webMethods.integrationServer.name=localhost

##### Specifies the Integration Server port. For example: 5555
webMethods.integrationServer.port=5555

##### Specifies the Integration Server user name. For example: Administrator, Developer
webMethods.integrationServer.userid=Administrator

##### Specifies the Integration Server user password. For example: manage
webMethods.integrationServer.password=manage

##### Specifies the Integration Server port uses SSL connection or normal. For example: false or true
webMethods.integrationServer.ssl=false




### Installation Location

##### Specifies the product installation location. For example: C\:\\SoftwareAG
webMethods.home=C\:\\SoftwareAG


### Absolute paths of Project locations.

##### Specifies multiple project locations (absolute directory path) in $AbsoluteProjectLocation1,$AbsoluteProjectLocation2,$AbsoluteProjectLocation3 format. In this case, Test Suite Executor searches for all available and valid WmTestSuite files in these directories.
webMethods.test.setup.location=\
C:/SoftwareAG/IntegrationServer/instances/default/packages/SampleTestSuite,\
C:/_gitRepo/packages/SampleTestSuite1.

##### It executes specific and multiple WmTestSuite files by specifying it in the following format:$AbsoluteProjectLocation1;$RelativeTestSuitePath1,$AbsoluteProjectLocation2;$RelativeTestSuitePath2.
webMethods.test.setup.location=\
C:/SoftwareAG/IntegrationServer/instances/default/packages/SampleTestSuite;resources/test/setup/wmTestSuite.xml,\
C:/_gitRepo/packages/SampleTestSuite1;resources/test/setup/wmTestSuite.xml

##### Specifies the relative paths within the projects where required classes or jar files are expected to be in Test Executor build-classpath. For example, when third-party libraries or Mockfactory classes are referred from the Tests, specify the locations where these are stored at, so that executor can load these dependencies during headless tests. Append the default comma separated list if required.
webMethods.test.setup.external.classpath.layout=resources/test/classes,resources/java/classes,resources/test/jars,resources/java/jars,resources/jars

##### The absolute path where the reports are stored.
webMethods.test.profile.result.location=C\:/git_sources/GitRepo3/WmTestSuiteExecutor/test/reports/



##### Sets to Coverage to generate coverage report. Set to None for regular test execution.
webMethods.test.setup.profile.mode=COVERAGE

##### Specifies the list of comma separated target Integration Server package names. This Defines the full scope for the coverage analysis and percentage calculation.
webMethods.test.scope.packages=\
SampleTestSuite,\
SampleTestSuite1






## License

Copyright (c) 2017-2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors. Use, reproduction, transfer, publication or disclosure is prohibited except as specifically provided for in your License Agreement with Software AG.