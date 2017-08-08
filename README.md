# gulp-template


###  INSTALL
node.js  
yarn [https://yarnpkg.com/zh-Hans/docs/install](https://yarnpkg.com/zh-Hans/docs/install)

安裝pageage套件
```
$ yarn -v
```

執行
yarn run
```
$ yarn gulp watch
```

npm run
```
在package.json 加上

"scripts": {
  "watch": "gulp watch"
},

終端機
$npm run watch
```



### gulp開發
```javascript
//定義名稱為pug的gulp工作
gulp.task('pug', function() {
  //指定要處理的原始檔案目錄,「!」排除指定處理的檔案或目錄
  gulp.src(['pug/*.pug','!pug/*.html'])
    .pipe(plumber()) //做什麼事 pipe：串接
    .pipe(
    pug({ pretty:'\t' }))
    .pipe(gulp.dest('')) //指定處理後的發布目錄
  });

  //指定檔案有異動 就執行gulp指令
  gulp.task('watch',function(){
  //異動資料夾裡的檔案 為gulp所的定義名稱
  gulp.watch('pug/*.pug',['pug']);
});
```
>JS另一種寫法

```javascript
gulp.task('pug', function() {
  var todo = gulp.src('pug/*.pug')
    .pipe(plumber())
    .pipe(
      pug({ pretty:'\t' }))
    .pipe(gulp.dest(''));
  return todo;
});
