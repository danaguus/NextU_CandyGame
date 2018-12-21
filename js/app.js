const COL=0, ROW=1;
var limitRows = 7, limitColums = 7, CandyPoints = 0, MoveCount = 0;
var _candySize = {
    _top: undefined,
    _right: undefined,
    _bottom: undefined,
    _left: undefined,
    _captured: false
}

var currMinutes;
var currSeconds;
var timer;

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
function GetRandomCandy(colClass, isPrepend) {
    var col = parseInt($(colClass).attr("number"));
    var row = parseInt($(colClass+">.candy").toArray().length)+1;
    var newCandyTag = "<img class='candy init' src='image/" + GetRandomNumber(1, 5).toString() + ".png' />";
    var candyTag = isPrepend? $(newCandyTag).prependTo($(colClass)) : $(newCandyTag).appendTo($(colClass));
    AsignCandyProperties(candyTag, col, row);

    return candyTag;
}
function AsignCandyProperties(candy, col, row) {
    $(candy).attr("cell", col.toString() + row.toString());
    captureCandySize();
    $(candy).draggable({
        snap: ".candy",
        snapMode: "inner",
        snapTolerance: (_candySize._left/2),
        stack: ".candy",
        revert: "invalid",
        revertDuration: 200,
    });
    $(candy).droppable({
        accept: ".candy",
        drop: Drop
    });
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
function FillColumnWithCandys(col) {
    var classCol = ".col-" + col.toString();
    var currCandys = $(".candy[cell^='" + col.toString() + "']").toArray();
    var _Moving = parseInt(currCandys.length)-1;
    var _toCreate = (limitRows - (parseInt(_Moving) + 1));
    var currRow = limitRows;

    for (let row = _Moving; row >= 0; row--) {
        $(currCandys[row]).attr("cell", col.toString() + currRow.toString());
        currRow--;
    }
    var delay = 1;
    for (let newRow = _toCreate; newRow >= 1; newRow--) {
        GetRandomCandy(classCol, true).attr("cell", col.toString() + newRow.toString()).css("animation-delay", "." + delay.toString() + "s");
        delay++;
    }
}
function BeginPlay(callBack) {
    var col = 1;
    $(".candy-content").empty();
    while ( col <= limitColums ) {
        var delay = limitRows;
        var classCurrentCol = ".col-" + col.toString();
        var colTag = "<div class='" + classCurrentCol.substring(1, classCurrentCol.length) + "' number='" + col.toString() + "'></div>";
        $(colTag).appendTo($(".candy-content"));
        while( $(classCurrentCol)[0].children.length < limitRows ) {
            var candyTag = GetRandomCandy(classCurrentCol, false);
            $(candyTag).css("animation-delay", "." + delay.toString() + "s");
            delay--;
        }
        col++;
    }

    return _parseToPromise(TimerCandy(callBack, 1, true));
}
function Waiting(seconds) {
    return new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, parseInt(seconds*1000));
      });
}
function _parseToPromise(value) {
    return new Promise(resolve => { resolve( (value == undefined || value == null) ? true : value ); });
}
function reLoadColumn(col) {
    var elements = [];
    for (let row = 1; row <= limitRows; row++) {
        const candy = $(".candy[cell='" + col.toString() + row.toString() + "']");
        if ($(candy).length > 0) {
            elements.push(ExtracImageName($(candy).attr("src").toString()));
        }
    }

    $(".candy[cell^='" + col.toString() + "']").remove();

    for(let row = elements.length; row >= 1; row--) {
        ReinitializeCandy(elements[row-1], col, row, true);
    }
}
function Timing() {
    currSeconds--;
    if (currSeconds == 0 && currMinutes > 0) currSeconds = 60;
    if (currSeconds == 60) { currMinutes--; currSeconds--; }

    if (currMinutes == 0 && currSeconds <= 10) {
        if (!$("#timer").hasClass("warning")) $("#timer").addClass("warning");
    }

    var impTime = Lpad(currMinutes.toString(), '0') + ":" + Lpad(currSeconds.toString(), '0');
    $("#timer").text(impTime);
    if ( currMinutes <= 0 && currSeconds <= 0 ) {
        $("#timer").removeClass("warning");
        clearInterval(timer);
    }
}
function Lpad(n, z) {
    z = z || '0';
    n = n + '';
    return n.length >= 2 ? n : new Array(2 - n.length + 1).join(z) + n;
}

async function Drop(event, ui) {
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

        if ( await _parseToPromise(EvaluateCandyDroping(Dragged, colTo, rowTo)) || 
             await _parseToPromise(EvaluateCandyDroping(Dropping, colFrom, rowFrom)) 
        ) {
            clearInterval(timer);
            await Waiting(.5);
            await _parseToPromise(reLoadColumn(colTo));
            if ( colFrom != colTo ) await _parseToPromise(reLoadColumn(colFrom));
            MoveCount++;
            $("#movimientos-text").text(MoveCount.toString());
            await TimerCandy(EvaluateCandys, 1, false);
            timer = setInterval(Timing, 1000);
        } else {
            $(Dragged).attr("cell", (colFrom.toString() + rowFrom.toString()));
            $(Dropping).attr("cell", (colTo.toString() + rowTo.toString()));

            if ( rowFrom == rowTo ) {
                ApplyAnimationHorizontal(Dragged, ( colFrom == (colTo-1) ) ? "-" : "+", 1);
                ApplyAnimationHorizontal(Dropping, ( colFrom == (colTo-1) ) ? "+" : "-", 1);
            } else {
                ApplyAnimationVertical(Dragged, ( rowFrom == (rowTo-1) ) ? "-" : "+", 1);
                ApplyAnimationVertical(Dropping, ( rowFrom == (rowTo-1) ) ? "+" : "-", 1);
            }
        }
    }
}
async function EvaluateCandys() {
    $(".candy.init").removeClass("init");
    var col=1, candysDestroying, _destroying;
    while ( col <= limitColums ) {
        var row=1;
        while( row <= limitRows ) {
            var candy = $(".candy[cell='" + col.toString() + row.toString() + "']");
            $(candy).css("animation-delay", "0s");
            if ( await _parseToPromise(EvaluateCandyDroping(candy, col, row)) ) { $(candy).addClass("destroyCandy"); }
            row++;
        }
        col++;
    }

    candysDestroying = $(".destroyCandy").length;
    _destroying = (candysDestroying > 0);

    await Waiting(1.7);
    await _parseToPromise(RemoveAndCompleteCandys());

    CandyPoints += (candysDestroying * 3);

    $("#score-text").text(CandyPoints.toString());
    return _destroying;
}
async function ReinitializeCandy(image, col, row, isPrepend) {
    var colClass = ".col-" + col.toString();
    var newCandyTag = "<img class='candy' src='image/" + image.toString() + ".png' />";
    var candyTag = isPrepend? $(newCandyTag).prependTo($(colClass)) : $(newCandyTag).appendTo($(colClass));
    await _parseToPromise(AsignCandyProperties(candyTag, col, row));

    return candyTag;
}
async function RemoveAndCompleteCandys() {
    await _parseToPromise($(".destroyCandy").detach());
    for (let col = 1; col <= limitColums; col++) {
        if ( $(".candy[cell^='" + col.toString() + "']:not(.destroyCandy)").toArray().length < limitRows ) {
            await _parseToPromise(FillColumnWithCandys(col));
        }
    }
}
async function TimerCandy(callFunc, seconds, awaitFirst) {
    if ( awaitFirst ) await Waiting(seconds);
    while (await _parseToPromise(callFunc())) {
        await Waiting(seconds);
    }
}

$(document).ready(function() {
    $(".btn-reinicio").on("click", async function() {
        clearInterval(timer);
        $(this).text("Reiniciar");
        CandyPoints = 0;
        MoveCount = 0;
        $("#score-text").text(CandyPoints.toString());
        $("#movimientos-text").text(MoveCount.toString());
        $("#timer").text("02:00");
        _candySize._captured = false;
        await _parseToPromise(BeginPlay(EvaluateCandys));
        currMinutes = 1;
        currSeconds = 60;
        timer = setInterval(Timing, 1000);
    });
});