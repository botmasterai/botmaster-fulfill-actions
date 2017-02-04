[![Build Status](https://travis-ci.org/botmasterai/botmaster-fulfill-actions.svg?branch=master)](https://travis-ci.org/botmasterai/botmaster-fulfill-actions)

# Botmaster actions

Useful actions for botmaster fulfill <http://botmasterai.com/>).

Enable chatbots to perform actions on Node.js.

Find the documentation at the main botmaster website: <http://botmasterai.com/middlewares/fulfill/>

# Reference

## greet

Greet users with a greeting that reflects the time of day

```xml
<greet />
<greet tz='America/New_York' lang='es' />
```

Outputs based on the detected system language

**English (en)**

-   between 4 am and 12 pm say "Good morning"
-   between 12 pm and 5pm  say "Good afternoon"
-   between 5 pm and 4am  say "Good evening"

**Spanish (es)**

-   between 4 am and 12 pm say "Buenos dias"
-   between 12 pm and 8pm  say "Buenas tardes"
-   between 8 pm and 4am  say "Buenas noches"

**Parameters**

-   `tz` **String** Which timezone to use for the time-based greeting. Defaults to GMT. To see available options see <http://momentjs.com/timezone/>
-   `lang` **String** Which language to use. Defaults to system locale setting

## pause

Break text up with a separate messages pausing before each one

```xml
<pause wait=2000 />
```

 evaluated in series
 after evaluating all text / xml before removed
 controller sends text before and then waits before allowing rest of text/xml to be evaluated

**Parameters**

-   `wait`  {String} how long to wait in ms between each defaults to 1000
