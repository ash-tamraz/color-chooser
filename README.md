# color-chooser
A small project to help choose terminal colors for applications like 
rxvt-unicode on unix-like oses. It began life as a personal project,
then accidental good timing let me use it as final project for a web
development class.

This is a webapp that is meant to serve as a tool to aid in choosing
terminal colors, from those available, when setting up something like
rxvt-unicode. It started as me trying to solve the problem of
not knowing what the colors in the 'rgb.txt' file looked like, and not
wanting to enter them all individually into some tool to show me what
they looked like.

It first creates a MongoDB database of the colors in 'rgb.txt' if one
doesn't already exist (it doesn't search the file system for such a file,
that is one of the to-do's for polishing the site further - I've just 
copied the file from my own computer into the project's directory).
Then the Node.js backend injects color data from the database into the
HTML based on user queries. 

There are 8 color slots. The user can save colors they have chosen, via
MongoDB, and load past color palettes via MongoDB as well, even between
sessions, if one runs this on the same computer.
