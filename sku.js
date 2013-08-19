KISSY.add('sku', function (S, DOM, Node, Event) {


    /**
     * K-combinations
     *
     * Get k-sized combinations of elements in a set.
     *
     * Usage:
     *   k_combinations(set, k)
     *
     * Parameters:
     *   set: Array of objects of any type. They are treated as unique.
     *   k: size of combinations to search for.
     *
     * Return:
     *   Array of found combinations, size of a combination is k.
     *
     * Examples:
     *
     *   k_combinations([1, 2, 3], 1)
     *   -> [[1], [2], [3]]
     *
     *   k_combinations([1, 2, 3], 2)
     *   -> [[1,2], [1,3], [2, 3]
     *
     *   k_combinations([1, 2, 3], 3)
     *   -> [[1, 2, 3]]
     *
     *   k_combinations([1, 2, 3], 4)
     *   -> []
     *
     *   k_combinations([1, 2, 3], 0)
     *   -> []
     *
     *   k_combinations([1, 2, 3], -1)
     *   -> []
     *
     *   k_combinations([], 0)
     *   -> []
     */
    function k_combinations(set, k) {
        var i, j, combs, head, tailcombs;

        if (k > set.length || k <= 0) {
            return [];
        }

        if (k == set.length) {
            return [set];
        }

        if (k == 1) {
            combs = [];
            for (i = 0; i < set.length; i++) {
                combs.push([set[i]]);
            }
            return combs;
        }

        // Assert {1 < k < set.length}

        combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
            head = set.slice(i, i + 1);
            tailcombs = k_combinations(set.slice(i + 1), k - 1);
            for (j = 0; j < tailcombs.length; j++) {
                combs.push(head.concat(tailcombs[j]));
            }
        }
        return combs;
    }


    /**
     * Combinations
     *
     * Get all possible combinations of elements in a set.
     *
     * Usage:
     *   combinations(set)
     *
     * Examples:
     *
     *   combinations([1, 2, 3])
     *   -> [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
     *
     *   combinations([1])
     *   -> [[1]]
     */
    function combinations(set) {
        var k, i, combs, k_combs;
        combs = [];

        // Calculate all non-empty k-combinations
        for (k = 1; k <= set.length; k++) {
            k_combs = k_combinations(set, k);
            for (i = 0; i < k_combs.length; i++) {
                combs.push(k_combs[i]);
            }
        }
        return combs;
    }


    function normalizeSkuMap(skuMap) {
        var newSkuMap = {};
        for (var key in skuMap) {
            var newKey = key.replace(/^;|;$/gi, '');
            newSkuMap[newKey] = skuMap[key];
        }
        return newSkuMap;
    }


    var defConfig = {
        skuClass:         'J_TSKU',
        selectedClass:    'selected',
        disabledClass:    'disabled',
        skuMap:           null,
        serializedSkuMap: {}
    };


    function SKU(cfg) {
        if (!cfg) {
            S.log('SKU: 配置为空，无法初始化');
            return;
        }

        var config = S.merge(defConfig, cfg);

        var SELECTED_CLS = config.selectedClass,
            DISABLED_CLS = config.disabledClass,
            SKU_CLS = config.skuClass;


        var skuMap = config.skuMap,
            serializedSkuMap = config.serializedSkuMap;

        if (!skuMap) {
            return S.log('SKU: skuMap 为空，无法初始化');
        }


        skuMap = normalizeSkuMap(skuMap);


//获得对象的key
        function getKeys(obj) {
            var keys = [];
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                    keys.push(key);
            }
            return keys;
        }

//把组合的key放入结果集SKUResult
        function add2SKUResult(key, sku) {
            if (serializedSkuMap[key]) {
                serializedSkuMap[key].count += sku.count;
                serializedSkuMap[key].prices.push(sku.price);
            } else {
                serializedSkuMap[key] = {
                    count:  sku.count,
                    prices: [sku.price]
                };
            }
        }

        // Sort keys in
        function sortKeys(keys) {

            var holder = {},
                i, key, newKey;

            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                newKey = key.replace(';');
                holder[newKey] = key;
                keys[i] = newKey;
            }
            keys.sort(function (a, b) {
                return parseInt(a) - parseInt(b);
            })
            for (var i = 0; i < keys.length; i++) {
                keys[i] = holder[keys[i]];
            }

            return keys;

        }


        //初始化得到结果集
        function serializeSkuMap() {
            var i, keys = getKeys(skuMap);
            for (i = 0; i < keys.length; i++) {
                var key = keys[i];//一条SKU信息key
                var sku = skuMap[key];    //一条SKU信息value
                var skuKeyAttrs = key.split(";"); //SKU信息key属性值数组
                var len = skuKeyAttrs.length;

                var combs = combinations(skuKeyAttrs);

                var j = 0;
                for (; j < len; j++) {
                    add2SKUResult(skuKeyAttrs[j], sku);
                }

                for (; j < combs.length - 1; j++) {
                    var tempKey = sortKeys(combs[j]).join(';');
                    add2SKUResult(tempKey, sku);
                }

                serializedSkuMap[key] = {
                    count:  sku.count,
                    prices: [sku.price]
                }
            }
        }

//初始化用户选择事件
        $(function () {
            serializeSkuMap();
            $('.' + SKU_CLS).each(function () {
                var self = $(this);
                var attr_id = self.attr('data-value');
                if (!serializedSkuMap[attr_id]) {
                    self.attr(DISABLED_CLS, DISABLED_CLS);
                }
            }).click(function () {
                         var self = $(this);

                         if ($(this).hasClass(DISABLED_CLS)) {
                             return;
                         }

                         // 切换被点击SKU 的class，去除其所在属性其它的sku 的 class
                         self.toggleClass(SELECTED_CLS).siblings().removeClass(SELECTED_CLS);

                         var selectedObjs = $('.' + SELECTED_CLS);
                         if (selectedObjs.length) {
                             //获得组合key价格
                             var selectedIds = [];
                             selectedObjs.each(function () {
                                 selectedIds.push($(this).attr('data-value'));
                             });
                             /*
                              selectedIds.sort(function(value1, value2) {
                              return parseInt(value1) - parseInt(value2);
                              });*/
                             selectedIds = sortKeys(selectedIds);
                             var len = selectedIds.length;
                             var prices = serializedSkuMap[selectedIds.join(';')].prices;
                             var maxPrice = Math.max.apply(Math, prices);
                             var minPrice = Math.min.apply(Math, prices);
                             $('#price').text(maxPrice > minPrice ? minPrice + "-" + maxPrice : maxPrice);

                             //用已选中的节点验证待测试节点 underTestObjs
                             $("." + SKU_CLS).not(selectedObjs).not(self).each(function () {
                                 var siblingsSelectedObj = $(this).siblings('.' + SELECTED_CLS);
                                 var testAttrIds = [];//从选中节点中去掉选中的兄弟节点
                                 if (siblingsSelectedObj.length) {
                                     var siblingsSelectedObjId = siblingsSelectedObj.attr('data-value');
                                     for (var i = 0; i < len; i++) {
                                         (selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
                                     }
                                 } else {
                                     testAttrIds = selectedIds.concat();
                                 }
                                 testAttrIds = testAttrIds.concat($(this).attr('data-value'));
                                 testAttrIds = sortKeys(testAttrIds);
                                 if (!serializedSkuMap[testAttrIds.join(';')]) {
                                     $(this).addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                                 } else {
                                     $(this).removeClass(DISABLED_CLS);
                                 }
                             });
                         } else {
                             //设置属性状态
                             $('.' + SKU_CLS).each(function () {
                                 serializedSkuMap[$(this).attr('data-value')] ? $(this).removeClass(DISABLED_CLS) : $(this).addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                             })
                         }
                     });
        });


    }

    S.augment(SKU, {
        destroy: function () {
            S.log('destroyed');
        }
    });


    return SKU;
}, {requires: ['dom', 'node', 'event']});