let vue = new Vue({
    el: '#body',
    data: {
        user: user,//用户信息
        data: [],
        currentPage: 1,
        size: 12
    },
    methods: {
        getRanking: function () {
            let type = (location.hash).split('#')[1];
            console.log('type:', type);
            if (type == 'academic') {
                this.getAcademics();
            }
        },
        getAcademics: function () {
            let currentPage = this.currentPage;
            let size = this.size;
            $.ajax({
                type: 'POST',
                url: '/api/getRanking',
                dataType: 'json',
                data: {
                    type: 'academic',
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
                        vue.data = vue.data.concat(data.data);
                    }
                }
            });
        },
        getMoreAcademics: function () {
            this.currentPage += 1;
            this.getAcademics();
        },
        skip: function (id) {
            window.open('/article?id=' + id);
        },
    },
    ready: function () {
        this.getRanking();
    }
});