@echo off
Setlocal EnableDelayedExpansion


rem check if field exists 
set "JS_FILE=exports.ts"

findstr /C:"const yandexToken" "%JS_FILE%"

if %errorlevel% equ 0 (
    echo yandexToken found.
    echo :

) else (
    echo yandexToken not found.
    echo :
)
findstr /C:"const discordClientToken" "%JS_FILE%"
if %errorlevel% equ 0 (
    echo discordClientToken found.
    echo :

) else (
    echo discordClientToken not found.
    echo :
)

echo Enter 1 to add yandexToken 
echo Enter 2 to add discordClientToken
echo Enter start to initiate programm
@REM set /p input=Type what do u wanna do: 

set /p UserInput=Type what do u wanna do: 
if %UserInput%==1 goto 1
if %UserInput%==2 goto 2
if %UserInput%==start goto 3


echo "%UserInput%"
:1
cls
echo setting yandex token
set /p "yandexToken=Set yandex token: "
echo "%yandexToken%"
echo const yandexToken = "%yandexToken%"; >> %file_path%
exit

:2
cls
echo setting discord token
set /p "discordToken=Set discord client token: "
echo "%discordToken%"
echo const discordClientToken = "%discordToken%"; >> %file_path%
exit

:3
echo Initiating proggram.
ts-node src/index.ts RPC
exit



