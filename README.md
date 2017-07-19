# burst-autoplotter

Automates plotting for BURST coin

Features:

- CLI-based UI for simple interaction
- Split large plots in smaller plots
- Comprehensive progress indicator
- Caches relevant information, like Account ID, and last written nonces
- Allows CPU and RAM selection
- Creates optimized plots (XPlotter)

> Currently, the plotter works only! on Windows

![autoplotter-in-action](https://cdn.discordapp.com/attachments/324092664813191170/336669430446555147/autoplotter.gif)
 
## Installation

The Autoplotter is based on nodejs (>= Version 6), so - if not already installed - you need to install [NodeJS](https://nodejs.org/en/download/) first.
Once installed simply call 

`npm i -g burst-autoplot`

Afterwards, you just need to call `autoplot` no console.

> __RUN CONSOLE AS ADMIN TO MAKE PLOT RUN SIGNIFICANTLY FASTER__


## Plot Automation?

Before you can start with BURST mining you need to prepare your hard drive. This process is called _Plotting_.
While plotting your disks will be filled with so called nonces, kind of pre-calculated values, which will be read 
while mining. The creation of a plot is a quite time consuming process. Furthermore, you need to be sure that your plots 
won't overlap, that is nonce range won't overlap. The Autoplotter takes entirely care of this.
You simply define the size and number of plots and the rest is done automatically. That way, plotting become very easy.
