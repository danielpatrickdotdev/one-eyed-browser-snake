======================
One Eyed Browser Snake
======================

An HTML & JS snake clone.

Built without using canvas as an experiment. Yes, I know this is terrible.

-----
Usage
-----

Build the example:

.. code-block:: console

    git clone git@github.com:remarkablerocket/one-eyed-browser-snake.git
    cd one-eyed-browser-snake
    npm install --no-save
    npm run build-example

The ``example`` folder should now contain a working example. Open ``example/snake.html`` in a browser to play. Tested in Firefox 62 and Chromium 69.

Controls
--------

Up, Down, Left, Right
  Arrow keys

Pause
  Space bar or click within game rectangle

-----------
Development
-----------

.. code-block:: console

    git clone git@github.com:remarkablerocket/one-eyed-browser-snake.git
    cd one-eyed-browser-snake
    npm install --only=dev --no-save

-------------
Running tests
-------------

.. code-block:: console

    npm test
