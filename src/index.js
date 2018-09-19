import EXIF from 'exif-js'
/**
 * file对象转成base64
 * @param file 
 * @return promise
 */
export const fileToDataURL = file => {
    if (!hasImage(file)) throw Error('入参必须是一个image类型的file');
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result)
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
    })
}

/**
 * url转成image对象
 * @param url 
 * @return promise
 */
export const dataURLToImage = url => {
    if (typeString(url) !== 'string') throw Error('入参不是字符串');
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = err => reject(err);
    })
}

/**
 * file对象转成image对象
 * @param file, isRotate 是否需要旋转图片
 * @return promise
 */
export const fileToImage = (file, isRotate) => {
    if (!isRotate) {
        return fileToDataURL(file)
            .then(url => dataURLToImage(url))
    } else {
        return fileToDataURL(file)
            .then(url => dataURLToImage(url))
            .then(image => {
                return { image, ...imageToCanvas(image) }
            })
            .then(res => rotateImgViaExif(res))
    }
}


/**
 * file对象压缩
 * @param {
 *  file: 文件
 *  quality: 压缩比例(0-1)
 * } 
 * @return promise
 */
export const fileZip = (file, quality = 0.8) => {
    if (!hasImage(file)) throw Error('入参必须是一个image类型的file');
    return new Promise((resolve, reject) => {
        fileToImage(file)
            .then(image => {
                let { canvas } = imageToCanvas(image);
                canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
            })
            .catch(err => reject(err))
    })
}

/**
 * image对象压缩
 * @param {
 *  image: 文件
 *  quality: 压缩比例(0-1)
 * } 
 * @return promise
 */
export const imageZip = (image, quality = 0.8) => {
    let { canvas } = imageToCanvas(image);
    let url = canvas.toDataURL(image, quality);
    return dataURLToImage(url);
}

/**
 * 一些工具函数
 */

// 旋转图片
function rotateImgViaExif(params) {
    const { image, canvas, ctx } = params;
    return getRotateDeg(image)
        .then(rotateDeg => {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotateDeg);
            let url = canvas.toDataURL(image);
            return dataURLToImage(url);
        })
}

const rotate = {
    6: 90 * Math.PI / 180,
    8: -90 * Math.PI / 180,
    3: 180 * Math.PI / 180
}

// 获取旋转的角度
function getRotateDeg(image) {
    return new Promise(resolve => {
        EXIF.getData(image, function () {
            let orientation = this.exifdata.Orientation;
            console.log(orientation);
            if (typeof orientation === 'undefined' || orientation === 1) return resolve(0);
            let rotateDeg = hasProp(rotate, orientation) ? rotate[orientation] : 0;
            resolve(rotateDeg)
        })
    })
}

// 图片转成canvas
function imageToCanvas(image) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let w = image.naturalWidth;
    let h = image.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(image, 0, 0, w, h);
    return { canvas, ctx }
}

// 识别对象类型
function typeString(anw) {
    return Object.prototype.toString.call(anw).slice(8, -1).toLowerCase();
}

// 是否是图片类型的file
function hasImage(file) {
    return typeString(file) === 'file' && (file.type).match(/image/);
}

// 对象是否有这个key
function hasProp(obj, key) {
    Object.prototype.hasOwnProperty.call(obj, key)
}