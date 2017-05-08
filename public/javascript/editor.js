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
            $.ajax({
                type: 'POST',
                url: '/api/publishToAcademic',
                dataType: 'json',
                data: {
                    session: getSession(),
                    param: {
                        title: '大家好我是VAE',
                        outline: '享受这令人愉悦的这么吧！不管是深海还是烈火都取不走我的命！',
                        content: editor.$txt.html()
                    }
                },
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
                        alert('发表成功');
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