# PowerShell script equivalent to your batch script

$file_path = "exports.ts"
$JS_FILE = "exports.ts"

# Check if yandexToken exists
$yandexTokenFound = Select-String -Path $JS_FILE -Pattern "const yandexToken"
if ($yandexTokenFound) {
    Write-Host "yandexToken found."
}
else {
    Write-Host "yandexToken not found."
}

# Check if discordClientToken exists
$discordTokenFound = Select-String -Path $JS_FILE -Pattern "const discordClientToken"
if ($discordTokenFound) {
    Write-Host "discordClientToken found."
}
else {
    Write-Host "discordClientToken not found."
}

Write-Host "Enter 1 to add yandexToken"
Write-Host "Enter 2 to add discordClientToken"
Write-Host "Enter start to initiate program"

# Get user input
$UserInput = Read-Host "Type what do you want to do"
$continueLoop = $true

while ($continueLoop) {
    Write-Host "Enter 1 to add yandexToken"
    Write-Host "Enter 2 to add discordClientToken"
    Write-Host "Enter start to initiate program"
    
    # Get user input
    $UserInput = Read-Host "Type what do you want to do"

    switch ($UserInput) {
        1 {
            Clear-Host
            Write-Host "Setting yandex token"
            $yandexToken = Read-Host "Set yandex token"
            Write-Host "$yandexToken"
            Add-Content -Path $file_path -Value "const yandexToken = ""$yandexToken"";"
            break
        }
        2 {
            Clear-Host
            Write-Host "Setting discord token"
            $discordToken = Read-Host "Set discord client token"
            Write-Host "$discordToken"
            Add-Content -Path $file_path -Value "const discordClientToken = ""$discordToken"";"
            break
        }
        start {
            Write-Host "Initiating program."
            ts-node src/index.ts RPC
            break
        }
        default {
            Write-Host "`"$UserInput`" is not a valid option."
            break
        }
    }

    # Ask if the user wants to continue
    $continue = Read-Host "Do you want to perform another action? (yes/no)"
    if ($continue -ne "yes") {
        $continueLoop = $false
    }
}
