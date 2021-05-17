pipeline {
  agent any
  stages {
    stage('Setup') {
      parallel {
        stage('Setup') {
          steps {
            sh '''#!/bin/bash

export VERSION="0.0.0CI"
echo ---------------------------------------------------------------------------
echo Build Information
echo ---------------------------------------------------------------------------
echo "Working on : $JOB_NAME"
echo "Workspace  : $WORKSPACE" 
echo "Revision   : $SVN_REVISION"
echo "Build      : $BUILD_NUMBER"
echo "Deploy to  : $DEPLOY_TO"
echo ---------------------------------------------------------------------------
echo "GIT_COMMIT : $GIT_COMMIT" 
echo "GIT_BRANCH : $GIT_BRANCH"
echo ---------------------------------------------------------------------------
'''
            sh '''echo "Clean Microservice Containers"

docker stop orderservicems || true
docker stop productservicems || true
docker stop customerservicems || true

docker stop ordermg || true
docker stop productmg || true
docker stop customermg || true

echo "Clean Test Containers"


sleep 1

runningCount=`docker ps -a -q --filter ancestor=jmeter:latest | wc -l`

if [ $runningCount -gt 0 ]; then
   docker stop $(docker ps -a -q --filter ancestor=jmeter:latest --format="{{.ID}}") > /dev/nul
else
   echo "No Jmeter Containers running"
fi

echo "Clean Build Assets"
rm -rf target
rm -rf jmeter

mkdir ${WORKSPACE}/test-results

'''
          }
        }
        stage('Get Version Number') {
          steps {
            echo 'Get Version Number'
            load 'versionInput.groovy'
          }
        }
      }
    }
    stage('Quality Review') {
      steps {
        sh '''/home/ukdxp/GCS_IS_ContinuousCodeReview_v7.1.0/CodeReview.sh -Dcode.review.pkgname=APIWCustomer -Dcode.review.pkgprefix=APIW -Dcode.review.folder-prefix=com.softwareag -Dcode.review.directory=$WORKSPACE/ISPKG

cp APIWCustomer__CodeReviewReport__junit.xml ./test-results/'''
      }
    }
    stage('Build') {
      steps {
        echo 'Build Project'
        sh '''#Set version

if [[ -z "$VERSION" ]]; then
   VERSION=ci
fi

echo Version is: $VERSION


'''
        sh '''echo "Move Package and license for Docker Build"
mv ./ISPKG/ ./MSR-Image/
cp /home/ukdxp/msr-license/licenseKey.xml ./MSR-Image/'''
      }
    }
    stage('Containerize') {
      steps {
        sh '''#Containerize Microservice


pwd
cd MSR-Image
ls -al

docker build -t customerservice:$VERSION .
'''
      }
    }
    stage('Start MicroSvc') {
      steps {
        sh '''#Run the container read for testing

docker run --rm --name customerservicems -d -p 8090:5555 customerservice:$VERSION


#Are services operational
timeout 60 bash -c \'while [[ "$(curl -u Administrator:manage -s -o /dev/null -w \'\'%{http_code}\'\' localhost:8090/restv2/com.softwareag.customer.pub:customer/customer)" != "200" ]]; do sleep 5; done\' || false'''
      }
    }
    stage('Testing') {
      parallel {
        stage('Load Test') {
          steps {
            sh '''rm -rf jmeter
mkdir jmeter
mkdir jmeter/output
cp MSR-Image/ISPKG/APIWCustomer/resources/test/setup/loadtest.jmx jmeter/
docker run --rm --name jmeter --volume $WORKSPACE/jmeter/:/mnt/jmeter vmarrazzo/jmeter:latest -n -t /mnt/jmeter/loadtest.jmx -l /mnt/jmeter/result.jtl -j /mnt/jmeter/result.log -e -o /mnt/jmeter/output'''
          }
        }
        stage('Unit Test') {
          steps {
            sh '''#Unit Test Microservice
echo "Unit Test Microservice"
pwd
cd MSR-Image
cd ISPKG/APIWCustomer/resources/test/executor
ant -buildfile run-test-suites.xml


cp -r ./test/reports/ ${WORKSPACE}/test-results
'''
          }
        }
        stage('Interface Test') {
          steps {
            echo 'Test Microservice'
            sh '''#Test Microservice

curl http://apiworldbuild:8090/product/1
test=`curl -s -u Administrator:manage http://apiworldbuild:8090/restv2/com.softwareag.customer.pub:customer/customer | grep Pemberton | wc -l`


if [ $test -gt 0 ]; then
   echo "Test Passed"
else
   echo "Error in interface test for Micro Service"
   exit 1
fi'''
          }
        }
      }
    }
    stage('Register Images') {
      when {
        anyOf {
          branch 'staging'
          branch 'master'
        }

      }
      steps {
        sh '''#push image to registry

#First tag
docker tag customerservice:$VERSION apiworldref:5000/customerservice:$VERSION


#second push 
docker push apiworldref:5000/customerservice:$VERSION
'''
      }
    }
    stage('Release To Test') {
      agent {
        node {
          label 'RefEnv-root'
        }

      }
      when {
        anyOf {
          branch 'staging'
        }

      }
      steps {
        echo 'Release to test'
        sh '''#Release into staging

deployActive=`kubectl get deployments.apps | grep product-service-deployment | wc -l`


if [ $deployActive -gt 0 ]; then

   echo "Perform Rolling Update"
   #Do a rolling update
   kubectl set image deployment.v1.apps/product-service-deployment product-service=apiworldref:5000/productservice:$VERSION
   
   #Now wait for deploy
   kubectl rollout status deployment.v1.apps/product-service-deployment
else
   echo "NEW Deployment"
   #Inject the version                                            
   sed -i \'s/latest/$VERSION/g\' k8s-deployment.yml

   #Register the K8S deployment
   kubectl apply -f k8s-deployment.yml
   kubectl apply -f k8s-services.yml
fi



'''
      }
    }
    stage('Release To Production') {
      agent {
        node {
          label 'RefEnv-root'
        }

      }
      when {
        branch 'master'
      }
      steps {
        echo 'Release to Prod'
        sh '''#Release into production

deployActive=`kubectl get deployments.apps | grep customer-service-deployment | wc -l`


if [ $deployActive -gt 0 ]; then

   echo "Perform Rolling Update"
   #Do a rolling update
   kubectl set image deployment.v1.apps/customer-service-deployment customer-service=apiworldref:5000/customerservice:$VERSION
   
   #Now wait for deploy
   kubectl rollout status deployment.v1.apps/customer-service-deployment
else
   echo "NEW Deployment"
   #Inject the version                                            
   sed -i \'s/latest/$VERSION/g\' k8s-deployment.yml

   #Register the K8S deployment
   kubectl apply -f k8s-deployment.yml
   kubectl apply -f k8s-services.yml
fi



'''
      }
    }
    stage('Clean') {
      steps {
        sh '''#Tidy up after build

#Stop containers
#docker stop productmg


#Prune
docker image prune -f
docker volume prune -f


#current dir
pwd'''
      }
    }
  }
  post {
    always {
      perfReport(sourceDataFiles: 'jmeter/result.jtl', compareBuildPrevious: true, errorUnstableResponseTimeThreshold: '5000')
      archiveArtifacts(artifacts: 'jmeter/result.*', fingerprint: true)
      archiveArtifacts(artifacts: 'APIWCustomer__CodeReviewReport*.*', fingerprint: true)
      archiveArtifacts(artifacts: 'ISCCR.log', fingerprint: true)
      archiveArtifacts(artifacts: 'test-results/**/*.*', fingerprint: true)
      junit 'test-results/**/*.xml'

    }

  }
}