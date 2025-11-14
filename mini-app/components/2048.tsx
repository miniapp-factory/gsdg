"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function getRandomTile() {
  return Math.random() < TILE_PROBABILITIES[0] ? 2 : 4;
}

function cloneGrid(grid: number[][]) {
  return grid.map(row => [...row]);
}

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const addRandomTile = useCallback((g: number[][]) => {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return g;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    g[r][c] = getRandomTile();
    return g;
  }, []);

  const initGame = useCallback(() => {
    let newGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback((dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const rotate = (g: number[][], times: number) => {
      let res = g;
      for (let t = 0; t < times; t++) {
        const newG: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            newG[c][GRID_SIZE - 1 - r] = res[r][c];
          }
        }
        res = newG;
      }
      return res;
    };

    const compress = (g: number[][]) => {
      const newG: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
      for (let r = 0; r < GRID_SIZE; r++) {
        let pos = 0;
        for (let c = 0; c < GRID_SIZE; c++) {
          if (g[r][c] !== 0) {
            newG[r][pos] = g[r][c];
            pos++;
          }
        }
      }
      return newG;
    };

    const merge = (g: number[][]) => {
      let gained = 0;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE - 1; c++) {
          if (g[r][c] !== 0 && g[r][c] === g[r][c + 1]) {
            g[r][c] *= 2;
            g[r][c + 1] = 0;
            gained += g[r][c];
          }
        }
      }
      return { g, gained };
    };

    let times = 0;
    if (dir === "up") times = 1;
    else if (dir === "right") times = 2;
    else if (dir === "down") times = 3;

    let rotated = rotate(grid, times);
    let compressed = compress(rotated);
    const { g: merged, gained } = merge(compressed);
    let final = compress(merged);
    final = rotate(final, (4 - times) % 4);

    if (JSON.stringify(final) !== JSON.stringify(grid)) {
      setGrid(final);
      setScore(prev => prev + gained);
      const newGrid = addRandomTile(final);
      setGrid(newGrid);
      if (!hasMoves(newGrid)) setGameOver(true);
    }
  }, [grid, gameOver, addRandomTile]);

  const hasMoves = (g: number[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return true;
        if (c < GRID_SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
        if (r < GRID_SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
      }
    }
    return false;
  };

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowUp") move("up");
    else if (e.key === "ArrowDown") move("down");
    else if (e.key === "ArrowLeft") move("left");
    else if (e.key === "ArrowRight") move("right");
  }, [move]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((val, idx) => (
          <div
            key={idx}
            className={`flex h-12 w-12 items-center justify-center rounded-md text-xl font-bold ${
              val === 0
                ? "bg-muted"
                : val < 8
                ? "bg-primary text-primary-foreground"
                : val < 16
                ? "bg-secondary text-secondary-foreground"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {val !== 0 ? val : null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("up")}>↑</Button>
        <Button onClick={() => move("left")}>←</Button>
        <Button onClick={() => move("right")}>→</Button>
        <Button onClick={() => move("down")}>↓</Button>
      </div>
      <div className="text-lg">Score: {score}</div>
      {gameOver && (
        <Share
          text={`I just finished a game of 2048 with a score of ${score}! Check it out at ${url}`}
        />
      )}
    </div>
  );
}
