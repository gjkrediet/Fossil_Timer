# Fossil Timer
 Just a timer based on better timer made by Daniel Dakhno (https://github.com/dakhnod) which was ment to be a replacement for the Fossil timer.
 The original 'better timer' integrated three funtions: A stopwatch, an alarm clock and a timer. Since I myself only use the latter and I found the better timer to be too complex I decided to strip it and make the timer-function more useable (to myself at least).

## Description
On startup the timer is preset with the previously used time. On the screen the function of the different buttons are shown. Long-press functions are shown on the left-side and short-press funtions on the right side beneath the buttons. There are three modes: (1) set time, (2) countdown and (3) run in the background.
When running in the background the app keeps track of the passed time. When activated while running in the background, the app shows the time left. When there are 30 seconds left, the app forces itself to the foreground.
When running in the foreground the hands show the minutes and seconds left. At the bottom, the current time is shown. In this mode the buttons offer the functions: add a minute to the time whle running; decrease the time with a minute while running; reset the timer; dismiss and close the timer; close the timer but leave it running in the background.

When the time is up, the watch starts to vibrate with a gradualy decreasing interval. 

![timer](https://github.com/gjkrediet/Fossil_Timer/assets/20277013/ea23f25e-3657-4b09-8dbd-b9456765b3a1)

When setting the time, the buttons offer the folowing functions: add 5 minutes to the set time; decrease the set time with 1 minute; reset the time to zero; fast increase the set time; close the timer; start countdown.

## Installation
Upload timerApp.wapp to your watch or compile the app yourself. Instructions for preprocessing/compiling the app are similar to those for Gadgetbridge's opensourceWatchface which can be found here: https://codeberg.org/Freeyourgadget/fossil-hr-watchface

Be aware: this app replaces the default and/or the better timer.
