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
        recommendArticle: [],//推荐文章
        academics: {
            currentPage: 1,
            size: 10,
            data: []
        },
        rankingList: [],
        friends:[]
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
                        if (data.code == 102 || data.code == 104) {
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
                        if (data.code == 102 || data.code == 104) {
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
        details: function (event) {
            $(event.target).children('.info').attr('class', 'info-select');
            $(event.target).children('.info').children('.t').attr('class', 't-select');
        },
        hiddenDetails: function (event) {
            $(event.target).children('.info-select').attr('class', 'info');
            $(event.target).children('.info').children('.t-select').attr('class', 't');
        },
        logout: function () {
            logout();
            vue.user = null;
        },
        skip: function (id) {
            window.open('/article?id=' + id);
        },
        getAcademics: function () {
            let currentPage = this.academics.currentPage;
            let size = this.academics.size;
            $.ajax({
                type: 'POST',
                url: '/api/getAcademics',
                dataType: 'json',
                data: {
                    currentPage: currentPage,
                    size: size
                },
                success: function (data) {
                    //存储在localStorage里面
                    if (data.code != 0) {
                        alert(data.message);
                        if (data.code == 102 || data.code == 104) {
                            //删除本地缓存
                            localStorage.removeItem('ggblogSession');
                            window.location.href = '/sign';
                        }
                    } else {
                        vue.academics.data = data.data;
                    }
                }
            });
        },
        getRanking: function () {
            $.ajax({
                type: 'POST',
                url: '/api/getRanking',
                dataType: 'json',
                data: {
                    type: 'academic',
                    currentPage: 1,
                    size: 7
                },
                success: function (data) {
                    //存储在localStorage里面
                    if (data.code != 0) {
                        alert(data.message);
                        if (data.code == 102 || data.code == 104) {
                            //删除本地缓存
                            localStorage.removeItem('ggblogSession');
                            window.location.href = '/sign';
                        }
                    } else {
                        console.log('data:', typeof data, data);
                        vue.rankingList = data.data;
                    }
                }
            });
        },
        getFriends: function () {
            if(user && user.headImageUrl){
                $.ajax({
                    type: 'POST',
                    url: '/api/getFriends',
                    dataType: 'json',
                    data: {
                        session: getSession(),
                        size: 7
                    },
                    success: function (data) {
                        //存储在localStorage里面
                        if (data.code != 0) {
                            alert(data.message);
                            if (data.code == 102 || data.code == 104) {
                                //删除本地缓存
                                localStorage.removeItem('ggblogSession');
                                window.location.href = '/sign';
                            }
                        } else {
                            vue.friends = data.data;
                        }
                    }
                });
            }
        },
        search: function () {
            let keyword = $('#search-keyword').val();
            window.open('/rankingList?' + 'keyword='+ keyword + '#academic');
        }
    },
    ready: function () {
        this.getNum();
        this.getRanking();
        this.getRecommendArticle();
        this.getAcademics();
        this.getFriends();
    }
});