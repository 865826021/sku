## 通用商品 SKU 选择器

### 初始化方法与配置项
```javascript
KISSY.use('sku', function(S, SKU){
    var sku = new SKU({
        root:          '#sku',          // SKU 区块的根节点
        skuClass:      'J_TSKU',        // SKU 颗粒节点 class
        selectedClass: 'selected',      // 选中的 SKU 颗粒节点 class
        disabledClass: 'disabled',      // 禁用的 SKU 颗粒节点 class
        attrName:      'data-value',    // SKU 节点上记录 ID 的属性名称
	});
	sku.render();                       // 实例初始化
})
```
### 订阅事件

调用实例上的```subscribe```方法：
```javascript
KISSY.use('sku', function(S, SKU){
    var sku = new SKU(config);
    sku.subscribe('skuFound', function(evt){
       // Your code
    })
})
```

同时订阅多个事件，可以用空格分隔事件名：
```javascript
sku.subscribe('skuFound skuLost', callback);
```



### 自定义事件与其对象


#### selectionChanged

* 触发机制：用户点击引起的颗粒状态变化
* 自定义事件数据：
    * ```selection ``` : 当前选中的 SKU 颗粒的 ID
        
#### skuFound
* 触发机制：SKU 匹配成功
* 自定义事件数据：
    * ```sku``` : SKU 对象

#### skuLost 
* 触发机制：SKU 匹配失败
* 自定义事件数据：无


#### skuChanged
* 触发机制：SKU 匹配变更
* 自定义事件对象结构：
    * ```sku``` : SKU 对象
    
#### 注意
        
* 所有的自定义事件对象均有 uid 字段，值为 SKU 实例的唯一 ID
* ```skuChanged``` 触发时，不再触发```skuFound``` 与 ```skuLost```。所以，如果只关心 SKU 的变动，建议使用 ```sku.subscribe('skuFound skuChanged', function(){})```
       
### 公用方法
``` getCurrentSku ```: 获取实例当前 SKU 对象。若未选中 SKU，则返回 ```null```。
