//input(message: 'Release Service?', id: 'release')
def userInput = true
def success = true
try {
    timeout(time: 15, unit: 'SECONDS') { // change to a convenient timeout for you
        userInput = input(
        id: 'Proceed1', message: 'Release Build?', parameters: [
        [$class: 'StringParameterDefinition', defaultValue: "0.0.0", description: '', name: 'Version Number']
        ])
    }
} catch(err) { // timeout reached or input false
    success = false
    echo err.toString();
    
}

node {
    if (success) {
        // do something on timeout
        echo "Deliver to environment"
    } else {
        // do something else
        echo "Finished - not deploying"
    } 
}