
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();

var xPos = clientWidth > 640 ? 19.5 : (clientWidth > 384 ? 11.5 : 10.5);
var yPos = clientWidth > 640 ? -20 : (clientWidth > 384 ? -11.5 : -10.5);

$(function () {
    $garden = $("#garden");
    gardenCanvas = $garden[0];
    gardenCanvas.width = $("#loveHeart").width();
    gardenCanvas.height = $("#loveHeart").height();
    gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);

    setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);
});

function getHeartPoint(angle) {
    var t = angle / Math.PI;
    var x = xPos * (16 * Math.pow(Math.sin(t), 3));
    var y = yPos * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return new Array(offsetX + x, offsetY + y);
}

function startHeartAnimation() {
    var interval = 50;
    var angle = 10;
    var tick = 0;
    var heart = new Array();
    var animationTimer = setInterval(function () {
        var bloom = getHeartPoint(angle);
        var draw = true;
        for (var i = 0; i < heart.length; i++) {
            var p = heart[i];
            var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
            if (distance < Garden.options.bloomRadius.max * 1.3) {
                draw = false;
                break;
            }
        }
        if (draw) {
            ++tick;
            heart.push(bloom);
            if (tick > 2) {
                garden.createRandomBloom(bloom[0], bloom[1]);
            }
        }
        if (angle >= 30) {
            clearInterval(animationTimer);
            showMessages();
        } else {
            angle += 0.2;
        }
    }, interval);
}

function timeElapse(date) {
    var current = Date();
    var seconds = (Date.parse(current) - Date.parse(date)) / 1000;
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);
    var hours = Math.floor(seconds / 3600);
    if (hours < 10) {
        hours = "0" + hours;
    }
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    seconds = seconds % 60;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var result = "<span class=\"digit\">" + days + "</span>" +
        "<span class=\"d-none d-sm-inline\"> days </span><span class=\"d-inline d-sm-none\"> D </span>" +
        "<span class=\"digit\">" + hours + "</span>" +
        "<span class=\"d-none d-sm-inline\"> hours </span><span class=\"d-inline d-sm-none\"> H </span>" +
        "<span class=\"digit\">" + minutes + "</span>" +
        "<span class=\"d-none d-sm-inline\"> minutes </span><span class=\"d-inline d-sm-none\"> m </span>" +
        "<span class=\"digit\">" + seconds + "</span>" +
        "<span class=\"d-none d-sm-inline\"> seconds </span><span class=\"d-inline d-sm-none\"> s </span>";

    $("#elapseClock").html(result);
}

function showMessages() {
    $('#messages').fadeIn(4000);
}