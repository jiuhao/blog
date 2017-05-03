$('#in').click(function () {
    $('#in').attr('class', 'choose');
    $('#up').attr('class', 'nav-item');
    $('#signin').css('display', 'block');
    $('#signup').css('display', 'none');
});
$('#up').click(function () {
    $('#in').attr('class', 'nav-item');
    $('#up').attr('class', 'choose');
    $('#signin').css('display', 'none');
    $('#signup').css('display', 'block');
});
$('#login').click(function () {
    let account = $('#signin').find("input[name='account']").val();
    let pwd = $('#signin').find("input[name='pwd']").val();
    console.log('account:', account);
    console.log('pwd:', pwd);
    $.ajax({
        type: 'POST',
        url: '/api/login',
        dataType: 'json',
        data: {
            param: {
                number: account,
                pwd: pwd
            }
        },
        success: function (data) {
            //存储在localStorage里面
            if (data.code != 0) {
                alert(data.message);
                if (data.code == 108) {
                    $('#in').attr('class', 'nav-item');
                    $('#up').attr('class', 'choose');
                    $('#signin').css('display', 'none');
                    $('#signup').css('display', 'block');
                }
            } else {
                console.log('data.data:', data.data);
                localStorage.setItem('ggblogSession', JSON.stringify(data.data));
                window.location.href = '/';
            }
        }
    });
});
$('#register').click(function () {
    let account = $('#signup').find("input[name='account']").val();
    let nick = $('#signup').find("input[name='nick']").val();
    let pwd = $('#signup').find("input[name='pwd']").val();
    $.ajax({
        type: 'POST',
        url: '/api/register',
        dataType: 'json',
        data: {
            param: {
                number: account,
                nick: nick,
                pwd: pwd
            }
        },
        success: function (data) {
            //存储在localStorage里面
            if (data.code != 0) {
                alert(data.message);
                if (data.code == 107) {
                    $('#in').attr('class', 'choose');
                    $('#up').attr('class', 'nav-item');
                    $('#signin').css('display', 'block');
                    $('#signup').css('display', 'none');
                }
            } else {
                localStorage.setItem('ggblogSession', JSON.stringify(data.data));
                window.location.href = '/';
            }
        }
    });
});
