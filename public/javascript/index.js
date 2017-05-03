let vue = new Vue({
    el: '#body',
    data: {
        user: user,//用户信息
        num: {
            academic: 0,
            topic: 0,
            vote: 0,
            activity: 0,
            emotion: 0,
            event: 0,
            help: 0
        },
    },
    methods: {
        //导航栏数据加载
        getNum: function () {
            $.ajax({
                type: 'POST',
                url: '/api/getNum',
                dataType: 'json',
                success: function (data) {
                    //存储在localStorage里面
                    if (data.code != 0) {
                        alert(data.message);
                    } else {
                        vue.num = data.data;
                    }
                }
            });
        }
    },
    ready: function () {
        this.getNum();
    }
});