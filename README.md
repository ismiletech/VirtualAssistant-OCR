
# VirtualAssitant-OCR<br>
### Recognize printed and handwritten text using Azure Cognitive Services<br>
* uses Google Cloud Storage for storing uploaded files, and uses Google Cloud Vision API to extract text from image files and pdfs.

### Instructions to run demo:<br>
1. Clone repo and cd into it
2. go to https://console.cloud.google.com/cloud-resource-manager and click on ```Create project```, create new project, then click on the navigation menu to the right, select ```API's & Services``` then ```Credentials```, click on ```Create credentials```, pick ```API key``` from the dropdown menu and follow the instructions provided.
3. a ```.json``` file should be downloaded to your local machine, now take that ```.json``` file and move it the root of your cloned folder.

4. go to the cloned repo, make a ```.env``` file in the root folder, and give it this key/value:
* ```GOOGLE_APPLICATION_CREDENTIALS``` Give it the value of the absolute path to your json file(which was downloaded to your local machine, see step 2 and 3) containing all your Google Cloud credentials
5. now run ```npm install``` in the terminal/command line
6. run ```npm start``` and go to ```http://localhost:3000```
