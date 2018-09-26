# imageTransform

> 整体使用promise风格编写,所有的api都可以使用then来链式调用,api组合起来非常灵活

## Install

npm:
`npm install images-transform --save`

## Usage

```js
import {fileToDataURL} from 'imageTransform'

fileToDataURL(file).then(url => console.log(url));
```

## API

| api | 参数 | 返回值 | 作用 |
| ---- | ---- | ---- | ---- |
| fileToDataURL | file | base64 | file对象转成base64 |
| dataURLToImage | url | image | url转成image |
| fileToImage | file, isRotate | image | file转成image,isRotate代表是否需要旋转,下面会细说 |
| fileZip | file | file | file文件压缩 |
| imageZip | image | image | image图像压缩 |

> 为什么需要旋转图片
ios手机拍摄的照片在上传的时候都会变成横屏,所以有时候需要在显示图片的时候将他转成正常的形式(横屏拍摄的不会转)

## Demo

1. 上传的文件需要进行压缩传给后台
```js
import {fileZip} from 'imageTransform'
let file = document.querySelector('input');
file.onchange = () => {
    let imgFile = this.files[0];
    fileZip(imgFile)
    .then(file => console.log(file))
}
```

2. 上传图片的时候需要预览
```js
import {fileToDataURL} from 'imageTransform'
let file = document.querySelector('input');
file.onchange = () => {
    let imgFile = this.files[0];
    fileToDataURL(imgFile)
    .then(url) => console.log(url))
}
```

## 文件大小以及兼容性

1. build之后 核心功能包是3.5k,如果需要使用旋转功能,则需额外引入exif 达到20多k
2. 由于使用了canvas来压缩,所以只能兼容到 ie11以上,后续会考虑使用其他办法处理压缩
