set username=Administrator
set password=manage
set url=http://localhost:5555
set apiID=b4032c81-7aee-4d06-b5c7-a3bb92e19c33
set file=.\microgateway\Customer.zip

curl -u %username%:%password% %url%/rest/apigateway/archive?apis=%apiID% --output %file%