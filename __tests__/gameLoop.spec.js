import { gameLoop } from "../src/gameLoop.js";

jest.useFakeTimers();

const validIntervals = [[10], [100], [1000]];
const invalidIntervals = [[-1], [0], [9]]
const defaultInterval = 100;

describe("gameLoop", function() {
  describe("constructor", function() {
    it("returns a frozen object", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      expect(Object.isFrozen(loop)).toBe(true);
    });

    it("initialises in stopped state", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      expect(loop.isStopped()).toBe(true);
    });

    it("calls given callback", function() {
      const callback = jest.fn();
      const loop = gameLoop(callback, defaultInterval);
      loop.start();

      expect(callback).not.toHaveBeenCalled();
      jest.runTimersToTime(defaultInterval);
      expect(callback).toHaveBeenCalled();
    });

    describe.each(invalidIntervals)("invalid interval arg", function(ms) {
      it("raises error if invalid interval", function() {
        function constructWithInvalidInterval() {
          gameLoop(jest.fn(), ms);
        }

        expect(constructWithInvalidInterval).toThrowError(
          /^timer interval must be at least 10ms$/
        );
      });
    });

    describe.each(validIntervals)("valid interval arg", function(ms) {
      it(`uses passed interval value ${ms}`, function() {
        const callback = jest.fn();
        const loop = gameLoop(callback, ms);
        loop.start();

        jest.runTimersToTime(ms - 1);
        expect(callback).not.toHaveBeenCalled();

        jest.runTimersToTime(1);
        expect(callback).toHaveBeenCalled();
      });
    });

    it("can be constructed without specifying an interval", function() {
      function constructWithoutIntervalArg() {
        gameLoop(jest.fn());
      }

      expect(constructWithoutIntervalArg).not.toThrowError();
    });
  });

  describe("start", function() {
    it("sets state to started", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      expect(loop.isStarted()).toBe(false);
      loop.start();
      expect(loop.isStarted()).toBe(true);

      loop.stop();
      expect(loop.isStarted()).toBe(false);
      loop.start();
      expect(loop.isStarted()).toBe(true);

      loop.pause();
      expect(loop.isStarted()).toBe(false);
      loop.start();
      expect(loop.isStarted()).toBe(true);
    });

    it("raises error if already started", function() {
      function startGameLoop() {
        loop.start();
      }

      const loop = gameLoop(jest.fn(), defaultInterval);
      startGameLoop();
      expect(startGameLoop).toThrowError(
        "gameLoop.start() called when gameLoop already started"
      );
    });

    it("raises error if interval not set", function() {
      function startGameLoop() {
        loop.start();
      }

      const loop = gameLoop(jest.fn());
      expect(startGameLoop).toThrowError(
        "timer interval must be set before timer can start"
      );
    });

    describe.each(validIntervals)("valid intervals", function(ms) {
      it(`calls callback after ${ms}ms`, function() {
        const callback = jest.fn();
        const loop = gameLoop(callback, ms);

        jest.runTimersToTime(ms);
        expect(callback).not.toHaveBeenCalled();

        loop.start();

        jest.runTimersToTime(ms);
        expect(callback).toHaveBeenCalled();
      });

      it(`calls callback every ${ms}ms`, function() {
        const callback = jest.fn();
        const loop = gameLoop(callback, ms);
        loop.start()

        jest.runTimersToTime(ms * 3);
        expect(callback).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe("stop", function() {
    it("sets state to stopped", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();
      loop.pause();
      expect(loop.isStopped()).toBe(false);
      loop.stop();
      expect(loop.isStopped()).toBe(true);

      loop.start();
      expect(loop.isStopped()).toBe(false);
      loop.stop();
      expect(loop.isStopped()).toBe(true);
    });

    it("raises error if already stopped", function() {
      function stopGameLoop() {
        loop.stop();
      }

      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();
      stopGameLoop();
      expect(stopGameLoop).toThrowError(
        "gameLoop.stop() called when gameLoop already stopped"
      );
    });

    describe.each(validIntervals)("with valid intervals", function(ms) {
      it(`no longer calls callback at intervals`, function() {
        const callback = jest.fn();
        const loop = gameLoop(callback, ms);
        loop.start();
        jest.runTimersToTime(ms);
        expect(callback).toHaveBeenCalledTimes(1);

        loop.stop();
        jest.runTimersToTime(ms * 5);
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("pause", function() {
    it("sets state to paused", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();
      expect(loop.isStopped()).toBe(false);
      loop.pause();
      expect(loop.isPaused()).toBe(true);
    });

    it("raises error if already paused", function() {
      function pauseGameLoop() {
        loop.pause();
      }

      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();
      pauseGameLoop();
      expect(pauseGameLoop).toThrowError(
        "gameLoop.pause() called when gameLoop already paused"
      );
    });

    it("raises error if gameLoop is stopped", function() {
      function pauseGameLoop() {
        loop.pause();
      }

      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();
      loop.stop();
      expect(pauseGameLoop).toThrowError(
        "gameLoop.pause() called when gameLoop is stopped"
      );
    });

    describe.each(validIntervals)("with valid intervals", function(ms) {
      it("resets interval on restart", function() {
        const callback = jest.fn();
        const loop = gameLoop(callback, ms);
        loop.start();
        jest.runTimersToTime(ms - 1);
        expect(callback).not.toHaveBeenCalled();

        loop.pause();
        loop.start();
        jest.runTimersToTime(ms - 1);
        expect(callback).not.toHaveBeenCalled();

        jest.runTimersToTime(1);
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe("isStarted", function() {
    it("to return true if started", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();

      expect(loop.isStarted()).toBe(true);
    });

    it("to return false if paused or stopped", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      expect(loop.isStarted()).toBe(false);

      loop.start();
      loop.pause();
      expect(loop.isStarted()).toBe(false);

      loop.stop();
      expect(loop.isStarted()).toBe(false);
    });
  });

  describe("isStopped", function() {
    it("to return true if stopped", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      expect(loop.isStopped()).toBe(true);

      loop.start();
      loop.stop();
      expect(loop.isStopped()).toBe(true);
    });

    it("to return false if started or paused", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();

      expect(loop.isStopped()).toBe(false);

      loop.pause();
      expect(loop.isStopped()).toBe(false);
    });
  });

  describe("isPaused", function() {
    it("to return true if paused", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      loop.start();
      loop.pause();
      expect(loop.isPaused()).toBe(true);
    });

    it("to return false if started or stopped", function() {
      const loop = gameLoop(jest.fn(), defaultInterval);
      expect(loop.isPaused()).toBe(false);

      loop.start();
      expect(loop.isPaused()).toBe(false);

      loop.stop();
      expect(loop.isPaused()).toBe(false);
    });
  });

  describe("setInterval", function() {
    describe.each(validIntervals)("with valid intervals", function(ms) {
      it("restarts gameLoop with new interval", function() {
        const callback = jest.fn();
        const loop = gameLoop(callback, defaultInterval);
        loop.start();
        jest.runTimersToTime(defaultInterval - 1);
        expect(callback).not.toHaveBeenCalled();

        loop.setInterval(ms);
        jest.runTimersToTime(1);
        expect(callback).not.toHaveBeenCalled();

        jest.runTimersToTime(ms - 1);
        expect(callback).toHaveBeenCalled();
      });
    });

    describe.each(invalidIntervals)("with invalid intervals", function(ms) {
      it("raises error if invalid interval", function() {
        function setInvalidInterval() {
          loop.setInterval(ms);
        }
        const loop = gameLoop(jest.fn());

        expect(setInvalidInterval).toThrowError(
          /^timer interval must be at least 10ms$/
        );
      });
    });
  });
});
