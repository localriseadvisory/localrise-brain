param(
  [Parameter(ValueFromRemainingArguments=$true)]
  [string[]]$Args
)
node "$PSScriptRoot\kimi.js" $Args
