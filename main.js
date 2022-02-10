
const main = Vue.createApp({
    data(){
        return {
            sign: {
                style: 'kitajuku-dentetsu',
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
