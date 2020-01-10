## 图片处理

这篇都是web前端技术，可能我还没有找到合适的方式，目前没有验证成功。 

想法很简单，就是根据js的一些api，编辑arraybuffer之后保存图片，因为发现在原始的arraybuffer 后面添加数据，对图片显示没影响， 
能够打乱图片并且在根据存储在图片中arraybuffer的数据规则，进行恢复。

![图片打乱和恢复](https://bloglibs.oss-cn-beijing.aliyuncs.com/articles/202001/0109001.jpg)

进入正题前，需要对下面两点有所了解

- ArrayBuffer
- Int8Array (Int16Array) 等等


<!--more-->

#### 两者的关系 

ArrayBuffer 不能直接操作需要转换成 Int8Array

```javascript

const bf = new ArrayBuffer(10);

const ar = new Int8Array(bf); 

//处理之后可以

//ar.buffer 获取 arraybuffer

```

### fileReader 读取图片的arraybuffer

```javascript
var fileReader = new FileReader();
	fileReader.onload = function(e) {
		fileContent = e.target.result;
		callback(fileContent);
	}
	fileReader.readAsArrayBuffer(file);

```

### 设置加密规则

整体方法，获取图片的信息，根据信息设置成几行几列的小图片区域，打乱顺序。


- 根据图片的arraybuffer 获取 图片的尺寸， 如有更简单的方式可以告诉我。

```javascript
function getImageSize(bf) {
	let blob = new Blob( [ bf ], { type: "image/png" } );
    let urlCreator = window.URL || window.webkitURL;
    let imageUrl = urlCreator.createObjectURL( blob );
    let img = new Image();
    return new Promise(function(resolve){
    	img.onload = function(){
    		resolve({w:img.naturalWidth, h:img.naturalHeight});
    	};
    	img.src = imageUrl;
    })
}
```

- 根据图片的尺寸，获取裁份以及顺序的调整


```javascript
//计算打乱顺序
function calculateRandomRule(imgsize){
	let sw=0, sh=0;
	let x,y; //xy轴划分
	let randomlist = []

	for(let i=4; i<Math.max(imgsize.w,imgsize.h); i++) {
		if(imgsize.w%i == 0) {
			sw = imgsize.w/i;
			x = i;
			if(sh){break}
		}
		if(imgsize.h%i == 0) {
			sh = imgsize.h/i;
			y = i;
			if(sw){break}
		}
	};

	for(let i=0; i<x*y; i++) {
		randomlist.push(i);
	}
	randomlist = randomlist.sort(() =>  0.4 - Math.random())
	return {
		sw,
		sh,
		x,
		y,
		randomlist
	}
}
```


- 用canvas根据规则进行处理并显示成图片

```javascript

function encodeImage(box) {
	// const cs = document.querySelector('canvas');
	const cs = document.createElement('canvas');
	const ctx = cs.getContext('2d');
	const img = document.getElementById('photo');
	cs.width = img.naturalWidth;
	cs.height = img.naturalHeight;
	let sw =box.sw, sh=box.sh, x = box.x, y=box.y;
	ctx.drawImage(img,0,0);
	let imgdataList = [], list=box.randomlist;
	for(let i=0; i<y; i++) {
		for(let j=0; j<x; j++) {
			imgdataList.push(ctx.getImageData(j*sw,i*sh,sw,sh));
		}
	};
	ctx.fillRect(0,0,cs.width,cs.height);
	for(let i=0, j=0; i<list.length; i++) {
		if(i >= x && (i%x) == 0) {
			j++;
		} 
		ctx.putImageData(imgdataList[list[i]], sw*(i%x),sh*j);
	}

	cs.toBlob(function(blob){
    	var urlCreator = window.URL || window.webkitURL;
		var imageUrl = urlCreator.createObjectURL(blob);
    	var img = document.querySelector("#photo2");
    	img.src= imageUrl
	},"image/png")
}

```

- 来看下整体方法

```javascript
async function callBack(m){
	let imgsize = await getImageSize(m); 
	let randomObj = calculateRandomRule(imgsize);
	let arr = new Int8Array(m);
	let boxabf = new ArrayBuffer(m.byteLength/50);
	let newarr = new Int8Array(arr.length+randomObj.randomlist.length+1);
	let boxarr = new Int8Array(boxabf.byteLength);
	for(let i =0; i<newarr.length; i++){
		if(i>=arr.length){
			if(i=== arr.length+randomObj.randomlist.length){
				newarr[i] = randomObj.randomlist.length;
			} else{
				newarr[i] = randomObj.randomlist[i-arr.length];
			}
		} else {
			newarr[i] = arr[i]
		};
	}

	encodeImage(randomObj);
}

```

最后再总结一下

- 图片的arraybuffer增加字节长度，不修改原始的数据只添加，是不影响显示的，
- arraybuffer 减少是只能显示图片的一部分，但是尺寸不变
