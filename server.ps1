$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")

try {
    $listener.Start()
} catch {
    Write-Host "Failed to start server on http://localhost:8080/. Address or port may be in use."
    exit 1
}

Write-Host "🕊️ LISTEN Server running at http://localhost:8080/"
Write-Host "Press Ctrl+C to stop the server."

$global:listener = $listener

# Handle Ctrl+C key press cleanly
$null = [System.Console]::add_CancelKeyPress({
    param($sender, $e)
    $e.Cancel = $true
    if ($global:listener -and $global:listener.IsListening) {
        $global:listener.Stop()
    }
})

$dbPath = Join-Path $PSScriptRoot "js\contents_db.json"

try {
    while ($listener.IsListening) {
        try {
            $contextTask = $listener.GetContextAsync()

            while (-not $contextTask.IsCompleted -and $listener.IsListening) {
                [System.Threading.Thread]::Sleep(100)
            }

            if (-not $listener.IsListening -or $contextTask.IsFaulted) {
                break
            }

            $context = $contextTask.Result
            $req = $context.Request
            $res = $context.Response

            $path = $req.Url.LocalPath
            $method = $req.HttpMethod

            # Enable CORS for all responses
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            $res.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            $res.AddHeader("Access-Control-Allow-Headers", "Content-Type")

            if ($method -eq "OPTIONS") {
                $res.StatusCode = 200
                $res.Close()
                continue
            }

            # REST API: /api/contents (POST/PUT/DELETE)
            if ($path.StartsWith("/api/contents")) {
                $res.ContentType = "application/json; charset=utf-8"

                if ($method -eq "POST" -or $method -eq "PUT") {
                    $reader = New-Object System.IO.StreamReader($req.InputStream, $req.ContentEncoding)
                    $bodyStr = $reader.ReadToEnd()
                    $reader.Close()

                    if (Test-Path $dbPath) {
                        $dbRaw = Get-Content $dbPath -Raw -Encoding UTF8 | ConvertFrom-Json
                        $newItem = $bodyStr | ConvertFrom-Json
                        
                        # Find existing or append
                        $existingIdx = -1
                        for ($i=0; $i -lt $dbRaw.contents.Count; $i++) {
                            if ($dbRaw.contents[$i].id -eq $newItem.id) {
                                $existingIdx = $i
                                break
                            }
                        }

                        if ($existingIdx -ge 0) {
                            $dbRaw.contents[$existingIdx] = $newItem
                        } else {
                            $dbRaw.contents += $newItem
                        }

                        $dbRaw.updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                        $updatedJson = $dbRaw | ConvertTo-Json -Depth 10
                        [System.IO.File]::WriteAllText($dbPath, $updatedJson, [System.Text.Encoding]::UTF8)

                        $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                        $res.OutputStream.Write($respBytes, 0, $respBytes.Length)
                    } else {
                        $res.StatusCode = 500
                    }
                } elseif ($method -eq "DELETE") {
                    $itemId = $path.Replace("/api/contents/", "").Trim()
                    if (Test-Path $dbPath) {
                        $dbRaw = Get-Content $dbPath -Raw -Encoding UTF8 | ConvertFrom-Json
                        $dbRaw.contents = $dbRaw.contents | Where-Object { $_.id -ne $itemId }
                        $updatedJson = $dbRaw | ConvertTo-Json -Depth 10
                        [System.IO.File]::WriteAllText($dbPath, $updatedJson, [System.Text.Encoding]::UTF8)

                        $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                        $res.OutputStream.Write($respBytes, 0, $respBytes.Length)
                    }
                }
                $res.Close()
                continue
            }

            # Static File Serving
            if ($path -eq "/") { $path = "/index.html" }

            $relativePath = $path.TrimStart('/').Replace('/', '\')
            $filePath = Join-Path $PSScriptRoot $relativePath

            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)

                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($ext) {
                    ".html" { $res.ContentType = "text/html; charset=utf-8" }
                    ".css"  { $res.ContentType = "text/css; charset=utf-8" }
                    ".js"   { $res.ContentType = "text/javascript; charset=utf-8" }
                    ".png"  { $res.ContentType = "image/png" }
                    ".jpg"  { $res.ContentType = "image/jpeg" }
                    ".jpeg" { $res.ContentType = "image/jpeg" }
                    ".svg"  { $res.ContentType = "image/svg+xml" }
                    ".json" { $res.ContentType = "application/json; charset=utf-8" }
                    ".ico"  { $res.ContentType = "image/x-icon" }
                    ".webp" { $res.ContentType = "image/webp" }
                    default { $res.ContentType = "application/octet-stream" }
                }

                $res.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
                $res.ContentLength64 = $bytes.Length
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $res.StatusCode = 404
            }
            $res.Close()
        } catch {
            # Catch transient errors
        }
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
    Write-Host "Server stopped."
}
