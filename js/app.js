var limitRows = 7, limitColums = 7, CandyPoints = 3;
var _top, _left;

function GetRandomNumber(star, end) {
    return  parseInt(star != undefined && star != null && end != undefined && end != null ? 
            Math.random() * (star - end) + end : Math.random());
}
function BuildDragAcceptSelector(row, col) {
    return ".candy[row='" + row.toString() + "']," +
           ".candy[col='" + col.toString() + "'] "
}
function capturePosition(event, ui) {
    _top    = $(ui.helper).offset().top;
    _left   = $(ui.helper).offset().left;
}
function Dropping(event, ui) {
    $(event.target).addClass("candy-hover");
}
function DroppingOut(event, ui) {
    $(event.target).removeClass("candy-hover");
}
function Dropped(event, ui) {
    var accept = false;

    var candyDragging = $(ui.draggable[0]);
    var candyTarget = $(event.target);
    candyTarget.removeClass("candy-hover");

    var rowFrom = parseInt(candyDragging.attr("row")), rowTo = parseInt(candyTarget.attr("row"));
    var colFrom = parseInt(candyDragging.attr("col")), colTo = parseInt(candyTarget.attr("col"));

    if ( rowFrom == rowTo ) {
        if ( ( (colTo+1) == colFrom ) || ( (colTo-1) == colFrom ) ) {
            accept = true;
        }
    } else {
        if ( colFrom == colTo ) {
            if ( ( (rowTo+1) == rowFrom ) || ( (rowTo-1) == rowFrom ) ) {
                accept = true;
            }
        }
    }

    if ( accept ) {
        $(candyTarget).offset({
            top: _top,
            left: _left
        });
        $(candyTarget).attr("row", rowFrom.toString());
        $(candyTarget).attr("col", colFrom.toString());
        $(candyDragging).attr("row", rowTo.toString());
        $(candyDragging).attr("col", colTo.toString());
    } else {
        $(candyDragging).offset({
            top: _top,
            left: _left
        });
    }
}
function BeginPlay() {
    var row = 1;
    var col = 1;
    $(".candy-content").empty();
    while ($(".candy-content")[0].children.length < (limitRows*limitColums)) {
        var newCandyTag = "<img class='candy' src='image/" + GetRandomNumber(1, 5).toString() + ".png' />";
        var candyTag = $(newCandyTag).appendTo($(".candy-content"));
        $(candyTag).css("animation-delay", "." + row.toString() + "s");
        $(candyTag).attr("row", row.toString());
        $(candyTag).attr("col", col.toString());
        $(candyTag).draggable({
            revert: "invalid",
            revertDuration: 200,
            snap: ".candy",
            stack: ".candy",
            snapMode: "inner",
            snapTolerance: 50,
            start: capturePosition
        });
        $(candyTag).droppable({
            accept: BuildDragAcceptSelector(row, col),
            over: Dropping,
            out: DroppingOut,
            drop: Dropped
        });
        row++;
        if ( row > limitRows )
        {
            col++;
            row = 1;
        }
    }

}

$(document).ready(function() {
    $(".btn-reinicio").on("click", function(){
        $(this).text("Reiniciar");
        _top = undefined;
        _left = undefined;
        BeginPlay();
    });
});