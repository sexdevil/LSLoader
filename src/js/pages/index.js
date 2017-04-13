import Vue from '../lib/vue.min.js'
import List from '../component/list.vue'

import '../../css/common.css'

let data = [
    '首页1',
    '首页2',
    '首页3'
]
let vue = new Vue ({
    el: '#root',
    data: {
        listData: data
    },
    components: {
        List
    }
})
console.log('demo/vue')