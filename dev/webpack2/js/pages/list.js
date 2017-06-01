import Vue from '../lib/vue.min.js'
import List from '../component/list.vue'
import alib from '../lib/alib.js'
import '../../css/common.css'

let data = [
    {
        name:'item1',
        url:'./detail'
    },
    {
        name:'item2',
        url:'./detail'
    },
    {
        name:'item3',
        url:'./detail'
    },
    {
        name:'item4',
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
console.log(alib)
