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
    stage('Build') {
      steps {
        echo 'Build Project'
        sh '''#Set version

if [[ -z "$VERSION" ]]; then
   VERSION=ci
fi

echo Version is: $VERSION


'''
        sh '''echo "Move Package for Docker Build"
mv ./ISPKG/ ./MSR-Image/
cp /home/ukdxp/msr-license/licenseKey.xml ./MSR-Image/'''
        sh '''#Modify Alias depending on stage

if [ $GIT_BRANCH = "staging" ]; then
   sudo sed -i \'s/\\[gateway\\]/apiworldref\\:5555/g\' $WORKSPACE/microgateway/config.yml
   sudo sed -i \'s/\\[microservice\\]/localhost\\:8090/g\' $WORKSPACE/microgateway/config.yml
   exit
fi

if [ $GIT_BRANCH = "master" ]; then
   sudo sed -i \'s/\\[gateway\\]/apiworldref\\:5555/g\' $WORKSPACE/microgateway/config.yml
   sudo sed -i \'s/\\[microservice\\]/localhost\\:8090/g\' $WORKSPACE/microgateway/config.yml   
   exit
fi

#Else assume its a development branch and set accordingly

sudo sed -i \'s/\\[gateway\\]/apiworldbuild\\:5555/g\' $WORKSPACE/microgateway/config.yml
sudo sed -i \'s/\\[microservice\\]/apiworldbuild\\:8090/g\' $WORKSPACE/microgateway/config.yml

'''
        sh '''#Build MicroGateway
cd /opt/softwareag/microgateway
./microgateway.sh createDockerFile --docker_dir . -p 9090 -a $WORKSPACE/microgateway/Customer.zip -dof ./Dockerfile -c $WORKSPACE/microgateway/config.yml'''
      }
    }
    stage('Containerize') {
      steps {
        sh '''#Containerize Microservice



cd MSR-Image

docker build -t customerservice:$VERSION .
'''
        sh '''#Containerize Microgateway
cd /opt/softwareag/microgateway
docker build -t customermg:$VERSION .
'''
      }
    }
    stage('Deployment') {
      parallel {
        stage('Start MicroSvc') {
          steps {
            sh '''#Run the container read for testing

docker run --rm --name customerservicems -d -p 8090:5555 customerservice:$VERSION
'''
          }
        }
        stage('Start MicroGW') {
          steps {
            sh '''#Run MicroGateway Container
docker run --rm --name customermg -d -p 9090:9090 --net=host customermg:$VERSION
'''
          }
        }
      }
    }
    stage('Test Operational') {
      parallel {
        stage('Test MicroSvc Operational') {
          steps {
            sh '''#Are services operational
timeout 60 bash -c \'while [[ "$(curl -u Administrator:manage -s -o /dev/null -w \'\'%{http_code}\'\' localhost:8090/restv2/com.softwareag.customer.pub:customer/customer)" != "200" ]]; do sleep 5; done\' || false
'''
          }
        }
        stage('Test MicroGW Operational') {
          steps {
            sh '''#Is MicroGW Operational
timeout 60 bash -c \'while [[ "$(curl -s -o /dev/null -w \'\'%{http_code}\'\' localhost:9090/gateway/Customer/1.0/customer)" != "200" ]]; do sleep 5; done\' || false'''
          }
        }
      }
    }
    stage('Testing') {
      parallel {
        stage('Load Test') {
          steps {
            sh '''exit 0
rm -rf jmeter
mkdir jmeter
mkdir jmeter/output
cp src/main/loadtest.jmx jmeter/
docker run --rm --name jmeter --volume $WORKSPACE/jmeter/:/mnt/jmeter vmarrazzo/jmeter:latest -n -t /mnt/jmeter/loadtest.jmx -l /mnt/jmeter/result.jtl -j /mnt/jmeter/result.log -e -o /mnt/jmeter/output'''
            perfReport(sourceDataFiles: 'jmeter/result.jtl', compareBuildPrevious: true, errorUnstableResponseTimeThreshold: '5000')
          }
        }
        stage('Unit Test') {
          steps {
            sh '''#Unit Test Microservice
exit 0
echo "Unit Test Microservice"
docker run --rm --name service-maven -v "$PWD":/usr/share/mymaven -v "$HOME/.m2":/root/.m2 -v "$PWD"/target:/usr/share/mymaven/target -w /usr/share/mymaven maven:3.6-jdk-8 mvn test'''
          }
        }
        stage('Interface Test') {
          steps {
            echo 'Test Microservice'
            sh '''#Test Microservice
exit 0
curl http://apiworldbuild:8090/product/1
test=`curl -s http://apiworldbuild:8090/product/1 | grep foo | wc -l`


if [ $test -gt 0 ]; then
   echo "Test Passed"
else
   echo "Error in interface test for MicroService"
   exit 1
fi'''
            echo 'Test Gateway'
            sh '''#Test Gateway
exit 0
test=`curl -s http://apiworldbuild:9090/gateway/Product/1.0/product/1 | grep foo | wc -l`


if [ $test -gt 0 ]; then
   echo "Test Passed"
else
   echo "Error in interface test for MicroGateway"
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
docker tag productservice:$VERSION apiworldref:5000/productservice:$VERSION
docker tag productmg:$VERSION apiworldref:5000/productmg:$VERSION

#second push 
docker push apiworldref:5000/productservice:$VERSION
docker push apiworldref:5000/productmg:$VERSION'''
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
   kubectl set image deployment.v1.apps/product-service-deployment product-service-sidecar=apiworldref:5000/productmg:$VERSION
   
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

deployActive=`kubectl get deployments.apps | grep product-service-deployment | wc -l`


if [ $deployActive -gt 0 ]; then

   echo "Perform Rolling Update"
   #Do a rolling update
   kubectl set image deployment.v1.apps/product-service-deployment product-service=apiworldref:5000/productservice:$VERSION
   kubectl set image deployment.v1.apps/product-service-deployment product-service-sidecar=apiworldref:5000/productmg:$VERSION
   
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
    stage('Clean') {
      steps {
        sh '''#Tidy up after build

#Stop containers
#docker stop productmg
#docker stop productservicems

#Prune
docker image prune -f
docker volume prune -f

'''
      }
    }
    stage('Quality Review') {
      steps {
        sh '/home/ukdxp/GCS_IS_ContinuousCodeReview_v7.1.0/CodeReview.sh -Dcode.review.pkgname=SAGCustomerData -Dcode.review.pkgprefix=SAG -Dcode.review.folder-prefix=com.softwareag -Dcode.review.directory=$WORKSPACE/ISPKG'
      }
    }
  }
  post {
    always {
      junit 'target/surefire-reports/**/*.xml'
      perfReport(sourceDataFiles: 'jmeter/result.jtl', compareBuildPrevious: true, errorUnstableResponseTimeThreshold: '5000')
      archiveArtifacts(artifacts: 'jmeter/result.*', fingerprint: true)

    }

  }
}