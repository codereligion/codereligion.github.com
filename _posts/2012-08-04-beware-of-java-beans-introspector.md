---
layout: post
author: SierraGolf
title: Beware of Java Beans Introspector
date: '2012-08-04T18:10:00+02:00'
tags:
- java
- beans
- introspector
- type erasue
- generics
- spring
- stripes
---
## A Little Background

The package `java.beans` is part of *Java Standard Edition* since quite the beginning. Everybody has some understanding 
of what a JavaBean is. It is a convention which defines that java objects provide the following:

- a default constructor
- getters and setters to access members
- support for serialization

The main reason for this convention and the framework around it was to ease the instantiation and handling of GUI 
classes in AWT and swing. So most of you which have worked with a Java desktop GUI framework may know classes like 
`PropertyChangeListener` and `PropertyEditor`.

A very convenient part of the JavaBeans API is the introspection. It allows analyzing methods, parameters and 
properties of a Java class and provides merged information about these in so called descriptors.

The introspection is used in the roots of frameworks which need to analyze classes and instantiate them without 
actually knowing them. A few prominent examples are Spring and Stripes.

## The Problem

A few weeks back I stumbled upon a weird and really hard to reproduce bug. The surface indication was that the frontend 
framework, which is Stripes, suddenly could not map some POST parameters to Java objects anymore. This bug only 
occurred on the test servers but never on local environments. After some intense remote debugging sessions I figured 
out that the cause was located in the 
[`java.beans.Introspector`](http://docs.oracle.com/javase/7/docs/api/java/beans/Introspector.html) class utilized by 
Stripes to instantiate objects for request binding. For some reason the information returned by the introspector told 
Stripes that there are no setters for some properties.

## The Cause

Recently generics have been added to a few classes used in request binding. Here is an simplified example of such a 
class:

{% highlight java %}
public class User implements Identifiable<Integer> {
    
    private Integer id;
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
}
{% endhighlight %}

The belonging interface:

{% highlight java %}
public interface Identifiable<T> {
    T getId();
}
{% endhighlight %}

The setter has been left out on the interface because the services interacting with *Identifiables* should not have the 
ability to set the id.

In Java generics are only known at compile time and are removed by the compiler through type erasure. This design 
decision has been made for the sake of backward compatibility, as most of the greatest flaws in software history.

The important thing to know is that the compiler will replace generic types by their bounds or `Object` (if unbounded), 
it will also insert type casts where necessary and will generate synthetic bridge methods to preserve polymorphism in 
extended generic types.

Knowing that, one can understand the output of the following:

{% highlight java %}
for (Method method : User.class.getMethods()) {
    System.out.println(method);
}
{% endhighlight %}

Output with Java Version 1.6.0_29:

    public void User.setId(java.lang.Integer)
    public java.lang.Integer User.getId()
    public java.lang.Object User.getId()
    //… the rest has been omitted for readability

The compiler added another method `getId()` to the `User` which has the return type `Object`. Though a programmer is 
forbidden to overload method return types the compiler can do that.

So the actual class now has two getters which return different types. The newly added getter is called a bridge method 
and will delegate every call to the `Integer` getter while casting the return type explicitly to `Integer`.

The actual root cause of the missing setter in the Stripes logic resides in the logic inside the 
`java.beans.Introspector` which could be simplified as:

- iterate over all methods and create PropertyDescriptors for each
- iterate over all getter PropertyDescriptors
  - remove redundant getter by merging them so that the last added getter for a property wins
- iterate over all setter PropertyDescriptors and merge them into their appropriate getter PropertyDescriptors

Since the last getter method wins, the return type of this method will be made the type of the PropertyDescriptor and 
the logic may not find an appropriate setter because the types do not match. Tests with different Java versions showed 
different results in the order of methods and so different results of the following test:

{% highlight java %}
@Test
public void test() throws Exception {
    final Class<User> clazz = User.class;
    final BeanInfo beanInfo = Introspector.getBeanInfo(clazz);
    final PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
        
    for (final PropertyDescriptor propertyDescriptor : propertyDescriptors) {
            
        if (propertyDescriptor.getName().equals("id")) {              
            assertEquals(Integer.class, propertyDescriptor.getPropertyType());
            assertNotNull(propertyDescriptor.getReadMethod());
            assertNotNull(propertyDescriptor.getWriteMethod());
        }
    }
}
{% endhighlight %}

Results for Java version 1.5.0_09:

    assert: SUCCESS
    assert: SUCCESS
    assert: SUCCESS

Results for Java version 1.6.0_29:

    assert: FAIL
    assert: SUCCESS
    assert: FAIL

Results for Java version 1.7.0:

    assert: SUCCESS
    assert: SUCCESS
    assert: SUCCESS

Until Java version [1.7](http://bugs.sun.com/view_bug.do?bug_id=6528714) there is no specific logic inside the 
Introspector which handles bridge methods. So the success of this test solely depends on the right order of methods, 
which only the compiler has the power of.

## How to fix it

### Upgrading to Java 1.7

If one has the freedom to do that, great! Despite the bug fixes Java 1.7 brings a lot of nice new features.

### Wrap or Avoid Introspector

Usually upgrading to a new major Java versions is a thing which takes a while or may even be forbidden by company 
policies. It can also just not be possible because the software is a framework and needs to be run against different 
versions of Java (e.g. Spring).

So the solution is usually to not use the `java.beans.Introspector` at all or wrap around it to fix the problem.
[Spring](https://github.com/spring-projects/spring-framework/blob/master/spring-beans/src/main/java/org/springframework/beans/GenericTypeAwarePropertyDescriptor.java) 
and [Stripes](http://stripes.sourceforge.net/docs/current/javadoc/overview-tree.html) and most certainly other projects 
do exactly that.

### Avoid Asymmetry

When possible make getters and setters in classes and interfaces symmetrically. This will not fix the root cause that 
one might get a `PropertyDescriptor` for the wrong type e.g. `Object` instead of `Integer`, but at least one would have 
a setter *and* a getter.

This approach actually solved my problem, though Stripes is aware of the issue and tries to work around it, it does not 
cover all cases.

## Conclusion

When using generics and `java.beans.Introspector` in Java versions below 1.7 be aware of unwanted side effects like 
missing setters or wrong types. In general beware of type erasure when working with generics especially in combination 
with reflection.