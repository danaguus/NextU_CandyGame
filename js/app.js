var limitRows = 7, limitColums = 7, CandyPoints = 3;
var _candySize = {
    _top: undefined,
    _right: undefined,
    _bottom: undefined,
    _left: undefined,
    _captured: false
}
var _positionFirst = {
    _top: undefined,
    _left: undefined
}
var _positionLast = {
    _top: undefined,
    _left: undefined
}

function GetRandomNumber(star, end) {
    return  parseInt(star != undefined && star != null && end != undefined && end != null ? 
            Math.random() * (star - end) + end : Math.random());
}
function captureCandySize() {
    if ( !(_candySize._captured) ) {
        var objet = ".candy:first";
        _candySize._top    =   parseFloat($(objet).css("height").toString().substring(0, $(objet).css("height").toString().length)) + 
                            ( parseFloat($(objet).css("margin-top").toString().substring(0, $(objet).css("margin-top").toString().length)) * 2 );

        _candySize._bottom =   parseFloat($(objet).css("height").toString().substring(0, $(objet).css("height").toString().length)) + 
                            ( parseFloat($(objet).css("margin-bottom").toString().substring(0, $(objet).css("margin-bottom").toString().length)) * 2 );

        _candySize._left   =   parseFloat($(objet).css("width").toString().substring(0, $(objet).css("width").toString().length)) + 
                            ( parseFloat($(objet).css("margin-left").toString().substring(0, $(objet).css("margin-left").toString().length)) * 2 );

        _candySize._right  =   parseFloat($(objet).css("width").toString().substring(0, $(objet).css("width").toString().length)) + 
                            ( parseFloat($(objet).css("margin-right").toString().substring(0, $(objet).css("margin-right").toString().length)) * 2 );

        _candySize._captured = true;
    }
}

function DragStart(event, ui) {
    _positionFirst._top     = $(ui.helper).position().top;
    _positionFirst._left    = $(ui.helper).position().left;
}
function DropOver(event, ui) {
    _positionLast._top     = $(event.target).position().top;
    _positionLast._left    = $(event.target).position().left;
}

function ApplyAnimationHorizontal(candyElem, orientation, multiply) {
    $(candyElem).animate({
        left: orientation + "=" + (parseFloat(orientation == "+" ? _candySize._left : _candySize._right) * multiply).toString() + "px"
    },{
        duration: 500,
        easing: "swing"
    });
    return true;
}
function ApplyAnimationVertical(candyElem, orientation, multiply) {
    $(candyElem).animate({
        top: orientation + "=" + (parseFloat(orientation == "+" ? _candySize._top : _candySize._bottom) * multiply).toString() + "px"
    },{
        duration: 500,
        easing: "swing"
    });
    return true;
}

function Drop(event, ui) {
    var Dragged = $(ui.helper), Dropping = $(event.target);
    var accepted = false;

    var rowFrom = parseInt($(Dragged).attr("row")), rowTo = parseInt($(Dropping).attr("row"));
    var colFrom = parseInt($(Dragged).attr("col")), colTo = parseInt($(Dropping).attr("col"));

    if ( rowFrom == rowTo ) {
        if ( colFrom == (colTo-1)) {
            accepted = ApplyAnimationHorizontal(Dropping, "-", 1);
        } else if (colFrom == (colTo+1)) {
            accepted = ApplyAnimationHorizontal(Dropping, "+", 1);
        } else {
            ApplyAnimationHorizontal(Dragged, colFrom > colTo ? "+" : "-", colFrom > colTo ? (colFrom-colTo) : (colTo-colFrom));
        }
    } else if ( colFrom == colTo ) {
        if ( rowFrom == (rowTo-1)) {
            accepted = ApplyAnimationVertical(Dropping, "-", 1);
        } else if (rowFrom == (rowTo+1)) {
            accepted = ApplyAnimationVertical(Dropping, "+", 1);
        } else {
            ApplyAnimationVertical(Dragged, rowFrom > rowTo ? "+" : "-", rowFrom > rowTo ? (rowFrom-rowTo) : (rowTo-rowFrom));
        }
    } else {
        $(Dragged).animate({
            top: (rowFrom > rowTo ? "+" : "-") + "=" + (parseFloat(rowFrom > rowTo ? _candySize._top : _candySize._bottom) * 
                    (rowFrom > rowTo ? (rowFrom-rowTo) : (rowTo-rowFrom))).toString() + "px",
            left: (colFrom > colTo ? "+" : "-") + "=" + (parseFloat(colFrom > colTo ? _candySize._left : _candySize._right) * 
                    (colFrom > colTo ? (colFrom-colTo) : (colTo-colFrom))).toString() + "px"
        },{
            duration: 500,
            easing: "swing"
        });
    }

    if ( accepted ) {
        $(Dragged).attr("row", rowTo);
        $(Dragged).attr("col", colTo);
        $(Dropping).attr("row", rowFrom);
        $(Dropping).attr("col", colFrom);
    }
}
function ExtracImageName(src) {
    var pos = src.search(".png");
    return src.substring(pos-1, pos);
}
function EvaluateRows(column) {
    var col = $(column).attr("number").toString();
    $("div[number='" + col + "']>.candy").toArray().forEach(candy => {
        var name = ExtracImageName(candy.src);
        var row = $(candy).attr("row");

        

    });
}
function EvaluateCandys() {
    $("div[class^='col-'").toArray().forEach(column => {
        EvaluateRows(column);
    });

    return false;
}

function BeginPlay() {
    var col = 1;
    $(".candy-content").empty();
    while ( col <= limitColums ) {
        var row = 1;
        var delay = limitRows;
        var classCurrentCol = ".col-" + col.toString();
        var colTag = "<div class='" + classCurrentCol.toString().substring(1, classCurrentCol.length) + "' number='" + col.toString() + "'></div>";
        $(colTag).appendTo($(".candy-content"));
        while( $(classCurrentCol)[0].children.length < limitRows ) {
            var newCandyTag = "<img class='candy' src='image/" + GetRandomNumber(1, 5).toString() + ".png' />";
            var candyTag = $(newCandyTag).appendTo($(classCurrentCol));
            $(candyTag).css("animation-delay", "." + delay.toString() + "s");
            $(candyTag).attr("row", row.toString());
            $(candyTag).attr("col", col.toString());
            captureCandySize();
            $(candyTag).draggable({
                snap: ".candy",
                snapMode: "inner",
                snapTolerance: (_candySize._left/2),
                stack: ".candy",
                start: DragStart
            });
            $(candyTag).droppable({
                accept: ".candy",
                over: DropOver,
                drop: Drop
            });
            row++;
            delay--;
        }
        col++;
    }
}

$(document).ready(function() {
    $(".btn-reinicio").on("click", function(){
        $(this).text("Reiniciar");
        _candySize._captured = false;
        BeginPlay();
        EvaluateCandys();
    });
});