node {
    stage('Preparation') { 
        git 'https://github.com/varund29/employee-portal.git'
    }
    stage('Deploy-main') {
        bat 'del "F:\\jenkin_builds\\tata\\*.*" /s /q'
        bat 'del "F:\\jenkin_builds\\itc\\*.*" /s /q'
        bat 'del "F:\\jenkin_builds\\reliance\\*.*" /s /q'
        bat '''cd ..
            xcopy "%JOB_NAME%\\build" "F:\\jenkin_builds\\tata" /s/h/e/k/f/c
            xcopy "%JOB_NAME%\\build" "F:\\jenkin_builds\\itc" /s/h/e/k/f/c
            xcopy "%JOB_NAME%\\build" "F:\\jenkin_builds\\reliance" /s/h/e/k/f/c'''
    }
    stage('Deploy-ITC') { 
          build 'itc-build'
    } 
    stage('Deploy-TATA') { 
          build 'tata-build'
    }
     stage('Deploy-RELIANCE') { 
          build 'reliance-build'
    }

}
