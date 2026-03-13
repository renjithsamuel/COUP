Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ProcessTreeIds {
  param(
    [int[]] $RootIds
  )

  $all = New-Object 'System.Collections.Generic.HashSet[int]'
  $queue = New-Object 'System.Collections.Generic.Queue[int]'

  foreach ($rootId in $RootIds) {
    if ($all.Add($rootId)) {
      $queue.Enqueue($rootId)
    }
  }

  while ($queue.Count -gt 0) {
    $currentId = $queue.Dequeue()
    $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $currentId" -ErrorAction SilentlyContinue
    foreach ($child in $children) {
      if ($all.Add($child.ProcessId)) {
        $queue.Enqueue($child.ProcessId)
      }
    }
  }

  return @($all)
}

$targetIds = New-Object 'System.Collections.Generic.HashSet[int]'

$listeners = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($listenerId in $listeners) {
  [void] $targetIds.Add($listenerId)
}

$uvicornProcesses = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Name -match 'python|uvicorn' -and
    $_.CommandLine -and
    ($_.CommandLine -match 'uvicorn' -or $_.CommandLine -match 'app\.main:app')
  }
foreach ($process in $uvicornProcesses) {
  [void] $targetIds.Add($process.ProcessId)
}

$allIds = @(Get-ProcessTreeIds -RootIds @($targetIds))
if ($allIds.Length -eq 0) {
  Write-Host 'No backend dev server processes found.'
  exit 0
}

Write-Host "Stopping backend dev server process tree: $($allIds -join ', ')"
Stop-Process -Id $allIds -Force -ErrorAction SilentlyContinue
Write-Host 'Backend dev server stopped.'