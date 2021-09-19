console.clear();

const CELL_STYLES = {
  position: "absolute",
  textAlign: "center",
  padding: "0",
};

let SIZE;
let CELL_SIZE;
let positions = [];
let cells;

let win;
let overlay = document.querySelector(".overlay");
let playerWin = document.querySelector(".win__player");
let computerWin = document.querySelector(".win__computer");
let frWin = document.querySelector(".win__friendship");
let startBtn = document.querySelector(".startBtn");
let fieldContainer = document.getElementById("field");
let setting = document.querySelector(".setting");
let fieldEl = document.querySelector(".fieldS");
let cellEl = document.querySelector(".cellS");
let box = document.querySelector(".first");
let eS = document.querySelector(".error__size");
let eL = document.querySelector(".error__level");
let dif = document.getElementById("dif");
let easy = document.getElementById("easy");

function start() {
  startBtn.addEventListener("click", function (event) {
    event.preventDefault();
    cells = []; //restart, it is necessary to clear the array before each start, else after restart zero won't be put
    let fieldS = fieldEl.value; // custom values for field size and cells size
    let cellS = cellEl.value;

    if (
      fieldS > 2 &&
      fieldS < 20 &&
      cellS > 15 &&
      (easy.checked || dif.checked)
    ) {
      let font = cellS - 4; // font size
      CELL_STYLES.width = cellS + "px";
      CELL_STYLES.height = cellS + "px";
      CELL_STYLES.fontSize = font + "px";
      CELL_SIZE = cellS;
      SIZE = fieldS;
      setting.classList.remove("show"); // remove settings window if everything is fine
      setting.classList.add("hidden");
      createField(SIZE);
    } else if (fieldS < 2 || fieldS > 20 || cellS < 15) {
      eS.classList.remove("hidden"); //else size error message
      eS.classList.add("show");
    } else {
      eS.classList.remove("show");
      eS.classList.add("hidden");
      eL.classList.remove("hidden"); //if game level is not detected
      eL.classList.add("show");
    }
  });
}

start();

function restart() {
  let newGame = document.querySelector(".restart");
  let btn;
  newGame.addEventListener("click", function (event) {
    event.preventDefault();
    btn = document.querySelectorAll("#field button");
    overlay.classList.remove("show");
    overlay.classList.add("hidden");
    //remove window that determines the winner
    if (playerWin.classList.contains("show")) {
      playerWin.classList.remove("show");
      playerWin.classList.add("hidden");
    } else if (computerWin.classList.contains("show")) {
      computerWin.classList.remove("show");
      computerWin.classList.add("hidden");
    } else {
      frWin.classList.remove("show");
      frWin.classList.add("hidden");
    }
    for (let i = 0; i < btn.length; i++) {
      btn[i].remove(); //remove button in the field, save only container "field"
    }
    setting.classList.remove("hidden"); //restore settings windiw and reset previous size value
    setting.classList.add("show");
    fieldEl.value = "";
    cellEl.value = "";
    box.checked = false;
    dif.checked = false;
    easy.checked = false;
    if (eS.classList.contains("show")) {
      eS.classList.remove("show"); 
      eS.classList.add("hidden");
    } else if (eL.classList.contains("show")) {
      eL.classList.remove("show"); 
      eL.classList.add("hidden");
    }
    e.classList.remove("show"); // вообще не нужно, но без этого работает с ошибкой

    start();
  });
}

restart();

function createField(size) {
  let widthF = size * CELL_SIZE; //width of field for horizontal alignment
  fieldContainer.classList.remove("hidden");
  fieldContainer.classList.add("show");
  fieldContainer.style.position = "absolute";
  fieldContainer.style.width = widthF + "px";
  let counter = 0;
  for (let i = 0; i < size; i++) {
    positions[i] = [];
    for (let j = 0; j < size; j++) {
      positions[i][j] = -1;
      counter++;
      cells.push(cell(fieldContainer, i, j, counter));
    }
  }
  if (!box.checked) {
    computerStep();
  }
  return cells;
}

function cell(parent, i, j, counter) {
  let top = i;
  let left = j;
  let cell = document.createElement("BUTTON");
  setStyle(cell, CELL_STYLES);
  cell.style.top = top * CELL_SIZE + "px";
  cell.style.left = left * CELL_SIZE + "px";
  cell.textContent = "";
  cell.addEventListener(
    "click",
    function (event) {
      listener(event, i, j, cell);
    },
    { once: true } //listen "click" only once on each button
  );
  parent.appendChild(cell);
  return cell;
}

function setStyle(obj, styles) {
  for (let style in styles) {
    obj.style[style] = styles[style];
  }
}

function blockade() {
  // block button presses after finish
  let count = SIZE * SIZE;
  for (let i = 0; i < count; i++) {
    cells[i].disabled = true;
  }
}
function listener(event, i, j, cell) {
  if (cell.textContent == "") {
    cell.textContent = "X";
    positions[i][j] = 1;
    let win = checkField(1);
    if (win) {
      blockade();
      //delay to view the final result
      setTimeout(function () {
        overlay.classList.remove("hidden");
        overlay.classList.add("show");
        playerWin.classList.remove("hidden");
        playerWin.classList.add("show");
      }, 1000);
    } else {
      let winC = computerStep();
      if (winC) {
        blockade();
        setTimeout(function () {
          overlay.classList.remove("hidden");
          overlay.classList.add("show");
          computerWin.classList.remove("hidden");
          computerWin.classList.add("show");
        }, 1500);
      } else {
        pos = checkFree();
        if (!pos) {
          blockade();
          setTimeout(function () {
            overlay.classList.remove("hidden");
            overlay.classList.add("show");
            frWin.classList.remove("hidden");
            frWin.classList.add("show");
            return;
          }, 1000);
        }
      }
    }
  }
}

function computerStep() {
  let pos = checkFree();
  if (pos) {
    cells[pos[0] * SIZE + pos[1]].textContent = "O";
  } else {
    blockade();
    setTimeout(function () {
      overlay.classList.remove("hidden");
      overlay.classList.add("show");
      frWin.classList.remove("hidden");
      frWin.classList.add("show");
      return;
    }, 1000);
  }
  positions[pos[0]][pos[1]] = 0;
  let win = checkField(0);
  return win;
}

function checkFree() {
  let freee;
  if (easy.checked) {
    freee = checkFreeEasy();
  } else if (dif.checked) {
    freee = checkFreeDif();
  }
  return freee;
}

function checkFreeEasy() {
  let freeCells = [];
  positions.forEach(function (row, i) {
    row.forEach(function (val, j) {
      if (positions[i][j] === -1) {
        freeCells.push([i, j]);
      }
    });
  });
  let freeCell = freeCells[Math.floor(Math.random() * freeCells.length)];
  return freeCell;
}

function checkFreeDif() {
  //create a two-dimensional array
  let weight = [];
  for (let i = 0; i < SIZE; i++) {
    weight[i] = [];
    for (let j = 0; j < SIZE; j++) {
      weight[i][j] = 0;
    }
  }

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (positions[i][j] == "-1") weight[i][j] = 1;
    }
  }

  for (let i = 0; i < SIZE; i++) {
    let horizont = 0;
    let horizontO = 1;
    for (let j = 0; j < SIZE; j++) {
      if (positions[i][j] == 1) {
        weight[i][j] = -1;
        horizont++;
      }
      if (positions[i][j] == 0) {
        horizontO++;
        weight[i][j] = -1;
      }
    }
    if (horizontO > 2) {
      for (let j = 0; j < SIZE; j++) {
        if (weight[i][j] != -1) {
          weight[i][j] = horizontO;
        }
      }
    }
    if (horizont == SIZE - 1) {
      tx = i;
      let ty = null;
      for (let y = 0; y < SIZE; y++) {
        if (positions[tx][y] == "-1") {
          ty = y;
        }
      }
      if (ty != null) {
        weight[tx][ty] = SIZE;
      }
    }
  }

  for (let j = 0; j < SIZE; j++) {
    let vertical = 0;
    let verticalO = 1;
    for (let i = 0; i < SIZE; i++) {
      if (positions[i][j] == 1) {
        vertical++;
        weight[i][j] = -1;
      }
      if (positions[i][j] == 0) {
        weight[i][j] = -1;
        verticalO++;
      }
    }
    if (verticalO > 2) {
      for (let i = 0; i < SIZE; i++) {
        if (weight[i][j] != -1) {
          weight[i][j] = verticalO;
        }
      }
    }
    if (vertical == SIZE - 1) {
      ty = j;
      let tx = null;
      for (let x = 0; x < SIZE; x++) {
        if (positions[x][ty] == "-1") {
          tx = x;
        }
      }
      if (tx != null) {
        weight[tx][ty] = SIZE;
      }
    }
  }
  let diagonalOne = 0;
  let diagonalOneO = 1;
  for (let i = 0; i < SIZE; i++) {
    if (positions[i][i] == 1) {
      diagonalOne++;
      weight[i][i] = -1;
    }
    if (positions[i][i] == 0) {
      weight[i][i] = -1;
      diagonalOneO++;
    }
  }
  if (diagonalOneO > 2) {
    for (let i = 0; i < SIZE; i++) {
      if (weight[i][i] != -1) {
        weight[i][i] = diagonalOneO;
      }
    }
  }
  if (diagonalOne == SIZE - 1) {
    for (let i = 0; i < SIZE; i++) {
      if (positions[i][i] == "-1") {
        weight[i][i] = SIZE;
      }
    }
  }

  let diagonalTwo = 0;
  let diagonalTwoO = 1;
  for (let i = 0; i < SIZE; i++) {
    if (positions[i][SIZE - i - 1] == 1) {
      diagonalTwo++;
      weight[i][SIZE - i - 1] = -1;
    }
    if (positions[i][SIZE - i - 1] == 0) {
      weight[i][SIZE - i - 1] = -1;
      diagonalTwoO++;
    }
  }
  if (diagonalTwoO > 2) {
    for (let i = 0; i < SIZE; i++) {
      if (weight[i][SIZE - i - 1] != -1) {
        weight[i][SIZE - i - 1] = diagonalOneO;
      }
    }
  }
  if (diagonalTwo == SIZE - 1) {
    for (let i = 0; i < SIZE; i++) {
      if (positions[i][SIZE - i - 1] == "-1") {
        weight[i][SIZE - i - 1] = 3;
      }
    }
  }

  let freeCells = [];
  let maxEl = 1;

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (weight[i][j] > maxEl) {
        maxEl = weight[i][j];
        mi = i;
        mj = j;
      }
    }
  }
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (weight[i][j] == maxEl) {
        freeCells.push([i, j]);
      }
    }
  }

  let freeCell = freeCells[Math.floor(Math.random() * freeCells.length)];
  return freeCell;
}

function checkField(value) {
  win = false;
  let horizont = 0,
    vertical = 0,
    diagonalOne = 0,
    diagonalTwo = 0;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (positions[i][j] == value) {
        horizont++;
      }
      for (let l = 0; l < SIZE; l++) {
        if (positions[l][j] == value) {
          vertical++;
        }
      }
      if (i === j && positions[i][j] == value) {
        diagonalOne++;
      }
      if (i === SIZE - j - 1 && positions[i][j] == value) {
        diagonalTwo++;
      }
      if (
        horizont == SIZE ||
        vertical == SIZE ||
        diagonalOne == SIZE ||
        diagonalTwo == SIZE
      ) {
        win = true;
        return win;
        break;
      }
      vertical = 0;
    }
    horizont = 0;
  }
  return win;
}
