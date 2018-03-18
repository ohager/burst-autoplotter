[![Build Status](https://travis-ci.org/ohager/burst-autoplotter.svg?branch=master)](https://travis-ci.org/ohager/burst-autoplotter)
[![codecov](https://codecov.io/gh/ohager/burst-autoplotter/branch/master/graph/badge.svg)](https://codecov.io/gh/ohager/burst-autoplotter)

# burst-autoplotter

> NEW VERSION 0.3: Complete rewritten UI using blessedjs

Automates plotting for BURST coin

Features:

- CLI-based UI for simple interaction
- Split large plots in smaller plots
- Comprehensive progress indicators
- Support for SSE, AVX, and AVX2
- Duration estimates
- Caches relevant information, like Account ID, and last written nonces
- Allows CPU and RAM selection (in enhanced mode)
- Creates optimized plots (XPlotter)

> Currently, the plotter works only! on Windows (as XPlotter is used internally)

![autoplotter-in-action](https://devbutze.com/wp-content/uploads/2018/03/autoplot_v0.3.gif)
 
## Installation

The Autoplotter is based on nodejs (>= Version 8.9 (LTS Carbon), so - if not already installed - you need to install [NodeJS](https://nodejs.org/en/download/) first.
Once installed simply call 

`npm i -g burst-autoplotter`

Afterwards, you just need to call `autoplot` in the console.

> __You need to run as administrator__ 

### Extended Mode
Since 0.0.9 there's is an extended mode, which allows you to set advanced settings like Threads, Memory, and Instruction Set.

To plot in extended mode you just need to call `autoplot -e`.


## Plot Automation?

Before you can start with BURST mining you need to prepare your hard drive. This process is called _Plotting_.
While plotting your disks will be filled with so called nonces, kind of pre-calculated values, which will be read 
while mining. The creation of a plot is a quite time consuming process. Furthermore, you need to be sure that your plots 
won't overlap, that is nonce range won't overlap. The Autoplotter takes entirely care of this.
You simply define the size and number of plots and the rest is done automatically. That way, plotting become very easy.

# Credits

This tool uses [XPlotter](https://github.com/Blagodarenko/XPlotter). 

Thanks to Blago, Cerr Janro, and DCCT
