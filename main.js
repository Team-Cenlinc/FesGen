
const main = Vue.createApp({
    data(){
        return {
            sign: {
                type: 'sign',
                light: ''
            },
            size: {
                height: '720',
                width: '2160'
            }
        }
    }
})
main.mount('#main')
