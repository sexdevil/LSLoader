import Vue from '../lib/vue.min.js'
import List from '../component/list.vue'
import alib from '../lib/alib.js'
import '../../css/common.css'

let data = [
    'item1',
    'item2',
    'item3',
    'item4',
    'item5',
    'item6'
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
console.log(alib)
