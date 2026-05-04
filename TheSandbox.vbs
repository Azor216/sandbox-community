Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "msedge --app=""file:///c:/Projects/sandbox/index.html"" --window-size=1024,700", 0, False
