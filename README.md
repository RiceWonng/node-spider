# node-spider
node 爬虫经常使用的一些代码和库
### Parser - 轻量级文本解析工具
```javascript
var Parser = require('./lib/parser');
// 使用工具方法
Parser.getTag(res.body, 'div', 'class');
```
**如果解析内容为空， 使用Parser.filterCr去除文本中的换行符**