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
        recommendArticle: []
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
                        if (data.code != 102 || data.code != 104) {
                            //删除本地缓存
                            localStorage.removeItem('ggblogSession');
                            window.location.href = '/sign';
                        }
                    } else {
                        vue.num = data.data;
                    }
                }
            });
        },
        getRecommendArticle: function () {
            $.ajax({
                type: 'POST',
                url: '/api/recommendArticle',
                dataType: 'json',
                success: function (data) {
                    //存储在localStorage里面
                    if (data.code != 0) {
                        alert(data.message);
                        if (data.code != 102 || data.code != 104) {
                            //删除本地缓存
                            localStorage.removeItem('ggblogSession');
                            window.location.href = '/sign';
                        }
                    } else {
                        vue.recommendArticle = data.data;
                    }
                }
            });
        },
        details: function () {
            $('#info').attr('class', 'info-select');
            $('#t').attr('class', 't-select');
        },
        hiddenDetails: function () {
            $('#info').attr('class', 'info');
            $('#t').attr('class', 't');
        },
        logout: function () {
            logout();
            vue.user = null;
        },
        skip: function (id) {
            window.location.href = '/article?id=' + id;
        }
    },
    ready: function () {
        this.getNum();
        this.getRecommendArticle();
    }
});