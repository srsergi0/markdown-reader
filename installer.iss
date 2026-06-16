; Inno Setup installer for Markdown Reader
; Requires Inno Setup: https://jrsoftware.org/isdl.php
; Usage: iscc installer.iss

#define MyAppName "Markdown Reader"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Markdown Reader"
#define MyAppURL "https://github.com/markdown-reader/markdown-reader"
#define MyAppExeName "bin\MarkdownReader.exe"

[Setup]
AppId={{B8F4B3A0-2C7D-4A1E-9D5F-8A3E6B2C1D0F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=installer
OutputBaseFilename=MarkdownReader-Setup-{#MyAppVersion}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
SetupIconFile=src\assets\icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "build\stable-win-x64\MarkdownReader\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "launcher.exe"
Source: "build\stable-win-x64\MarkdownReader\bin\launcher.exe"; DestDir: "{app}\bin"; DestName: "MarkdownReader.exe"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Registry]
; Register .md file association
Root: HKCU; Subkey: "Software\Classes\.md"; ValueType: string; ValueName: ""; ValueData: "MarkdownReader.md"; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\Classes\.markdown"; ValueType: string; ValueName: ""; ValueData: "MarkdownReader.md"; Flags: uninsdeletevalue

; Create ProgID
Root: HKCU; Subkey: "Software\Classes\MarkdownReader.md"; ValueType: string; ValueName: ""; ValueData: "Markdown Reader"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\MarkdownReader.md\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"
Root: HKCU; Subkey: "Software\Classes\MarkdownReader.md\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent
