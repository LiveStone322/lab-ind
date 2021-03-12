"use strict";

const fs = require("fs");
const path = require("path");

const matrix = fs
  .readFileSync(path.join(__dirname, "input2.txt"))
  .toString()
  .split("\n")
  .map((e) => e.split(" ").map((n) => Number.parseInt(n)));

const matrix2 = matrix.map((a) => a.map((e) => (e == 0 ? Infinity : e)));

printMat(matrix);

const linksCount = matrix.flat().filter((e) => e !== 0).length / 2;

const n = matrix.length;

let result = [];
let minValue = Infinity;

function isEilerCycle(matrix, n) {
  let { degrees, oddList } = getDegreesAndOddList(matrix, n);

  if (oddList.length > 2) return [];

  let stack = [0];
  let result = [];
  let tempMatrix = matrix.slice(0);

  let i = 0;

  while (stack.length !== 0) {
    if (degrees[i] === 0) {
      result.push(stack[stack.length - 1]);
      stack.pop();
    } else {
      for (let j = 0; j < n; j++) {
        if (tempMatrix[i][j] !== 0) {
          tempMatrix[i][j] = 0;
          degrees[i] -= 1;
          degrees[j] -= 1;
          tempMatrix[j][i] = 0;
          stack.push(j);
          i = j;
          break;
        }
      }
    }
  }
  let usedNodes = matrix.map((_, idx) => idx).filter((e) => result.includes(e));
  return usedNodes.length === matrix.length ? result : [];
}

function findAdj(i, matrix, n) {
  let k = 0;
  for (let j = 0; j < n; j++) {
    if (matrix[i][j] > 0 && matrix[i][j] < Infinity) k++;
  }
  return k;
}

function getDegrees(matrix, n) {
  let nodes = [];
  matrix.forEach(() => nodes.push(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] !== 0) {
        nodes[i]++;
      }
    }
  }
  return nodes;
}

function getDegreesAndOddList(matrix, n) {
  let degrees = getDegrees(matrix, n);
  let oddList = [];
  degrees.forEach((e, idx) => {
    if (matrix[idx][idx] !== 0 || e === 0) {
      console.error("Ошибка в графе!");
    }
    if (e % 2 !== 0) {
      oddList.push(idx);
    }
  });
  return {
    degrees,
    oddList,
  };
}

function copyMatrix(matrix) {
  let m = [];
  for (let i = 0; i < matrix.length; i++) {
    m.push([]);
    for (let j = 0; j < matrix.length; j++) {
      m[i].push(matrix[i][j]);
    }
  }
  return m;
}

function finalFind(oddCount, oddList, linksCount, n, matrix, matrixOddDist, d) {
  let incCount = linksCount + oddCount / 2;

  //матрица инцидентности
  let matrixInc = [];
  for (let i = 0; i < n; i++) {
    matrixInc.push([]);
    for (let j = 0; j < incCount; j++) {
      matrixInc[i][j] = 0;
    }
  }

  let v = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (matrix[i][j] != 0) {
        matrixInc[i][v] = matrix[i][j];
        matrixInc[j][v] = matrix[i][j];
        v++;
      }
    }
  }
  //добавить новые ребра и найти новый эйлеров путь
  for (let i = 0; i < oddCount; i += 2) {
    if (matrix[oddList[result[i]]][oddList[result[i + 1]]] != 0) {
      linksCount++;
      matrixInc[oddList[result[i]]][v] =
        matrixOddDist[result[i]][result[i + 1]];
      matrixInc[oddList[result[i + 1]]][v] =
        matrixOddDist[result[i]][result[i + 1]];
      v++;
    }
  }

  for (let i = 0; i < oddCount; i += 2) {
    if (matrix[oddList[result[i]]][oddList[result[i + 1]]] == 0) {
      matrixInc[oddList[result[i]]][v] =
        matrixOddDist[result[i]][result[i + 1]];
      matrixInc[oddList[result[i + 1]]][v] =
        matrixOddDist[result[i]][result[i + 1]];
      v++;
    }
  }

  let mask2 = [];
  for (let j = 0; j < incCount; j++) {
    mask2[j] = 0;
  }
  let put = [];
  put.push(0);

  solveEiler(d, matrixInc, mask2, put, incCount, 0, n, linksCount, matrix);
}

function solveEiler(
  d,
  matrixInc,
  mask,
  put,
  incCount,
  k,
  n,
  linksCount,
  matrix
) {
  let allNodes = true;
  let nextIdx = mask.findIndex((e) => e === 0);
  if (nextIdx !== -1) {
    allNodes = false;
  }
  if (allNodes) {
    console.log(`Получившийся путь: `);
    let sum = 0;
    let path = "";
    path += put[0];
    for (let i = 1; i < put.length; i++) {
      path += " -> " + put[i];
      if (matrix[put[i]][put[i - 1]] == 0) {
        sum += d[put[i]][put[i - 1]];
      } else {
        sum += matrix[put[i]][put[i - 1]];
      }
    }
    console.log(path);
    console.log(`Длина пути: ${sum}`);
    return true;
  } else {
    for (let i = 0; i < incCount; i++) {
      if (matrixInc[k][i] !== 0 && mask[i] === 0) {
        for (let j = 0; j < n; j++) {
          if (matrixInc[j][i] !== 0 && j !== k) {
            if (i >= linksCount) {
              mask[i] = 1;
              let put2 = minDist(d, k + 1, j + 1);
              let pc = put2.length;
              for (let s = 1; s < pc; s++) {
                put.push(put2[s]);
              }

              if (
                solveEiler(
                  d,
                  matrixInc,
                  mask,
                  put,
                  incCount,
                  j,
                  n,
                  linksCount,
                  matrix
                )
              )
                return true;
              for (let s = 1; s < pc; s++) {
                put.slice(put.Count() - 1, 1);
              }
              mask[i] = 0;
              break;
            } else {
              mask[i] = 1;
              put.push(j);
              if (
                solveEiler(
                  d,
                  matrixInc,
                  mask,
                  put,
                  incCount,
                  j,
                  n,
                  linksCount,
                  matrix
                )
              )
                return true;
              put.pop();
              mask[i] = 0;
              break;
            }
          }
        }
      }
    }
    return false;
  }
}

function minDist(d, k, j) {
  let line = [];
  line.push(k);
  k--;
  j--;
  while (k !== j) {
    line.push(d[k][j]);
    k = d[k][j];
  }
  return line;
}

function findMinPairs(matrix, mask, oddCount, minPairs = [], val = 0) {
  let allNodes = true;
  let nextIdx = mask.findIndex((e) => !e);
  if (nextIdx !== -1) {
    allNodes = false;
  }

  if (allNodes) {
    if (minValue > val) {
      minValue = val;
      result = [];
      for (let i = 0; i < oddCount; i++) {
        result.push(minPairs[i]);
      }
    }
  } else {
    mask[nextIdx] = true; // взяли элемент
    minPairs.push(nextIdx);

    for (let i = nextIdx + 1; i < oddCount; i++) {
      if (mask[i] == false) {
        mask[i] = true; // взяли элемент
        minPairs.push(i);
        val += matrix[nextIdx][i]; //добавляем вес

        findMinPairs(matrix, mask, oddCount, minPairs, val); // идем за следующе парой

        mask[i] = false; //откат
        minPairs = minPairs.splice(minPairs.length - 1, 1);
        val -= matrix[nextIdx][i];
      }
    }
  }
}

function printMat(matrix) {
  console.table(matrix);
}

function solve(matrix, matrix2, n) {
  console.log("Точный метод");
  const tempMatrix = copyMatrix(matrix2);
  const eilerCycle = isEilerCycle(matrix, n);
  if (eilerCycle.length !== 0) {
    console.log(`Найден эйлеров цикл: ${eilerCycle}`);
    return;
  }

  let { degrees, oddList } = getDegreesAndOddList(matrix, n);
  let d = copyMatrix(matrix);

  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = j;

  for (let k = 0; k < n; ++k)
    for (let i = 0; i < n; ++i)
      for (let j = 0; j < n; ++j)
        if (
          tempMatrix[i][k] < Infinity &&
          tempMatrix[k][j] < Infinity &&
          i != j
        ) {
          let prev = tempMatrix[i][j];
          tempMatrix[i][j] = Math.min(
            tempMatrix[i][j],
            tempMatrix[i][k] + tempMatrix[k][j]
          );

          if (tempMatrix[i][j] < prev) d[i][j] = d[i][k];
        }

  let matrixOddDist = [];
  for (let i = 0; i < oddList.length; i++) {
    matrixOddDist.push([]);
    for (let j = 0; j < oddList.length; j++)
      matrixOddDist[i].push(tempMatrix[oddList[i]][oddList[j]]);
  }

  let mask = oddList.slice(0).map(() => false);

  findMinPairs(matrixOddDist, mask, oddList.length);

  finalFind(oddList.length, oddList, linksCount, n, matrix, matrixOddDist, d);

  console.log("--------------");
  solveGreedy(oddList, matrixOddDist, linksCount, n, matrix, d);
}

function solveGreedy(oddList, matrixOddDist, l, n, matrix, d) {
  console.log("Жадный метод");
  result = [];
  let mask = oddList.map(() => false);
  for (let k = 0; k < oddList.length / 2; k++) {
    let minI = 0;
    let minJ = 0;
    minValue = Infinity;
    for (let i = 0; i < oddList.length; i++) {
      if (mask[i] === false)
        for (let j = i; j < oddList.length; j++) {
          if (mask[j] === false && i !== j && minValue > matrixOddDist[i][j]) {
            minValue = matrixOddDist[i][j];
            minI = i;
            minJ = j;
          }
        }
    }
    result.push(minI);
    result.push(minJ);
    mask[minI] = true;
    mask[minJ] = true;
  }

  finalFind(oddList.length, oddList, l, n, matrix, matrixOddDist, d);
}

console.log("--------------");
solve(matrix, matrix2, n);
