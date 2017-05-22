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
        personalData:{
            academic:[]
        },
        currentPage: 1,
        size: 9
    },
    methods: {
        isLogin: function () {
            if (!user) {
                console.log('*&*&*&*:', vue.user);
                window.location.href = '/sign';
            }
        },
        //导航栏数据加载
        getNum: function () {
            $.ajax({
                type: 'POST',
                url: '/api/getUserNum',
                dataType: 'json',
                data: {
                    session: getSession()
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
                        vue.num = data.data;
                    }
                }
            });
        },
        getPersonalData: function () {
            let currentPage = this.currentPage;
            let size = this.size;
            $.ajax({
                type: 'POST',
                url: '/api/getPersonalData',
                dataType: 'json',
                data: {
                    session: getSession(),
                    param: {
                        type: 'academic',
                        currentPage: currentPage,
                        size: size
                    }
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
                        vue.personalData.academic = vue.personalData.academic.concat(data.data.academic);
                    }
                }
            });
        },
        getMorePersonalData: function () {
            this.currentPage += 1;
            this.getPersonalData();
        },
        skip: function (id) {
            window.open('/article?id=' + id);
        }
    },
    ready: function () {
        this.isLogin();
        this.getNum();
        this.getPersonalData()
    }
});