---
layout: post
author: SierraGolf
title: Time is relative
date: '2013-04-27T11:38:00+02:00'
tags:
- java
- date
- datetime
- timezone
- calendar
- joda
---
## Introduction

Albert Einstein postulated that time is relative and he has been proven right, but what is time actually? Time is a 
unit which we use to split our daily live into pieces. Time has multiple different units which translate more or less 
to astronomic events.

We made it quite easy for ourselves. We named the rotation of the earth around itself *day* which is basically defined 
by sunrise and sunset and we named the rotation of the earth around the sun *year*. These units are the basic elements 
of what we call time, but that was not enough.

We needed a finer granularity, so we made up months, weeks, hours, minutes,  seconds and so forth. Most of todays month 
and week concept was defined by the romans.

For everyone who is really interested in how todays date and time units got established and restructured over time I 
really recommend to read this *how stuff works* [article](http://www.timeanddate.com/news/time/).

## Time is complicated

### Leaps
The main problem is that the units we chose do not match the actual astronomic events exactly, which brings in the 
problem of leap years and even leap seconds. Leaps allow us to re-establish accuracy by 
[adding a day every four years](http://en.wikipedia.org/wiki/Leap_year#Algorithm) and from time to time 
[a second](http://en.wikipedia.org/wiki/Leap_second). 

### Time zones
Despite those basic problems in accuracy we made it a little more complicated by introducing time zones, because a day 
should still be something that starts with sunrise and ends with sunset. So depending on how far away you are from 
Greenwich (the meridian) you might add or remove a few hours to get your local time.

### Daylight saving
That is something the modern society invented for the sake of having more daylight. That allows us to be more 
productive, have a *longer day* and it even lets us safe electricity.

### Calendar
Historically not all parts of the world evolved in the same way, so we actually now have despite the ISO standardized 
calendar (ISO8601) a lot of other systems to calculate and define time. For example: Buddhist, Ethiopic and Islamic.

### Format and localization
Regional differences do not only come in different calendars, but also in different formats of displaying time, even 
in the same calendar. For example Germans usually use something like 31.12.2012 while the Americans prefer something 
like 12/31/2012.

## What about `java.util.Date`?
This class was the first attempt in Java to create a class which can store time information. As it is with all the 
first drafts, they usually are not perfect and need to be redesigned. Actually the `Date` class was so fundamentally 
broken that it only lasted in the Java version 1.0. Most of the public API of this class has been deprecated with 
version 1.1, this means four of six constructors and 18 of 27 methods. Anyhow this class is still widely used but 
mostly in combination with the next *draft* which they called `Calendar`, but let’s take a step back and have a look 
at the `Date` class.

### Weird offsets
The first thing you will have a problem with, when working directly with `Date` is that it has some really weird 
offsets. Let’s have a look at the constructor; if you would like to initiate a `Date` object for the last day of the 
year 2012 (31.12.2012) you would need to call the constructor like this:

{% highlight java %}
new Date(112, 11, 31);
{% endhighlight %}

Isn’t that great? So the year is something completely absurd and the month is minus one, because it starts at 0 while 
the days start at 1. Actually this constructor was not so bad until the year 2000, because if you would take the last 
day of the year 1985 it would look like: 

{% highlight java %}
new Date(85, 11, 31);
{% endhighlight %}

So now you can see where this weird year - 1900 formula comes from. I guess they did not think this API would last 
that long. By the way Java 1.0 was released on the 1th October 1992.

### Accuracy
`Date` stores the time internally as a long which represents the milliseconds since the beginning of the UNIX epoch, 
which was on 01.01.1970 at 00:00:00:000. It also exposes this accuracy in milliseconds as public API, but there is no 
constructor with which you can specify milliseconds, despite the one which takes a UNIX epoch timestamp. This means 
that the internal logic of `Date` will automatically convert every specified `Date` to 0 milliseconds.

### Internationalization
As it is stated in the class documentation `Date` is not capable of internationalization. The methods 
`Date.toGMTString()` and `Date.toLocaleString()` are both deprecated and refer to `DateFormat.format(Date)`. Sadly the 
class `DateFormat` is abstract and declares in its class documentation that all subclasses are inherently not thread 
safe. Currently there is only one subclass in the JDK which is called `SimpleDateFormat`.

### Time zones
`Date` actually supports time zones, but in a very hard to work with manner. It has a method which will return the 
time zone offset it has from UTC. Wait, how does it know that? The answer is simple, it just takes the default 
timezone of your system, which you can set  by calling `TimeZone.setDefault(TimeZone)`. This seems to be ok in 
environments where you have only one working thread or only one time zone to take care of, but as soon as you want to 
go multithreaded with different time zones you get into trouble.

Actually it is recommended to use `SimpleDateFormat` to display the time localized to a specific time zone, but watch 
out for thread-safety.

### Calendars
`Date` does not support different kinds of calendar systems, actually it is hardcoded to the gregorian calendar.

### General class design
Despite the already mentioned problems there are some more which concern more or less basic API design principles. 
What would you expect from a class called `Date`? Would you expect it to contain time? I would not, but sadly it does. 
So the name is in best case confusing and in the worst case just plain wrong.

Additionally `Date` objects are mutable which is again an issue in multithreaded environments. Even in single threaded 
environment you should make defensive copies on every method call which either takes or returns a `Date` object which 
is associated with the internal state of an object.

## What about `java.util.Calendar`?
So is `Calendar` an improvement to `Date`? Definitely, but it still has some flaws.

### Improvements
- it does not have the weird year offset
- it supports millisecond precision in constructors
- it has time zone support
- it has, as the name already implies, calendar support (well kind of …)

### Remaining problems
Sadly the month offset is still there. So January is still equal to 0, but at least there is now a variety of 
constants to use like `Calendar.JANUARY`.

Although the `Calendar` class is supposed to support different calendars it only comes with one which is Gregorian. 
At least that is what you can see from the Java documentation, but actually there are two more which are hard-coded 
in the `Calendar` class. These two are Buddhist and Japanese Imperial. So how can you retrieve an instance of such a 
calendar when there is no public class to instantiate them?

The answer is: through the static method `Calendar.getInstance(Locale)`. So if you would like to get a Buddhist 
calendar you must do the following: `Calendar.getInstance(new Locale("th", "TH"))`. The sad thing is that the 
developers hard-coded it actually to the locale for Thailand, which makes me think they assumed that only Thailand 
has a Buddhist calendar which is just plain wrong. So this so called calendar API is actually not really providing 
calendars, nor allows it to create custom calendars easily.

Besides, `Calendar` is still mutable and does not assert on invalid dates. Time zones are now supported, but you are 
always forced to have a time zone.

Last but not least what would you actually expect from a class called `Calendar`? Would you expect it to contain 
date information? Maybe. Would you expect it to contain time information? Not so much. Would you expect it to contain 
time zone information? Most certainly not.

This is a class which is not well designed and you can already tell that by reading the name and the class 
documentation.

## What about `java.util.TimeZone`?

The abstract class `TimeZone` tries to accomplish to cover the aspects of handling time zones and daylight saving. 
The interface feels a little unhandy especially when working with `Date` objects. For example the method 
`TimeZone.getRawOffset()` returns signed milliseconds while the method `Date.getTimeZoneOffset()` returns unsigned 
minutes.

You can query available time zones by calling `TimeZone.getAvailableIDs()`. If you try to retrieve a `TimeZone` that 
does not match one of those IDs the `TimeZone` class will automatically fall back to GMT. So for example this will 
always be true:

{% highlight java %}
TimeZone gmt = TimeZone.getTimeZone("GMT");
TimeZone foo = TimeZone.getTimeZone("foo");
gmt.equals(foo); // will return true
{% endhighlight %}

If you find yourself in the position of not finding your desired time zone in the *available IDs* you can specify a 
custom time zone through `SimpleTimeZone` class, which has quite a tricky interface. This means if you do not read 
the entire class documentation, you will not be able to initialize a correct `SimpleTimeZone` object.

Despite these strange things the `TimeZone` class also has a quite unintuitive implementation, if not plain false, 
when it comes to daylight saving. The following tables show the time zone database definition of daylight saving 
transitions for CST/CDT and compares it to the implementation in the JDK.

### Time zone database definition for daylight saving period start CST/CDT

When local standard time is about to reach Sunday, March 11, 2012 at 2:00:00 AM clocks are turned forward 1 hour to 
Sunday, March 11, 2012 at 3:00:00 AM to local daylight time.

| Time                   | DST | UTC offset | Time Zone |
|:-----------------------|:----|:-----------|:----------|
| 0:00:00 AM             | No  | UTC-6h     | CST       |
| 1:59:59 AM             | No  | UTC-6h     | CST       |
| 2:00:00 AM→ 3:00:00 AM | +1h | UTC-5h     | CDT       |
| 3:00:01 AM             | +1h | UTC-5h     | CDT       |
{: rules="groups"}

So that means when the time zone transitions from CST to CDT one hour is skipped. The day on which the daylight saving 
period starts has no 2 AM, because the clock automatically jumps from 1:59:59 AM to 3:00:00 AM. In return this means 
that it should not be possible to initialize a `Date` or `Calendar` instance for this concrete moment in time for this 
specific time zone.

Let’s have a look how it is implemented in the JDK.

### Behavior implemented by JDK for daylight saving period start CST/CDT

| Time                    | DST | UTC offset | Time Zone |
|:------------------------|:----|:-----------|:----------|
| 0:00:00 AM              | No  | UTC-6h     | CST       |
| 1:59:59 AM              | No  | UTC-6h     | CST       |
| 2:00:00 AM → 3:00:00 AM | +1h | UTC-5h     | CDT       |
| 3:00:01 AM              | +1h | UTC-5h     | CDT       |
{: rules="groups"}

The table tries to show that if you initialize a `Date` object with 2 AM for the day on which the daylight saving 
period starts it will be converted automatically to 3 AM without further notice. I would rather prefer to get an 
exception when trying to initialize and invalid moment in time, but at least that behavior is consistent with the 
rest of the public interface of `Date` and `Calendar`. One could say that the JDK implementations try to patronize the 
user by picking some default or next best value, if the given one is not valid.

Let’s have a look now at how the transition from daylight saving to non daylight saving is specified and implemented.

### Time zone database definition for daylight saving period end CST/CDT

When local standard time is about to reach Sunday, November 4, 2012 at 2:00:00 AM clocks are turned backward 1 hour 
to Sunday, November 4, 2012 at 1:00:00 AM to local daylight time.

| Time                   | DST | UTC offset | Time Zone |
|:-----------------------|:----|:-----------|:----------|
| 0:00:00 AM             | +1h | UTC-5h     | CDT       |
| 1:00:00 AM             | +1h | UTC-5h     | CDT       |
| 1:59:59 AM             | +1h | UTC-5h     | CDT       |
| 2:00:00 AM→ 1:00:00 AM | No  | UTC-6h     | CST       |
| 1:00:01 AM             | No  | UTC-6h     | CST       |
| 2:00:00 AM             | No  | UTC-6h     | CST       |
{: rules="groups"}

The specification states that the last moment in daylight saving is 1:59:59 AM (milliseconds omitted) and that the clock switches from that time directly back to 1 AM. This means that there are actually two 1 AM instants in time for that specific date, one in CDT and one in CST. So how does the JDK handle this case?

### Behavior implemented by JDK for daylight saving period end CST/CDT

| Time       | DST | UTC offset | Time Zone |
|:-----------|:----|:-----------|:----------|
| 0:00:00 AM | +1h | UTC-5h     | CDT       |
| 0:59:59 AM | +1h | UTC-5h     | CDT       |
| 1:00:00 AM | No  | UTC-6h     | CST       |
| 2:00:00 AM | No  | UTC-6h     | CST       |
{: rules="groups"}

So instead of the specified switch from 2 AM to 1 AM and having the 1 AM twice the implementation switches from 
0:59:59 (milliseconds omitted) CDT directly to 1:00:00 CST which effectively skips one hour. This means it is not 
possible to define any instant in CDT on that date for 1 AM, if you do it anyways it will automatically be converted 
to 1 AM in CST. This can be quite a surprise, because the actual switch will always be one hour earlier as specified 
by the time zone database.

## Joda Time
So can we do better than `Date` and `Calendar`? Yes, we can! There is that nice little API called Joda Time, which by 
the way is not pronounced Yoda but Joda.

### Basic concepts
It separates the concerns of date, time, time zones, calendars and mutability/immutability. In the Joda 
date-time-continuum the basic concept of storing time is called an instant. An instant represents a concrete and 
valid moment in time with millisecond precision, so if you try to initialize and invalid instant you get an exception. 
Internally such an instant is stored as the number of milliseconds since the UNIX epoch, which is similar to the 
JDK approach.

In fact, the Joda Time is fully compatible and interoperable with the JDK classes like `Calendar`, `Date` and 
`TimeZone`. This means you can initialize Joda Time classes from JDK classes and vice versa.

In order to represent things which are not a concrete instant the Joda Time API uses so called partials. Partials are 
things that can become an instant by adding the missing parts which are required by an instant. So for example the 
partial `LocalTime`, which is a time object without date and time zone information, can be extended with those to 
become an instant.

So basically you convert every instant to a partial through convenience methods like `toLocalTime()` and at the same 
time you can convert every partial to an instant by adding the missing parts.

### Convenience
Joda Time is very convenient to use, not only because of those nice conversion APIs, but also because it finally 
provides a month system which is based on 1 and not on 0. This combined with the parameter validation makes a much 
better and intuitive API as everything else which comes from the JDK.

Additionally it provides a lot of utility methods and classes which allow you to perform very easy transformation 
and different representation of data.

It also comes with thread safety through the provided immutable classes and through a thread safe formatter.

Joda Time is widely accepted as the new standard for handling time. This means though not all frameworks and libraries 
support Joda Time natively, extensions are available or can be written easily.

### Calendars
In the Joda API calendars are implemented as *chronologies*. The API comes with the following calendars: 
Buddhist, Coptic, Ethiopic, Gregorian/Julian, Gregorian, Islamic, ISO and Julian. Additionally it provides some wrapper 
chronologies to add additional features like lenient, strict, zoned or limited chronologies.

### Time zones
Time zone implementation is more convenient than the JDK implementation. Actually Joda Time comes with its own time 
zone class called `DateTimeZone`.

### Behavior implemented by Joda API for daylight saving period start CST/CDT

| Time       | DST     | UTC offset | Time Zone |
|:-----------|:--------|:-----------|:----------|
| 0:00:00 AM | No	   | UTC-6h     | CST       |
| 1:59:59 AM | No	   | UTC-6h     | CST       |
| 2:00:00 AM | invalid | invalid    | invalid   |
| 3:00:00 AM | +1h	   | UTC-5h     | CDT       |
{: rules="groups"}

So the Joda API will raise an exception if you try to initialize 2 AM on the day of daylight saving start in CST. 
Programmatically this problem can be solved by initializing the instant as `LocalDateTime` and check if it is in a 
daylight saving gap for a specified time zone. If the instant is located in such a gap one can convert that instant to 
be either the next or previous hour. This gives great flexibility and makes the behavior explicit and customizable to 
the application’s needs.

### Behavior implemented by Joda API for daylight saving period end CST/CDT

| Time       | DST | UTC offset | Time Zone |
|:-----------|:----|:-----------|:----------|
| 0:00:00 AM | +1h | UTC-5h     | CDT       |
| 0:59:59 AM | +1h | UTC-5h     | CDT       |
| 1:00:00 AM | +1h | UTC-5h     | CDT       |
| 2:00:00 AM | No  | UTC-6h     | CST       |
{: rules="groups"}

So the Joda Time API tries a different approach compared to the JDK. It takes the 1 AM in CDT instead of CST so that 
the period ends with 2 AM as specified by the time zone database, though there is no 1 AM is CST.

### Tips
There a few things which are quite useful to know when working with Joda Time.

1. If you want to add milliseconds to an object you would naturally use `plusMilliseconds(int)`, but integer is very 
often the wrong type when working with milliseconds so you should use `plus(long)` instead.
2. The default chronology in Joda Time is `ISOChronology`. It is used when no chronology is explicitly specified, for 
example when initializing a `DateTime` object. This can be confusing when initializing Joda classes from 
`GregorianCalendar` instances because they will have the `GJChronology` set. So for example those two objects are 
not equal:

{% highlight java %}
DateTime dateTimeWithGJ = new DateTime(new GregorianCalendar(2012, 11, 31, 0, 0, 0, 0));
DateTime dateTimeWithISO = new DateTime(2012, 12, 31, 0, 0, 0, 0);
dateTimeWithGJ.equals(dateTimeWithISO); // will return false
{% endhighlight %}

## What about JSR-310?
JSR-310 is the request to finally solve the `Date`/`Calendar` debacle in Java by adopting to the ideas and principles 
provided by Joda Time API. Actually one of the three lead developers is Stephen Colebourne, who is the founder 
and lead of Joda Time and other Joda APIs. Current ETA of that JSR is Java SE 8.

## Overview

<table rules="groups">
    <thead>
        <tr>
            <td>Aspect</td>
            <td>JDK</td>
            <td>Joda Time</td>
        </tr>
    </thead>
    <tr>
        <td>convenience</td>
        <td>got better with Calendar</td>
        <td>very good</td>
    </tr>
    <tr>
        <td>performance</td>
        <td>needs external synchronization in multithreaded environments</td>
        <td>performs better than Date, Calendar and TimeZone in most use cases, specifically in multithreaded environments</td>
    </tr>
    <tr>
        <td>precision</td>
        <td>
            <ul>
                <li>seconds with Date</li>
                <li>milliseconds with Calendar</li>
            </ul>
        </td>
        <td>milliseconds</td>
    </tr>
    <tr>
        <td>immutability</td>
        <td>Date and Calendar are mutable</td>
        <td>provides immutable and mutable classes</td>
    </tr>
    <tr>
        <td>calendar</td>
        <td>
            <ul>
                <li>no support for Date</li>
                <li>hard coded support for Gregorian, Japanese Imperial and Buddhist with Calendar</li>
            </ul>
        </td>
        <td>all major calendars, easily extendable</td>
    </tr>
    <tr>
        <td>internationalization</td>
        <td>
            <ul>
                <li>no support with Date</li>
                <li>possible with Calendar</li>
            </ul>
        </td>
        <td>good support</td>
    </tr>
    <tr>
        <td>thread safety</td>
        <td>no, needs external synchronization</td>
        <td>through immutable classes and thread safe formatter</td>
    </tr>
    <tr>
        <td>parameter validation</td>
        <td>no, silently rolls to the next best value or a default value</td>
        <td>yes</td>
    </tr>
    <tr>
        <td>time zone</td>
        <td>
            <ul>
                <li>possible with Date, but very difficult to handle</li>
                <li>got a lot better with Calendar</li>
            </ul>
        </td>
        <td>good support and provides data structures without time zones</td>
    </tr>
    <tr>
        <td>daylight saving</td>
        <td>very difficult, since it does not stick to the time zone database specification</td>
        <td>asserts on invalid dates and sticks as close as possible to the time zone database specification (switches back to standard time in the specified hour)</td>
    </tr>
    <tr>
        <td>leap years</td>
        <td>yes</td>
        <td>yes</td>
    </tr>
    <tr>
        <td>leap seconds</td>
        <td>no</td>
        <td><a href="http://www.google.com/url?q=http%3A%2F%2Fjoda-time.sourceforge.net%2Ffaq.html%23leapseconds&sa=D&sntz=1&usg=AFQjCNGL180UF3RaiEnMqIiGweW6lITlzA">no, but extension is possible</a></td>
    </tr>
</table>

*[JSR]: Java Specification Request