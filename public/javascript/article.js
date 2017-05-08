let vue = new Vue({
    el: '#body',
    data: {
        user: user,//用户信息
        article: {}//文章的信息
    },
    methods: {
        getArticle: function () {
            let aa = new UrlSearch();
            $.ajax({
                type: 'POST',
                url: '/api/getArticle',
                dataType: 'json',
                data: {
                    session: getSession(),
                    id: aa.id
                },
                success: function (data) {
                    if (data.code != 0) {
                        alert(data.message);
                        if (data.code != 102 || data.code != 104) {
                            //删除本地缓存
                            localStorage.removeItem('ggblogSession');
                            window.location.href = '/sign';
                        }
                    } else {
                        vue.article = data.data;
                    }
                }
            })
        }
    },
    ready: function () {
        this.getArticle();
    }
});