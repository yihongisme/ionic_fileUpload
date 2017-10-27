import { Component } from '@angular/core';
import { Platform, ActionSheetController,LoadingController,ToastController } from 'ionic-angular';


import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FileChooser } from '@ionic-native/file-chooser';
import { FileOpener } from '@ionic-native/file-opener';


declare let cordova;     //此处声明cordova


@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public storageDirectory;
    public fileName;
	constructor(
        public plt: Platform,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,,
        private transfer: FileTransfer,
        private fileChooser: FileChooser,
        private fileOpener: FileOpener,
        private file:File,
    ){

        //判断安卓或者ios，系统路径不同
		this.plt.ready().then(() => {
			// make sure this is on a device, not an emulation (e.g. chrome tools device mode)
			if(!this.plt.is('cordova')) {
			  return false;
			}
			
			if (this.plt.is('ios')) {
			  this.storageDirectory = this.file.documentsDirectory;
			}
			else if(this.plt.is('android')) {
			  this.storageDirectory = this.file.externalRootDirectory;
			}
			else {
			  // exit otherwise, but you could add further types here e.g. Windows
			  return false;
			}
          });
          

    }








//文件上传
upload(){

	//判断是否ios
	if (this.plt.is('ios')) {
		// This will only print when on iOS
		console.log('I am an iOS device!');
		this.iosUploading();
 }

	//判断是安卓
	if (this.plt.is('android')) {
		// This will only print when on Android
        console.log('I am an Android device!');
        
		//打开文件目录选择文件/图片
		this.fileChooser.open().then(uri=>
			{				
				//获取一个新的文件上传
				const FileTransfer:FileTransferObject=this.transfer.create();	
				//设置名字，请求头，传参数
				let options1 :FileUploadOptions={
					fileKey:'file',
					fileName:uri,
					headers:{},
					chunkedMode:false,
					params:{}
				}
				console.log(options1.params);
				//上传文件的（文件路径，服务器端口，文件参数）
				FileTransfer.upload(uri,encodeURI("your server url"),options1)
				.then((data)=>{
					console.log(data);
					var res=JSON.parse(data.response);
					console.log(res);	
					var fn=res.result.fileName;
					console.log(fn);
					console.log('上传成功');
				},(err)=>{
					alert("上传失败");
					console.log(JSON.stringify(err));
				});
			}

		).catch(e=>alert("失败"));
	}

}	   


	//ios处理
  	iosUploading() {
  	
      var loading = this.loading();
      loading.present();
      
      setTimeout(()=>{    
        loading.dismiss();
        this.toast('iOS端暂不支持附件上传！');
      },1500);
  	}






  	//准备下载文件
  	Downloading() {

		this.plt.ready().then(() => {
	  const FileTransfer:FileTransferObject=this.transfer.create();			
		//得到文件后面的名字
	  var filename ="you server filePath".split("/").pop();
	  console.log(filename);

	  //文件下载：   需要下载路径，保存路径showCheckActionSheet
	  this.transfer.create().download("you server filePath",this.storageDirectory+'Download/'+filename)
	  .then((entry) => {
		  
		  console.log('download complete: ' + entry.toURL());		  
			this.toast('附件下载完成');
			//接住返回来的保存全部路径,可以在后面的打开预览
			var fileUrl=entry.toURL();
			console.log(fileUrl);
		  //得到文件类型并进行判断
		  var fileType=this.getFileType(filename);
		  console.log(fileType);


		  //打开文件： 需要文件的完整路径，文件的格式处理
		  this.fileOpener.open(fileUrl, this.getFileMimeType(fileType))
		  .then(() => {
			console.log('打开成功');
		  })
		  .catch(() => {
			console.log('打开失败');
		  });
	  }, (error) => {
		  // handle error
		  console.log('download error: ' + error);
		  this.toast('附件下载失败');
	  });

	});
  	}

    
      //获取文件类型
	  getFileType(fileName: string): string {
		return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase();
	  }



	  //判断文件类型
	  getFileMimeType(fileType: string): string {
		let mimeType: string = '';
	  
		switch (fileType) {
		  case 'txt':
			mimeType = 'text/plain';
			break;
		  case 'docx':
			mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
			break;
		  case 'doc':
			mimeType = 'application/msword';
			break;
		  case 'pptx':
			mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
			break;
		  case 'ppt':
			mimeType = 'application/vnd.ms-powerpoint';
			break;
		  case 'xlsx':
			mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			break;
		  case 'xls':
			mimeType = 'application/vnd.ms-excel';
			break;
		  case 'zip':
			mimeType = 'application/x-zip-compressed';
			break;
		  case 'rar':
			mimeType = 'application/octet-stream';
			break;
		  case 'pdf':
			mimeType = 'application/pdf';
			break;
		  case 'jpg':
			mimeType = 'image/jpeg';
			break;
		  case 'png':
			mimeType = 'image/png';
			break;
		  default:
			mimeType = 'application/' + fileType;
			break;
		}
		return mimeType;
	  }

	



   //Loading控件...
   public loading() {
    return this.loadingCtrl.create({  
        content: '',  
        spinner: 'ios',  
        duration: 0, //单位是毫秒
    }); 
  }     


  //toast控件...
  public toast(msg) {
    return this.toastCtrl.create({
        message: msg,
        duration: 1000,
        position: 'top',
      }).present();
  }

}