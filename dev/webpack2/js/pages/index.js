import Vue from '../lib/vue.min.js'
import List from '../component/list.vue'

import '../../css/common.css'

let data = [
    {
        name:'首页1',
        url:'./detail'
    },
    {
        name:'首页2',
        url:'./detail'
    },
    {
        name:'首页3',
        url:'./detail'
    }
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