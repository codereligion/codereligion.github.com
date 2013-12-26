---
layout: post
title: Hidden feature of Stripes' NumberTypeConverterSupport
date: '2013-04-27T11:35:09+02:00'
tags:
- stripes error handling conversion
tumblr_url: http://codereligion.com/post/48995710962/hidden-feature-of-stripes-numbertypeconvertersupport
---
A little background
Stripes offers the following basic TypeConverter implementations:

BigDecimalTypeConverter
BigIntegerTypeConverter
BooleanTypeConverter
ByteTypeConverter
CharacterTypeConverter
CreditCardTypeConverter
DateTypeConverter
DoubleTypeConverter
EmailTypeConverter
EnumeratedTypeConverter
FloatTypeConverter
IntegerTypeConverter
LongTypeConverter
ObjectTypeConverter
OneToMnyTypeConverter
PercentageTypeConverter
ShortTypeConverter
StringTypeConverter

They are used to convert/bind the request parameter values to the according java types during the bind and validation event phase. A programmer may also register his own TypeConverter for a specific request parameter by specifying the converter in the @Validate annotation or he may register the TypeConverter globally by using the DefaultTypeConverterFactory.

Where it gets interesting
The following TypeConverters extend the class NumberTypeConverterSupport:

BigDecimalTypeConverter
BigIntegerTypeConverter
ByteTypeConverter
DoubleTypeConverter
FloatTypeConverter
IntegerTypeConverter
LongTypeConverter
PercentageTypeConverter
ShortTypeConverter

The documentation of the NumberTypeConverterSupport states that this class does the following: 

Provides the basic support for converting Strings to non-floating point numbers (i.e. shorts, integers, and longs).

Despite the fact that there are also implementations which support floating point data types, one may think what is common about converting numbers and what does this class actually provide?

Basically it does following:
it pre-processes the request parameter string by:
trimming it with String.trim()
removing the current locale’s currency symbol
trimming again
removing parentheses
if there were parentheses prepending a minus sign

it parses the string into a Number according to the current locale’s NumberFormat

So the hidden feature is that Stripes assumes that per default every BigDecimal, BigInteger, Byte, Double, Float, Integer, Long, Short and percentage storing value is a currency/monetary value. By the way, parenthesis around a value are a common way in finance/accounting to express negative values, so that is what it means to replace parenthesis with a minus sign.
Why is that bad?
You may have already noticed that I am not really thinking this is a feature, but why can this “feature” actually be a problem? The problem lies, as always, in the details. First of all I do not expect this behaviour from the above mentioned type converters and second this can have weird effects when trying to validate input data.

Consider the following:
A user enters something like “ $ ( 365 ) ” into a field which represents a number of days as Integer. The logic will silently convert the given value to “-365” without giving any error message that the given input is not a valid integer.

In my humble opinion this is quite unexpected and annoying.
How to solve the issue
The only way to solve this issue is to globally override the above mentioned sub-classes of NumberTypeConverterSupport by using the DefaultTypeConverterFactory in order to remove this wicket default behaviour.
