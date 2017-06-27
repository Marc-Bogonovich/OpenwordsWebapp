myNg.controller("CourseEditControl",function($scope,$http){$scope.courseContentChanged=[false];$scope.addLesson=function(){myApp.popup(".popup-choose-lesson");$scope.courseContentChanged[0]=true};var chosenLesson=null;var lessonArray=null;var actionButtons=[{text:"Move up",onClick:function(){if(chosenLesson>0){var les=lessonArray[chosenLesson];var itemGoDown=lessonArray[chosenLesson-1];lessonArray[chosenLesson-1]=les;lessonArray[chosenLesson]=itemGoDown;$scope.$apply();$scope.courseContentChanged[0]=true}}},{text:"Move down",onClick:function(){if(chosenLesson<lessonArray.length-1){var les=lessonArray[chosenLesson];var itemGoUp=lessonArray[chosenLesson+1];lessonArray[chosenLesson+1]=les;lessonArray[chosenLesson]=itemGoUp;$scope.$apply();$scope.courseContentChanged[0]=true}}},{text:"Remove",color:"red",onClick:function(){lessonArray.splice(chosenLesson,1);$scope.$apply();$scope.courseContentChanged[0]=true}},{text:"Cancel"}];$scope.lessonAction=function(index,array){chosenLesson=index;lessonArray=array;myApp.actions(actionButtons)}});myNg.controller("CourseListControl",function($scope,$http){$scope.listCourses=function(page,done){$scope.rootAllCourse.page=page;listCourse($scope.rootAllCourse,$http,function(list){if(done){done()}})};$scope.learnCourse=function(c){getScope("CourseProgressControl").setCourse(c);mainView.router.load({pageName:"course_progress"})}});myNg.controller("CourseManagerControl",function($scope,$http){$scope.createCourse=function(){myApp.prompt("Please enter a name for the course","Creating Course",function(v){var name=v;myApp.prompt("Please enter a simple description for the course","Creating Course",function(v){var comment=v;$http({url:"createCourse",method:"get",params:{name:name,userName:userInfo.username,comment:comment}}).then(function(res){var r=res.data;if(!r.errorMessage){myApp.alert(null,"Success");$scope.listMyCourses(1)}else{myApp.alert(null,"Fail")}})})})};$scope.listMyCourses=function(page){$scope.rootMyCourseList.page=page;listCourse($scope.rootMyCourseList,$http)};var chosenCourse;var actionButtons=[{text:"Edit",onClick:function(){$http({url:"getCourseLessons",method:"get",params:{makeTime:chosenCourse.makeTime}}).then(function(res){var r=res.data;if(!r.errorMessage){var copy=JSON.parse(angular.toJson(chosenCourse));copy.json.lessons=r.result;$scope.rootTargetCourse.target=copy;mainView.router.load({pageName:"course_edit"});getScope("CourseEditControl").courseContentChanged[0]=false}})}},{text:"Delete",color:"red",onClick:function(){myApp.confirm('Are you sure to delete Course "'+chosenCourse.name+'"?',"Deleting Course",function(){$http({url:"deleteCourse",method:"get",params:{makeTime:chosenCourse.makeTime}}).then(function(res){var r=res.data;if(!r.errorMessage){$scope.listMyCourses(1);myApp.alert(null,"Course deleted")}})})}},{text:"Cancel"}];$scope.courseAction=function(c){chosenCourse=c;myApp.actions(actionButtons)}});myNg.controller("CourseProgressControl",function($scope,$http){$scope.setCourse=function(c){$scope.canSync=false;$scope.course=null;myApp.showPreloader("Checking progress...");$http({url:"copyCourse",method:"get",params:{makeTime:c.makeTime,authorId:c.authorId}}).then(function(res){myApp.hidePreloader();var r=res.data;if(r.errorMessage){myApp.alert(null,"Cannot load course");return}$scope.course=r.result;$scope.canSync=r.canSync})};$scope.syncCourse=function(){myApp.confirm("You can sync this course to the newest version that the course author has made. But please note that this will erase the entire progress of this course you made so far, want to continue?","Syncing Course",function(){myApp.showPreloader("Syncing course...");$http({url:"syncCourse",method:"get",params:{makeTime:$scope.course.makeTime,authorId:$scope.course.authorId}}).then(function(res){myApp.hidePreloader();var r=res.data;if(r.errorMessage){myApp.alert(null,"Cannot sync course");return}$scope.course.json=r.result.json;$scope.course.updated=r.result.updated;$scope.canSync=false})})};$scope.learnLesson=function(les){stepRe=true;STEPS=les.json.steps;if(!STEPS[STEPS.length-1].final){STEPS.push({final:true})}var StepsControl=getScope("StepsControl");StepsControl.lesson=les;StepsControl.mode="exam";StepsControl.studyState.reachFinal=false;$$("#back_button_in_steps").once("click",function(){stepOn=false;mainView.router.load({pageName:"course_progress"})});mainView.router.load({pageName:"steps"});stepOn=true};$scope.forfeitCourse=function(){myApp.confirm("Are you sure to forfeit this course? Study progress will be discarded.","Forfeit Course",function(){$http({url:"deleteCourse",method:"get",params:{makeTime:$scope.course.makeTime,authorId:$scope.course.authorId}}).then(function(res){var r=res.data;if(!r.errorMessage){myApp.alert(null,"Course progress deleted");getScope("CourseListControl").listCourses(1);mainView.router.load({pageName:"course_list"})}})})}});myNg.controller("CourseStudyControl",function($scope,$http){$scope.listMyStudy=function(page){$scope.rootMyStudyList.page=page;listCourse($scope.rootMyStudyList,$http,function(list){list.forEach(function(c){if(c.json.totalLesson&&c.json.totalLessonRight){c.json.progress=(c.json.totalLessonRight/c.json.totalLesson*100).toFixed(0)}})})};$scope.courseAction=function(c){getScope("CourseProgressControl").setCourse(c);mainView.router.load({pageName:"course_progress"})}});myNg.controller("LessonManagerControl",function($scope,$http,FileUploader){var uploader=$scope.uploader=new FileUploader({url:"uploadLesson",queueLimit:1});var name;$scope.doUpload=function(){myApp.prompt("Please enter a name for the lesson","Uploading Lesson",function(v){name=v;if(name){uploader.uploadAll()}else{myApp.alert(null,"You've provided invalid information")}})};uploader.onBeforeUploadItem=function(item){item.formData.push({name:name})};uploader.onSuccessItem=function(fileItem,response,status,headers){uploader.clearQueue();myApp.alert(null,"Upload success");$scope.listMyLessons(1)};uploader.onErrorItem=function(fileItem,response,status,headers){var m="";if(status===901){m="Lessons cannot have the same name"}myApp.alert(m,"Upload fail")};$scope.listMyLessons=function(page){$scope.rootMyLessonList.page=page;listLesson($scope.rootMyLessonList,$http)};var chosenLesson=null;var actionButtons=[{text:"Preview",onClick:function(){STEPS=chosenLesson.json.steps;var StepsControl=getScope("StepsControl");StepsControl.lesson=chosenLesson;StepsControl.mode="preview";$$("#back_button_in_steps").once("click",function(){stepOn=false;mainView.router.load({pageName:"lesson_manager"})});mainView.router.load({pageName:"steps"});stepOn=true}},{text:"Immediate Feedback Mode",onClick:function(){$http({url:"changeLessonMode",method:"get",params:{name:chosenLesson.name,imf:true}}).then(function(res){var r=res.data;if(!r.errorMessage){chosenLesson.imf=true}})}},{text:"End Feedback Mode",onClick:function(){chosenLesson.imf=false;$http({url:"changeLessonMode",method:"get",params:{name:chosenLesson.name,imf:false}}).then(function(res){var r=res.data;if(!r.errorMessage){chosenLesson.imf=false}})}},{text:"Delete",color:"red",onClick:function(){myApp.confirm('Are you sure to delete Lesson "'+chosenLesson.name+'"?',"Deleting Lesson",function(){$http({url:"deleteLesson",method:"get",params:{name:chosenLesson.name}}).then(function(res){var r=res.data;if(!r.errorMessage){$scope.listMyLessons(1);myApp.alert(null,"Lesson deleted")}})})}},{text:"Cancel"}];$scope.lessonAction=function(le){chosenLesson=le;myApp.actions(actionButtons)}});myNg.controller("LoginControl",function($scope,$http){$scope.full=function(){var elem=document.getElementById("RootControl");if(elem.requestFullscreen){elem.requestFullscreen()}else if(elem.msRequestFullscreen){elem.msRequestFullscreen()}else if(elem.mozRequestFullScreen){elem.mozRequestFullScreen()}else if(elem.webkitRequestFullscreen){elem.webkitRequestFullscreen()}};$scope.login=function(){var loginData=myApp.formToJSON("#my-login-form");var loginOk=false;myApp.showPreloader("Connecting to Openwords...");$http({url:"loginUser",method:"get",params:{username:loginData.username,password:loginData.pass}}).then(function(res){loginOk=true;myApp.hidePreloader();var r=res.data;userInfo={username:loginData.username};if(!r.errorMessage){var CourseManagerControl=getScope("CourseManagerControl");CourseManagerControl.listMyCourses(1);var LessonManagerControl=getScope("LessonManagerControl");LessonManagerControl.listMyLessons(1);var CourseListControl=getScope("CourseListControl");CourseListControl.listCourses(1,function(){$http({url:"getMyProgress",method:"get",params:{recent:true}}).then(function(res){var r=res.data;if(r.result.length!==0){$scope.rootAllCourse.list.unshift(r.result[0]);var i=Math.floor(Math.random()*9)+1;$scope.rootAllCourse.list[0].fileCover="img/test"+i+".jpg";$scope.rootAllCourse.list[0].json.recent=true}mainView.router.load({pageName:"course_list"})})})}else{myApp.alert(r.errorMessage,"Login fail")}});setTimeout(function(){myApp.hidePreloader();if(!loginOk){myApp.alert("No response from server","Error")}},1e4)}});myNg.controller("RegistrationControl",function($scope,$http){$scope.regInfo={};$scope.doReg=function(){if($scope.regInfo.pass!==$scope.regInfo.repass){myApp.alert(null,"Your passwords do not match");return}var regOk=false;myApp.showPreloader("Please wait...");setTimeout(function(){myApp.hidePreloader();if(!regOk){myApp.alert("No response from server","Error")}},15e3);$http({url:"addUser",method:"get",params:{username:$scope.regInfo.username,password:$scope.regInfo.pass,email:$scope.regInfo.email}}).then(function(res){regOk=true;myApp.hidePreloader();var r=res.data;if(!r.errorMessage){myApp.alert(null,"Account created");mainView.router.load({pageName:"index"})}else{myApp.alert(r.errorMessage,"Registration fail")}})};$scope.canSubmit=function(){if(!$scope.regInfo.username){return false}if(!$scope.regInfo.pass){return false}if(!$scope.regInfo.email){return false}return true}});myNg.controller("RootControl",function($scope,$http,$httpParamSerializerJQLike){$scope.logOut=function(){$http({url:"logoutUser",method:"get"});mainView.router.load({pageName:"index"});myApp.alert("Don't forget to add this web app to your phone's home screen!","See you^_^")};$scope.rootMyLessonList={page:1,pageSize:1e4};$scope.rootMyCourseList={page:1,pageSize:1e4,my:true};$scope.rootAllCourse={page:1,pageSize:1e4,all:true};$scope.rootMyStudyList={page:1,pageSize:1e4,user:true};$scope.rootSoundManager={item:null};$scope.goToCourseStudy=function(){getScope("CourseStudyControl").listMyStudy(1);mainView.router.load({pageName:"course_study"})};$scope.refreshCourseList=function(){listCourse($scope.rootAllCourse,$http)};$scope.rootTargetCourse={target:null};$scope.addLessonFromPool=function(les){if($scope.rootTargetCourse.target){$scope.rootTargetCourse.target.json.lessons.push(JSON.parse(angular.toJson(les)))}};$scope.saveCourse=function(){if(!$scope.rootTargetCourse.target.name){myApp.alert(null,"Course must have a name!");return}$scope.rootTargetCourse.target.content=angular.toJson($scope.rootTargetCourse.target.json);$scope.rootTargetCourse.target.json=null;$http({url:"saveCourse",method:"post",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},data:$httpParamSerializerJQLike({course:angular.toJson($scope.rootTargetCourse.target)})}).then(function(res){if(res.data.errorMessage){myApp.alert(null,"Save failed")}else{myApp.alert(null,"Save successful");$scope.rootTargetCourse.target=null;getScope("CourseManagerControl").listMyCourses(1);getScope("CourseListControl").listCourses(1);mainView.router.load({pageName:"course_manager"})}})};$scope.goToLessonManager=function(){mainView.router.load({pageName:"lesson_manager"})};$scope.backFromCourseEdit=function(){var CourseEditControl=getScope("CourseEditControl");if(CourseEditControl.courseContentChanged[0]){myApp.alert(null,"Don't forget to save your intended changes");CourseEditControl.courseContentChanged[0]=false;return}mainView.router.load({pageName:"course_manager"})}});myNg.controller("SoundManagerControl",function($scope,$http,FileUploader,$httpParamSerializerJQLike){function getBuffers(event){var buffers=[];for(var ch=0;ch<2;++ch)buffers[ch]=event.inputBuffer.getChannelData(ch);return buffers}var audioContext,microphone,input,processor,defaultBufferSize,worker,blob;$scope.recording=false;function setup(){navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia;if(navigator.getUserMedia){console.log("getUserMedia supported");audioContext=new AudioContext;if(audioContext.createScriptProcessor===null){audioContext.createScriptProcessor=audioContext.createJavaScriptNode}defaultBufferSize=audioContext.createScriptProcessor(undefined,2,2).bufferSize;console.log("defaultBufferSize: "+defaultBufferSize);input=audioContext.createGain();input.gain.value=1;worker=new Worker("ng/dist/EncoderWorker.js");worker.onmessage=function(event){blob=event.data.blob;var node=document.getElementById("sound_controls");var audioURL=window.URL.createObjectURL(blob);var audio=document.createElement("audio");audio.setAttribute("controls","");audio.setAttribute("style","width: 100%;");audio.src=audioURL;node.appendChild(audio);$scope.canUpload=true;$scope.$apply()};var onSuccess=function(stream){microphone=audioContext.createMediaStreamSource(stream);microphone.connect(input);visualize(stream);$scope.ok=true;$scope.recording=false;$scope.canUpload=false;$scope.$apply()};var onError=function(error){console.log(error);myApp.alert(null,"Audio Error")};navigator.getUserMedia({audio:true},onSuccess,onError)}else{myApp.alert("Please update your browser to its newest version or change a browser","Web Audio API not supported")}}function clearSoundDemo(){var node=document.getElementById("sound_controls");while(node.hasChildNodes()){node.removeChild(node.lastChild)}}$scope.setup=function(){setup();clearSoundDemo();if($scope.rootSoundManager.soundValid){listSound($scope.soundList,$http,null,function(list){list.forEach(function(item){if(item.file===$scope.rootSoundManager.soundFile){item.use=true}})})}};$scope.startRecording=function(){clearSoundDemo();$scope.recording=true;$scope.canUpload=false;processor=audioContext.createScriptProcessor(defaultBufferSize,2,2);processor.onaudioprocess=function(event){worker.postMessage({command:"record",buffers:getBuffers(event)})};input.connect(processor);processor.connect(audioContext.destination);worker.postMessage({command:"start",sampleRate:audioContext.sampleRate,bitRate:128})};$scope.stopRecording=function(finish){input.disconnect();processor.disconnect();worker.postMessage({command:finish?"finish":"cancel"});$scope.recording=false};$scope.soundList={};$scope.uploadRecording=function(){var uploader=new FileUploader({url:"uploadSound",queueLimit:1});uploader.onBeforeUploadItem=function(item){item.formData.push({text:$scope.rootSoundManager.item.text[0]});item.formData.push({type:"mp3"})};uploader.onSuccessItem=function(fileItem,response,status,headers){var fileName=response.trim();updateLessonContentForItemSound($scope,fileName,function(res){if(res.data.errorMessage){myApp.alert(null,"Upload Fail");return}myApp.alert(null,"Upload Success");listSound($scope.soundList,$http,null,function(list){list[0].use=true})})};uploader.onErrorItem=function(fileItem,response,status,headers){myApp.alert(null,"Upload Fail")};uploader.addToQueue(blob);uploader.uploadAll()};$scope.pickSound=function(sound,index){$scope.soundList.currentSound=sound;$scope.soundList.index=index;myApp.actions(soundActionButtons)};var soundActionButtons=[{text:"Play",onClick:function(){var sound=new Howl({src:["getSound?userId="+$scope.soundList.currentSound.userId+"&fileName="+$scope.soundList.currentSound.file],format:["mp3"],onloaderror:function(id,error){console.log(id);console.log(error);myApp.alert(null,"Cannot play audio")}});sound.play()}},{text:"Use this sound",onClick:function(){$scope.soundList.list.forEach(function(item){if(item.updated===$scope.soundList.currentSound.updated){item.use=true;updateLessonContentForItemSound($scope,item.file,function(res){if(res.data.errorMessage){myApp.alert(null,"Update Fail");return}})}else{delete item.use}});$scope.$apply()}},{text:"Delete",color:"red",onClick:function(){$http({url:"deleteSound",method:"get",params:{time:$scope.soundList.currentSound.updated}}).then(function(res){var r=res.data;if(!r.errorMessage){$scope.soundList.list.splice($scope.soundList.index,1)}else{myApp.alert(null,"Delete fail")}})}},{text:"Cancel"}];function updateLessonContentForItemSound($scope,newSoundFileName,done){if(!$scope.rootSoundManager.item.attach){$scope.rootSoundManager.item.attach=[[{type:"sound-out"}]]}$scope.rootSoundManager.item.attach[0].forEach(function(attach){if(attach.type==="sound-out"){attach.url="openwords://user/"+newSoundFileName}});var StepsControl=getScope("StepsControl");$http({url:"updateLessonContent",method:"post",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},data:$httpParamSerializerJQLike({name:StepsControl.lesson.name,content:angular.toJson(StepsControl.lesson.json)})}).then(function(res){if(done){done(res)}})}function visualize(stream){var audioCtx=new(window.AudioContext||webkitAudioContext);var canvas=document.getElementById("visualizer");var canvasCtx=canvas.getContext("2d");var source=audioCtx.createMediaStreamSource(stream);var analyser=audioCtx.createAnalyser();analyser.fftSize=2048;var bufferLength=analyser.frequencyBinCount;var dataArray=new Uint8Array(bufferLength);source.connect(analyser);var WIDTH=canvas.width;var HEIGHT=canvas.height;draw();function draw(){requestAnimationFrame(draw);analyser.getByteTimeDomainData(dataArray);canvasCtx.fillStyle="rgb(200, 200, 200)";canvasCtx.fillRect(0,0,WIDTH,HEIGHT);canvasCtx.lineWidth=2;canvasCtx.strokeStyle="rgb(0, 0, 0)";canvasCtx.beginPath();var sliceWidth=WIDTH*1/bufferLength;var x=0;for(var i=0;i<bufferLength;i++){var v=dataArray[i]/128;var y=v*HEIGHT/2;if(i===0){canvasCtx.moveTo(x,y)}else{canvasCtx.lineTo(x,y)}x+=sliceWidth}canvasCtx.lineTo(canvas.width,canvas.height/2);canvasCtx.stroke()}}});myNg.controller("StepsControl",function($scope,$http,$httpParamSerializerJQLike){$scope.lesson=null;$scope.mode=null;$scope.studyState={reachFinal:false};$scope.saveStudyState=function(course){$scope.studyState.reachFinal=true;course.json.learnTime=(new Date).getTime();var totalRight=0;course.json.lessons.forEach(function(les){if(les.ok){totalRight+=1}});course.json.totalLessonRight=totalRight;course.json.totalLesson=course.json.lessons.length;course.content=angular.toJson(course.json);$http({url:"saveCourseProgress",method:"post",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},data:$httpParamSerializerJQLike({course:angular.toJson(course)})}).then(function(res){$scope.studyState.reachFinal=true;course.content=null;if(res.data.errorMessage){myApp.alert(null,res.data.errorMessage)}})}});myNg.controller("StepPageControl",function($scope,$http,$httpParamSerializerJQLike){$scope.myIndex;$scope.step;$scope.answerPool=[];var soundActionButtons=[{text:"Record new sound",onClick:function(){stepRe=false;mainView.router.load({pageName:"sound_manager"});getScope("SoundManagerControl").setup()}},{text:"Play sound",soundUrl:"hi",onClick:function(){var sound=new Howl({src:[this.soundUrl],format:["mp3"],onloaderror:function(){myApp.alert(null,"Cannot play audio")}});sound.play()}},{text:"Cancel"}];$scope.proSoundOut=function(item){$scope.rootSoundManager.item=item;var thisActions=[];var hasSound=false;if(item.attach){var i;for(i=0;i<item.attach[0].length;i++){if(item.attach[0][i].type==="sound-out"){if(item.attach[0][i].url){var uri=new URI(item.attach[0][i].url);var segs=uri.segment();var nurl="getSound?userId="+segs[0]+"&fileName="+segs[1];soundActionButtons[1].soundUrl=nurl;hasSound=true;$scope.rootSoundManager.soundValid=true;$scope.rootSoundManager.soundFile=segs[1];if($scope.mode==="exam"){var sound=new Howl({src:[nurl],format:["mp3"],onloaderror:function(){myApp.alert(null,"Cannot play audio")}});sound.play()}break}}}}if($scope.mode==="preview"){thisActions.push(soundActionButtons[0]);if(hasSound){thisActions.push(soundActionButtons[1])}thisActions.push(soundActionButtons[2]);myApp.actions(thisActions)}};$scope.hasProSoundOut=function(item){if(item.attach){var i;for(i=0;i<item.attach[0].length;i++){if(item.attach[0][i].type==="sound-out"){return true}}return false}return false};$scope.init=function(index){$scope.myIndex=index;$scope.step=STEPS[index];if(!$scope.step.final){var noAnswer=true;$scope.step.lines.forEach(function(line){line.forEach(function(item){if(item.type==="ans"){noAnswer=false;item.text.forEach(function(answer){$scope.answerPool.push({type:"ans",text:answer})})}})});if(noAnswer){$scope.step.check=true}$scope.step.marplots.forEach(function(group){group.text.forEach(function(mar){$scope.answerPool.push({type:"mar",text:mar})})});if($scope.mode==="exam"){shuffle($scope.answerPool)}}else{$scope.steps=STEPS}};function removeAnswerFromPool(a){for(var i=0;i<$scope.answerPool.length;i++){if($scope.answerPool[i]===a){$scope.answerPool.splice(i,1)}}}$scope.pickAnswer=function(a){var found=false;var allOk=true;$scope.step.lines.forEach(function(line){line.forEach(function(item){if(item.type==="ans"){if(!item.userInput&&!found){found=true;item.userInput=a.text;removeAnswerFromPool(a)}item.ok=checkAnswerText(item.text,item.userInput);if(!item.ok){allOk=false}}})});$scope.step.check=allOk;$scope.lesson.ok=checkLesson(STEPS)};function checkAnswerText(all,incoming){for(var i=0;i<all.length;i++){if(all[i]===incoming){return true}}return false}$scope.removeInput=function(item){$scope.answerPool.push({text:item.userInput});item.userInput=null;$scope.step.check=false;$scope.lesson.ok=false};$scope.slideTo=function(index){stepsUI.slideTo(index)};$scope.lessonComment={done:false};$scope.sendComment=function(){if(!$scope.lessonComment.text){myApp.alert(null,"Please say something");return}$scope.lessonComment.done=true;var pack=JSON.parse(angular.toJson($scope.lesson));delete pack.content;delete pack.json;delete pack.langOne;delete pack.langTwo;delete pack.ok;pack.comment=$scope.lessonComment.text;$scope.lessonComment.content=angular.toJson(pack);$http({url:"postComment",method:"post",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},data:$httpParamSerializerJQLike({comment:angular.toJson($scope.lessonComment)})}).then(function(res){if(res.data.errorMessage){myApp.alert(null,res.data.errorMessage)}else{myApp.alert(null,"Comment Sent")}})}});function listCourse(pack,http,done){pack.canLookAfter=false;http({url:"listCourse",method:"get",params:{pageNumber:pack.page,pageSize:pack.pageSize,authorId:pack.authorId,my:pack.my,user:pack.user,all:pack.all}}).then(function(res){var r=res.data;if(r.errorMessage){console.error(r.errorMessage);return}if(r.result.length===0){pack.list=null;return}if(r.result.length>pack.pageSize){pack.canLookAfter=true;r.result.pop()}pack.list=r.result;pack.list.forEach(function(c){var i=Math.floor(Math.random()*9)+1;c.fileCover="img/test"+i+".jpg"});if(done){done(pack.list)}})}function listLesson(pack,http){pack.canLookAfter=false;http({url:"listLesson",method:"get",params:{pageNumber:pack.page,pageSize:pack.pageSize}}).then(function(res){var r=res.data;if(r.errorMessage){console.error(r.errorMessage);return}if(r.result.length===0){pack.list=null;return}if(r.result.length>pack.pageSize){pack.canLookAfter=true;r.result.pop()}pack.list=r.result})}function listSound(pack,http,error,done){http({url:"listSound",method:"get"}).then(function(res){var r=res.data;if(r.errorMessage){if(error){error(r.errorMessage)}return}pack.list=r.result;if(done){done(pack.list)}})}