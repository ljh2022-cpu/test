# 한 파일(전주맞춤밥상_최종.html)로 합칩니다. 사용법: powershell -File build.ps1
$d = Split-Path -Parent $MyInvocation.MyCommand.Path
$u = New-Object System.Text.UTF8Encoding($false)
$h = [IO.File]::ReadAllText("$d\index.html", $u)
$h = $h.Replace('<link rel="stylesheet" href="app.css">', "<style>`n" + [IO.File]::ReadAllText("$d\app.css", $u) + "`n</style>")
foreach ($f in 'data.js', 'i18n.js', 'logic.js', 'ui.js') {
  $h = $h.Replace("<script src=`"$f`"></script>", "<script>`n" + [IO.File]::ReadAllText("$d\$f", $u) + "`n</script>")
}
[IO.File]::WriteAllText("$d\전주맞춤밥상_최종.html", $h, $u)
"완료: " + $h.Length + " bytes"
