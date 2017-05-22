let vue = new Vue({
    el: '#body',
    data: {
        user: user,//用户信息
    },
    methods: {
        isLogin: function () {
            if (!user) {
                window.location.href = '/sign';
            }
        },
        publish: function () {
            let posterUrl = editor.$txt.find('img')[0] && editor.$txt.find('img')[0].src || '';
            $.ajax({
                type: 'POST',
                url: '/api/publishToAcademic',
                dataType: 'json',
                data: {
                    session: getSession(),
                    param: {
                        html: editor.$txt.html(),
                        text: editor.$txt.text(),
                        posterUrl: posterUrl
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
                        console.log('data:', data.data);
                        alert('发表成功!\n' + '标题为：' + data.data.title + '\n' + '主题词：' + data.data.outline);
                        window.location.href = '/';
                    }
                }
            });
        }
    },
    ready: function () {
        this.isLogin();
    }
});