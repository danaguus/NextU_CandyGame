const COL=0, ROW=1;
var limitRows = 7, limitColums = 7, CandyPoints = 3;
var _candySize = {
    _top: undefined,
    _right: undefined,
    _bottom: undefined,
    _left: undefined,
    _captured: false
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
function GetRandomCandy(colClass) {
    var col = parseInt($(colClass).attr("number"));
    var row = parseInt($(colClass+">.candy").toArray().length)+1;
    var newCandyTag = "<img class='candy' src='image/" + GetRandomNumber(1, 5).toString() + ".png' />";
    var candyTag = $(newCandyTag).appendTo($(colClass));
    $(candyTag).attr("cell", col.toString() + row.toString());
    captureCandySize();
    $(candyTag).draggable({
        snap: ".candy",
        snapMode: "inner",
        snapTolerance: (_candySize._left/2),
        stack: ".candy"
    });
    $(candyTag).droppable({
        accept: ".candy",
        drop: Drop
    });

    return candyTag;
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

    var rowFrom = parseInt($(Dragged).attr("cell").substring(ROW,ROW+1)), rowTo = parseInt($(Dropping).attr("cell").substring(ROW,ROW+1));
    var colFrom = parseInt($(Dragged).attr("cell").substring(COL,COL+1)), colTo = parseInt($(Dropping).attr("cell").substring(COL,COL+1));

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
        $(Dragged).attr("cell", (colTo.toString() + rowTo.toString()));
        $(Dropping).attr("cell", (colFrom.toString() + rowFrom.toString()));
    }
}
function ExtracImageName(src) {
    var pos = src.search(".png");
    return src.substring(pos-1, pos);
}
function EvaluateCandyDirection(type, col, row, isVertical, operator) {
    var cont=1, nextObject, othersType;

    do {
        if (!isVertical) {
            col = ( (operator == "+")? (col+1) : (col-1) );
        } else {
            row = ( (operator == "+")? (row+1) : (row-1) );
        }
        nextObject = $(".candy[cell='" + col.toString() + row.toString() + "'");
        if ( $(nextObject).length != 0 ) {
            othersType = ExtracImageName($(nextObject).attr("src").toString());
            if ( othersType == type ) {
                cont++;
                if (cont>=3) { return true; }
            } else { break; }
        } else { break; }
    } while ($(nextObject).length != 0);

    return false;
}
function EvaluateCandyInMiddle(type, col, row, isVertical) {
    var prevObject = $(".candy[cell='" + (isVertical? ( (col-1).toString() + row.toString() ) : ( col.toString() + (row-1).toString() ) ).toString() + "']"),
        nextObject = $(".candy[cell='" + (isVertical? ( (col+1).toString() + row.toString() ) : ( col.toString() + (row+1).toString() ) ).toString() + "']");

    if ( ( $(prevObject).length != 0 ) && ( $(nextObject).length != 0 ) ) {
        var typePrev = ExtracImageName($(prevObject).attr("src").toString()), 
            typeNext = ExtracImageName($(nextObject).attr("src").toString());

        if ( ( typePrev == type ) && ( typeNext == type ) ) { return true; }
    }

    return false;
}
function EvaluateCandyDroping(candy, col, row) {
    var type = ExtracImageName($(candy).attr("src").toString());

//  Evaluamos los dulces hacía arriba del actual para determinar si tiene al menos dos iguales.
    if ( EvaluateCandyDirection(type, col, row, true, "-") ) { return true; }
//  Evaluamos los dulces hacía abajo del actual para determinar si tiene al menos dos iguales.
    if ( EvaluateCandyDirection(type, col, row, true, "+") ) { return true; }
//  Evaluamos los dulces hacía la izquierda del actual para determinar si tiene al menos dos iguales.
    if ( EvaluateCandyDirection(type, col, row, false, "-") ) { return true; }
//  Evaluamos los dulces hacía la derecha del actual para determinar si tiene al menos dos iguales.
    if ( EvaluateCandyDirection(type, col, row, false, "+") ) { return true; }

//  Evaluamos si el dulce actual se encuentra en medio de al menos dos identicos en orientación vertical
    if ( EvaluateCandyInMiddle(type, col, row, true) ) { return true; }
//  Evaluamos si el dulce actual se encuentra en medio de al menos dos identicos en orientación horizontal
    if ( EvaluateCandyInMiddle(type, col, row, false) ) { return true; }

    return false;
}
function EvaluateCandys() {
    var col=1;
    while ( col <= limitColums ) {
        var row=1;
        while( row <= limitRows ) {
            var candy = $(".candy[cell='" + col.toString() + row.toString() + "']");
            if ( EvaluateCandyDroping(candy, col, row) ) { $(candy).addClass("destroyCandy"); }
            row++;
        }
        col++;
    }

    return false;
}
function BeginPlay(callBack) {
    var col = 1;
    $(".candy-content").empty();
    while ( col <= limitColums ) {
        var delay = limitRows;
        var classCurrentCol = ".col-" + col.toString();
        var colTag = "<div class='" + classCurrentCol.toString().substring(1, classCurrentCol.length) + "' number='" + col.toString() + "'></div>";
        $(colTag).appendTo($(".candy-content"));
        while( $(classCurrentCol)[0].children.length < limitRows ) {
            var candyTag = GetRandomCandy(classCurrentCol);
            $(candyTag).css("animation-delay", "." + delay.toString() + "s");
            delay--;
        }
        col++;
    }

    var interval = setInterval(function() {
        callBack();
        clearInterval(interval);
    }, 2000);
}

$(document).ready(function() {
    $(".btn-reinicio").on("click", function(){
        $(this).text("Reiniciar");
        _candySize._captured = false;
        BeginPlay(EvaluateCandys);
    });
});