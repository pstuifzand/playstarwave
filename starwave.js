var bullets = [];
var enemies = [];

var x = 0;
var y = 0;

var bullet_count = 100;
var prevx = 0;
var prevy = 0;

var lives = 3;
var score = 0;

var dead_enemies = 0;
var level = 0;

var widths = [ 640, 800, 1024, 1280, 1600, 1920 ];

var ox = 0;
var oy = 0;

var paused = true;
var targetinglaser = true;

function rnd(min,max) {
    return min+Math.floor(Math.random()*(max-min))
}
function rndf(min,max) {
    return min+Math.random()*(max-min);
}

function enemy_generator() {
    var randomnumber=rnd(20,widths[level]-20);

    var en = { x: randomnumber, y: 0, size: rnd(6,15) };
    en.speed = 0.5 + (2*en.size) / 15;
    enemies.push(en);
    if (!paused) {
        setTimeout('enemy_generator()', rnd(800, 1000));
    }
}

function object_mover() {
    var obj = document.getElementById('starwave');
    var ctx = obj.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, 0, 1500);
    grad.addColorStop(1.0,'#0000ff');
    grad.addColorStop(0.0, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, widths[level], 440);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 440, widths[level], 40);

    y = 460;

    var width = 10;
    var height = 20;

    for (var i in enemies) {
        var enemy = enemies[i];

        for (var j in bullets) {
            var bullet = bullets[j];
            
            var dx = enemy.x - bullet.x;
            var dy = enemy.y - bullet.y;

            var len = Math.sqrt((dx*dx) + (dy*dy));
            if (len < (bullet.size+enemy.size)) {
                bullet.dead=true;
                enemy.dead=true;

                score += 10;
                dead_enemies += 1;

                if (dead_enemies >= level*10) {
                    dead_enemies = 0;
                    level++;
                    if (level >= widths.length) {
                        level = widths.length-1;
                    }
                    else {
                        obj.width = widths[level];
                    }

                    $('#level').html(level);

                    ox = obj.offsetLeft;
                    oy = obj.offsetTop;
                }
                $('#score').html(score);
                console.log(score);
            }
        }
    }

    for (var i in bullets) {
        var obj = bullets[i];

        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(obj.x, obj.y, obj.size+1, 0, 360, false);
        ctx.fill();
        ctx.closePath();

        obj.y = obj.y - 5;
        if (obj.y < 0) {
            obj.dead=true;
        }
    }

    for (var i in bullets.reverse()) {
        var obj = bullets[i];
        if (obj.dead) {
            bullets.splice(i, 1);
        }
    }

    for (var i in bullets) {
        var obj = bullets[i];

        /*
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.arc(obj.x, obj.y, obj.size, 0, 360, false);
        ctx.fill();
        ctx.closePath();
        */
    }

    for (var i in enemies) {
        var obj = enemies[i];

        obj.y = obj.y + obj.speed;
        if (obj.y > 480) {
            obj.dead=true;
            lives -= 1;
            $('#lives').html(lives);
            console.log(lives);
        }
    }

    for (var i in enemies.reverse()) {
        var obj = enemies[i];
        if (obj.dead) {
            enemies.splice(i, 1);
        }
    }

    for (var i in enemies) {
        var obj = enemies[i];

        ctx.beginPath();
        ctx.fillStyle = '#ff0000';
        ctx.arc(obj.x, obj.y, obj.size, 0, 360, false);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.arc(obj.x, obj.y, obj.size+5, 0, 360, false);
        ctx.stroke();
        ctx.closePath();
    }

    prevy=460;
    /*
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.moveTo(prevx, prevy-height-2);
    ctx.lineTo(prevx+width+2, prevy+height+2);
    ctx.lineTo(prevx-width-2, prevy+height+2);
    ctx.lineTo(prevx, prevy-height-2);
    ctx.fill();
    ctx.closePath();
    */

    ctx.beginPath();
    ctx.fillStyle = '#000000';
    ctx.moveTo(x, y-height);
    ctx.lineTo(x+width, y+height);
    ctx.lineTo(x-width, y+height);
    ctx.lineTo(x, y-height);
    ctx.fill();
    ctx.closePath();

    if (targetinglaser) {
        ctx.beginPath();
        ctx.strokeStyle = '#ffff00';
        ctx.moveTo(x, y-height);
        ctx.lineTo(x, 0);
        ctx.stroke();
        ctx.closePath();
    }

    prevx = x;
    prevy = 460;

    if (ctx.fillText) {
        ctx.fillText("Level " + level, 10, 10);
    }

    if (!paused) {
        setTimeout('object_mover()', 10);
    }
}

$(document).ready(function() {
    var obj = document.getElementById('starwave');
    obj.width = widths[level];
    ox = obj.offsetLeft;
    oy = obj.offsetTop;
    var ctx = obj.getContext('2d');

    obj.onmousedown = function(e) {
        if (!paused) {
            bullets.push({ size: 3, x:e.clientX - ox, y:460 });
            bullet_count -= 1;
            $('#bullets').html(bullet_count);
        }
    };


    obj.onmousemove = function(e) {
        x = e.clientX - ox;
        y = e.clientY - oy;
    };
});


$('#playpause').click(function (e) {
    paused = !paused;
    object_mover();
    enemy_generator();
});

