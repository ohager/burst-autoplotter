# burst-autoplotter

[![Build Status](https://travis-ci.org/ohager/burst-autoplotter.svg?branch=master)](https://travis-ci.org/ohager/burst-autoplotter)
[![codecov](https://codecov.io/gh/ohager/burst-autoplotter/branch/master/graph/badge.svg)](https://codecov.io/gh/ohager/burst-autoplotter)

> NEW VERSION 0.4: Email and Telegram Notifications

Automates plotting for BURST coin

Features:

- Very easy plot configuration, based on simple question dialog
    - No nonce calculation necessary (setup based on disk space)
    - Splits large plots in smaller plot files
- CLI-based UI with progress indicators, ETA, etc
- Creates optimized plots (XPlotter)
- Support for SSE, AVX, and AVX2
- Caches relevant information, like last written nonces, and Account ID
- Allows CPU and RAM selection (in enhanced mode)
- Notification while plotting
    - Email notification
    - [Telegram](https://telegram.org/) Push Notification

> Currently, the plotter works only! on Windows (as XPlotter is used internally)

![autoplotter-in-action](https://devbutze.com/wp-content/uploads/2018/03/autoplot_v0.3.gif)

## Plot Automation?

Before you can start with BURST mining you need to prepare your hard drive. This process is called _Plotting_.
While plotting your disks will be filled with so called nonces, kind of pre-calculated values, which will be read 
while mining. The creation of a plot is a quite time consuming process. Furthermore, you need to be sure that your plots 
won't overlap, that is nonce range won't overlap. The Autoplotter takes entirely care of this.
You simply define the size and number of plots and the rest is done automatically. That way, plotting become very easy.
 
## Installation

The Autoplotter is based on nodejs (>= Version 8.9 (LTS Carbon)), so - if not already installed - you need to install [NodeJS](https://nodejs.org/en/download/) first.
Once installed simply call 

`npm i -g burst-autoplotter`

Afterwards, you just need to call `autoplot` in the console.

> __You need to run as administrator__ 

## Command Line Commands

The application supports several commands for different purposes, from version, help, to setting up notifications.

## Common Options
At all time you may use the following options:

| option       | alias | description                        | Example                                      |
|--------------|:-----:|------------------------------------|----------------------------------------------|
| version      |   v   | Shows current version              | `autoplot --version`                         |
| help         |   h   | Shows help for current command     | `autoplot setup -h`                          |
| cache <file> |   c   | Defines the name of the cache file | `autoplot -c "c:\myfiles\autoplot-config.js"`|

> The default cache file is stored in `%AppData%/.autoplot-cache` 

### Command `run`

This is the main command to run the plotter. `run` is the default command, such that `autoplot run` and `autoplot` do
the same.

#### `run` Options

| option       | alias | description                        | Example                                      |
|--------------|:-----:|------------------------------------|----------------------------------------------|
| extended     |   e   | Runs the plotter in extended mode  | `autoplot run -e`                            |


_Extended Mode_

The extended mode allows you to set further settings like thread number and memory usage for plotting.


### Command `setup`

The setup command allows to execute additional setups, like configuring email transport, or [Telegram](https://telegram.org/) push notification
There are no other options, than the common functions, but following sub-commands are possible:

| command  | description                 | Example                   |
|----------|-----------------------------|---------------------------|
| mail     | Runs email configuration    | `autoplot setup mail`     |
| telegram | Runs Telegram configuration | `autoplot setup telegram` |

If configured correctly, you'll receive a success notification. Of course, it's possible to receive as email _and_ push notification.

### Notes on email notification setup for Gmail

Per default, Google considers authentication using login and password as not sufficient to met todays security needs. 
You'll receive an email about a blocked sign in then, when trying to use Gmail as your mail transporter. In that case, 
you need to [configure your Gmail Account to allow _less secure apps_](https://support.google.com/accounts/answer/6010255?hl=en).


### How Telegram Push Notification works

The Autoplotter uses the [Middleman-Bot](https://github.com/n1try/telegram-middleman-bot) for delivering notification.
You just need to add the bot in your Telegram messenger,
and you'll receive a token (e.g. `2a3137d2-2d6a-4e4d-985a-df0d278426b0`) that you need to enter while setup.

# Credits

This tool uses [XPlotter](https://github.com/Blagodarenko/XPlotter). 

Thanks to Blago, Cerr Janro, and DCCT
