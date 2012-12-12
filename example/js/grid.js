eve.once("load.ui", function () {
    function Grid (divId, rows, columns) {
        var parent = document.getElementById(divId),
            block, i, j;
        this.blocks = [];
        this.states = [];
        this.rows = rows;
        this.columns = columns;
        for (i = 0; i < rows; i++) {
            this.blocks[i] = [];
            this.states[i] = [];
            for (j = 0; j < columns; j++) {
                block = document.createElement("div");
                block.classList.add("grid_block");
                block.data = {
                    evnt: "ui.gridBlock",
                    row: i,
                    column: j
                };
                this.blocks[i].push(block);
                this.states[i].push(false);
                parent.appendChild(block);
            }
            block.classList.add("last_in_row");
        }
    }
    Grid.prototype.lightColumn = function (index, lightUp) {
        var mod = lightUp === true ? "add" : "remove";
        for (var i = 0; i < this.rows; i++) {
            this.blocks[i][index].classList[mod]("light_up");
        }
    };
    Grid.prototype.activateBlock = function (row, column) {
        var state = !this.states[row][column],
            mod = state ? "add" : "remove";
        this.blocks[row][column].classList[mod]("active");
        this.states[row][column] = state;
    };
    Grid.prototype.clearAll = function () {
        var i, j;
        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.columns; j++) {
                this.blocks[i][j].classList.remove("light_up");
            }
        }
    };
    Grid.prototype.mouseEvent = function (el) {
        this.activateBlock(el.data.row, el.data.column);
    };
    this.ui.grid = new Grid("grid", 8, 16);
});