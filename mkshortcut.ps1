$s = (New-Object -COM WScript.Shell).CreateShortcut("$env:USERPROFILE\Desktop\The Sandbox.lnk")
$s.TargetPath = "c:\Projects\sandbox\dist\win-unpacked\The Sandbox.exe"
$s.WorkingDirectory = "c:\Projects\sandbox\dist\win-unpacked"
$s.Description = "The Sandbox"
$s.Save()
Write-Host "Shortcut created!"
